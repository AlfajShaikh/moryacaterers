import {
    ClipboardDocumentListIcon,
    CalendarDaysIcon,
    CakeIcon,
    PlusCircleIcon,
    UserPlusIcon,
    DocumentPlusIcon,
    ReceiptPercentIcon,
    ArrowUpRightIcon,
    BellAlertIcon,
    ClockIcon,
    CheckBadgeIcon,
    QuestionMarkCircleIcon,
    XCircleIcon,
    ChartBarIcon,
    ChartPieIcon,
    SunIcon,
    MoonIcon
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getDashboardCounts, markRead, getCalendar, getOrderStatus } from "./homeSlice";
import { EventCalendarModal } from "../EventCalendarModal/eventCalendarModal";

export function Home() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // --- Modal & Loading State ---
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Get counts, calendar, and orderStatus from Redux
    const { counts, calendar, orderStatus } = useSelector((state) => state.dashboard);

    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role;

    // Customer Redirection
    useEffect(() => {
        if (role === "Customer") {
            navigate("/menu");
        }
    }, [role, navigate]);

    // Load Dashboard Data (With Initial Buffering Logic)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await Promise.all([
                    dispatch(getDashboardCounts()),
                    dispatch(getCalendar()),
                    dispatch(getOrderStatus())
                ]);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsInitialLoad(false);
            }
        };

        fetchInitialData();

        const interval = setInterval(() => {
            dispatch(getDashboardCounts());
            dispatch(getCalendar());
            dispatch(getOrderStatus());
        }, 10000);

        return () => clearInterval(interval);
    }, [dispatch]);

    const handleOrderClick = async () => {
        await dispatch(markRead());
        dispatch(getDashboardCounts());
        navigate("/orders");
    };

    const cards = [
        {
            title: "मेनू पदार्थ",
            value: counts?.menuItemCount || 0,
            icon: CakeIcon,
            bgClass: "bg-gradient-to-br from-rose-500 to-pink-600 shadow-pink-500/20",
            path: "/menu",
        },
        {
            title: "एकूण ऑर्डर्स",
            value: counts?.orderCount || 0,
            icon: ClipboardDocumentListIcon,
            bgClass: "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20",
            path: "",
        },
        {
            title: "आगामी कार्यक्रम",
            value: counts?.upcomingEventCount || 0,
            icon: CalendarDaysIcon,
            bgClass: "bg-gradient-to-br from-violet-500 to-purple-600 shadow-purple-500/20",
            path: "/events",
        },
    ];

    const quickActions = [
        {
            title: "नवीन ऑर्डर",
            description: "नवीन ग्राहक ऑर्डर तयार करा",
            icon: PlusCircleIcon,
            hoverClass: "hover:border-blue-300 hover:bg-blue-50",
            iconBg: "bg-blue-100 text-blue-600",
            path: "/orders",
            onClick: handleOrderClick
        },
        {
            title: "मेनू कार्ड",
            description: "मेनू कार्ड पहा",
            icon: DocumentPlusIcon,
            hoverClass: "hover:border-pink-300 hover:bg-pink-50",
            iconBg: "bg-pink-100 text-pink-600",
            path: "/menu",
        },
        {
            title: "मेनू पदार्थ जोडा",
            description: "नवीन पदार्थ जोडा",
            icon: CakeIcon,
            hoverClass: "hover:border-purple-300 hover:bg-purple-50",
            iconBg: "bg-purple-100 text-purple-600",
            path: "/addmenu",
        },
        {
            title: "बिल तयार करा",
            description: "ऑर्डरसाठी बिल तयार करा",
            icon: ReceiptPercentIcon,
            hoverClass: "hover:border-amber-300 hover:bg-amber-50",
            iconBg: "bg-amber-100 text-amber-600",
            path: "/invoice",
        },
        {
            title: "वापरकर्ता जोडा",
            description: "नवीन कर्मचारी किंवा ग्राहक नोंदवा",
            icon: UserPlusIcon,
            hoverClass: "hover:border-emerald-300 hover:bg-emerald-50",
            iconBg: "bg-emerald-100 text-emerald-600",
            path: "/signin",
        },

        //  {
        //     title: "प्लानिंग ",
        //     description: "नवीन कर्मचारी किंवा ग्राहक नोंदवा",
        //     icon: UserPlusIcon,
        //     hoverClass: "hover:border-emerald-300 hover:bg-emerald-50",
        //     iconBg: "bg-emerald-100 text-emerald-600",
        //     path: "/planning",
        // },
    ];

    const customerMenuCard = {
        title: "मेनू कार्ड",
        description: "मेनू कार्ड पहा",
        icon: DocumentPlusIcon,
        hoverClass: "hover:border-pink-300 hover:bg-pink-50",
        iconBg: "bg-pink-100 text-pink-600",
        path: "/menu",
    };

    const actionsToShow = role === "Customer" ? [customerMenuCard] : quickActions;

    // --- Time Based Greeting Logic ---
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: "शुभ सकाळ", icon: SunIcon, color: "text-amber-500" };
        if (hour < 18) return { text: "शुभ दुपार", icon: SunIcon, color: "text-orange-500" };
        return { text: "शुभ संध्याकाळ", icon: MoonIcon, color: "text-indigo-500" };
    };
    const greeting = getGreeting();
    const GreetingIcon = greeting.icon;

    // --- Event Logic ---
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isSameDay = (d1, d2) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    const confirmedEvents = calendar?.filter((e) => e.extendedProps?.status === "Confirmed") || [];
    const inquiryEvents = calendar?.filter((e) => e.extendedProps?.status === "Inquiry") || [];
    const pendingEvents = calendar?.filter((e) => e.extendedProps?.status === "Pending") || [];

    // All events for today's schedule
    const allTodayEvents = calendar?.filter((e) => isSameDay(new Date(e.start), today)) || [];

    const todayConfirmed = confirmedEvents.filter((e) => isSameDay(new Date(e.start), today));
    const tomorrowConfirmed = confirmedEvents.filter((e) => isSameDay(new Date(e.start), tomorrow));

    const todayPending = pendingEvents.filter((e) => isSameDay(new Date(e.start), today));
    const tomorrowPending = pendingEvents.filter((e) => isSameDay(new Date(e.start), tomorrow));

    const todayInquiry = inquiryEvents.filter((e) => isSameDay(new Date(e.start), today));
    const tomorrowInquiry = inquiryEvents.filter((e) => isSameDay(new Date(e.start), tomorrow));

    const hasConfirmed = todayConfirmed.length > 0 || tomorrowConfirmed.length > 0;
    const hasPending = todayPending.length > 0 || tomorrowPending.length > 0;
    const hasInquiry = todayInquiry.length > 0 || tomorrowInquiry.length > 0;
    const showNotifications = role !== "Customer" && (hasConfirmed || hasInquiry || hasPending);

    if (isInitialLoad) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-indigo-100/40 to-transparent pointer-events-none -z-10"></div>
                <span className="relative flex h-20 w-20 mb-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-20 w-20 bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <ChartBarIcon className="w-10 h-10 text-white animate-pulse" />
                    </span>
                </span>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">डॅशबोर्ड लोड होत आहे...</h2>
                <p className="text-slate-500 font-medium text-sm">कृपया प्रतीक्षा करा, माहिती मिळवली जात आहे.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans relative overflow-x-hidden">
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-indigo-100/40 to-transparent pointer-events-none -z-10"></div>

            <div className="max-w-8xl mx-auto space-y-8 relative z-10">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <GreetingIcon className={`w-5 h-5 ${greeting.color}`} />
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{greeting.text}, {user?.name || "Admin"}</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                            <ChartBarIcon className="w-8 h-8 text-indigo-600 hidden md:block" />
                            डॅशबोर्ड
                        </h1>
                        <p className="text-sm md:text-base text-slate-500 font-medium mt-1">
                            आपल्या केटरिंग व्यवसायाचा संपूर्ण आढावा व नियंत्रण
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => navigate("/analytics")}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <ChartPieIcon className="w-5 h-5" />
                            मासिक अहवाल
                        </button>

                        <button
                            onClick={() => setIsCalendarOpen(true)}
                            className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-indigo-600 hover:text-white transition-colors duration-300"
                        >
                            <CalendarDaysIcon className="w-5 h-5" />
                            कॅलेंडर पहा
                        </button>

                        <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-xl">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-sm font-bold text-emerald-700">Live</span>
                        </div>
                    </div>
                </div>

                {/* --- NOTIFICATION CENTER --- */}
                {showNotifications && (
                    <div className="flex flex-col gap-3 animate-in fade-in duration-500 delay-100">
                        {hasConfirmed && (
                            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                                        <BellAlertIcon className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-emerald-900 font-bold text-lg">आगामी कार्यक्रम (Confirmed)</h3>
                                        <p className="text-emerald-700 text-sm font-medium">
                                            {todayConfirmed.length > 0 && <span>आज <strong className="text-emerald-900 bg-emerald-200/50 px-1.5 py-0.5 rounded">{todayConfirmed.length}</strong> कार्यक्रम. </span>}
                                            {tomorrowConfirmed.length > 0 && <span>उद्या <strong className="text-emerald-900 bg-emerald-200/50 px-1.5 py-0.5 rounded">{tomorrowConfirmed.length}</strong> कार्यक्रम.</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {hasPending && (
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                                        <ClockIcon className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-amber-900 font-bold text-lg">प्रलंबित ऑर्डर (Pending)</h3>
                                        <p className="text-amber-700 text-sm font-medium">
                                            {todayPending.length > 0 && <span>आजचे <strong className="text-red-600">{todayPending.length}</strong> कार्यक्रम Pending आहेत! </span>}
                                            {tomorrowPending.length > 0 && <span>उद्याचे <strong className="text-amber-900">{tomorrowPending.length}</strong> कार्यक्रम Pending आहेत.</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {hasInquiry && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                                        <QuestionMarkCircleIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-blue-900 font-bold text-lg">चौकशी प्रलंबित (Inquiry)</h3>
                                        <p className="text-blue-700 text-sm font-medium">
                                            {todayInquiry.length > 0 && <span>आज <strong className="text-blue-900">{todayInquiry.length}</strong> Inquiries आहेत. </span>}
                                            {tomorrowInquiry.length > 0 && <span>उद्या <strong className="text-blue-900">{tomorrowInquiry.length}</strong> Inquiries आहेत.</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- DASHBOARD STATS & TODAY'S SCHEDULE GRID --- */}
                {role !== "Customer" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                        
                        {/* Left Side: KPI & Status Cards (Spans 8 columns) */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Main KPI Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                {cards.map((card, index) => {
                                    const Icon = card.icon;
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => navigate(card.path)}
                                            className={`group cursor-pointer rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden ${card.bgClass}`}
                                        >
                                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-md text-white shadow-inner">
                                                    <Icon className="w-7 h-7" />
                                                </div>
                                                <ArrowUpRightIcon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="text-4xl font-black text-white mb-1">
                                                    {card.value}
                                                </h3>
                                                <p className="text-sm font-semibold text-white/90">
                                                    {card.title}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Order Status Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                    <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><ClockIcon className="w-6 h-6" /></div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</p>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-800">{orderStatus?.Pending || 0}</h2>
                                    </div>
                                </div>

                                <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                    <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><CheckBadgeIcon className="w-6 h-6" /></div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmed</p>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-800">{orderStatus?.Confirmed || 0}</h2>
                                    </div>
                                </div>

                                {/* <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                    <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><QuestionMarkCircleIcon className="w-6 h-6" /></div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Inquiry</p>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-800">{orderStatus?.Inquiry || 0}</h2>
                                    </div>
                                </div> */}

                                <div className="bg-white border border-rose-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                                    <div className="p-3 bg-rose-50 text-rose-500 rounded-xl"><XCircleIcon className="w-6 h-6" /></div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Cancelled</p>
                                        <h2 className="text-xl sm:text-2xl font-black text-slate-800">{orderStatus?.Cancel || 0}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- NEW ADVANCED FEATURE: Today's Schedule (Spans 4 columns) --- */}
                        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 relative overflow-hidden flex flex-col h-full">
                            {/* Decorative Background for Schedule */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                            
                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div>
                                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                        <ClockIcon className="w-5 h-5 text-indigo-500" />
                                        आजचे वेळापत्रक
                                    </h2>
                                    <p className="text-xs font-bold text-slate-500 mt-1">
                                        {today.toLocaleDateString('mr-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
                                    {allTodayEvents.length} Events
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
                                {allTodayEvents.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-70">
                                        <CalendarDaysIcon className="w-12 h-12 text-slate-300 mb-3" />
                                        <p className="text-slate-500 font-bold">आज कोणतेही कार्यक्रम नाहीत.</p>
                                    </div>
                                ) : (
                                    allTodayEvents.map((event, idx) => {
                                        const shifts = event.extendedProps?.shifts || [];
                                        const status = event.extendedProps?.status;
                                        
                                        // Status Colors
                                        let statusColor = "bg-slate-100 text-slate-600";
                                        if(status === "Confirmed") statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
                                        if(status === "Pending") statusColor = "bg-amber-100 text-amber-700 border-amber-200";
                                        if(status === "Inquiry") statusColor = "bg-blue-100 text-blue-700 border-blue-200";

                                        return (
                                            <div key={idx} className="group flex gap-4 relative">
                                                {/* Timeline Line */}
                                                <div className="flex flex-col items-center">
                                                    <div className="w-3 h-3 rounded-full bg-indigo-400 ring-4 ring-indigo-50 z-10 mt-1.5 group-hover:scale-125 transition-transform"></div>
                                                    {idx !== allTodayEvents.length - 1 && (
                                                        <div className="w-px h-full bg-slate-200 mt-1"></div>
                                                    )}
                                                </div>

                                                {/* Event Card */}
                                                <div className="flex-1 bg-slate-50 hover:bg-indigo-50/50 transition-colors border border-slate-100 rounded-2xl p-4 mb-2 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-extrabold text-slate-800 text-sm leading-tight">
                                                            {event.extendedProps?.customerName || "Customer"}
                                                        </h4>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColor}`}>
                                                            {status}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-2">
                                                        <CakeIcon className="w-3.5 h-3.5" />
                                                        {event.extendedProps?.eventType || "Event"}
                                                    </div>

                                                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-200/60">
                                                        {shifts.map(shift => (
                                                            <span key={shift} className="bg-white border border-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full shadow-sm font-bold">
                                                                {shift}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- QUICK ACTIONS --- */}
                <div className="animate-in fade-in duration-500 delay-300">
                    <h2 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
                        झटपट कृती (Quick Actions)
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {actionsToShow.map((action, index) => {
                            const ActionIcon = action.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (action.onClick) action.onClick();
                                        else navigate(action.path);
                                    }}
                                    className={`group relative flex flex-col items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 text-left cursor-pointer ${action.hoverClass}`}
                                >
                                    <div className={`p-3 rounded-xl shadow-sm transition-transform duration-300 group-hover:-translate-y-1 ${action.iconBg}`}>
                                        <ActionIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 mb-1">
                                            {action.title}
                                        </h4>
                                        <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                            {action.description}
                                        </p>

                                        {action.title === "नवीन ऑर्डर" && counts?.unreadOrders > 0 && (
                                            <span className="absolute top-4 right-4 bg-red-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm animate-pulse">
                                                {counts.unreadOrders} New
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-8 pb-4 text-center">
                    <p className="text-sm font-medium text-slate-400">@ 2026 Developed by Deenova Digital</p>
                </div>

            </div>

            <EventCalendarModal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
            />
        </div>
    );
}