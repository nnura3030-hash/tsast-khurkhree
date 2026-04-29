import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import api from "../services/api.js";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency, formatNumber, formatDate } from "../utils/formatters.js";

/* ─── design tokens ─── */
const inp = "w-full rounded-xl border border-stone-200 dark:border-white/8 bg-stone-50 dark:bg-white/5 px-4 py-3 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-white/25 outline-none focus:ring-2 focus:ring-green-400/30 dark:focus:ring-yellow-400/30 focus:border-green-400/50 dark:focus:border-yellow-400/50 transition text-sm";
const ADMIN_PHONE = "88888888";

const typeLabel   = { ger:"ГЭР", trip:"АЯЛАЛ", food:"ХООЛ", product:"БАРАА" };
const statusLabel = {
  pending:            "Хүлээгдэж буй",
  confirmed:          "Баталгаажсан",
  cancelled:          "Цуцлагдсан",
  refund_requested:   "Буцаалт хүлээгдэж буй",
  refunded:           "Буцаалт хийгдлээ",
  refund_denied:      "Буцаалт татгалзагдсан",
};
const statusColor = {
  pending:          "bg-yellow-400/15 text-yellow-400",
  confirmed:        "bg-emerald-400/15 text-emerald-400",
  cancelled:        "bg-red-400/15 text-red-400",
  refund_requested: "bg-orange-400/15 text-orange-400",
  refunded:         "bg-purple-400/15 text-purple-400",
  refund_denied:    "bg-white/10 text-white/40",
};

const CANCEL_POLICY = [
  { days: 7,  pct: 90, label: "7+ хоногийн өмнө" },
  { days: 3,  pct: 50, label: "3–7 хоногийн өмнө" },
  { days: 0,  pct: 0,  label: "3 хоногоос бага" },
];

const CANCEL_REASONS = [
  "Цаг агаарын нөхцөл",
  "Гэнэтийн яаралтай тохиолдол",
  "Аяллын төлөвлөгөө өөрчлөгдсөн",
  "Санхүүгийн шалтгаан",
  "Бусад шалтгаан",
];

const ADMIN_TABS = [
  { key:"bookings",  label:"Захиалга",    icon:<path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /> },
  { key:"reviews",   label:"Сэтгэгдэл",   icon:<path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /> },
  { key:"gers",      label:"Гэр",          icon:<path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
  { key:"trips",     label:"Аялал",        icon:<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /> },
  { key:"foods",     label:"Хоол",         icon:<path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /> },
  { key:"products",  label:"Дэлгүүр",      icon:<path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /> },
  { key:"settings",  label:"Тохиргоо",     icon:<path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
];
const USER_TABS = [
  { key:"bookings", label:"Миний захиалга", icon:ADMIN_TABS[0].icon },
];

const itemConfig = {
  ger:     { state:"gers",     endpoint:"/api/gers",     add:"/add", title:"Гэрүүд",    priceKey:"pricePerNight" },
  trip:    { state:"trips",    endpoint:"/api/trips",    add:"/add", title:"Аяллууд",   priceKey:"pricePerPerson" },
  food:    { state:"foods",    endpoint:"/api/foods",    add:"/add", title:"Хоолнууд",  priceKey:"price" },
  product: { state:"products", endpoint:"/api/products", add:"/add", title:"Бараанууд", priceKey:"price" },
};
const bookingEndpoints = {
  ger:"/api/bookings", trip:"/api/trip-bookings", food:"/api/food-bookings", product:"/api/product-bookings",
};
const emptyForm = {
  ger:     { gerNumber:"", title:"", location:"", pricePerNight:"", capacity:4, status:"available", description:"", image:null },
  trip:    { title:"", location:"", pricePerPerson:"", duration:"", image:null },
  food:    { name:"", category:"", description:"", price:"", image:null },
  product: { name:"", category:"", description:"", price:"", stock:0, image:null },
  settings:{ logoText:"Ц", brandName:"ЦАСТ-ХҮРХРЭЭ", phone:"+976 8888 8888", email:"info@gerconnect.mn",
    address:"Баян-Өлгий, Цэнгэл сум, Монгол", facebook:"", instagram:"", twitter:"",
    heroTitle:"", heroSubtitle:"", destinationBadge:"", destinationTitle:"", destinationDescription:"",
    featureSectionTitle:"",
    serviceTitle1:"", serviceDesc1:"", serviceLink1:"",
    serviceTitle2:"", serviceDesc2:"", serviceLink2:"",
    serviceTitle3:"", serviceDesc3:"", serviceLink3:"",
    serviceTitle4:"", serviceDesc4:"", serviceLink4:"",
    serviceTitle5:"", serviceDesc5:"", serviceLink5:"",
    featureTitle1:"", featureDesc1:"", featureLink1:"",
    featureTitle2:"", featureDesc2:"", featureLink2:"",
    featureTitle3:"", featureDesc3:"", featureLink3:"",
    featureTitle4:"", featureDesc4:"", featureLink4:"",
    locationCard1Icon:"", locationCard1Title:"", locationCard1Body:"", locationCard1Img:null,
    locationCard2Icon:"", locationCard2Title:"", locationCard2Body:"", locationCard2Img:null,
    locationCard3Icon:"", locationCard3Title:"", locationCard3Body:"", locationCard3Img:null,
    locationCard4Icon:"", locationCard4Title:"", locationCard4Img:null,
    locationStat1Value:"", locationStat1Label:"",
    locationStat2Value:"", locationStat2Label:"",
    locationStat3Value:"", locationStat3Label:"",
    locationCard5Icon:"", locationCard5Title:"", locationCard5Body:"", locationCard5Img:null,
    locationCard6Icon:"", locationCard6Title:"", locationCard6Body:"", locationCard6Img:null,
    stepTitle1:"", stepDesc1:"",
    stepTitle2:"", stepDesc2:"",
    stepTitle3:"", stepDesc3:"",
    image:null, heroImage:null, destinationImage:null,
    serviceImg1:null, serviceImg2:null, serviceImg3:null, serviceImg4:null, serviceImg5:null,
    featureImg1:null, featureImg2:null, featureImg3:null, featureImg4:null,
    stepImg1:null, stepImg2:null, stepImg3:null,
  },
};

/* ─── SVG icon helper ─── */
const Icon = ({ d, size = 18, stroke = true }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={stroke ? "none" : "currentColor"}
    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke ? 1.75 : 0}>
    {typeof d === "string" ? <path strokeLinecap="round" strokeLinejoin="round" d={d} /> : d}
  </svg>
);

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, loading: authLoading, user, logout } = useAuth();
  const { addToCart } = useCart();
  const isAdmin = user?.phone === ADMIN_PHONE;
  const { dark } = useTheme();
  const chartBg   = dark ? "#0f0f14" : "#ffffff";
  const chartBord = dark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const chartTxt  = dark ? "rgba(255,255,255,0.4)"  : "#6b7280";
  const chartGrid = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";

  const [activeTab,      setActiveTab]      = useState("bookings");
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [bookingType,    setBookingType]    = useState("all");
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [filterRating,   setFilterRating]   = useState("all");
  const [filterDate,     setFilterDate]     = useState("");
  const [sortOrder,      setSortOrder]      = useState("desc");
  const [toast,          setToast]          = useState("");
  const [selectedBooking,setSelectedBooking]= useState(null);
  const [replyingTo,     setReplyingTo]     = useState(null);
  const [replyText,      setReplyText]      = useState("");
  const [modalType,      setModalType]      = useState(null);
  const [editingItem,    setEditingItem]    = useState(null);
  const [forms,          setForms]          = useState(emptyForm);
  const [savingSection,  setSavingSection]  = useState(null);
  const [openSection,    setOpenSection]    = useState("general");
  const [cancelModal,    setCancelModal]    = useState(null);
  const [cancelReason,   setCancelReason]   = useState("");
  const [cancelNote,     setCancelNote]     = useState("");
  const [refundNote,     setRefundNote]     = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedIds,    setSelectedIds]    = useState(new Set());
  const [bulkAction,     setBulkAction]     = useState("");

  const [data, setData] = useState({ bookings:[], reviews:[], gers:[], trips:[], foods:[], products:[], settings:{} });

  /* toast */
  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(""), 3000);
  };

  /* helpers */
  const setFormValue = (type, key, value) => setForms(p => ({ ...p, [type]:{ ...p[type], [key]:value } }));
  const setList = (key, value) => setData(p => ({ ...p, [key]:value }));
  const getServiceName = b => { const s = b.ger||b.trip||b.productId||b.saunaId; return s?.title||s?.name||b.foodName||b.name||"Тодорхойгүй"; };
  const getBookingEndpoint = (type, id="") => `${bookingEndpoints[type]}${id?`/${id}`:"/all"}`;
  const getItemEndpoint = (type, id="", add=false) => { const base=itemConfig[type].endpoint; return add?`${base}${itemConfig[type].add}`:`${base}${id?`/${id}`:"/all"}`; };
  const openModal  = (type, item=null) => { setModalType(type); setEditingItem(item); setForms(p=>({ ...p, [type]:item?{...p[type],...item,image:null}:emptyForm[type] })); };
  const closeModal = () => { setModalType(null); setEditingItem(null); };

  /* fetch */
  const fetchData = async () => {
    try {
      const bReqs = Object.entries(bookingEndpoints).map(([type,url]) =>
        api.get(`${url}/all`).then(r=>(r.data||[]).map(x=>({...x,type}))).catch(()=>[])
      );
      const allB = (await Promise.all(bReqs)).flat();
      setList("bookings", isAdmin ? allB : allB.filter(b=>b.phone===user?.phone));
      if (!isAdmin) return;
      const res = await Promise.all([
        ["reviews","/api/reviews/all"], ["gers","/api/gers/all"],
        ["trips","/api/trips/all"],     ["foods","/api/foods/all"],
        ["products","/api/products/all"],["settings","/api/settings"],
      ].map(([key,url]) => api.get(url).then(r=>{ if(key==="settings"&&r.data) setForms(p=>({...p,settings:{...p.settings,...r.data,image:null}})); return [key,r.data||(key==="settings"?{}:[])]; }).catch(()=>[key, key==="settings"?{}:[]])));
      res.forEach(([key,val])=>setList(key,val));
    } catch(e){ console.error(e); }
  };

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get("payment")==="success") { showToast("Төлбөр амжилттай!","success"); fetchData(); window.history.replaceState({},"",location.pathname); }
  }, [location]);

  useEffect(() => {
    if (!authLoading && !token) navigate("/login");
    if (token && user) fetchData();
  }, [token, user, authLoading, navigate]);

  /* actions */
  const updateBookingStatus = async (id, type, status, extra = {}) => {
    try {
      await api.patch(getBookingEndpoint(type,id), { status, ...extra });
      setList("bookings", data.bookings.map(b => b._id===id ? {...b, status, ...extra} : b));
      showToast("Төлөв шинэчлэгдлээ","success");
    } catch { showToast("Алдаа гарлаа","error"); }
  };

  const requestCancellation = async () => {
    if (!cancelReason) { showToast("Шалтгаан сонгоно уу","error"); return; }
    const b = cancelModal;
    await updateBookingStatus(b._id, b.type, "refund_requested", {
      cancellationReason: cancelReason + (cancelNote ? ` — ${cancelNote}` : ""),
    });
    setCancelModal(null); setCancelReason(""); setCancelNote("");
    showToast("Буцаалтын хүсэлт илгээгдлээ","success");
  };

  const approveRefund = async (b) => {
    await updateBookingStatus(b._id, b.type, "refunded", {
      refundNote: refundNote || "Буцаалт батлагдлаа",
    });
    setRefundNote(""); setSelectedBooking(null);
  };

  const denyRefund = async (b) => {
    await updateBookingStatus(b._id, b.type, "refund_denied");
    setSelectedBooking(null);
  };

  const executeBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    const targets = filteredBookings.filter(b => selectedIds.has(b._id));
    await Promise.all(targets.map(b => api.patch(getBookingEndpoint(b.type, b._id), { status: bulkAction }).catch(() => {})));
    await fetchData();
    setSelectedIds(new Set()); setBulkAction("");
    showToast(`${targets.length} захиалга шинэчлэгдлээ`, "success");
  };

  const toggleSelect = (id) => setSelectedIds(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredBookings.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredBookings.map(b => b._id)));
  };

  const printBooking = (b) => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Захиалга #${b._id?.slice(-6).toUpperCase()}</title>
      <style>body{font-family:sans-serif;padding:32px;max-width:600px;margin:0 auto}h1{font-size:24px;font-weight:900}table{width:100%;border-collapse:collapse;margin-top:16px}td{padding:8px 12px;border-bottom:1px solid #eee}td:first-child{color:#666;font-size:12px;text-transform:uppercase;letter-spacing:0.1em}td:last-child{font-weight:600}.price{font-size:22px;font-weight:900;color:#ca8a04}.footer{margin-top:32px;font-size:12px;color:#999;text-align:center}</style>
      </head><body>
      <h1>Цаст Хүрхрээ Resort</h1>
      <p style="color:#999;font-size:12px">Захиалга #${b._id?.slice(-6).toUpperCase()} · ${new Date().toLocaleDateString('mn-MN')}</p>
      <table>
        <tr><td>Үйлчилгээ</td><td>${getServiceName(b)}</td></tr>
        <tr><td>Төрөл</td><td>${typeLabel[b.type]||b.type}</td></tr>
        <tr><td>Захиалагч</td><td>${b.customerName||"—"}</td></tr>
        <tr><td>Утас</td><td>${b.phone||"—"}</td></tr>
        <tr><td>Огноо</td><td>${formatDate(b.createdAt)}</td></tr>
        ${b.checkIn ? `<tr><td>Check-in</td><td>${formatDate(b.checkIn)}</td></tr>` : ''}
        ${b.checkOut ? `<tr><td>Check-out</td><td>${formatDate(b.checkOut)}</td></tr>` : ''}
        <tr><td>Төлөв</td><td>${statusLabel[b.status]||b.status}</td></tr>
        <tr><td>Нийт үнэ</td><td class="price">${Number(b.totalPrice||0).toLocaleString()}₮</td></tr>
      </table>
      <div class="footer">Цаст Хүрхрээ Resort · Баян-Өлгий, Цэнгэл сум · info@tsastkhurkhree.mn</div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };
  const handleReorder = b => {
    const s = b.ger||b.trip||b.productId||b.saunaId;
    addToCart({ type:b.type, id:s?._id||b.foodId, title:getServiceName(b), name:s?.name||b.foodName||b.name, image:s?.image||b.image, customerName:user?.name||b.customerName, phone:user?.phone||b.phone, totalPrice:b.totalPrice, peopleCount:b.peopleCount, quantity:b.quantity, checkIn:b.checkIn, checkOut:b.checkOut, travelDate:b.travelDate, foodOption:b.foodOption, extraService:b.extraService, isWild:b.isWild, category:b.productId?.category });
    showToast("Сагсанд нэмэгдлээ!","success");
  };
  const deleteBooking = async (id, type) => {
    if (!window.confirm("Устгах уу?")) return;
    try { await api.delete(getBookingEndpoint(type,id)); setList("bookings",data.bookings.filter(b=>b._id!==id)); showToast("Устгагдлаа","success"); }
    catch { showToast("Алдаа гарлаа","error"); }
  };
  const deleteItem = async (type, id) => {
    if (!window.confirm("Устгах уу?")) return;
    try { await api.delete(getItemEndpoint(type,id)); setList(itemConfig[type].state,data[itemConfig[type].state].filter(x=>x._id!==id)); showToast("Устгагдлаа","success"); }
    catch { showToast("Алдаа гарлаа","error"); }
  };
  const submitItem = async (type, e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(forms[type]).forEach(([k,v])=>{ if(v!==null&&v!==undefined&&v!=="") fd.append(k,v); });
    try {
      editingItem ? await api.patch(getItemEndpoint(type,editingItem._id),fd) : await api.post(getItemEndpoint(type,"",true),fd);
      const r = await api.get(getItemEndpoint(type));
      setList(itemConfig[type].state,r.data||[]);
      closeModal(); showToast(editingItem?"Шинэчлэгдлээ":"Нэмэгдлээ","success");
    } catch(err) { showToast(err?.response?.data?.message||"Алдаа гарлаа","error"); }
  };
  const handleSectionSubmit = async (sectionName, sectionData) => {
    setSavingSection(sectionName);
    const fd = new FormData();
    Object.entries(sectionData).forEach(([k,v])=>{ if(v!==null&&v!==undefined) fd.append(k,v); });
    try {
      await api.post("/api/settings/update",fd);
      showToast("Хадгалагдлаа ✓","success");
      const { data:ns } = await api.get("/api/settings");
      setList("settings",ns); setForms(p=>({...p,settings:{...p.settings,...ns,image:null}}));
    } catch { showToast("Алдаа гарлаа","error"); }
    finally { setSavingSection(null); }
  };
  const submitReply = async (reviewId) => {
    if (!replyText.trim()) return;
    try { await api.patch(`/api/reviews/${reviewId}/reply`,{reply:replyText}); setList("reviews",data.reviews.map(r=>r._id===reviewId?{...r,reply:replyText}:r)); setReplyText(""); setReplyingTo(null); showToast("Илгээгдлээ","success"); }
    catch { showToast("Алдаа","error"); }
  };
  const deleteReview = async id => {
    if (!window.confirm("Устгах уу?")) return;
    try { await api.delete(`/api/reviews/${id}`); setList("reviews",data.reviews.filter(r=>r._id!==id)); showToast("Устгагдлаа","success"); }
    catch { showToast("Алдаа","error"); }
  };
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.bookings.map(b=>({ Үйлчилгээ:getServiceName(b), Төрөл:typeLabel[b.type], Захиалагч:b.customerName, Утас:b.phone, Төлөв:statusLabel[b.status], Үнэ:formatCurrency(b.totalPrice) })));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Bookings"); XLSX.writeFile(wb,"Bookings.xlsx"); showToast("Excel татагдлаа","success");
  };
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Цаст Хүрхрээ — Захиалгууд",14,15);
    doc.autoTable({ startY:20, head:[["Үйлчилгээ","Төрөл","Захиалагч","Утас","Төлөв","Үнэ"]], body:data.bookings.map(b=>[getServiceName(b),b.type?.toUpperCase(),b.customerName||"",b.phone||"",b.status||"",`${Number(b.totalPrice||0).toLocaleString()}₮`]) });
    doc.save("Bookings.pdf"); showToast("PDF татагдлаа","success");
  };

  /* computed */
  const stats = useMemo(() => {
    const confirmed = data.bookings.filter(b=>b.status==="confirmed");
    const sum = type => confirmed.filter(b=>!type||b.type===type).reduce((a,b)=>a+Number(b.totalPrice||0),0);
    return {
      total:            sum(),
      ger:              sum("ger"),
      trip:             sum("trip"),
      confirmed:        data.bookings.filter(b=>b.status==="confirmed").length,
      pending:          data.bookings.filter(b=>b.status==="pending").length,
      cancelled:        data.bookings.filter(b=>b.status==="cancelled").length,
      refundRequested:  data.bookings.filter(b=>b.status==="refund_requested").length,
      refunded:         data.bookings.filter(b=>b.status==="refunded").length,
    };
  }, [data.bookings]);

  const bookingChart = [
    { name:"Баталгаажсан", value:stats.confirmed, color:"#22c55e" },
    { name:"Цуцлагдсан",   value:stats.cancelled, color:"#ef4444" },
    { name:"Хүлээгдэж буй",value:stats.pending,   color:"#eab308" },
  ].filter(x=>x.value>0);

  const weeklyActivity = useMemo(() =>
    Array.from({length:7},(_,i)=>{
      const d=new Date(); d.setDate(d.getDate()-(6-i));
      const day=d.toISOString().split("T")[0];
      return { name:d.toLocaleDateString("mn-MN",{weekday:"short"}), count:data.bookings.filter(b=>new Date(b.createdAt).toISOString().split("T")[0]===day).length };
    }), [data.bookings]);

  const filteredBookings = useMemo(() =>
    data.bookings
      .filter(b => bookingType==="all" || b.type===bookingType)
      .filter(b => filterStatus==="all" || b.status===filterStatus)
      .filter(b => !filterDate || new Date(b.createdAt).toISOString().split("T")[0]===filterDate)
      .filter(b => !customerSearch.trim() || (b.customerName||"").toLowerCase().includes(customerSearch.toLowerCase()) || (b.phone||"").includes(customerSearch))
      .sort((a,b) => sortOrder==="desc" ? new Date(b.createdAt||0)-new Date(a.createdAt||0) : new Date(a.createdAt||0)-new Date(b.createdAt||0)),
  [data.bookings,bookingType,filterStatus,filterDate,sortOrder,customerSearch]);

  const filteredReviews = useMemo(() => data.reviews.filter(r=>filterRating==="all"||Math.round(r.rating)===Number(filterRating)), [data.reviews,filterRating]);

  /* ── RENDER SECTIONS ── */
  const renderStats = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {(isAdmin ? [
        { label:"Нийт орлого",    value:`${formatNumber(stats.total)}₮`,   icon:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color:"text-yellow-400",  accent:"border-yellow-400/15" },
        { label:"Нийт захиалга",  value:data.bookings.length,               icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color:"text-sky-400",     accent:"border-sky-400/15" },
        { label:"Баталгаажсан",   value:stats.confirmed,                     icon:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color:"text-emerald-400", accent:"border-emerald-400/15" },
        { label:"Буцаалт хүсэлт", value:stats.refundRequested,              icon:"M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6", color: stats.refundRequested > 0 ? "text-orange-400" : "text-stone-400 dark:text-white/30", accent: stats.refundRequested > 0 ? "border-orange-400/20" : "border-stone-200 dark:border-white/6" },
      ] : [
        { label:"Миний захиалга", value:data.bookings.length,               icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color:"text-sky-400",     accent:"border-sky-400/15" },
        { label:"Баталгаажсан",   value:stats.confirmed,                    icon:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color:"text-emerald-400", accent:"border-emerald-400/15" },
        { label:"Хүлээгдэж буй",  value:stats.pending,                      icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color:"text-orange-400",  accent:"border-orange-400/15" },
        { label:"Нийт зарцуулсан",value:`${formatNumber(stats.total)}₮`,    icon:"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color:"text-yellow-400", accent:"border-yellow-400/15" },
      ]).map((s,i) => (
        <div key={i} className={`bg-white dark:bg-white/3 border ${s.accent||"border-stone-200 dark:border-white/6"} hover:border-stone-300 dark:hover:border-white/15 rounded-2xl p-5 transition-all group shadow-sm dark:shadow-none`}>
          <div className={`w-9 h-9 rounded-xl bg-stone-100 dark:bg-white/5 flex items-center justify-center mb-4 ${s.color}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
            </svg>
          </div>
          <p className="text-stone-400 dark:text-white/30 text-[10px] font-semibold uppercase tracking-widest mb-1">{s.label}</p>
          <p className={`text-2xl font-black italic tracking-tighter ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      {isAdmin && stats.refundRequested > 0 && (
        <div className="flex items-center gap-4 bg-orange-400/8 border border-orange-400/25 rounded-2xl px-5 py-4">
          <div className="w-9 h-9 bg-orange-400/15 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-orange-400 font-bold text-sm">Буцаалтын хүсэлт хүлээгдэж байна</p>
            <p className="text-orange-400/60 text-xs mt-0.5">{stats.refundRequested} захиалга шийдвэрлэгдэхийг хүлээж байна</p>
          </div>
          <button onClick={()=>setFilterStatus("refund_requested")}
            className="px-4 py-2 bg-orange-400/15 border border-orange-400/25 text-orange-400 text-xs font-bold rounded-xl hover:bg-orange-400/25 transition-all uppercase tracking-widest">
            Харах
          </button>
        </div>
      )}
      {renderStats()}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartCard title="Захиалгын төлөв">
            <PieChart>
              <Pie data={bookingChart} dataKey="value" nameKey="name" outerRadius={90} strokeWidth={0}>
                {bookingChart.map((e,i)=><Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background:chartBg, border:`1px solid ${chartBord}`, borderRadius:12, color: dark?"#fff":"#111" }} />
              <Legend wrapperStyle={{ color: chartTxt }} />
            </PieChart>
          </ChartCard>
          <ChartCard title="7 хоногийн захиалга">
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
              <XAxis dataKey="name" tick={{ fill:chartTxt, fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:chartTxt, fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background:chartBg, border:`1px solid ${chartBord}`, borderRadius:12, color: dark?"#fff":"#111" }} />
              <Bar dataKey="count" fill={dark?"#facc15":"#16a34a"} radius={[6,6,0,0]} />
            </BarChart>
          </ChartCard>
        </div>
      )}

      {/* filters */}
      <div className="bg-white dark:bg-white/3 border border-stone-200 dark:border-white/6 rounded-2xl p-5 shadow-sm dark:shadow-none">
        {/* Filters */}
        <div className="space-y-3 mb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select className={inp} value={bookingType} onChange={e=>setBookingType(e.target.value)}>
              <option value="all">Бүх төрөл</option>
              <option value="ger">Гэр</option>
              <option value="trip">Аялал</option>
              <option value="food">Хоол</option>
              <option value="product">Бараа</option>
            </select>
            <select className={inp} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
              <option value="all">Бүх төлөв</option>
              <option value="pending">Хүлээгдэж буй</option>
              <option value="confirmed">Баталгаажсан</option>
              <option value="cancelled">Цуцлагдсан</option>
              <option value="refund_requested">Буцаалт хүсэлт</option>
              <option value="refunded">Буцаалт хийгдсэн</option>
            </select>
            <input className={inp} type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} />
            <select className={inp} value={sortOrder} onChange={e=>setSortOrder(e.target.value)}>
              <option value="desc">Шинэ дээрээ</option>
              <option value="asc">Хуучин дээрээ</option>
            </select>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Customer search */}
            <div className="relative flex-1 min-w-[200px]">
              <input className={`${inp} pl-9`} placeholder="Захиалагч хайх..." value={customerSearch} onChange={e=>setCustomerSearch(e.target.value)} />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            {/* Result count */}
            <span className="text-stone-400 dark:text-white/25 text-xs shrink-0">{filteredBookings.length} захиалга</span>

            {/* Bulk actions (admin only) */}
            {isAdmin && selectedIds.size > 0 && (
              <div className="flex items-center gap-2 glass rounded-xl px-3 py-1.5 animate-scale-in">
                <span className="text-yellow-400 text-xs font-bold">{selectedIds.size} сонгогдсон</span>
                <select className="bg-transparent text-white/60 text-xs outline-none cursor-pointer" value={bulkAction} onChange={e=>setBulkAction(e.target.value)}>
                  <option value="">Үйлдэл...</option>
                  <option value="confirmed">Батлах</option>
                  <option value="cancelled">Цуцлах</option>
                  <option value="refunded">Буцаалт хийх</option>
                </select>
                <button onClick={executeBulkAction} disabled={!bulkAction}
                  className="px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-lg disabled:opacity-40 hover:bg-white transition-all">
                  Хэрэгжүүлэх
                </button>
                <button onClick={()=>setSelectedIds(new Set())} className="text-white/30 hover:text-white transition-colors text-sm">×</button>
              </div>
            )}
          </div>
        </div>

        {isAdmin ? (
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-white/5">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 dark:bg-transparent">
                <tr className="border-b border-stone-200 dark:border-white/5">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selectedIds.size===filteredBookings.length && filteredBookings.length>0} onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded accent-green-500 dark:accent-yellow-400 cursor-pointer" />
                  </th>
                  {["Үйлчилгээ","Төрөл","Захиалагч","Огноо","Үнэ","Төлөв","Үйлдэл"].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b=>(
                  <tr key={b._id} className={`border-t border-stone-100 dark:border-white/5 hover:bg-stone-50 dark:hover:bg-white/3 transition-colors ${selectedIds.has(b._id) ? 'bg-green-50 dark:bg-yellow-400/4' : ''} ${b.status==='refund_requested' ? 'border-l-2 border-l-orange-400/40' : ''}`}>
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selectedIds.has(b._id)} onChange={()=>toggleSelect(b._id)}
                        className="w-3.5 h-3.5 rounded accent-green-500 dark:accent-yellow-400 cursor-pointer" />
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-stone-900 dark:text-white text-sm">{getServiceName(b)}</td>
                    <td className="px-4 py-3.5"><span className="text-[9px] font-bold text-stone-400 dark:text-white/40 uppercase tracking-widest">{typeLabel[b.type]}</span></td>
                    <td className="px-4 py-3.5"><p className="text-sm font-semibold text-stone-800 dark:text-white">{b.customerName}</p><p className="text-xs text-stone-400 dark:text-white/30">{b.phone}</p></td>
                    <td className="px-4 py-3.5 text-sm text-stone-500 dark:text-white/40">{formatDate(b.createdAt)}</td>
                    <td className="px-4 py-3.5 font-bold text-amber-600 dark:text-yellow-400">{formatCurrency(b.totalPrice)}</td>
                    <td className="px-4 py-3.5"><span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${statusColor[b.status]}`}>{statusLabel[b.status]}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-3 justify-end flex-wrap">
                        <button onClick={()=>setSelectedBooking(b)} className="text-[10px] font-semibold text-sky-500 dark:text-sky-400 hover:text-sky-700 dark:hover:text-white uppercase transition-colors">Үзэх</button>
                        <button onClick={()=>handleReorder(b)} className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-white uppercase transition-colors">Дахин</button>
                        {b.status==="pending" && <button onClick={()=>updateBookingStatus(b._id,b.type,"confirmed")} className="text-[10px] font-semibold text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-white uppercase transition-colors">Батлах</button>}
                        {b.status==="refund_requested" && (
                          <button onClick={()=>setSelectedBooking(b)} className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase transition-colors bg-orange-100 dark:bg-orange-400/10 px-2 py-0.5 rounded">Буцаалт</button>
                        )}
                        {!["cancelled","refunded","refund_requested"].includes(b.status) && <button onClick={()=>updateBookingStatus(b._id,b.type,"cancelled")} className="text-[10px] font-semibold text-amber-600 dark:text-yellow-400 hover:text-amber-800 dark:hover:text-white uppercase transition-colors">Цуцлах</button>}
                        <button onClick={()=>printBooking(b)} className="text-[10px] font-semibold text-stone-400 dark:text-white/30 hover:text-stone-700 dark:hover:text-white uppercase transition-colors" title="Хэвлэх">🖨</button>
                        <button onClick={()=>deleteBooking(b._id,b.type)} className="text-[10px] font-semibold text-red-500 dark:text-red-400 uppercase transition-colors">Устгах</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredBookings.length && <p className="p-8 text-center text-stone-400 dark:text-white/20 text-sm">Захиалга олдсонгүй</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookings.map(b=>{
              const img = (b.ger||b.trip||b.productId||b.saunaId)?.image||b.image;
              return (
                <div key={b._id} className="border border-stone-200 dark:border-white/6 rounded-2xl p-4 flex gap-4 hover:border-green-300 dark:hover:border-yellow-400/15 transition-all bg-white dark:bg-white/2 shadow-sm dark:shadow-none">
                  <div className="w-16 h-16 rounded-xl shrink-0 overflow-hidden border border-stone-200 dark:border-white/5">
                    <img src={img?`${api.defaults.baseURL}/uploads/${img}`:"/placeholder.jpg"} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-bold text-amber-600 dark:text-yellow-400 uppercase tracking-widest">{typeLabel[b.type]}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusColor[b.status]}`}>{statusLabel[b.status]}</span>
                    </div>
                    <h4 className="font-bold text-stone-900 dark:text-white text-sm truncate mb-0.5">{getServiceName(b)}</h4>
                    <p className="text-xs text-stone-400 dark:text-white/30">{formatDate(b.createdAt)}</p>
                    <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
                      <p className="font-bold text-amber-600 dark:text-yellow-400 text-sm">{formatCurrency(b.totalPrice)}</p>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={()=>handleReorder(b)} className="text-[10px] font-semibold text-emerald-400 uppercase">Дахин</button>
                        <button onClick={()=>setSelectedBooking(b)} className="text-[10px] font-semibold text-sky-400 uppercase">Харах</button>
                        {(b.status==="confirmed"||b.status==="pending") && (
                          <button onClick={()=>{ setCancelModal(b); setCancelReason(""); setCancelNote(""); }}
                            className="text-[10px] font-semibold text-orange-400 uppercase">Буцаах</button>
                        )}
                      </div>
                    </div>
                    {/* Cancellation reason */}
                    {b.cancellationReason && (
                      <div className="mt-2 text-[10px] text-white/30 bg-white/3 rounded-lg px-3 py-1.5 leading-relaxed">
                        <span className="text-orange-400/70 font-semibold uppercase tracking-widest">Шалтгаан: </span>
                        {b.cancellationReason}
                      </div>
                    )}
                    {/* Refund note */}
                    {b.refundNote && (
                      <div className="mt-2 text-[10px] text-white/30 bg-purple-400/5 rounded-lg px-3 py-1.5 leading-relaxed">
                        <span className="text-purple-400/70 font-semibold uppercase tracking-widest">Буцаалт: </span>
                        {b.refundNote}
                      </div>
                    )}
                    {/* Status timeline mini */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {['pending','confirmed','refunded'].map((s,i) => {
                        const past = ['pending','confirmed','cancelled','refunded','refund_requested','refund_denied'].indexOf(b.status) >= ['pending','confirmed','cancelled','refunded','refund_requested','refund_denied'].indexOf(s);
                        const isCurrent = b.status === s;
                        return (
                          <React.Fragment key={s}>
                            <div className={`w-2 h-2 rounded-full transition-colors ${isCurrent ? 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.6)]' : past ? 'bg-emerald-400' : 'bg-white/10'}`} />
                            {i < 2 && <div className={`flex-1 h-px ${past ? 'bg-emerald-400/40' : 'bg-white/5'}`} />}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            {!filteredBookings.length && <p className="p-8 text-center text-white/20 col-span-2">Захиалга олдсонгүй</p>}
          </div>
        )}
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Сэтгэгдлүүд <span className="text-white/30 text-sm font-normal">({filteredReviews.length})</span></h3>
        <select className={`${inp} w-auto`} value={filterRating} onChange={e=>setFilterRating(e.target.value)}>
          <option value="all">Бүх үнэлгээ</option>
          {[5,4,3,2,1].map(n=><option key={n} value={n}>{n} ★</option>)}
        </select>
      </div>
      {filteredReviews.map(r=>(
        <div key={r._id} className="bg-white/3 border border-white/6 hover:border-yellow-400/10 rounded-2xl p-5 transition-all">
          <div className="flex justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-bold text-sm shrink-0">
                {(r.userName||"U").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{r.userName||r.customerName||"Хэрэглэгч"}</p>
                <p className="text-yellow-400 text-xs">{"★".repeat(Math.round(r.rating))}<span className="text-white/20 ml-1">{r.rating}</span></p>
              </div>
            </div>
            <button onClick={()=>deleteReview(r._id)} className="text-[10px] font-semibold text-red-400 hover:text-white uppercase transition-colors">Устгах</button>
          </div>
          <p className="text-sm text-white/50 leading-relaxed mb-3">"{r.comment||r.message}"</p>
          {r.reply && <div className="bg-yellow-400/8 border border-yellow-400/15 rounded-xl p-3 mb-3"><p className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest mb-1">Ресортын хариу</p><p className="text-sm text-white/60">{r.reply}</p></div>}
          {replyingTo===r._id ? (
            <div className="flex gap-2 mt-3">
              <input className={inp} value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Хариу бичих..." />
              <button onClick={()=>submitReply(r._id)} className="px-4 py-2.5 bg-yellow-400 text-black rounded-xl font-bold text-sm hover:bg-white transition-all shrink-0">Илгээх</button>
            </div>
          ) : <button onClick={()=>setReplyingTo(r._id)} className="text-[10px] font-semibold text-sky-400 hover:text-white uppercase transition-colors mt-1">+ Хариу бичих</button>}
        </div>
      ))}
      {!filteredReviews.length && <p className="p-10 text-center text-white/20">Сэтгэгдэл олдсонгүй</p>}
    </div>
  );

  const renderItems = (type) => {
    const items = data[itemConfig[type].state];
    const getTitle = i => i.title||i.name||i.gerNumber||"—";
    const getSub   = i => i.location||i.category||i.description||"";
    const imgOf    = i => i?.image?`${api.defaults.baseURL}/uploads/${i.image}`:"/placeholder.jpg";
    const gerStatusMap = { available:"Сул", booked:"Захиалсан", maintenance:"Засвартай" };
    return (
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-stone-900 dark:text-white">{itemConfig[type].title} <span className="text-stone-400 dark:text-white/30 text-sm font-normal">({items.length})</span></h3>
          <button onClick={()=>openModal(type)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 dark:bg-yellow-400 text-white dark:text-black rounded-xl font-bold text-sm hover:bg-green-700 dark:hover:bg-white transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Нэмэх
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(item=>(
            <div key={item._id} className="bg-white dark:bg-white/3 border border-stone-200 dark:border-white/6 hover:border-green-300 dark:hover:border-yellow-400/15 rounded-2xl overflow-hidden transition-all group shadow-sm dark:shadow-none">
              <div className="h-44 overflow-hidden relative">
                <img src={imgOf(item)} alt={getTitle(item)} className="w-full h-full object-cover brightness-75 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500" />
                {type==="ger" && (
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${item.status==="available"?"bg-emerald-400/20 text-emerald-400":"bg-red-400/20 text-red-400"}`}>
                    {gerStatusMap[item.status]||item.status}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-bold text-stone-900 dark:text-white text-sm truncate mb-0.5 group-hover:text-green-600 dark:group-hover:text-yellow-400 transition-colors">{getTitle(item)}</h4>
                <p className="text-xs text-stone-400 dark:text-white/30 truncate mb-2">{getSub(item)}</p>
                <div className="flex justify-between items-center border-t border-stone-100 dark:border-white/5 pt-3">
                  <p className="text-amber-600 dark:text-yellow-400 font-bold text-sm">{formatCurrency(item[itemConfig[type].priceKey])}</p>
                  <div className="flex gap-2">
                    <button onClick={()=>openModal(type,item)} className="px-3 py-1.5 bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/8 text-stone-700 dark:text-white text-xs font-semibold rounded-lg hover:bg-green-600 dark:hover:bg-yellow-400 hover:text-white dark:hover:text-black hover:border-transparent transition-all">Засах</button>
                    <button onClick={()=>deleteItem(type,item._id)} className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-all">Устгах</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!items.length && <p className="p-10 text-stone-400 dark:text-white/20 col-span-3">Мэдээлэл байхгүй</p>}
        </div>
      </div>
    );
  };

  /* ─── SETTINGS accordion ─── */
  const SECTIONS = [
    { key:"general",     label:"Ерөнхий тохиргоо",       icon:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
    { key:"hero",        label:"Hero хэсэг",               icon:"M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { key:"destination", label:"Destination хэсэг",        icon:"M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
    { key:"services",    label:"Үйлчилгээнүүд (5)",        icon:"M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { key:"features",    label:"Онцлогууд (4 карт)",       icon:"M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { key:"location",    label:"Байршил хуудас (6 карт)",  icon:"M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
    { key:"steps",       label:"Захиалгын алхмууд",        icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
  ];

  const fv = (k) => forms.settings[k]||"";
  const sv = (k,v) => setFormValue("settings",k,v);

  const SaveBtn = ({section, keys}) => {
    const saving = savingSection===section;
    return (
      <button type="button" disabled={saving}
        onClick={()=>{ const d={}; keys.forEach(k=>{ d[k]=forms.settings[k]||null; }); handleSectionSubmit(section,d); }}
        className="w-full py-3 bg-green-600 dark:bg-yellow-400 text-white dark:text-black rounded-xl font-bold text-sm hover:bg-green-700 dark:hover:bg-white transition-all disabled:opacity-40 flex items-center justify-center gap-2">
        {saving ? <><span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"/> Хадгалж байна...</> : "Хадгалах →"}
      </button>
    );
  };

  const renderSettings = () => (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
      {/* section nav */}
      <div className="space-y-1">
        {SECTIONS.map(s=>(
          <button key={s.key} onClick={()=>setOpenSection(s.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all duration-200 ${
              openSection===s.key ? "bg-green-50 dark:bg-yellow-400/10 text-green-600 dark:text-yellow-400 border border-green-200 dark:border-yellow-400/20" : "text-stone-500 dark:text-white/40 hover:text-stone-900 dark:hover:text-white/70 hover:bg-stone-100 dark:hover:bg-white/4 border border-transparent"
            }`}>
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
            </svg>
            {s.label}
          </button>
        ))}
      </div>

      {/* section content */}
      <div className="bg-white dark:bg-white/3 border border-stone-200 dark:border-white/6 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-none">
        {openSection==="general" && (
          <>
            <SectionHeader title="Ерөнхий тохиргоо" desc="Брэнд нэр, лого, холбоо барих мэдээлэл" />
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Логоны үсэг"><input className={inp} value={fv("logoText")} onChange={e=>sv("logoText",e.target.value)} /></FieldGroup>
              <FieldGroup label="Брэндийн нэр"><input className={inp} value={fv("brandName")} onChange={e=>sv("brandName",e.target.value)} /></FieldGroup>
            </div>
            <FieldGroup label="Логоны зураг">
              {data.settings?.image && <img src={`${api.defaults.baseURL}/uploads/${data.settings.image}`} className="w-12 h-12 rounded-xl object-cover mb-2 border border-white/10" alt="" />}
              <input className={inp} type="file" onChange={e=>sv("image",e.target.files[0])} />
            </FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Утас"><input className={inp} value={fv("phone")} onChange={e=>sv("phone",e.target.value)} /></FieldGroup>
              <FieldGroup label="Имэйл"><input className={inp} type="email" value={fv("email")} onChange={e=>sv("email",e.target.value)} /></FieldGroup>
            </div>
            <FieldGroup label="Хаяг"><textarea className={`${inp} min-h-[80px] resize-none`} value={fv("address")} onChange={e=>sv("address",e.target.value)} /></FieldGroup>
            <div className="grid grid-cols-3 gap-4">
              <FieldGroup label="Facebook"><input className={inp} placeholder="https://..." value={fv("facebook")} onChange={e=>sv("facebook",e.target.value)} /></FieldGroup>
              <FieldGroup label="Instagram"><input className={inp} placeholder="https://..." value={fv("instagram")} onChange={e=>sv("instagram",e.target.value)} /></FieldGroup>
              <FieldGroup label="Twitter / X"><input className={inp} placeholder="https://..." value={fv("twitter")} onChange={e=>sv("twitter",e.target.value)} /></FieldGroup>
            </div>
            <SaveBtn section="Ерөнхий тохиргоо" keys={["logoText","brandName","image","phone","email","address","facebook","instagram","twitter"]} />
          </>
        )}

        {openSection==="hero" && (
          <>
            <SectionHeader title="Hero хэсэг" desc="Нүүр хуудасны том гарчиг, дэд гарчиг, зураг" />
            <FieldGroup label="Hero гарчиг"><input className={inp} placeholder="ЦАСТ ХҮРХРЭЭ" value={fv("heroTitle")} onChange={e=>sv("heroTitle",e.target.value)} /></FieldGroup>
            <FieldGroup label="Hero дэд гарчиг"><textarea className={`${inp} min-h-[80px] resize-none`} placeholder="Алтайн уулсын зүрхэнд..." value={fv("heroSubtitle")} onChange={e=>sv("heroSubtitle",e.target.value)} /></FieldGroup>
            <FieldGroup label="Hero дэвсгэр зураг">
              <input className={inp} type="file" onChange={e=>sv("heroImage",e.target.files[0])} />
            </FieldGroup>
            <SaveBtn section="Hero хэсэг" keys={["heroTitle","heroSubtitle","heroImage"]} />
          </>
        )}

        {openSection==="destination" && (
          <>
            <SectionHeader title="Destination хэсэг" desc="Байршлын танилцуулга хэсэг" />
            <FieldGroup label="Badge текст"><input className={inp} placeholder="Байршил" value={fv("destinationBadge")} onChange={e=>sv("destinationBadge",e.target.value)} /></FieldGroup>
            <FieldGroup label="Гарчиг"><input className={inp} placeholder="БАГА ТҮРГЭНИЙ ХҮРХРЭЭ" value={fv("destinationTitle")} onChange={e=>sv("destinationTitle",e.target.value)} /></FieldGroup>
            <FieldGroup label="Тайлбар"><textarea className={`${inp} min-h-[100px] resize-none`} placeholder="Тайлбар текст..." value={fv("destinationDescription")} onChange={e=>sv("destinationDescription",e.target.value)} /></FieldGroup>
            <FieldGroup label="Зураг">
              <input className={inp} type="file" onChange={e=>sv("destinationImage",e.target.files[0])} />
            </FieldGroup>
            <SaveBtn section="Destination хэсэг" keys={["destinationBadge","destinationTitle","destinationDescription","destinationImage"]} />
          </>
        )}

        {openSection==="services" && (
          <>
            <SectionHeader title="Үйлчилгээнүүд" desc="Нүүр хуудасны 5 үйлчилгээний карт" />
            {[1,2,3,4,5].map(i=>(
              <div key={i} className="bg-white/3 border border-white/6 rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Үйлчилгээ {i}</p>
                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup label="Гарчиг"><input className={inp} value={fv(`serviceTitle${i}`)} onChange={e=>sv(`serviceTitle${i}`,e.target.value)} /></FieldGroup>
                  <FieldGroup label="Холбоос"><input className={inp} placeholder="/gers" value={fv(`serviceLink${i}`)} onChange={e=>sv(`serviceLink${i}`,e.target.value)} /></FieldGroup>
                </div>
                <FieldGroup label="Тайлбар"><input className={inp} value={fv(`serviceDesc${i}`)} onChange={e=>sv(`serviceDesc${i}`,e.target.value)} /></FieldGroup>
                <FieldGroup label="Зураг"><input className={inp} type="file" onChange={e=>sv(`serviceImg${i}`,e.target.files[0])} /></FieldGroup>
              </div>
            ))}
            <SaveBtn section="Үйлчилгээнүүд" keys={[1,2,3,4,5].flatMap(i=>[`serviceTitle${i}`,`serviceLink${i}`,`serviceDesc${i}`,`serviceImg${i}`])} />
          </>
        )}

        {openSection==="features" && (
          <>
            <SectionHeader title="Онцлогуудын хэсэг" desc="Нүүр хуудасны 4 карт — гарчиг, тайлбар, холбоос, зураг тус бүр засна" />
            <FieldGroup label="Хэсгийн гарчиг">
              <input className={inp} placeholder="Дэлгэрэнгүй танилцуулга" value={fv("featureSectionTitle")} onChange={e=>sv("featureSectionTitle",e.target.value)} />
            </FieldGroup>

            {[
              { n:1, icon:"🗺️", defaultTitle:"Газар зүй",        defaultLink:"/location" },
              { n:2, icon:"🏕️", defaultTitle:"Ресортын бүтэц",  defaultLink:"/resort"   },
              { n:3, icon:"🌿", defaultTitle:"Байгалийн онцлог", defaultLink:"/nature"   },
              { n:4, icon:"🦅", defaultTitle:"Ан амьтад",        defaultLink:"/wildlife" },
            ].map(({n,icon,defaultTitle,defaultLink})=>{
              const existingImg = fv(`featureImg${n}`);
              const previewUrl = existingImg && typeof existingImg === "string"
                ? `${api.defaults.baseURL}/uploads/${existingImg}` : null;
              return (
                <div key={n} className="bg-white/3 border border-white/6 rounded-2xl p-5 space-y-4">
                  {/* Card header */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-lg">{icon}</div>
                    <div>
                      <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Карт {n}</p>
                      <p className="text-white/30 text-[10px]">{defaultTitle}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FieldGroup label="Гарчиг">
                      <input className={inp} placeholder={defaultTitle} value={fv(`featureTitle${n}`)} onChange={e=>sv(`featureTitle${n}`,e.target.value)} />
                    </FieldGroup>
                    <FieldGroup label="Холбоос (link)">
                      <input className={inp} placeholder={defaultLink} value={fv(`featureLink${n}`)} onChange={e=>sv(`featureLink${n}`,e.target.value)} />
                    </FieldGroup>
                  </div>

                  <FieldGroup label="Тайлбар">
                    <textarea className={`${inp} min-h-[70px] resize-none`} value={fv(`featureDesc${n}`)} onChange={e=>sv(`featureDesc${n}`,e.target.value)} />
                  </FieldGroup>

                  <FieldGroup label="Зураг (дэвсгэр зураг)">
                    {previewUrl && (
                      <div className="mb-2 relative rounded-xl overflow-hidden h-28 border border-white/8">
                        <img src={previewUrl} alt="preview" className="w-full h-full object-cover brightness-75" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                          <span className="text-[9px] text-white/50 uppercase tracking-widest">Одоогийн зураг</span>
                        </div>
                      </div>
                    )}
                    <input className={inp} type="file" accept="image/*" onChange={e=>sv(`featureImg${n}`,e.target.files[0])} />
                  </FieldGroup>
                </div>
              );
            })}

            <SaveBtn section="Дэлгэрэнгүй танилцуулга" keys={["featureSectionTitle",...[1,2,3,4].flatMap(i=>[`featureTitle${i}`,`featureLink${i}`,`featureDesc${i}`,`featureImg${i}`])]} />
          </>
        )}

        {openSection==="location" && (
          <>
            <SectionHeader title="Байршил хуудас" desc="6 мэдээллийн карт — гарчиг, агуулга, зураг тус бүр засна" />

            {[
              { n:1, icon:'📍', label:'Байршил',            type:'text'  },
              { n:2, icon:'🚗', label:'Авто замын удирдамж',type:'list'  },
              { n:3, icon:'✈️', label:'Агаарын үйлчилгээ',  type:'list'  },
              { n:4, icon:'🌡️', label:'Уур амьсгал',        type:'stats' },
              { n:5, icon:'🏥', label:'Ойрын үйлчилгээ',   type:'list'  },
              { n:6, icon:'💡', label:'Зөвлөмж',            type:'list'  },
            ].map(({n, icon, label, type}) => {
              const existingImg = fv(`locationCard${n}Img`);
              const previewUrl = existingImg && typeof existingImg === "string"
                ? `${api.defaults.baseURL}/uploads/${existingImg}` : null;
              return (
                <div key={n} className="bg-white/3 border border-white/6 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">{icon}</div>
                    <div>
                      <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Карт {n}</p>
                      <p className="text-white/30 text-[10px]">{label}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FieldGroup label="Icon (emoji)">
                      <input className={inp} placeholder={icon} value={fv(`locationCard${n}Icon`)} onChange={e=>sv(`locationCard${n}Icon`,e.target.value)} />
                    </FieldGroup>
                    <FieldGroup label="Гарчиг">
                      <input className={inp} placeholder={label} value={fv(`locationCard${n}Title`)} onChange={e=>sv(`locationCard${n}Title`,e.target.value)} />
                    </FieldGroup>
                  </div>

                  {type === 'stats' ? (
                    <div className="space-y-3">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">Статистик (3 утга)</p>
                      {[1,2,3].map(s=>(
                        <div key={s} className="grid grid-cols-2 gap-2">
                          <FieldGroup label={`Утга ${s}`}>
                            <input className={inp} placeholder="1800м" value={fv(`locationStat${s}Value`)} onChange={e=>sv(`locationStat${s}Value`,e.target.value)} />
                          </FieldGroup>
                          <FieldGroup label={`Тайлбар ${s}`}>
                            <input className={inp} placeholder="Далайн түвшнээс" value={fv(`locationStat${s}Label`)} onChange={e=>sv(`locationStat${s}Label`,e.target.value)} />
                          </FieldGroup>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <FieldGroup label={type === 'text' ? 'Агуулга' : 'Агуулга (мөр бүр тусдаа жагсаалт болно)'}>
                      <textarea
                        className={`${inp} resize-none`}
                        rows={type === 'list' ? 4 : 3}
                        placeholder={type === 'list' ? 'Мөр 1\nМөр 2\nМөр 3' : 'Тайлбар текст...'}
                        value={fv(`locationCard${n}Body`)}
                        onChange={e=>sv(`locationCard${n}Body`,e.target.value)}
                      />
                    </FieldGroup>
                  )}

                  <FieldGroup label="Дэвсгэр зураг (нэмэлт)">
                    {previewUrl && (
                      <div className="mb-2 relative rounded-xl overflow-hidden h-28 border border-white/8">
                        <img src={previewUrl} alt="preview" className="w-full h-full object-cover brightness-60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                          <span className="text-[9px] text-white/50 uppercase tracking-widest">Одоогийн зураг</span>
                        </div>
                      </div>
                    )}
                    <input className={inp} type="file" accept="image/*" onChange={e=>sv(`locationCard${n}Img`,e.target.files[0])} />
                  </FieldGroup>
                </div>
              );
            })}

            <SaveBtn
              section="Байршил хуудас"
              keys={[
                ...[1,2,3,4,5,6].flatMap(n=>[`locationCard${n}Icon`,`locationCard${n}Title`,`locationCard${n}Img`]),
                ...[1,2,3,4,5,6].filter(n=>n!==4).map(n=>`locationCard${n}Body`),
                ...[1,2,3].flatMap(s=>[`locationStat${s}Value`,`locationStat${s}Label`]),
              ]}
            />
          </>
        )}

        {openSection==="steps" && (
          <>
            <SectionHeader title="Захиалгын алхмууд" desc="'Хэрхэн захиалах вэ?' хэсгийн 3 алхам" />
            {[1,2,3].map(i=>(
              <div key={i} className="bg-white/3 border border-white/6 rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Алхам {i}</p>
                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup label="Гарчиг"><input className={inp} value={fv(`stepTitle${i}`)} onChange={e=>sv(`stepTitle${i}`,e.target.value)} /></FieldGroup>
                  <FieldGroup label="Тайлбар"><input className={inp} value={fv(`stepDesc${i}`)} onChange={e=>sv(`stepDesc${i}`,e.target.value)} /></FieldGroup>
                </div>
                <FieldGroup label="Зураг"><input className={inp} type="file" onChange={e=>sv(`stepImg${i}`,e.target.files[0])} /></FieldGroup>
              </div>
            ))}
            <SaveBtn section="Захиалгын алхам" keys={[1,2,3].flatMap(i=>[`stepTitle${i}`,`stepDesc${i}`,`stepImg${i}`])} />
          </>
        )}
      </div>
    </div>
  );

  /* ─── LOADING ─── */
  if (authLoading) return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#080809] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-green-400/20 dark:border-yellow-400/20 border-t-green-500 dark:border-t-yellow-400 rounded-full animate-spin" />
    </div>
  );

  const tabs = isAdmin ? ADMIN_TABS : USER_TABS;

  /* ══════════════════════════════════════════════════════
     MAIN RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#080809] text-stone-900 dark:text-white flex transition-colors duration-300">

      {/* toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border animate-scale-in text-sm font-medium ${
          toast.type==="success" ? "bg-white dark:bg-[#0f0f14] border-emerald-300 dark:border-emerald-400/25 text-emerald-700 dark:text-emerald-400" :
          toast.type==="error"   ? "bg-white dark:bg-[#0f0f14] border-red-300 dark:border-red-400/25 text-red-600 dark:text-red-400" :
          "bg-white dark:bg-[#0f0f14] border-amber-300 dark:border-yellow-400/25 text-amber-700 dark:text-yellow-400"
        }`}>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
          {toast.msg}
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <>
        {/* mobile overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={()=>setSidebarOpen(false)} />}

        <aside className={`fixed top-0 left-0 h-full w-[240px] bg-white dark:bg-[#060609] border-r border-stone-200 dark:border-white/[0.04] z-40 flex flex-col transition-transform duration-300 ${sidebarOpen?"translate-x-0":"-translate-x-full"} lg:translate-x-0`}>

          {/* brand */}
          <div className="px-5 py-5 border-b border-stone-200 dark:border-white/[0.04]">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-black text-sm shrink-0 group-hover:scale-105 transition-transform">Ц</div>
              <div>
                <p className="text-stone-900 dark:text-white font-black text-sm uppercase italic leading-none">Цаст<span className="text-green-600 dark:text-yellow-400">Хүрхрээ</span></p>
                <p className="text-stone-400 dark:text-white/20 text-[9px] tracking-widest">Resort · Admin</p>
              </div>
            </Link>
          </div>

          {/* nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
            <p className="text-[9px] font-semibold text-stone-400 dark:text-white/20 uppercase tracking-widest px-3 mb-3">{isAdmin ? "Удирдлага" : "Хэрэглэгч"}</p>
            {tabs.map(t=>(
              <button key={t.key} onClick={()=>{ setActiveTab(t.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all duration-150 ${
                  activeTab===t.key ? "bg-green-50 dark:bg-yellow-400/10 text-green-600 dark:text-yellow-400" : "text-stone-500 dark:text-white/40 hover:text-stone-900 dark:hover:text-white/70 hover:bg-stone-100 dark:hover:bg-white/4"
                }`}>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>{t.icon}</svg>
                {t.label}
                {t.key==="bookings" && stats.refundRequested>0 && (
                  <span className="ml-auto px-1.5 py-0.5 bg-orange-400/20 text-orange-400 text-[9px] font-bold rounded-full animate-pulse">
                    {stats.refundRequested}
                  </span>
                )}
                {activeTab===t.key && stats.refundRequested===0 && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-yellow-400" />}
              </button>
            ))}

            {/* quick links */}
            <div className="pt-4 mt-2 border-t border-stone-200 dark:border-white/[0.04]">
              <p className="text-[9px] font-semibold text-stone-400 dark:text-white/20 uppercase tracking-widest px-3 mb-3">Хуудас</p>
              {[["/",'Нүүр'],['/gers','Гэрүүд'],['/trips','Аяллууд'],['/foods','Хоол'],['/products','Дэлгүүр']].map(([to,label])=>(
                <Link key={to} to={to} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-400 dark:text-white/30 hover:text-stone-700 dark:hover:text-white/60 hover:bg-stone-100 dark:hover:bg-white/4 transition-all">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  {label}
                </Link>
              ))}
            </div>
          </nav>

          {/* user + logout */}
          <div className="px-3 py-4 border-t border-stone-200 dark:border-white/[0.04] space-y-1">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-yellow-400/15 border border-green-200 dark:border-yellow-400/20 flex items-center justify-center text-green-600 dark:text-yellow-400 font-bold text-sm shrink-0">
                {(user?.name||user?.phone||"U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-stone-900 dark:text-white text-sm font-semibold truncate">{user?.name||"Хэрэглэгч"}</p>
                <p className="text-stone-400 dark:text-white/30 text-[10px]">{isAdmin?"Admin":"Хэрэглэгч"}</p>
              </div>
            </div>
            <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-400 dark:text-white/30 hover:text-stone-700 dark:hover:text-white/60 hover:bg-stone-100 dark:hover:bg-white/4 transition-all">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Профайл засах
            </Link>
            <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/8 transition-all">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Гарах
            </button>
          </div>
        </aside>
      </>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 lg:ml-[240px] min-w-0">

        {/* top bar */}
        <div className="sticky top-0 z-20 bg-stone-100/90 dark:bg-[#080809]/90 backdrop-blur-xl border-b border-stone-200 dark:border-white/[0.04] px-5 md:px-8 h-14 flex items-center gap-4">
          {/* hamburger */}
          <button onClick={()=>setSidebarOpen(v=>!v)} className="lg:hidden p-2 text-stone-400 dark:text-white/40 hover:text-stone-900 dark:hover:text-white transition-colors rounded-xl hover:bg-stone-200 dark:hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          {/* breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-stone-400 dark:text-white/25">Dashboard</span>
            <span className="text-stone-300 dark:text-white/15">/</span>
            <span className="text-stone-700 dark:text-white/70 font-medium">{tabs.find(t=>t.key===activeTab)?.label}</span>
          </div>

          {/* actions right */}
          <div className="ml-auto flex items-center gap-2">
            {isAdmin && activeTab==="bookings" && (
              <>
                <button onClick={exportToExcel} className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 dark:bg-white/4 border border-stone-200 dark:border-white/8 text-stone-600 dark:text-white/60 text-[11px] font-semibold rounded-xl hover:bg-stone-200 dark:hover:bg-white/8 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Excel
                </button>
                <button onClick={exportToPDF} className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 dark:bg-white/4 border border-stone-200 dark:border-white/8 text-stone-600 dark:text-white/60 text-[11px] font-semibold rounded-xl hover:bg-stone-200 dark:hover:bg-white/8 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  PDF
                </button>
              </>
            )}
            {isAdmin && stats.refundRequested > 0 && (
              <button onClick={()=>{ setActiveTab("bookings"); setFilterStatus("refund_requested"); }}
                className="relative p-2 text-orange-400/70 hover:text-orange-400 transition-colors rounded-xl hover:bg-orange-400/8">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-400 text-black text-[8px] font-black rounded-full flex items-center justify-center">{stats.refundRequested}</span>
              </button>
            )}
            <Link to="/cart" className="relative p-2 text-stone-500 dark:text-white/40 hover:text-stone-900 dark:hover:text-white transition-colors rounded-xl hover:bg-stone-100 dark:hover:bg-white/5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </Link>
          </div>
        </div>

        {/* page content */}
        <div className="px-5 md:px-8 py-8 max-w-7xl">
          {activeTab==="bookings" && renderBookings()}
          {isAdmin && activeTab==="reviews" && renderReviews()}
          {isAdmin && activeTab==="gers" && renderItems("ger")}
          {isAdmin && activeTab==="trips" && renderItems("trip")}
          {isAdmin && activeTab==="foods" && renderItems("food")}
          {isAdmin && activeTab==="products" && renderItems("product")}
          {isAdmin && activeTab==="settings" && renderSettings()}
        </div>
      </div>

      {/* ── MODALS ── */}
      {selectedBooking && (
        <Modal title="Захиалгын дэлгэрэнгүй" onClose={()=>setSelectedBooking(null)}>
          <div className="space-y-3">
            {[
              ["Үйлчилгээ", getServiceName(selectedBooking)],
              ["Төрөл", typeLabel[selectedBooking.type]],
              ["Захиалагч", selectedBooking.customerName],
              ["Утас", selectedBooking.phone],
              ["Огноо", formatDate(selectedBooking.createdAt)],
              ["Check-in", selectedBooking.checkIn ? formatDate(selectedBooking.checkIn) : null],
              ["Check-out", selectedBooking.checkOut ? formatDate(selectedBooking.checkOut) : null],
            ].filter(([,v])=>v).map(([label,value])=>(
              <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-white/40 text-sm">{label}</span>
                <span className="text-white text-sm font-semibold">{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2">
              <span className="text-white/40 text-sm">Үнэ</span>
              <span className="text-yellow-400 font-bold text-lg">{formatCurrency(selectedBooking.totalPrice)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-white/40 text-sm">Төлөв</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor[selectedBooking.status]}`}>{statusLabel[selectedBooking.status]}</span>
            </div>

            {/* Cancellation reason */}
            {selectedBooking.cancellationReason && (
              <div className="bg-orange-400/8 border border-orange-400/15 rounded-xl p-3">
                <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest mb-1">Буцаалтын шалтгаан</p>
                <p className="text-sm text-white/70">{selectedBooking.cancellationReason}</p>
              </div>
            )}

            {/* Admin: approve/deny refund */}
            {isAdmin && selectedBooking.status==="refund_requested" && (
              <div className="pt-3 border-t border-white/5 space-y-3">
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Буцаалтын шийдвэр</p>
                <input className={inp} placeholder="Буцаалтын тэмдэглэл (заавал биш)..." value={refundNote} onChange={e=>setRefundNote(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={()=>approveRefund(selectedBooking)}
                    className="py-3 bg-purple-400/15 border border-purple-400/25 text-purple-400 rounded-xl font-bold text-sm hover:bg-purple-400 hover:text-black hover:border-purple-400 transition-all">
                    ✓ Буцаалт батлах
                  </button>
                  <button onClick={()=>denyRefund(selectedBooking)}
                    className="py-3 bg-white/5 border border-white/8 text-white/50 rounded-xl font-bold text-sm hover:bg-red-500/15 hover:text-red-400 hover:border-red-400/20 transition-all">
                    ✕ Татгалзах
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {modalType && (
        <Modal title={editingItem?"Мэдээлэл засах":"Шинэ нэмэх"} onClose={closeModal}>
          <form onSubmit={e=>submitItem(modalType,e)} className="space-y-3">
            {renderFormFields(modalType,forms,setFormValue,inp)}
            <button className="w-full py-3 bg-yellow-400 text-black rounded-xl font-bold hover:bg-white transition-all">Хадгалах</button>
          </form>
        </Modal>
      )}

      {/* ── CANCEL MODAL ── */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d0d14] border border-stone-200 dark:border-white/8 w-full max-w-md rounded-3xl overflow-hidden shadow-xl dark:shadow-[0_32px_80px_rgba(0,0,0,0.8)] animate-scale-in">

            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-100 dark:border-white/6">
              <div className="h-px bg-gradient-to-r from-orange-400/50 via-orange-400/20 to-transparent mb-5" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-orange-500 dark:text-orange-400 font-bold text-[9px] uppercase tracking-widest mb-1">Буцаалтын хүсэлт</p>
                  <h3 className="text-stone-900 dark:text-white font-black text-lg uppercase italic tracking-tighter">{getServiceName(cancelModal)}</h3>
                  <p className="text-amber-600 dark:text-yellow-400 font-bold text-sm mt-0.5">{formatCurrency(cancelModal.totalPrice)}</p>
                </div>
                <button onClick={()=>{ setCancelModal(null); setCancelReason(""); setCancelNote(""); }}
                  className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-white/40 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-white/10 transition-all flex items-center justify-center text-lg">×</button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Cancellation policy */}
              <div className="bg-stone-50 dark:bg-white/3 border border-stone-200 dark:border-white/6 rounded-2xl p-4">
                <p className="text-[9px] font-bold text-stone-400 dark:text-white/40 uppercase tracking-widest mb-3">Буцаалтын бодлого</p>
                <div className="space-y-2">
                  {CANCEL_POLICY.map((p, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-xs text-white/50">{p.label}</span>
                      <span className={`text-xs font-bold ${p.pct >= 90 ? 'text-emerald-400' : p.pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {p.pct}% буцаана
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason selector */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Шалтгаан сонгоно уу *</p>
                <div className="space-y-2">
                  {CANCEL_REASONS.map(r => (
                    <button key={r} type="button" onClick={() => setCancelReason(r)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border ${
                        cancelReason === r
                          ? 'border-orange-400/40 bg-orange-400/10 text-orange-400'
                          : 'border-white/6 text-white/40 hover:border-white/12 hover:text-white/70'
                      }`}>
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${cancelReason===r ? 'border-orange-400' : 'border-white/20'}`}>
                        {cancelReason===r && <span className="w-2 h-2 rounded-full bg-orange-400" />}
                      </span>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional note */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Нэмэлт тайлбар (заавал биш)</p>
                <textarea
                  value={cancelNote}
                  onChange={e => setCancelNote(e.target.value)}
                  placeholder="Дэлгэрэнгүй мэдээлэл оруулах..."
                  className="w-full bg-white/5 border border-white/8 rounded-2xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-orange-400/40 transition-all text-sm resize-none min-h-[80px]"
                />
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 bg-red-500/8 border border-red-400/15 rounded-2xl px-4 py-3">
                <span className="text-red-400 text-lg shrink-0 leading-none">⚠️</span>
                <p className="text-xs text-white/50 leading-relaxed">
                  Буцаалтын хүсэлт илгээсний дараа <span className="text-white/70 font-semibold">24 цагийн дотор</span> администратор шийдвэрлэнэ.
                  Буцаан олгох хэмжээ нь цуцлах хугацаанаас хамаарна.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setCancelModal(null); setCancelReason(""); setCancelNote(""); }}
                  className="py-3.5 border border-white/8 text-white/40 rounded-xl font-semibold text-sm hover:border-white/20 hover:text-white/70 transition-all">
                  Болих
                </button>
                <button onClick={requestCancellation} disabled={!cancelReason}
                  className="py-3.5 bg-orange-400 text-black rounded-xl font-bold text-sm hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]">
                  Хүсэлт илгээх
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── helper components ── */
function SectionHeader({title,desc}) {
  return (
    <div className="pb-4 border-b border-stone-200 dark:border-white/5">
      <h3 className="text-stone-900 dark:text-white font-bold text-base">{title}</h3>
      {desc && <p className="text-stone-400 dark:text-white/30 text-xs mt-1">{desc}</p>}
    </div>
  );
}
function FieldGroup({label,children}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-semibold text-stone-400 dark:text-white/30 uppercase tracking-widest ml-1">{label}</label>
      {children}
    </div>
  );
}
function ChartCard({title,children}) {
  const [mounted,setMounted] = useState(false);
  useEffect(()=>setMounted(true),[]);
  return (
    <div className="bg-white dark:bg-white/3 border border-stone-200 dark:border-white/6 rounded-2xl p-5 shadow-sm dark:shadow-none">
      <h4 className="text-sm font-semibold text-stone-500 dark:text-white/60 uppercase tracking-widest mb-5">{title}</h4>
      <div className="w-full h-64 min-w-0">
        {mounted && <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>}
      </div>
    </div>
  );
}
function Modal({title,onClose,children}) {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0d0d14] border border-stone-200 dark:border-white/8 w-full max-w-lg rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.15)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.8)] animate-scale-in">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-white/6">
          <h3 className="font-bold text-stone-900 dark:text-white text-base">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-500 dark:text-white/40 hover:text-stone-900 dark:hover:text-white transition-all flex items-center justify-center text-lg leading-none">×</button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

const inpStyle = "w-full rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-white placeholder-white/25 outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400/50 transition text-sm";

function renderFormFields(type,forms,setFormValue,inp) {
  const f = (key) => forms[type]?.[key]??'';
  const s = (key,val) => setFormValue(type,key,val);
  const file = () => <input className={inp} type="file" onChange={e=>s("image",e.target.files[0])} />;

  if (type==="ger") return (<>
    <div className="grid grid-cols-2 gap-3">
      <input className={inp} placeholder="Гэрийн дугаар (1-1)" value={f("gerNumber")} onChange={e=>s("gerNumber",e.target.value)} required />
      <select className={inp} value={f("status")} onChange={e=>s("status",e.target.value)}>
        <option value="available">Сул</option>
        <option value="booked">Захиалсан</option>
        <option value="maintenance">Засвартай</option>
      </select>
    </div>
    <input className={inp} placeholder="Нэр" value={f("title")} onChange={e=>s("title",e.target.value)} required />
    <input className={inp} placeholder="Байршил" value={f("location")} onChange={e=>s("location",e.target.value)} required />
    <div className="grid grid-cols-2 gap-3">
      <input className={inp} type="number" placeholder="Үнэ / хоног" value={f("pricePerNight")} onChange={e=>s("pricePerNight",e.target.value)} required />
      <input className={inp} type="number" placeholder="Багтаамж" value={f("capacity")} onChange={e=>s("capacity",e.target.value)} required />
    </div>
    <input className={inp} placeholder="Тайлбар" value={f("description")} onChange={e=>s("description",e.target.value)} />
    {file()}
  </>);
  if (type==="trip") return (<>
    <input className={inp} placeholder="Аяллын нэр" value={f("title")} onChange={e=>s("title",e.target.value)} required />
    <input className={inp} placeholder="Байршил" value={f("location")} onChange={e=>s("location",e.target.value)} required />
    <div className="grid grid-cols-2 gap-3">
      <input className={inp} type="number" placeholder="Үнэ / хүн" value={f("pricePerPerson")} onChange={e=>s("pricePerPerson",e.target.value)} required />
      <input className={inp} type="number" placeholder="Хугацаа (цаг)" value={f("duration")} onChange={e=>s("duration",e.target.value)} required />
    </div>
    {file()}
  </>);
  if (type==="food") return (<>
    <input className={inp} placeholder="Хоолны нэр" value={f("name")} onChange={e=>s("name",e.target.value)} required />
    <input className={inp} placeholder="Ангилал" value={f("category")} onChange={e=>s("category",e.target.value)} required />
    <input className={inp} placeholder="Тайлбар" value={f("description")} onChange={e=>s("description",e.target.value)} />
    <input className={inp} type="number" placeholder="Үнэ" value={f("price")} onChange={e=>s("price",e.target.value)} required />
    {file()}
  </>);
  if (type==="product") return (<>
    <input className={inp} placeholder="Барааны нэр" value={f("name")} onChange={e=>s("name",e.target.value)} required />
    <input className={inp} placeholder="Ангилал" value={f("category")} onChange={e=>s("category",e.target.value)} required />
    <input className={inp} placeholder="Тайлбар" value={f("description")} onChange={e=>s("description",e.target.value)} />
    <div className="grid grid-cols-2 gap-3">
      <input className={inp} type="number" placeholder="Үнэ" value={f("price")} onChange={e=>s("price",e.target.value)} required />
      <input className={inp} type="number" placeholder="Нөөц" value={f("stock")} onChange={e=>s("stock",e.target.value)} required />
    </div>
    {file()}
  </>);
}
