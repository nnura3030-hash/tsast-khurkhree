const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Order = require('../models/Order'); // Шинэ модель
const TripBooking = require('../models/TripBooking');
const FoodBooking = require('../models/FoodBooking');
const ProductBooking = require('../models/ProductBooking');
const SaunaBooking = require('../models/SaunaBooking');
const dns = require('dns').promises;
const crypto = require('crypto');
const axios = require('axios');
const mongoose = require('mongoose'); // Transaction ашиглахад хэрэгтэй

const MAX_GERS = 15; // Total available gers


const BYL_API_BASE_URL = process.env.BYL_API_BASE_URL || 'https://byl.mn/api/v1';
const BYL_API_HOST = (() => {
    try {
        return new URL(BYL_API_BASE_URL).hostname;
    } catch {
        return 'byl.mn';
    }
})();

// Byl API-д зориулсан тусгай Axios instance үүсгэх
const bylClient = axios.create({
    baseURL: BYL_API_BASE_URL,
    timeout: 15000, // Timeout-ыг 15 секунд болгож сунгав
    headers: { 'Content-Type': 'application/json' }
});

// Retry (Дахин оролдох) логик нэмэх Interceptor
bylClient.interceptors.response.use(null, async (error) => {
    const config = error.config;
    // Хэрэв retry тохиргоо байхгүй бол анхны утгыг оноох (3 удаа оролдоно)
    config.retryCount = config.retryCount ?? 0;
    const MAX_RETRIES = 3;

    // Зөвхөн сүлжээний алдаа эсвэл серверийн (5xx) алдаа дээр дахин оролдоно
    const shouldRetry = error.code === 'ENOTFOUND' || 
                        error.code === 'ETIMEDOUT' || 
                        (error.response && error.response.status >= 500);

    if (shouldRetry && config.retryCount < MAX_RETRIES && !config._isRetry) {
        config.retryCount += 1;
        console.log(`[RETRY] Byl API холболт амжилтгүй. Дахин оролдож байна (${config.retryCount}/${MAX_RETRIES})...`);
        
        // Дараагийн оролдлогоос өмнө 3 секунд хүлээх
        const delay = new Promise((resolve) => setTimeout(resolve, 3000));
        await delay;
        
        return bylClient(config);
    }
    return Promise.reject(error);
});

// BYL орчны хувьсагч шалгах туслах функц
function checkBylEnv() {
    const required = [
        'BYL_TOKEN',
        'BYL_PROJECT_ID'
    ];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`BYL тохиргооны дараах хувьсагч дутуу байна: ${missing.join(', ')}`);
    }
}

// Нэгдсэн багц захиалга (Bulk Checkout)
router.post('/bulk-checkout', async (req, res) => {
    let session = null;
    try {
        // Бааз гүйлгээ дэмжих эсэхийг (ReplicaSet/Sharded) шалгах
        const topology = mongoose.connection.client?.topology;
        const description = topology?.description;
        const isTransactionSupported = description && (
            description.setName || 
            description.type?.includes('ReplicaSet') ||
            description.type === 'Sharded'
        );

        if (isTransactionSupported) {
            session = await mongoose.startSession();
            session.startTransaction();
        }

        const { items, customerName, phone, paymentMethod = 'byl', invoiceId, returnUrl, totalPrice, userId } = req.body;
        // Invoice ID-г эхэнд нь нэг удаа тогтоож өгөх (Бүх зүйлд ижил ID ашиглах)
        const finalInvoiceId = invoiceId || `bulk_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

        // 1. Нэгдсэн Order (Нэхэмжлэх) үүсгэж хадгалах
        const newOrder = new Order({
            userId: userId || null,
            orderNumber: `ORD-${Date.now()}`,
            amount: Math.max(0, Math.floor(Number(totalPrice || 0))),
            currency: 'MNT',
            status: 'pending',
            bylInvoiceId: finalInvoiceId,
            paymentMethod: paymentMethod === 'byl' ? 'Quick QR' : paymentMethod
        });

        await newOrder.save({ session: session || undefined });

        // 2. Бүх захиалгуудыг (items) харгалзах collection-д нь хадгалах
        const savePromises = items.map(async (item) => {
            if (item.type === 'ger') {
                const overlappingBookings = await Booking.countDocuments({
                    status: { $ne: 'cancelled' },
                    $or: [
                        { checkIn: { $lt: new Date(item.checkOut) }, checkOut: { $gt: new Date(item.checkIn) } }
                    ]
                }).session(session || undefined);

                if (overlappingBookings >= MAX_GERS) {
                    throw new Error(`Уучлаарай, ${item.checkIn} - ${item.checkOut} хооронд гэр дүүрсэн байна (Нийт ${MAX_GERS} гэр).`);
                }
            }

            const baseData = {
                customerName, phone, totalPrice: Number(item.totalPrice || 0),
                paymentMethod: paymentMethod || 'byl', invoiceId: finalInvoiceId, status: 'pending', createdAt: new Date()
            };

            let model;
            if (item.type === 'ger') model = new Booking({ ...baseData, ger: item.id || item._id, checkIn: item.checkIn, checkOut: item.checkOut, peopleCount: item.peopleCount, foodOption: item.foodOption });
            else if (item.type === 'trip') model = new TripBooking({ ...baseData, trip: item.id || item._id, travelDate: item.travelDate, peopleCount: item.peopleCount, extraService: item.extraService, foodOption: item.foodOption, isWild: item.isWild });
            else if (item.type === 'food') model = new FoodBooking({ ...baseData, foodId: item.id || item._id, quantity: item.quantity, orderDate: item.orderDate, foodName: item.title });
            else if (item.type === 'product') model = new ProductBooking({ ...baseData, productId: item.id || item._id, quantity: item.quantity });
            else if (item.type === 'sauna') model = new SaunaBooking({ ...baseData, sauna: item.id || item._id, quantity: item.quantity });
            
            if (model) return await model.save({ session: session || undefined });
            return Promise.resolve();
        });

        await Promise.all(savePromises);

        // 2. Төлбөрийн системүүдтэй холбогдох
        if (paymentMethod === 'byl') {
            checkBylEnv(); // BYL ашиглах үед л шалгана
            try {
                // Byl системд тоог бүхэл болгох, 0-ээс бага байж болохгүй
                const finalAmount = Math.max(0, Math.round(Number(totalPrice || 0)));
                if (finalAmount <= 0) throw new Error("Төлбөрийн дүн 0-ээс их байх ёстой.");
                if (!finalInvoiceId) throw new Error("Invoice ID үүсгэхэд алдаа гарлаа.");

                // byl.mn API-ийн зөв format
                const bylPayload = {
                    amount:      finalAmount,
                    currency:    'MNT',
                    description: `Цаст Хүрхрээ Resort #${finalInvoiceId}`,
                    invoice_id:  finalInvoiceId,
                    return_url:  returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:5174'}/admin?payment=success`,
                };

                console.log('\n[BYL] Sending request:', JSON.stringify(bylPayload, null, 2));

                const response = await bylClient.post(
                    `/projects/${process.env.BYL_PROJECT_ID}/invoices`,
                    bylPayload,
                    { headers: { 'Authorization': `Bearer ${process.env.BYL_TOKEN}`, 'Accept': 'application/json' } }
                );

                console.log('[BYL] Response:', JSON.stringify(response.data, null, 2));

                // byl.mn хариу — бүх боломжит талбарыг шалгах
                const d = response.data;
                const redirectUrl =
                    d?.data?.payment_url  ||
                    d?.data?.url          ||
                    d?.data?.invoice_url  ||
                    d?.data?.link         ||
                    d?.payment_url        ||
                    d?.url                ||
                    d?.link;

                if (!redirectUrl) {
                    console.error('[BYL] No redirect URL in response:', JSON.stringify(d, null, 2));
                    throw new Error('Был системээс төлбөрийн холбоос ирсэнгүй. Дахин оролдоно уу.');
                }

                console.log(`\n✅ [BYL API] Нэхэмжлэх амжилттай үүслээ: ID=${finalInvoiceId}, URL=${redirectUrl}\n`);

                if (session) await session.commitTransaction();
                return res.status(201).json({ paymentUrl: redirectUrl, invoiceId: finalInvoiceId });
            } catch (bylErr) {
                const isNetworkError = bylErr.code === 'ENOTFOUND' || bylErr.code === 'EAI_AGAIN' || bylErr.code === 'ECONNABORTED' || bylErr.code === 'ETIMEDOUT';
                
                console.log("\n--- BYL API CONNECTION ERROR ---");
                console.log("Error Code:", bylErr.code);
                console.log("Message:", bylErr.message);
                console.log("---------------------------------\n");

                // DNS оношилгоо хийх
                if (isNetworkError) {
                    const domainToLookup = BYL_API_HOST;
                    dns.lookup(domainToLookup)
                        .then(result => console.log(`[DIAGNOSTIC] DNS Lookup success for ${domainToLookup}: ${result.address}`))
                        .catch(dnsErr => {
                            console.error(`[DIAGNOSTIC] DNS Lookup FAILED for ${domainToLookup}: ${dnsErr.message}. Таны интернэт холболт эсвэл DNS тохиргоог шалгана уу.`);
                        });
                }

                throw new Error(isNetworkError ? `Byl API host (${BYL_API_HOST}) could not be resolved. Check backend/.env BYL_API_BASE_URL and DNS/network settings.` : bylErr.message);
            }
        }

        // Бүх төлбөр byl.mn-ээр хийгдэнэ
        if (session) await session.commitTransaction();
        res.status(201).json({ message: "Захиалга амжилттай" });
    } catch (err) {
        if (session) await session.abortTransaction();
        
        // Алдааны мэдээллийг илүү дэлгэрэнгүй болгох
        const apiError = err.response?.data?.message || err.response?.data?.error || err.message;
        console.error("Bulk Checkout Error:", apiError);
        res.status(400).json({ message: "Захиалга үүсгэхэд алдаа гарлаа: " + apiError });
    } finally {
        if (session) session.endSession();
    }
});

// Шинэ захиалга нэмэх
router.post('/add', async (req, res) => {
    let session = null;
    try {
        const topology = mongoose.connection.client?.topology;
        const description = topology?.description;
        const isTransactionSupported = description && (
            description.setName || 
            description.type?.includes('ReplicaSet') ||
            description.type === 'Sharded'
        );

        if (isTransactionSupported) {
            session = await mongoose.startSession();
            session.startTransaction();
        }

        const { gerId, customerName, phone, checkIn, checkOut, peopleCount, foodOption, totalPrice, paymentMethod, invoiceId, returnUrl } = req.body;
        
        const finalInvoiceId = invoiceId || `single_${Date.now()}`;

        const newBooking = new Booking({
            ger: gerId,
            customerName,
            phone,
            checkIn,
            checkOut,
            peopleCount,
            foodOption,
            totalPrice: Math.round(Number(totalPrice || 0)),
            paymentMethod,
            invoiceId: finalInvoiceId,
            status: 'pending'
        });

        await newBooking.save({ session: session || undefined });

        // Byl төлбөрийн системтэй холбогдох
        if (paymentMethod === 'byl') {
            checkBylEnv();
            try {
                // Byl API руу нэхэмжлэх үүсгэх хүсэлт илгээх
                const bylResponse = await bylClient.post(
                    `/projects/${process.env.BYL_PROJECT_ID}/invoices`,
                    {
                        amount:      Math.max(0, Math.round(Number(totalPrice || 0))),
                        currency:    'MNT',
                        description: `Цаст Хүрхрээ Resort #${finalInvoiceId}`,
                        invoice_id:  finalInvoiceId,
                        return_url:  returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:5174'}/admin?payment=success`,
                    },
                    { headers: { 'Authorization': `Bearer ${process.env.BYL_TOKEN}`, 'Accept': 'application/json' } }
                );

                const d2 = bylResponse.data;
                const redirectUrl =
                    d2?.data?.payment_url || d2?.data?.url || d2?.data?.invoice_url ||
                    d2?.data?.link || d2?.payment_url || d2?.url || d2?.link;
                
                console.log(`\n✅ [BYL API] Ганц захиалгын нэхэмжлэх үүслээ: ID=${finalInvoiceId}\n`);
                
                if (session) await session.commitTransaction();
                return res.status(201).json({ message: "Амжилттай", paymentUrl: redirectUrl });
            } catch (bylErr) {
                console.error("Byl API Error (Single):", bylErr.response?.data || bylErr.message);
                throw bylErr;
            }
        }

        if (session) await session.commitTransaction();
        res.status(201).json({ message: "Амжилттай" });
    } catch (err) {
        if (session) await session.abortTransaction();
        console.error("Алдаа:", err.message);
        res.status(400).json({ message: "Захиалга үүсгэхэд алдаа гарлаа", error: err.message });
    } finally {
        if (session) session.endSession();
    }
});

// Byl төлбөрийн системээс ирэх Webhook хүлээн авах
router.post('/webhook/byl', async (req, res) => {
    try {
        // 1. Signature шалгах (Security)
        const signature = req.headers['x-byl-signature'];
        const hashKey = process.env.BYL_HASH_KEY;
        
        // 1. Signature баталгаажуулах (Security)
        if (signature && hashKey && req.body) {
            const hmac = crypto.createHmac('sha256', hashKey);
            // Byl-ээс ирсэн body-г яг байгаагаар нь hash хийнэ
            const dataToHash = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            const computedSignature = hmac.update(dataToHash).digest('hex');
            
            if (signature.toLowerCase() !== computedSignature.toLowerCase()) {
                console.error("[BYL WEBHOOK] Invalid signature detected!");
                return res.status(401).json({ message: "Unauthorized: Invalid Signature" });
            }
        }

        // Byl API-аас ирж буй өгөгдлийг задлах
        // Төлбөрийн системээс хамаарч өгөгдөл body эсвэл data объект дотор ирдэг
        const payload = req.body.data || req.body;
        const { invoice_id, status } = payload;

        console.log(`\n--- [${new Date().toLocaleString()}] BYL WEBHOOK RECEIVE ---`);
        console.log(`Invoice ID: ${invoice_id}`);
        console.log(`Status: ${status}`);
        console.log("---------------------------------------------------\n");

        if (!invoice_id) {
            return res.status(400).json({ message: "Invoice ID missing" });
        }

        // Byl v1 төлөвүүд: 'paid' эсвэл 'success'
        const isPaid = status === 'paid' || status === 'success';
        if (isPaid) {
            const filter = { invoiceId: invoice_id };
            
            // MongoDB Transaction ашиглахгүй ч бүгдийг зэрэг шинэчлэх оролдлого
            await Promise.all([
                // Үндсэн Order-ийг 'paid' болгох
                Order.findOneAndUpdate({ bylInvoiceId: invoice_id }, { status: 'paid', paidAt: new Date() }),
                
                // Бүх дэд захиалгуудыг (Гэр, Аялал, Хоол г.м) баталгаажуулах
                Booking.updateMany(filter, { $set: { status: 'confirmed' } }),
                TripBooking.updateMany(filter, { $set: { status: 'confirmed' } }),
                FoodBooking.updateMany(filter, { $set: { status: 'confirmed' } }),
                ProductBooking.updateMany(filter, { $set: { status: 'confirmed' } }),
                SaunaBooking.updateMany(filter, { $set: { status: 'confirmed' } })
            ]);
            
            console.log(`[BYL WEBHOOK] SUCCESS: Invoice ${invoice_id} updated to PAID.`);
        }

        // Byl системд хүлээн авснаа баталгаажуулж 200 OK хариу илгээх 
        // (Энэ хариуг өгөхгүй бол Byl систем дахин дахин хүсэлт илгээж магадгүй)
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error("[BYL WEBHOOK ERROR]:", err.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Бүх захиалгыг авах (Админд)
router.get('/all', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('ger');
        res.json(bookings);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Захиалгын төлөв шинэчлэх
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: "Захиалга олдсонгүй" });
        }

        booking.status = status;
        if (req.body.cancellationReason) booking.cancellationReason = req.body.cancellationReason;
        if (req.body.refundNote) booking.refundNote = req.body.refundNote;
        const updated = await booking.save();

        // Мэдэгдэл илгээх логик (Лог хэлбэрээр)
        if (status === 'refund_requested') {
            console.log("\n" + "=".repeat(35));
            console.log("NOTIFY: REFUND REQUEST RECEIVED");
            console.log(`TO: ${booking.phone}`);
            console.log("MSG: Таны буцаалтын хүсэлтийг хүлээн авлаа. Бид 24 цагийн дотор шийдвэрлэх болно.");
            console.log("=".repeat(35) + "\n");
            // Энд SMS API эсвэл Nodemailer ашиглан имэйл илгээх код байна
        } 
        else if (status === 'refunded') {
            console.log("\n" + "=".repeat(35));
            console.log("NOTIFY: REFUND COMPLETED");
            console.log(`TO: ${booking.phone}`);
            console.log(`MSG: Таны ${updated.totalPrice}₮-ийн буцаалт амжилттай хийгдлээ.`);
            console.log("=".repeat(35) + "\n");
            // Энд SMS API эсвэл Nodemailer ашиглан имэйл илгээх код байна
        }

        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Алдаа гарлаа" });
    }
});

// Захиалга устгах
router.delete('/:id', async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: "Захиалга устгагдлаа" });
    } catch (err) {
        res.status(500).json({ message: "Устгахад алдаа гарлаа" });
    }
});

module.exports = router;
