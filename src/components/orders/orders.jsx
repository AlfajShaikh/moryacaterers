import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteOrder, getAllOrders, updateOrder } from "./ordersSlice";
import {
    UserIcon,
    PhoneIcon,
    CalendarDaysIcon,
    TagIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ClockIcon,
    MapPinIcon,
    UsersIcon,
    DocumentTextIcon,
    SparklesIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowsUpDownIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { ShoppingBagIcon, CurrencyRupeeIcon, CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

export function Orders() {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector((state) => state.orders);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
const [selectedOrderId, setSelectedOrderId] = useState(null);

    const [expandedOrders, setExpandedOrders] = useState({});
    const [localOrders, setLocalOrders] = useState([]);

    // --- Search & Filter States ---
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("date-asc");

    // --- Service Options ---
    const SERVICE_OPTIONS = ["बुफे", "पंगत", "VIP सर्व्हिस"];

    useEffect(() => {
        dispatch(getAllOrders());
    }, [dispatch]);

    useEffect(() => {
        if (orders) {
            setLocalOrders(JSON.parse(JSON.stringify(orders)));
        }
    }, [orders]);

    const handleDeleteOrder = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this order?");
        if (!confirmDelete) return;

        try {
            await dispatch(deleteOrder(id)).unwrap();
            setLocalOrders((prev) => prev.filter((item) => item._id !== id));
            alert("Order deleted successfully.");
        } catch (err) {
            alert(err || "Unable to delete order.");
        }
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const calculatePerPlatePrice = (order) => {
        let total = 0;
        order.shifts?.forEach((shift) => {
            shift.categories?.forEach((category) => {
                category.selectedItems?.forEach((item) => {
                    total += Number(item.price || 0);
                });
            });
        });
        return total;
    };

    const handleFieldChange = (orderId, field, value) => {
        setLocalOrders((prevOrders) =>
            prevOrders.map((order) => {
                if (order._id !== orderId) return order;
                const updatedOrder = { ...order, [field]: value };
                if (field === "guestCount") {
                    const perPlatePrice = calculatePerPlatePrice(updatedOrder);
                    updatedOrder.grandTotal = Number(value || 0) * perPlatePrice;
                }
                return updatedOrder;
            })
        );
    };

    const handleItemPriceChange = (orderId, shiftIndex, categoryIndex, itemIndex, newPrice) => {
        setLocalOrders((prevOrders) =>
            prevOrders.map((order) => {
                if (order._id !== orderId) return order;
                const updatedOrder = JSON.parse(JSON.stringify(order));
                updatedOrder.shifts[shiftIndex].categories[categoryIndex].selectedItems[itemIndex].price = newPrice;
                const perPlatePrice = calculatePerPlatePrice(updatedOrder);
                updatedOrder.grandTotal = Number(updatedOrder.guestCount || 0) * perPlatePrice;
                return updatedOrder;
            })
        );
    };

    const handleSaveOrder = async (order) => {
        try {
            await dispatch(updateOrder({ id: order._id, data: order })).unwrap();
            alert("Order Updated Successfully");
        } catch (err) {
            alert(err?.message || err || "Unable to update order");
        }
    };

    const filteredAndSortedOrders = [...localOrders]
        .filter((order) => {
            const matchesSearch =
                (order.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.mobile || "").includes(searchTerm);
            const matchesStatus = statusFilter === "All" || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "date-asc": return new Date(a.eventDate) - new Date(b.eventDate);
                case "date-desc": return new Date(b.eventDate) - new Date(a.eventDate);
                case "amount-desc": return (b.grandTotal || 0) - (a.grandTotal || 0);
                case "amount-asc": return (a.grandTotal || 0) - (b.grandTotal || 0);
                default: return new Date(a.eventDate) - new Date(b.eventDate);
            }
        });

    // Dynamic styles for status dropdown
    const getStatusStyles = (status) => {
        switch (status) {
            case 'Confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200 focus:ring-emerald-500';
            case 'Cancel': return 'bg-rose-100 text-rose-800 border-rose-200 focus:ring-rose-500';
            default: return 'bg-amber-100 text-amber-800 border-amber-200 focus:ring-amber-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="relative flex h-20 w-20 mb-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-40"></span>
                    <span className="relative inline-flex rounded-full h-20 w-20 bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center shadow-xl">
                        <ShoppingBagIcon className="w-10 h-10 text-white animate-pulse" />
                    </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-700 tracking-wide">ऑर्डर्स लोड होत आहेत...</h2>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-20 overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-br from-indigo-100/40 via-purple-50/40 to-emerald-50/40 pointer-events-none -z-10"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3">
                            ग्राहकांच्या <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ऑर्डर्स</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg max-w-xl">
                            ऑर्डर व्यवस्थापन, किमतींचे संपादन आणि अपडेट्स एकाच ठिकाणी.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/90 backdrop-blur-md border border-slate-200 px-6 py-4 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-2xl">
                            <ShoppingBagIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">एकूण ऑर्डर्स</p>
                            <p className="text-2xl font-black text-slate-800 leading-none">{filteredAndSortedOrders?.length || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] p-6 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        <div className="md:col-span-6 relative group">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="नाव किंवा मोबाईल नंबरने शोधा..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium transition-all"
                            />
                        </div>
                        <div className="md:col-span-3 relative group">
                            <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium appearance-none transition-all cursor-pointer"
                            >
                                <option value="All">सर्व ऑर्डर्स (All)</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Cancel">Cancelled</option>
                            </select>
                        </div>
                        <div className="md:col-span-3 relative group">
                            <ArrowsUpDownIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium appearance-none transition-all cursor-pointer"
                            >
                                <option value="date-desc">तारीख: नवीन प्रथम</option>
                                <option value="date-asc">तारीख: जुने प्रथम</option>
                                <option value="amount-desc">रक्कम: जास्त ते कमी</option>
                                <option value="amount-asc">रक्कम: कमी ते जास्त</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    {filteredAndSortedOrders?.map((order) => {
                        const isExpanded = expandedOrders[order._id];
                        const perPlatePrice = calculatePerPlatePrice(order);
                        const guestCount = Number(order.guestCount || 0);

                        // Ensure services is always an array for safe mapping
                        const currentServices = Array.isArray(order.services)
                            ? order.services
                            : (order.services ? [order.services] : []);

                        return (
                            <div key={order._id} className={`bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border transition-all duration-300 ${isExpanded ? "border-blue-300 shadow-[0_12px_40px_rgba(0,0,0,0.08)] ring-4 ring-blue-50" : "border-slate-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1"}`}>

                                {/* Order Summary (Header) */}
                                <div className="p-6 lg:p-8 cursor-pointer" onClick={() => toggleOrderDetails(order._id)}>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

                                        {/* Customer Info */}
                                        <div className="md:col-span-4 flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border border-slate-200 shrink-0 shadow-inner">
                                                <UserIcon className="w-8 h-8 text-slate-600" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-extrabold text-xl text-slate-900 truncate mb-1">{order.customerName}</h3>
                                                <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                                                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                                                        <PhoneIcon className="w-3.5 h-3.5" /> {order.mobile}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Event & Date */}
                                        <div className="md:col-span-3 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TagIcon className="w-4 h-4 text-indigo-500" />
                                                <span className="font-bold text-slate-700 text-sm">{order.eventType || "इतर कार्यक्रम"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CalendarDaysIcon className="w-4 h-4 text-blue-500" />
                                                <span className="font-bold text-slate-700 text-sm">
                                                    {new Date(order.eventDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="md:col-span-2 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6" onClick={(e) => e.stopPropagation()}>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</p>
                                            <div className="relative">
                                                <select
                                                    value={order.status || "Pending"}
                                                    onChange={(e) => handleFieldChange(order._id, "status", e.target.value)}
                                                    className={`w-full font-bold text-sm rounded-xl border px-3 py-2 pr-8 outline-none transition-all appearance-none cursor-pointer focus:ring-4 ${getStatusStyles(order.status || 'Pending')}`}
                                                >
                                                    <option value="Pending">⏳ Pending</option>
                                                    <option value="Inquiry">⏳ Inquiry</option>
                                                    <option value="Confirmed">✅ Confirmed</option>
                                                    <option value="Cancel">❌ Cancelled</option>
                                                </select>
                                                <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                            </div>
                                        </div>

                                        {/* Total & Expand Icon */}
                                        <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                                            <div className="text-left md:text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Bill</p>
                                                <p className="text-2xl font-black text-slate-900 tracking-tight">₹{order.grandTotal?.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className={`p-2.5 rounded-full transition-all duration-300 ${isExpanded ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 rotate-180" : "bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-700"}`}>
                                                <ChevronDownIcon className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Section */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 p-6 lg:p-8 bg-slate-50/50 rounded-b-[2rem] animate-in slide-in-from-top-4 fade-in duration-300">

                                        {/* Additional Info Form */}
                                        <div className="bg-white border border-slate-200 p-6 rounded-[1.5rem] mb-6 shadow-sm">
                                            <h4 className="font-black text-slate-800 text-lg mb-5 flex items-center gap-2">
                                                <DocumentTextIcon className="w-6 h-6 text-blue-500" /> अतिरिक्त माहिती
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="group">
                                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                        <UsersIcon className="w-4 h-4" /> Guest Count (पाहुणे)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={order.guestCount || ""}
                                                        onChange={(e) => handleFieldChange(order._id, "guestCount", e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="group">
                                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                        <MapPinIcon className="w-4 h-4" /> Address / Venue
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="ठिकाण किंवा पत्ता"
                                                        value={order.address || ""}
                                                        onChange={(e) => handleFieldChange(order._id, "address", e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="group">
                                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                        <DocumentTextIcon className="w-4 h-4" /> Special Instructions
                                                    </label>
                                                    <textarea
                                                        rows="2"
                                                        placeholder="काही विशेष सूचना..."
                                                        value={order.specialInstruction || ""}
                                                        onChange={(e) => handleFieldChange(order._id, "specialInstruction", e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none"
                                                    ></textarea>
                                                </div>

                                                {/* MULTIPLE SELECTION CHIPS FOR SERVICES */}
                                                <div className="group">
                                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                        <SparklesIcon className="w-4 h-4" /> Services / Add-ons
                                                    </label>
                                                    <div className="flex flex-wrap gap-2.5 mt-2">
                                                        {SERVICE_OPTIONS.map((option) => {
                                                            const isSelected = currentServices.includes(option);
                                                            return (
                                                                <button
                                                                    key={option}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        let newServices = [...currentServices];
                                                                        if (isSelected) {
                                                                            // Remove if already selected
                                                                            newServices = newServices.filter((s) => s !== option);
                                                                        } else {
                                                                            // Add if not selected
                                                                            newServices.push(option);
                                                                        }
                                                                        handleFieldChange(order._id, "services", newServices);
                                                                    }}
                                                                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border-2 active:scale-95 ${isSelected
                                                                            ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                                                                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300"
                                                                        }`}
                                                                >
                                                                    {isSelected && <CheckCircleSolid className="w-4 h-4 text-indigo-600" />}
                                                                    {option}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        {/* Menu Shifts Breakdown */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                            {order.shifts?.map((shift, shiftIdx) => (
                                                <div key={shiftIdx} className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-sm flex flex-col">
                                                    <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                                                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                                                            <ClockIcon className={`w-5 h-5 ${shift.shift === "सकाळ" ? "text-amber-500" : shift.shift === "संध्याकाळ" ? "text-orange-500" : "text-indigo-500"}`} />
                                                        </div>
                                                        <h3 className="font-black text-slate-800 text-lg uppercase tracking-wider">
                                                            {shift.shift} Shift
                                                        </h3>
                                                    </div>

                                                    <div className="p-5 flex-1 bg-white">
                                                        {shift.categories?.length > 0 ? (
                                                            <div className="space-y-6">
                                                                {shift.categories.map((category, catIdx) => (
                                                                    <div key={catIdx} className="relative">
                                                                        <h4 className="inline-block text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md mb-3 tracking-widest uppercase border border-indigo-100">
                                                                            {category.category}
                                                                        </h4>
                                                                        <div className="space-y-2">
                                                                            {category.selectedItems.map((item, itemIdx) => (
                                                                                <div key={itemIdx} className="flex justify-between items-center p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm transition-all group">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors"></div>
                                                                                        <span className="font-bold text-slate-700">{item.itemName}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center bg-white border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-indigo-400 overflow-hidden shadow-sm">
                                                                                        <span className="bg-slate-50 px-2.5 py-1.5 text-slate-400 text-sm font-bold border-r border-slate-200">₹</span>
                                                                                        <input
                                                                                            type="number"
                                                                                            value={item.price}
                                                                                            onChange={(e) => handleItemPriceChange(order._id, shiftIdx, catIdx, itemIdx, e.target.value)}
                                                                                            className="w-20 px-2 py-1.5 text-sm outline-none text-right font-black text-slate-800"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                                                                <CheckCircleIcon className="w-12 h-12 mb-2 opacity-50" />
                                                                <p className="font-medium">या शिफ्टमध्ये पदार्थ नाहीत</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Billing Calculation & Save Bar */}
                                        <div className="bg-slate-900 text-white p-6 lg:p-8 rounded-[1.5rem] shadow-2xl relative overflow-hidden">
                                            {/* Decorative background elements inside dark card */}
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                                            <h4 className="font-bold text-slate-400 text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <CurrencyRupeeIcon className="w-5 h-5 text-indigo-400" /> Billing Breakdown
                                            </h4>

                                            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">

                                                {/* Visual Math Formula */}
                                                <div className="flex-1 flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 w-full backdrop-blur-sm">
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">प्रति थाळी</p>
                                                        <p className="text-2xl font-black text-white">₹{perPlatePrice}</p>
                                                    </div>
                                                    <div className="text-indigo-400 font-light text-3xl">×</div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">पाहुणे</p>
                                                        <p className="text-2xl font-black text-white">{guestCount}</p>
                                                    </div>
                                                    <div className="text-indigo-400 font-light text-3xl">=</div>
                                                    <div className="text-center bg-indigo-500/20 px-4 py-2 rounded-xl border border-indigo-500/30">
                                                        <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Calculated Total</p>
                                                        <p className="text-2xl font-black text-indigo-400">₹{perPlatePrice * guestCount}</p>
                                                    </div>
                                                </div>

                                                {/* Final Amount & Actions */}
                                                <div className="flex flex-col gap-4 w-full lg:w-auto shrink-0">
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Final Grand Total</p>
                                                        <div className="flex items-center bg-slate-800 border border-slate-600 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 overflow-hidden shadow-inner">
                                                            <span className="bg-slate-700 px-4 py-3 text-slate-300 font-black border-r border-slate-600">₹</span>
                                                            <input
                                                                type="number"
                                                                value={order.grandTotal}
                                                                onChange={(e) => handleFieldChange(order._id, "grandTotal", e.target.value)}
                                                                className="w-full lg:w-48 px-4 py-3 outline-none text-2xl font-black text-white bg-slate-800"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 mt-2">
                                                        <button
                                                            onClick={() => handleSaveOrder(order)}
                                                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                                                        >
                                                            Save Changes
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteOrder(order._id)}
                                                            className="px-5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/30 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                                                            title="Delete Order"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}