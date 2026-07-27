import {
    ClipboardDocumentListIcon,
    CalendarDaysIcon,
    CakeIcon,
    PlusCircleIcon,
    UserPlusIcon,
    DocumentPlusIcon,
    ReceiptPercentIcon,
    ArrowUpRightIcon
} from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getDashboardCounts, markRead } from "./homeSlice";




export function Home() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

   const handleOrderClick = async () => {
    await dispatch(markRead());
    dispatch(getDashboardCounts());
    navigate("/orders");
};

    const { counts } = useSelector((state) => state.dashboard);

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



    useEffect(() => {

        dispatch(getDashboardCounts());

    }, [dispatch]);


    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role;
    useEffect(() => {
        if (role === "Customer") {
            navigate("/menu");
        }
    }, [role, navigate]);

    const actionsToShow =
        role === "Customer"
            ? [customerMenuCard]
            : quickActions;

    return (
        <div className="min-h-screen bg-indigo-50/40 p-6 md:p-10 font-sans relative overflow-hidden">

            {/* Colorful Ambient Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-pink-100/50 pointer-events-none -z-10"></div>
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-pink-300/30 to-purple-300/30 blur-[100px] pointer-events-none -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cyan-300/20 to-blue-300/20 blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: "2s" }}></div>

            <div className="max-w-7xl mx-auto space-y-10 relative z-10">

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
                    <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-md border border-emerald-200 px-5 py-2.5 rounded-full shadow-sm">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-sm font-bold text-emerald-800">प्रणाली कार्यरत</span>
                    </div>
                </div>

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
        if (action.onClick) {
            action.onClick();
        } else {
            navigate(action.path);
        }
    }}
    className={`group flex flex-col items-start gap-4 p-5 rounded-3xl border shadow-sm hover:shadow-md transition-all duration-300 text-left hover:-translate-y-1 ${action.cardBg}`}
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

                                       {action.title === "नवीन ऑर्डर" &&
    counts.unreadOrders > 0 && (
        <span className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {counts.unreadOrders}
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
                                            <div className="p-3.5 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white">
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
        </div>
    );
}