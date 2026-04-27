const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    logoText: { type: String, default: 'T' },
    brandName: { type: String, default: 'TSAST-KHURKHREE' },
    phone: { type: String, default: '+976 8888 8888' },
    email: { type: String, default: 'info@gerconnect.mn' },
    address: { type: String, default: 'Bayan-Ulgii, Tsengel, Mongolia' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },

    image: String,
    heroImage: String,
    destinationImage: String,
    advantageImg1: String,
    advantageImg2: String,
    advantageImg3: String,
    serviceImg1: String,
    serviceImg2: String,
    serviceImg3: String,
    serviceImg4: String,
    serviceImg5: String,
    serviceImg6: String,
    stepImg1: String,
    stepImg2: String,
    stepImg3: String,

    heroTitle: { type: String, default: 'TSAST KHURKHREE' },
    heroSubtitle: {
      type: String,
      default: 'Peaceful stay in the Altai mountains near Baga Turgen waterfall',
    },
    destinationBadge: { type: String, default: 'Explore Tsengel, Bayan-Ulgii' },
    destinationTitle: { type: String, default: 'BAGA TURGEN WONDER' },
    destinationDescription: {
      type: String,
      default:
        'Tsast Khurkhree Resort is located near the unique nature of Baga Turgen waterfall and offers a calm stay in western Mongolia.',
    },

    serviceTitle1: { type: String, default: 'Гэр захиалга' },
    serviceDesc1: { type: String, default: 'Алтайн сүрлэг төрхөд амрах' },
    serviceLink1: { type: String, default: '/gers' },
    serviceTitle2: { type: String, default: 'Аялал' },
    serviceDesc2: { type: String, default: 'Адал явдалт дурсамжууд' },
    serviceLink2: { type: String, default: '/trips' },
    serviceTitle3: { type: String, default: 'Хоолны цэс' },
    serviceDesc3: { type: String, default: 'Амтат зоог, үндэсний хоол' },
    serviceLink3: { type: String, default: '/foods' },
    serviceTitle4: { type: String, default: 'Дэлгүүр' },
    serviceDesc4: { type: String, default: 'Дурсгалын зүйлс, гар урлал' },
    serviceLink4: { type: String, default: '/products' },
    serviceTitle5: { type: String, default: 'Тусламж' },
    serviceDesc5: { type: String, default: 'Зааварчилгаа болон тусламж' },
    serviceLink5: { type: String, default: '/about' },

    featureTitle1: { type: String, default: 'Газар зүй' },
    featureDesc1: { type: String, default: 'Манай байршил, ирэх заавар болон газрын зургийн мэдээлэл.' },
    featureLink1: { type: String, default: '/location' },
    featureImg1: { type: String },
    featureTitle2: { type: String, default: 'Ресортын бүтэц' },
    featureDesc2: { type: String, default: 'Амралтын газрын бүтэц, боломжууд болон үйлчилгээний танилцуулга.' },
    featureLink2: { type: String, default: '/resort' },
    featureImg2: { type: String },
    featureTitle3: { type: String, default: 'Байгалийн онцлог' },
    featureDesc3: { type: String, default: 'Онгон зэрлэг байгаль, уул ус, үзэсгэлэнт газруудын тухай.' },
    featureLink3: { type: String, default: '/nature' },
    featureImg3: { type: String },
    featureTitle4: { type: String, default: 'Ан амьтад' },
    featureDesc4: { type: String, default: 'Манай бүс нутагт тааралдах зэрлэг ан амьтдын мэдээлэл.' },
    featureLink4: { type: String, default: '/wildlife' },
    featureImg4: { type: String },

    featureSectionTitle: {
      type: String,
      default: 'Дэлгэрэнгүй танилцуулга',
    },

    // Location page cards
    locationCard1Icon:  { type: String, default: '📍' },
    locationCard1Title: { type: String, default: 'Байршил' },
    locationCard1Body:  { type: String, default: 'Баян-Өлгий аймгийн Цэнгэл сумын нутагт, Бага Түргэний хүрхрээний дэргэд байрлана. Баян-Өлгийн төвөөс 150км.' },
    locationCard1Img:   { type: String },

    locationCard2Icon:  { type: String, default: '🚗' },
    locationCard2Title: { type: String, default: 'Авто замын удирдамж' },
    locationCard2Body:  { type: String, default: 'Улаанбаатараас: 1200км · 2–3 хоног\nБаян-Өлгийн төвөөс: 150км · 3–4 цаг\nЦэнгэл сумаас: 80км · 1.5–2 цаг\nЗам: зуны нөхцөл сайн, өвөл хэцүү' },
    locationCard2Img:   { type: String },

    locationCard3Icon:  { type: String, default: '✈️' },
    locationCard3Title: { type: String, default: 'Агаарын үйлчилгээ' },
    locationCard3Body:  { type: String, default: 'MIAT: Улаанбаатар → Баян-Өлгий · 2 цаг\nНислэг долоо хоног бүр байдаг\nБаян-Өлгийгоос такси/авто байна' },
    locationCard3Img:   { type: String },

    locationCard4Icon:  { type: String, default: '🌡️' },
    locationCard4Title: { type: String, default: 'Уур амьсгал' },
    locationStat1Value: { type: String, default: '1800м' },
    locationStat1Label: { type: String, default: 'Далайн түвшнээс' },
    locationStat2Value: { type: String, default: '−20°' },
    locationStat2Label: { type: String, default: 'Өвлийн хүйтэн' },
    locationStat3Value: { type: String, default: '+25°' },
    locationStat3Label: { type: String, default: 'Зуны дулаан' },
    locationCard4Img:   { type: String },

    locationCard5Icon:  { type: String, default: '🏥' },
    locationCard5Title: { type: String, default: 'Ойрын үйлчилгээ' },
    locationCard5Body:  { type: String, default: 'Цэнгэл сумын эмнэлэг: 80км\nБаян-Өлгийн эмнэлэг: 150км\nДэлгүүр: сумын төвд байна\nХолбоо: 2G/3G сүлжээ' },
    locationCard5Img:   { type: String },

    locationCard6Icon:  { type: String, default: '💡' },
    locationCard6Title: { type: String, default: 'Зөвлөмж' },
    locationCard6Body:  { type: String, default: 'Хангамжаа Баян-Өлгийгоос бүрдүүлнэ\nАнхны тусламжийн хайрцаг авчирна\nУлирлын нөхцөлийн мэдээллийг авна\nДулаан хувцас заавал хэрэгтэй' },
    locationCard6Img:   { type: String },

    stepTitle1: { type: String, default: 'Choose' },
    stepDesc1: { type: String, default: 'Find your preferred ger or trip' },
    stepTitle2: { type: String, default: 'Book' },
    stepDesc2: { type: String, default: 'Enter details and confirm payment' },
    stepTitle3: { type: String, default: 'Enjoy' },
    stepDesc3: { type: String, default: 'Create unforgettable memories in nature' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
