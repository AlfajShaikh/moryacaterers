import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteOrder, getAllOrders, removeOrderItem, updateOrder } from "./ordersSlice";
import {
    UserIcon,
    PhoneIcon,
    CalendarDaysIcon,
    TagIcon,
    ChevronDownIcon,
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
    XCircleIcon
} from "@heroicons/react/24/outline";
import { ShoppingBagIcon, CurrencyRupeeIcon, CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import { EstimationModal } from "./EstimationModal/estimationModal";

export function Orders() {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector((state) => state.orders);

    // UI States
    const [expandedOrders, setExpandedOrders] = useState({});
    const [localOrders, setLocalOrders] = useState([]);
    const [estimationOrder, setEstimationOrder] = useState(null);
    const [showAddItem, setShowAddItem] = useState({});
    const [newItemName, setNewItemName] = useState({});
    const [newItemPrice, setNewItemPrice] = useState({});

    // Search & Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("date-asc");

    // Service Options
    const SERVICE_OPTIONS = ["बुफे", "पंगत", "VIP सर्व्हिस"];

    useEffect(() => {
        dispatch(getAllOrders());
    }, [dispatch]);

    useEffect(() => {
        if (orders) {
            setLocalOrders(JSON.parse(JSON.stringify(orders)));
        }
    }, [orders]);

    // Handlers
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

    const handleAddItem = (orderId, shiftIndex, categoryIndex) => {
        const name = newItemName[`${orderId}-${shiftIndex}-${categoryIndex}`]?.trim();
        const price = Number(newItemPrice[`${orderId}-${shiftIndex}-${categoryIndex}`] || 0);

        if (!name) {
            alert("Please enter item name");
            return;
        }

        setLocalOrders((prevOrders) =>
            prevOrders.map((order) => {
                if (order._id !== orderId) return order;
                const updatedOrder = JSON.parse(JSON.stringify(order));
                updatedOrder.shifts[shiftIndex].categories[categoryIndex].selectedItems.push({ itemName: name, price });
                const perPlatePrice = calculatePerPlatePrice(updatedOrder);
                updatedOrder.grandTotal = Number(updatedOrder.guestCount || 0) * perPlatePrice;
                return updatedOrder;
            })
        );

        setNewItemName((prev) => ({ ...prev, [`${orderId}-${shiftIndex}-${categoryIndex}`]: "" }));
        setNewItemPrice((prev) => ({ ...prev, [`${orderId}-${shiftIndex}-${categoryIndex}`]: "" }));
    };

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
        setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
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

    const handleRemoveItem = async (order, shift, category, itemId) => {
        if (!window.confirm("Remove this item?")) return;
        try {
            await dispatch(removeOrderItem({ orderId: order._id, shift, category, itemId })).unwrap();
            dispatch(getAllOrders());
        } catch (err) {
            alert(err || "Unable to remove item");
        }
    };

    // Derived Data & Filtering
    const filteredAndSortedOrders = [...localOrders]
        .filter((order) => {
            const matchesSearch = (order.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) || (order.mobile || "").includes(searchTerm);
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
                <div className="relative flex h-16 w-16 mb-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-40"></span>
                    <span className="relative inline-flex rounded-full h-16 w-16 bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center shadow-xl">
                        <ShoppingBagIcon className="w-8 h-8 text-white animate-pulse" />
                    </span>
                </div>
                <h2 className="text-xl font-bold text-slate-700 tracking-wide">ऑर्डर्स लोड होत आहेत...</h2>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-16 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-100/40 via-purple-50/40 to-emerald-50/40 pointer-events-none -z-10"></div>

            <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

                {/* Header Section */}
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-1">
                            ऑर्डर्स <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">व्यवस्थापन</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">
                            ऑर्डर व्यवस्थापन, किमतींचे संपादन आणि अपडेट्स एकाच ठिकाणी.
                        </p>
                    </div>
                    {/* Orders Summary Badge */}
                    <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-200 px-5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow w-max">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><ShoppingBagIcon className="w-6 h-6" /></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">एकूण ऑर्डर्स</p>
                            <p className="text-xl font-black text-slate-800 leading-none">{filteredAndSortedOrders.length}</p>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white/90 backdrop-blur-xl border border-white rounded-2xl p-4 mb-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6 relative group">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500" />
                            <input type="text" placeholder="नाव किंवा मोबाईल नंबरने शोधा..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium text-sm transition-all" />
                        </div>
                        <div className="md:col-span-3 relative group">
                            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500" />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium text-sm appearance-none transition-all cursor-pointer">
                                <option value="All">सर्व ऑर्डर्स (All)</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Cancel">Cancelled</option>
                            </select>
                        </div>
                        <div className="md:col-span-3 relative group">
                            <ArrowsUpDownIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500" />
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium text-sm appearance-none transition-all cursor-pointer">
                                <option value="date-desc">तारीख: नवीन प्रथम</option>
                                <option value="date-asc">तारीख: जुने प्रथम</option>
                                <option value="amount-desc">रक्कम: जास्त ते कमी</option>
                                <option value="amount-asc">रक्कम: कमी ते जास्त</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredAndSortedOrders?.map((order) => {
                        const totalAmount = Number(order.grandTotal || 0);
                        const advance = Number(order.advance || 0);
                        const balance = totalAmount - advance;

                        const isExpanded = expandedOrders[order._id];
                        const perPlatePrice = calculatePerPlatePrice(order);
                        const guestCount = Number(order.guestCount || 0);
                        const currentServices = Array.isArray(order.services) ? order.services : (order.services ? [order.services] : []);

                        return (
                            <div key={order._id} className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 ${isExpanded ? "border-blue-300 shadow-md ring-2 ring-blue-50" : "border-slate-100 hover:border-blue-200"}`}>

                                {/* Order Summary (Compact Header) */}
                                <div className="p-4 md:p-5 cursor-pointer" onClick={() => toggleOrderDetails(order._id)}>
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                        
                                        <div className="md:col-span-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                                                <UserIcon className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-extrabold text-base text-slate-900 truncate">{order.customerName}</h3>
                                                <div className="flex items-center gap-1 text-slate-500 text-[11px] font-semibold mt-0.5">
                                                    <PhoneIcon className="w-3 h-3" /> {order.mobile}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="md:col-span-4 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <TagIcon className="w-3.5 h-3.5 text-indigo-500" />
                                                <span className="font-bold text-slate-700 text-xs">{order.eventType || "इतर कार्यक्रम"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <CalendarDaysIcon className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="font-bold text-slate-700 text-xs">
                                                    {new Date(order.eventDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Status & Total */}
                                        <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 md:pl-4">
                                            <div className="text-left md:text-right" onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    value={order.status || "Pending"}
                                                    onChange={(e) => handleFieldChange(order._id, "status", e.target.value)}
                                                    className={`w-full font-bold text-[11px] rounded-md border px-2 py-0.5 outline-none appearance-none cursor-pointer mb-1 ${getStatusStyles(order.status || 'Pending')}`}
                                                >
                                                    <option value="Pending">⏳ Pending</option>
                                                    <option value="Confirmed">✅ Confirmed</option>
                                                    <option value="Cancel">❌ Cancelled</option>
                                                </select>
                                                <p className="text-lg font-black text-slate-900 tracking-tight leading-none">₹{totalAmount.toLocaleString('en-IN')}</p>
                                            </div>
                                            <div className={`p-2 rounded-full transition-all duration-300 shrink-0 ${isExpanded ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 rotate-180" : "bg-slate-50 text-slate-400 hover:bg-slate-200"}`}>
                                                <ChevronDownIcon className="w-5 h-5" />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Expanded Section */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 p-4 md:p-6 bg-slate-50/50 rounded-b-2xl animate-in slide-in-from-top-2 fade-in duration-200">

                                        {/* Additional Info Form */}
                                        <div className="bg-white border border-slate-200 p-4 rounded-xl mb-5 shadow-sm">
                                            <h4 className="font-black text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                                                <DocumentTextIcon className="w-4 h-4 text-blue-500" /> अतिरिक्त माहिती
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">

                                                <div className="group">
                                                    <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                        <PhoneIcon className="w-3 h-3" /> Mobile Number
                                                    </label>
                                                    <input type="text" value={order.mobile || ""} onChange={(e) => handleFieldChange(order._id, "mobile", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 text-sm outline-none" />
                                                </div>

                                                <div className="group">
                                                    <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                        <CalendarDaysIcon className="w-3 h-3" /> Event Date
                                                    </label>
                                                    <input type="date" value={order.eventDate ? new Date(order.eventDate).toISOString().split("T")[0] : ""} onChange={(e) => handleFieldChange(order._id, "eventDate", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 text-sm outline-none" />
                                                </div>

                                                <div className="group">
                                                    <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                        <UsersIcon className="w-3 h-3" /> Guest Count
                                                    </label>
                                                    <input type="number" value={order.guestCount || ""} onChange={(e) => handleFieldChange(order._id, "guestCount", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 text-sm outline-none" />
                                                </div>

                                                <div className="group lg:col-span-1">
                                                    <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                        <MapPinIcon className="w-3 h-3" /> Address
                                                    </label>
                                                    <input type="text" value={order.address || ""} onChange={(e) => handleFieldChange(order._id, "address", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 text-sm outline-none" />
                                                </div>

                                                <div className="group md:col-span-3 lg:col-span-2">
                                                    <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                        <DocumentTextIcon className="w-3 h-3" /> Special Instructions
                                                    </label>
                                                    <textarea rows="1" value={order.specialInstruction || ""} onChange={(e) => handleFieldChange(order._id, "specialInstruction", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 text-sm outline-none resize-none" />
                                                </div>

                                                <div className="group md:col-span-3 lg:col-span-2">
                                                    <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                        <SparklesIcon className="w-3 h-3" /> Services
                                                    </label>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {SERVICE_OPTIONS.map((option) => {
                                                            const isSelected = currentServices.includes(option);
                                                            return (
                                                                <button
                                                                    key={option} type="button"
                                                                    onClick={() => {
                                                                        let newServices = [...currentServices];
                                                                        if (isSelected) newServices = newServices.filter((s) => s !== option);
                                                                        else newServices.push(option);
                                                                        handleFieldChange(order._id, "services", newServices);
                                                                    }}
                                                                    className={`px-3 py-1 rounded-lg font-bold text-xs border ${isSelected ? "bg-indigo-50 border-indigo-500 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}
                                                                >
                                                                    {option}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Shifts Compact Grid */}
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
                                            {order.shifts?.map((shift, shiftIdx) => (
                                                <div key={shiftIdx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                                                    <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
                                                        <ClockIcon className={`w-4 h-4 ${shift.shift === "सकाळ" ? "text-amber-500" : shift.shift === "संध्याकाळ" ? "text-orange-500" : "text-indigo-500"}`} />
                                                        <h3 className="font-black text-slate-800 text-sm uppercase">{shift.shift} Shift</h3>
                                                    </div>

                                                    <div className="p-4 flex-1">
                                                        {shift.categories?.length > 0 ? (
                                                            <div className="space-y-4">
                                                                {shift.categories.map((category, catIdx) => (
                                                                    <div key={catIdx}>
                                                                        <h4 className="inline-block text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mb-2 uppercase border border-indigo-100">
                                                                            {category.category}
                                                                        </h4>
                                                                        <div className="space-y-1.5">
                                                                            {category.selectedItems.map((item, itemIdx) => (
                                                                                <div key={itemIdx} className="flex justify-between items-center p-2 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all group">
                                                                                    <div className="flex items-center gap-2 truncate pr-2">
                                                                                        <div className="w-1 h-1 rounded-full bg-slate-400 shrink-0"></div>
                                                                                        <span className="font-bold text-slate-700 text-sm truncate">{item.itemName}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                                        <div className="flex items-center bg-white border border-slate-200 rounded-md overflow-hidden">
                                                                                            <span className="bg-slate-50 px-1.5 py-1 text-slate-400 text-xs font-bold border-r border-slate-200">₹</span>
                                                                                            <input type="number" value={item.price} onChange={(e) => handleItemPriceChange(order._id, shiftIdx, catIdx, itemIdx, e.target.value)} className="w-14 px-1.5 py-1 text-xs outline-none text-right font-black text-slate-800" />
                                                                                        </div>
                                                                                        <button onClick={() => handleRemoveItem(order, shift.shift, category.category, item.itemId)} className="text-slate-400 hover:text-rose-500">
                                                                                            <TrashIcon className="w-4 h-4" />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                            
                                                                            {/* Add Item Button */}
                                                                            <div className="mt-2 pt-2 border-t border-slate-100">
                                                                                {!showAddItem[`${order._id}-${shiftIdx}-${catIdx}`] ? (
                                                                                    <button onClick={() => setShowAddItem((prev) => ({ ...prev, [`${order._id}-${shiftIdx}-${catIdx}`]: true }))} className="text-xs text-emerald-600 font-bold hover:underline">
                                                                                        + Add Item
                                                                                    </button>
                                                                                ) : (
                                                                                    <div className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                                                                                        <input type="text" placeholder="Name" value={newItemName[`${order._id}-${shiftIdx}-${catIdx}`] || ""} onChange={(e) => setNewItemName((prev) => ({ ...prev, [`${order._id}-${shiftIdx}-${catIdx}`]: e.target.value }))} className="w-full min-w-[80px] border border-slate-300 rounded text-xs px-2 py-1 outline-none" />
                                                                                        <input type="number" placeholder="₹" value={newItemPrice[`${order._id}-${shiftIdx}-${catIdx}`] || ""} onChange={(e) => setNewItemPrice((prev) => ({ ...prev, [`${order._id}-${shiftIdx}-${catIdx}`]: e.target.value }))} className="w-16 border border-slate-300 rounded text-xs px-2 py-1 outline-none" />
                                                                                        <button onClick={() => { handleAddItem(order._id, shiftIdx, catIdx); setShowAddItem((prev) => ({ ...prev, [`${order._id}-${shiftIdx}-${catIdx}`]: false })); }} className="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-bold">Save</button>
                                                                                        <button onClick={() => setShowAddItem((prev) => ({ ...prev, [`${order._id}-${shiftIdx}-${catIdx}`]: false }))} className="text-slate-500 px-1"><XCircleIcon className="w-4 h-4"/></button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                                                                <CheckCircleIcon className="w-8 h-8 mb-1 opacity-50" />
                                                                <p className="text-xs font-medium">Empty Shift</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* 🧮 Compact & Attractive Billing Breakdown Section */}
                                        <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                                            
                                            <div className="flex flex-col xl:flex-row justify-between gap-6 relative z-10">
                                                
                                                {/* Left Panel: Math */}
                                                <div className="flex-1 flex flex-wrap items-center gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 uppercase">प्रति थाळी (Per Plate)</p>
                                                        <p className="text-lg font-black">₹{perPlatePrice}</p>
                                                    </div>
                                                    <div className="text-indigo-400">×</div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-400 uppercase">पाहुणे (Guests)</p>
                                                        <p className="text-lg font-black">{guestCount}</p>
                                                    </div>
                                                    <div className="text-indigo-400">=</div>
                                                    <div className="bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/30">
                                                        <p className="text-[9px] text-indigo-300 uppercase">Calculated Total</p>
                                                        <p className="text-xl font-black text-indigo-400">₹{(perPlatePrice * guestCount).toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>

                                                {/* Right Panel: Inputs & Balances */}
                                                <div className="flex flex-col gap-3 w-full xl:w-[350px] shrink-0">
                                                    <div className="flex items-center justify-between bg-slate-800 border border-slate-600 rounded-lg p-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase px-1">Grand Total</span>
                                                        <div className="flex items-center rounded overflow-hidden">
                                                            <span className="bg-slate-700 px-2 py-1 text-slate-300 font-bold border-r border-slate-600">₹</span>
                                                            <input type="number" value={order.grandTotal || ""} onChange={(e) => handleFieldChange(order._id, "grandTotal", e.target.value)} className="w-24 px-2 py-1 outline-none text-base font-black text-white bg-slate-700 text-right" />
                                                        </div>
                                                    </div>

                                                    {/* Advance Payment Input (Shows only when Confirmed) */}
                                                    {order.status === "Confirmed" && (
                                                        <div className="flex items-center justify-between bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-2 shadow-inner">
                                                            <span className="text-[10px] font-bold text-emerald-400 uppercase px-1 flex items-center gap-1"><CheckCircleSolid className="w-3 h-3" /> Advance Received</span>
                                                            <div className="flex items-center rounded overflow-hidden">
                                                                <span className="bg-emerald-800/50 px-2 py-1 text-emerald-300 font-bold border-r border-emerald-600/50">₹</span>
                                                                <input type="number" min="0" value={order.advance || ""} onChange={(e) => handleFieldChange(order._id, "advance", e.target.value)} className="w-24 px-2 py-1 outline-none text-base font-black text-emerald-100 bg-emerald-800/50 text-right placeholder-emerald-700/50" placeholder="0" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Balance Due Display */}
                                                    <div className="flex justify-between items-center px-3 py-2 mt-1 bg-rose-900/20 border border-rose-500/30 rounded-lg">
                                                        <span className="text-xs font-bold text-rose-400 uppercase">Balance Due</span>
                                                        <span className="text-xl font-black text-rose-400">₹{balance.toLocaleString("en-IN")}</span>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                                        <button onClick={() => handleSaveOrder(order)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-sm col-span-2 transition-all">Save Changes</button>
                                                        <button onClick={() => setEstimationOrder(order)} className="flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2 rounded-lg text-xs transition-all"><DocumentTextIcon className="w-4 h-4" /> एस्टिमेशन</button>
                                                        <button onClick={() => handleDeleteOrder(order._id)} className="flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2 rounded-lg text-xs transition-all"><TrashIcon className="w-4 h-4" /> डिलीट</button>
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
                {estimationOrder && (
                    <EstimationModal
                        order={estimationOrder}
                        onClose={() => setEstimationOrder(null)}
                    />
                )}
            </div>
        </div>
    );
}