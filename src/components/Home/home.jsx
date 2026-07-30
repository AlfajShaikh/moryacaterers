import {
    ClipboardDocumentListIcon,
    CalendarDaysIcon,
    CakeIcon,
    PlusCircleIcon,
    UserPlusIcon,
    DocumentPlusIcon,
    ReceiptPercentIcon,
    ArrowUpRightIcon,
    BellAlertIcon
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getDashboardCounts, markRead, getCalendar } from "./homeSlice"; 
import { EventCalendarModal } from "../EventCalendarModal/eventCalendarModal";

export function Home() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // --- Modal State ---
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Get both counts and calendar from Redux
    const { counts, calendar } = useSelector((state) => state.dashboard);

    const handleOrderClick = async () => {
        await dispatch(markRead());
        dispatch(getDashboardCounts());
        navigate("/orders");
    };

    const cards = [
        {
            title: "मेनू पदार्थ",
            value: counts.menuItemCount || 0,
            icon: CakeIcon,
            bgClass: "bg-gradient-to-br from-rose-400 to-pink-600 shadow-pink-500/30",
            path: "/menu",
        },
        {
            title: "ऑर्डर्स",
            value: counts.orderCount || 0,
            icon: ClipboardDocumentListIcon,
            bgClass: "bg-gradient-to-br from-cyan-400 to-blue-600 shadow-blue-500/30",
            path: "",
        },
        {
            title: "आगामी कार्यक्रम",
            value: counts.upcomingEventCount || 0,
            icon: CalendarDaysIcon,
            bgClass: "bg-gradient-to-br from-fuchsia-400 to-purple-600 shadow-purple-500/30",
            path: "/events",
        },
    ];

    const quickActions = [
        {
            title: "नवीन ऑर्डर",
            description: "नवीन ग्राहक ऑर्डर तयार करा",
            icon: PlusCircleIcon,
            cardBg: "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200",
            iconBg: "bg-white",
            iconColor: "text-blue-600",
            titleColor: "text-blue-900",
            descColor: "text-blue-700",
            path: "/orders",
            onClick: handleOrderClick
        },
        {
            title: "मेनू कार्ड ",
            description: "मेनू कार्ड पहा",
            icon: DocumentPlusIcon,
            cardBg: "bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200",
            iconBg: "bg-white",
            iconColor: "text-pink-600",
            titleColor: "text-pink-900",
            descColor: "text-pink-700",
            path: "/menu ",
        },
        {
            title: "मेनू पदार्थ जोडा",
            description: "नवीन पदार्थ जोडा",
            icon: DocumentPlusIcon,
            cardBg: "bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200",
            iconBg: "bg-white",
            iconColor: "text-purple-600",
            titleColor: "text-purple-900",
            descColor: "text-purple-700",
            path: "/addmenu",
        },
        {
            title: "बिल तयार करा",
            description: "ऑर्डरसाठी बिल तयार करा",
            icon: ReceiptPercentIcon,
            cardBg: "bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-amber-200",
            iconBg: "bg-white",
            iconColor: "text-amber-600",
            titleColor: "text-amber-900",
            descColor: "text-amber-700",
            path: "/invoice",
        },
        {
            title: "वापरकर्ता जोडा",
            description: "नवीन कर्मचारी किंवा ग्राहक नोंदवा",
            icon: UserPlusIcon,
            cardBg: "bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-emerald-200",
            iconBg: "bg-white",
            iconColor: "text-emerald-600",
            titleColor: "text-emerald-900",
            descColor: "text-emerald-700",
            path: "/signin",
        },
    ];

    const customerMenuCard = {
        title: "मेनू कार्ड",
        description: "मेनू कार्ड पहा",
        icon: DocumentPlusIcon,
        cardBg: "bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200",
        iconBg: "bg-white",
        iconColor: "text-pink-600",
        titleColor: "text-pink-900",
        descColor: "text-pink-700",
        path: "/menu",
    };

    // Load both Dashboard counts and Calendar data on mount
    useEffect(() => {
        dispatch(getDashboardCounts());
        dispatch(getCalendar());
    }, [dispatch]);

    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role;

    useEffect(() => {
        if (role === "Customer") {
            navigate("/menu");
        }
    }, [role, navigate]);

    const actionsToShow = role === "Customer" ? [customerMenuCard] : quickActions;

    // --- Upcoming Events Logic (Today & Tomorrow) ---
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isSameDay = (d1, d2) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    // Filter events based on status
    const confirmedEvents = calendar?.filter((event) => event.extendedProps.status === "Confirmed") || [];
    const inquiryEvents = calendar?.filter((event) => event.extendedProps.status === "Inquiry") || [];
    const pendingEvents = calendar?.filter((event) => event.extendedProps.status === "Pending") || [];

    // Filter specific timelines for notifications (Today and Tomorrow)
    const todayConfirmed = confirmedEvents.filter((event) => isSameDay(new Date(event.start), today));
    const tomorrowConfirmed = confirmedEvents.filter((event) => isSameDay(new Date(event.start), tomorrow));

    const todayPending = pendingEvents.filter((event) => isSameDay(new Date(event.start), today));
    const tomorrowPending = pendingEvents.filter((event) => isSameDay(new Date(event.start), tomorrow));

    const todayInquiry = inquiryEvents.filter((event) => isSameDay(new Date(event.start), today));
    const tomorrowInquiry = inquiryEvents.filter((event) => isSameDay(new Date(event.start), tomorrow));

    // Check if ANY notifications need to be shown
    const hasConfirmed = todayConfirmed.length > 0 || tomorrowConfirmed.length > 0;
    const hasPending = todayPending.length > 0 || tomorrowPending.length > 0;
    const hasInquiry = todayInquiry.length > 0 || tomorrowInquiry.length > 0;
    const showNotifications = role !== "Customer" && (hasConfirmed || hasInquiry || hasPending);

    return (
        <div className="min-h-screen bg-indigo-50/40 p-6 md:p-10 font-sans relative overflow-hidden">

            {/* Colorful Ambient Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-pink-100/50 pointer-events-none -z-10"></div>
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-pink-300/30 to-purple-300/30 blur-[100px] pointer-events-none -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cyan-300/20 to-blue-300/20 blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: "2s" }}></div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-purple-800 mb-3">
                            डॅशबोर्ड
                        </h1>
                        <p className="text-base text-slate-600 font-semibold">
                            आपल्या केटरिंग व्यवसायाचा संपूर्ण आढावा
                        </p>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setIsCalendarOpen(true)}
                            className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-indigo-200 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md hover:bg-indigo-50 hover:-translate-y-0.5 transition-all"
                        >
                            <CalendarDaysIcon className="w-5 h-5 text-indigo-600" />
                            <span className="text-sm font-bold text-indigo-900">कॅलेंडर पहा</span>
                        </button>

                        <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-md border border-emerald-200 px-5 py-2.5 rounded-full shadow-sm">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <span className="text-sm font-bold text-emerald-800">प्रणाली कार्यरत</span>
                        </div>
                    </div>
                </div>

                {/* --- NOTIFICATION CENTER --- */}
                {showNotifications && (
                    <div className="flex flex-col gap-4 w-full animate-in fade-in slide-in-from-top-4 duration-500">
                        
                        {/* 1. Confirmed Events Banner (Emerald) */}
                        {hasConfirmed && (
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] p-5 shadow-lg shadow-emerald-500/30 flex flex-col sm:flex-row sm:items-center gap-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>

                                <div className="p-3.5 bg-white/20 rounded-2xl shrink-0 relative z-10">
                                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                                    </span>
                                    <BellAlertIcon className="w-8 h-8 text-white" />
                                </div>

                                <div className="text-white relative z-10 flex-1">
                                    <h3 className="text-xl font-black tracking-wide mb-2">
                                        आगामी कार्यक्रम (Confirmed)
                                    </h3>
                                    <div className="flex flex-col gap-2 text-sm md:text-base font-semibold text-white/90">
                                        {todayConfirmed.length > 0 && (
                                            <p className="bg-white/20 px-3 py-2 rounded-xl inline-block w-fit">
                                                आज <span className="font-black bg-white text-emerald-600 px-2 py-0.5 rounded-md shadow-sm mx-1.5">{todayConfirmed.length}</span> कार्यक्रम आहेत.
                                            </p>
                                        )}
                                        {tomorrowConfirmed.length > 0 && (
                                            <p className="bg-white/10 px-3 py-2 rounded-xl inline-block w-fit">
                                                उद्या <span className="font-black bg-white text-emerald-600 px-2 py-0.5 rounded-md shadow-sm mx-1.5">{tomorrowConfirmed.length}</span> कार्यक्रम आहेत.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button onClick={() => setIsCalendarOpen(true)} className="relative z-10 shrink-0 bg-white text-emerald-600 font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95">
                                    कॅलेंडर पहा
                                </button>
                            </div>
                        )}

                        {/* 2. Pending Events Banner (Amber) */}
                        {hasPending && (
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2rem] p-5 shadow-lg shadow-amber-500/30 flex flex-col sm:flex-row sm:items-center gap-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>

                                <div className="p-3.5 bg-white/20 rounded-2xl shrink-0 relative z-10">
                                    <BellAlertIcon className="w-8 h-8 text-white" />
                                </div>

                                <div className="text-white relative z-10 flex-1">
                                    <h3 className="text-xl font-black tracking-wide mb-2">
                                        प्रलंबित ऑर्डर (Pending)
                                    </h3>
                                    <div className="flex flex-col gap-2 text-sm md:text-base font-semibold text-white/90">
                                        {/* URGENT MESSAGE FOR TODAY'S PENDING */}
                                        {todayPending.length > 0 && (
                                            <p className="bg-white/20 px-3 py-2 rounded-xl border border-white/40">
                                                <span className="font-black bg-white text-amber-600 px-2 py-0.5 rounded-md shadow-sm mr-2">{todayPending.length}</span>
                                                आजचे कार्यक्रम <span className="underline decoration-2 underline-offset-2">Pending</span> स्थितीत आहेत! कृपया तातडीने Confirmation घ्या.
                                            </p>
                                        )}
                                        {/* MESSAGE FOR TOMORROW'S PENDING */}
                                        {tomorrowPending.length > 0 && (
                                            <p className="bg-white/10 px-3 py-2 rounded-xl">
                                                <span className="font-black bg-white text-amber-600 px-2 py-0.5 rounded-md shadow-sm mr-2">{tomorrowPending.length}</span>
                                                उद्याचे कार्यक्रम Pending आहेत. कृपया ऑर्डरची स्थिती Confirm करा.
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => setIsCalendarOpen(true)} className="relative z-10 shrink-0 bg-white text-amber-600 font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95">
                                    कॅलेंडर पहा
                                </button>
                            </div>
                        )}

                        {/* 3. Inquiry Events Banner (Blue) */}
                        {hasInquiry && (
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2rem] p-5 shadow-lg shadow-blue-500/30 flex flex-col sm:flex-row sm:items-center gap-5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>

                                <div className="p-3.5 bg-white/20 rounded-2xl shrink-0 relative z-10">
                                    <BellAlertIcon className="w-8 h-8 text-white" />
                                </div>

                                <div className="text-white relative z-10 flex-1">
                                    <h3 className="text-xl font-black tracking-wide mb-2">
                                        चौकशी प्रलंबित (Inquiry)
                                    </h3>
                                    <div className="flex flex-col gap-2 text-sm md:text-base font-semibold text-white/90">
                                        {todayInquiry.length > 0 && (
                                            <p className="bg-white/20 px-3 py-2 rounded-xl inline-block w-fit border border-white/40">
                                                <span className="font-black bg-white text-blue-600 px-2 py-0.5 rounded-md shadow-sm mr-2">{todayInquiry.length}</span>
                                                आजचे कार्यक्रम Inquiry स्थितीत आहेत. कृपया ग्राहकाशी संपर्क साधून Confirm करा.
                                            </p>
                                        )}
                                        {tomorrowInquiry.length > 0 && (
                                            <p className="bg-white/10 px-3 py-2 rounded-xl inline-block w-fit">
                                                <span className="font-black bg-white text-blue-600 px-2 py-0.5 rounded-md shadow-sm mr-2">{tomorrowInquiry.length}</span>
                                                उद्याचे कार्यक्रम Inquiry स्थितीत आहेत.
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => setIsCalendarOpen(true)} className="relative z-10 shrink-0 bg-white text-blue-600 font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95">
                                    कॅलेंडर पहा
                                </button>
                            </div>
                        )}

                    </div>
                )}


                {/* Quick Actions List */}
                <div>
                    <h2 className="text-xl font-bold mb-5 text-slate-800 flex items-center gap-2">
                        झटपट कृती
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
                        {actionsToShow.map((action, index) => {
                            const ActionIcon = action.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (action.onClick) action.onClick();
                                        else navigate(action.path);
                                    }}
                                    className={`group relative flex flex-col items-start gap-4 p-5 rounded-3xl border shadow-sm hover:shadow-md transition-all duration-300 text-left hover:-translate-y-1 ${action.cardBg}`}
                                >
                                    <div className={`p-3 rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${action.iconBg}`}>
                                        <ActionIcon className={`w-7 h-7 ${action.iconColor}`} />
                                    </div>
                                    <div>
                                        <h4 className={`text-base font-extrabold mb-1 ${action.titleColor}`}>
                                            {action.title}
                                        </h4>
                                        <p className={`text-sm font-semibold leading-relaxed ${action.descColor}`}>
                                            {action.description}
                                        </p>

                                        {action.title === "नवीन ऑर्डर" && counts.unreadOrders > 0 && (
                                            <span className="absolute top-4 right-4 bg-red-600 text-white rounded-full px-2.5 py-0.5 text-xs font-bold shadow-sm animate-pulse">
                                                {counts.unreadOrders} New
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Key Metrics (Stats) */}
                {role !== "Customer" && (
                    <div>
                        <h2 className="text-xl font-bold mb-5 text-slate-800 flex items-center gap-2">
                            मुख्य आकडेवारी
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {cards.map((card, index) => {
                                const Icon = card.icon;
                                return (
                                    <div
                                        key={index}
                                        onClick={() => navigate(card.path)}
                                        className={`group cursor-pointer rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col hover:-translate-y-1.5 ${card.bgClass}`}
                                    >
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white shadow-inner">
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                                                <ArrowUpRightIcon className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-white drop-shadow-md">
                                                {card.value}
                                            </h3>
                                            <p className="text-lg font-bold text-white/90">
                                                {card.title}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Imported Calendar Component */}
            <EventCalendarModal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
            />

        </div>
    );
}