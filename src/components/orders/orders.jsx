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
    TrashIcon
} from "@heroicons/react/24/outline";
import { ShoppingBagIcon } from "@heroicons/react/24/solid";

export function Orders() {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector((state) => state.orders);

    const [expandedOrders, setExpandedOrders] = useState({});
    const [localOrders, setLocalOrders] = useState([]);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // --- Search & Filter States ---
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("date-asc");

    const handleDeleteOrder = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this order?"
        );

        if (!confirmDelete) return;

        try {
            await dispatch(deleteOrder(id)).unwrap();
            alert("Order deleted successfully.");
        } catch (err) {
            alert(err || "Unable to delete order.");
        }
    };

    useEffect(() => {
        dispatch(getAllOrders());
    }, [dispatch]);

    useEffect(() => {
        if (orders) {
            setLocalOrders(JSON.parse(JSON.stringify(orders)));
        }
    }, [orders]);

    const toggleOrderDetails = (orderId) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    // --- Helper: Calculate Per Plate (Thali) Price ---
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

    // --- Handlers for Editing Fields ---
    const handleFieldChange = (orderId, field, value) => {
        setLocalOrders((prevOrders) =>
            prevOrders.map((order) => {
                if (order._id !== orderId) return order;
                const updatedOrder = { ...order, [field]: value };
                // Auto-calculate Grand Total if Guest Count changes
                if (field === "guestCount") {
                    const perPlatePrice = calculatePerPlatePrice(updatedOrder);
                    updatedOrder.grandTotal = Number(value || 0) * perPlatePrice;
                }
                return updatedOrder;
            })
        );
    };

    // Updated to handle the nested Categories structure
    const handleItemPriceChange = (orderId, shiftIndex, categoryIndex, itemIndex, newPrice) => {
        setLocalOrders((prevOrders) =>
            prevOrders.map((order) => {
                if (order._id !== orderId) return order;
                
                // Deep copy to safely edit nested arrays
                const updatedOrder = JSON.parse(JSON.stringify(order));
                
                updatedOrder.shifts[shiftIndex].categories[categoryIndex].selectedItems[itemIndex].price = newPrice;
                
                // Auto-recalculate Grand Total based on new item price
                const perPlatePrice = calculatePerPlatePrice(updatedOrder);
                updatedOrder.grandTotal = Number(updatedOrder.guestCount || 0) * perPlatePrice;
                
                return updatedOrder;
            })
        );
    };

    const handleSaveOrder = async (order) => {
        try {
            await dispatch(
                updateOrder({
                    id: order._id,
                    data: order,
                })
            ).unwrap();
            alert("Order Updated Successfully");
        } catch (err) {
            alert(err?.message || err || "Unable to update order");
        }
    };

    // --- Filtering and Sorting Logic ---
    const filteredAndSortedOrders = [...localOrders]
        .filter((order) => {
            const matchesSearch =
                (order.customerName || "")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                (order.mobile || "").includes(searchTerm);

            const matchesStatus =
                statusFilter === "All" || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "date-asc":
                    return new Date(a.eventDate) - new Date(b.eventDate);
                case "date-desc":
                    return new Date(b.eventDate) - new Date(a.eventDate);
                case "amount-desc":
                    return (b.grandTotal || 0) - (a.grandTotal || 0);
                case "amount-asc":
                    return (a.grandTotal || 0) - (b.grandTotal || 0);
                default:
                    return new Date(a.eventDate) - new Date(b.eventDate);
            }
        });

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <span className="relative flex h-16 w-16 mb-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-16 w-16 bg-blue-600"></span>
                </span>
                <h2 className="text-xl font-bold text-slate-600 animate-pulse">ऑर्डर्स लोड होत आहेत...</h2>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-20 overflow-hidden">
            {/* Premium Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-br from-indigo-100/40 via-purple-50/40 to-emerald-50/40 pointer-events-none -z-10"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
                            ग्राहकांच्या <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ऑर्डर्स</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg">
                            ऑर्डर व्यवस्थापन, किमतींचे संपादन आणि अपडेट्स.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <ShoppingBagIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">दिसणाऱ्या ऑर्डर्स</p>
                            <p className="text-xl font-black text-slate-800">{filteredAndSortedOrders?.length || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-5 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Search Bar */}
                        <div className="md:col-span-6 relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="नाव किंवा मोबाईल नंबरने शोधा..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
                            />
                        </div>
                        {/* Status Filter */}
                        <div className="md:col-span-3 relative">
                            <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none transition-all cursor-pointer"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Cancel">Cancel</option>
                            </select>
                        </div>
                        {/* Sort By */}
                        <div className="md:col-span-3 relative">
                            <ArrowsUpDownIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none transition-all cursor-pointer"
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

                        return (
                            <div
                                key={order._id}
                                className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] border transition-all duration-300 ${isExpanded ? "border-blue-300 shadow-[0_8px_30px_rgba(0,0,0,0.08)]" : "border-white/60 hover:border-blue-200 hover:shadow-lg hover:-translate-y-0.5"
                                    }`}
                            >
                                {/* Order Summary */}
                                <div className="p-5 md:p-6 lg:p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                        <div className="md:col-span-3 flex items-center gap-4 cursor-pointer" onClick={() => toggleOrderDetails(order._id)}>
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 shrink-0">
                                                <UserIcon className="w-7 h-7 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800 truncate">{order.customerName}</h3>
                                                <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium mt-0.5">
                                                    <PhoneIcon className="w-4 h-4" /> {order.mobile}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-4 grid grid-cols-2 gap-4 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 cursor-pointer" onClick={() => toggleOrderDetails(order._id)}>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">कार्यक्रम</p>
                                                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                                    <TagIcon className="w-4 h-4 text-emerald-500" />
                                                    {order.eventType || "N/A"}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">तारीख</p>
                                                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                                                    <CalendarDaysIcon className="w-4 h-4 text-blue-500" />
                                                    {new Date(order.eventDate).toLocaleDateString("en-IN", {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 border-t md:border-t-0 border-slate-200 pt-4 md:pt-0">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status</p>
                                            <select
                                                value={order.status || "Pending"}
                                                onChange={(e) => handleFieldChange(order._id, "status", e.target.value)}
                                                className={`w-full font-bold text-sm rounded-xl border px-3 py-2 outline-none transition-colors appearance-none cursor-pointer
                                                    ${order.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        order.status === 'Cancel' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                            'bg-amber-50 text-amber-700 border-amber-200'}`}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Cancel">Cancel</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-200 pt-4 md:pt-0">
                                            <div className="text-left md:text-right">
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">एकूण रक्कम</p>
                                                <p className="text-2xl font-black text-blue-700">₹{order.grandTotal}</p>
                                            </div>
                                            <button onClick={() => toggleOrderDetails(order._id)} className={`p-2 rounded-full transition-colors ${isExpanded ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                                                {isExpanded ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Menu Items & Extra Details */}
                                {isExpanded && (
                                    <div className="border-t border-slate-200/60 p-5 md:p-6 lg:p-8 bg-slate-50/50 rounded-b-3xl animate-in slide-in-from-top-4 fade-in duration-300">
                                        <div className="bg-white border border-slate-200 p-5 rounded-2xl mb-6 shadow-sm">
                                            <h4 className="font-extrabold text-slate-700 mb-4 border-b border-slate-100 pb-2">ऑर्डरची अतिरिक्त माहिती</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-600 mb-1.5"><UsersIcon className="w-4 h-4" /> Guest Count</label>
                                                    <input
                                                        type="number"
                                                        placeholder="उदा. 500"
                                                        value={order.guestCount || ""}
                                                        onChange={(e) => handleFieldChange(order._id, "guestCount", e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 outline-none transition"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-600 mb-1.5"><MapPinIcon className="w-4 h-4" /> Address / Venue</label>
                                                    <input
                                                        type="text"
                                                        placeholder="ठिकाण किंवा पत्ता"
                                                        value={order.address || ""}
                                                        onChange={(e) => handleFieldChange(order._id, "address", e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 outline-none transition"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-600 mb-1.5"><DocumentTextIcon className="w-4 h-4" /> Special Instructions</label>
                                                    <textarea
                                                        rows="2"
                                                        placeholder="उदा. तिखट कमी ठेवा..."
                                                        value={order.specialInstruction || ""}
                                                        onChange={(e) => handleFieldChange(order._id, "specialInstruction", e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 outline-none transition resize-none"
                                                    ></textarea>
                                                </div>
                                                <div>
                                                    <label className="flex items-center gap-1.5 text-sm font-bold text-slate-600 mb-1.5"><SparklesIcon className="w-4 h-4" /> Special Services</label>
                                                    <textarea
                                                        rows="2"
                                                        placeholder="उदा. VIP सर्व्हिस, डेकोरेशन..."
                                                        value={order.services || ""}
                                                        onChange={(e) => handleFieldChange(order._id, "services", e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 outline-none transition resize-none"
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Nested Categories & Items List */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                            {order.shifts?.map((shift, shiftIdx) => (
                                                <div key={shiftIdx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                                    <div className="bg-gradient-to-r from-slate-50 to-white px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                                                        <ClockIcon className={`w-5 h-5 ${shift.shift === "सकाळ" ? "text-amber-500" : shift.shift === "संध्याकाळ" ? "text-orange-500" : "text-indigo-500"}`} />
                                                        <h3 className="font-bold text-slate-800 text-lg uppercase tracking-wide">
                                                            {shift.shift} Shift
                                                        </h3>
                                                    </div>
                                                    
                                                    <div className="p-4">
                                                        {shift.categories?.length > 0 ? (
                                                            <div className="space-y-5">
                                                                {shift.categories.map((category, catIdx) => (
                                                                    <div key={catIdx}>
                                                                        <h4 className="text-sm font-bold text-blue-600 border-b border-blue-100 pb-1 mb-2">
                                                                            {category.category}
                                                                        </h4>
                                                                        <div className="space-y-1">
                                                                            {category.selectedItems.map((item, itemIdx) => (
                                                                                <div key={itemIdx} className="flex justify-between items-center p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                                                                                            {itemIdx + 1}
                                                                                        </span>
                                                                                        <span className="font-semibold text-slate-700 text-sm">{item.itemName}</span>
                                                                                    </div>
                                                                                    <div className="flex items-center bg-white border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-blue-400 overflow-hidden">
                                                                                        <span className="bg-slate-50 px-2 py-1 text-slate-500 text-sm font-bold border-r border-slate-200">₹</span>
                                                                                        <input
                                                                                            type="number"
                                                                                            value={item.price}
                                                                                            onChange={(e) => handleItemPriceChange(order._id, shiftIdx, catIdx, itemIdx, e.target.value)}
                                                                                            className="w-16 px-2 py-1 text-sm outline-none text-right font-bold text-slate-800"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-slate-400 text-center py-4 text-sm font-medium">या शिफ्टमध्ये कोणतेही पदार्थ नाहीत</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Billing Calculation & Editable Grand Total */}
                                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                                            <h4 className="font-extrabold text-slate-700 mb-4 border-b border-slate-100 pb-2">ऑर्डरचे बिल (Billing Details)</h4>
                                            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                                <div className="flex-1 flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8 bg-slate-50 p-4 rounded-xl border border-slate-100 w-full">
                                                    <div className="text-center lg:text-left">
                                                        <p className="text-xs font-bold text-slate-500 uppercase">एका थाळीची किंमत</p>
                                                        <p className="text-xl font-black text-slate-700">₹{perPlatePrice}</p>
                                                    </div>
                                                    <div className="text-slate-400 font-bold text-xl">×</div>
                                                    <div className="text-center lg:text-left">
                                                        <p className="text-xs font-bold text-slate-500 uppercase">पाहुण्यांची संख्या</p>
                                                        <p className="text-xl font-black text-slate-700">{guestCount}</p>
                                                    </div>
                                                    <div className="text-slate-400 font-bold text-xl">=</div>
                                                    <div className="text-center lg:text-left">
                                                        <p className="text-xs font-bold text-blue-500 uppercase">एकूण रक्कम (Calculated)</p>
                                                        <p className="text-2xl font-black text-blue-600">₹{perPlatePrice * guestCount}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col gap-4 w-full lg:w-auto shrink-0">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-500 mb-1">Final Grand Total (Editable)</p>
                                                        <div className="flex items-center bg-white border border-slate-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden shadow-sm">
                                                            <span className="bg-slate-50 px-3 py-2 text-slate-500 font-bold border-r border-slate-200">₹</span>
                                                            <input
                                                                type="number"
                                                                value={order.grandTotal}
                                                                onChange={(e) => handleFieldChange(order._id, "grandTotal", e.target.value)}
                                                                className="w-full lg:w-48 px-3 py-2 outline-none text-xl font-black text-blue-700"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleSaveOrder(order)}
                                                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition"
                                                        >
                                                            Save Changes
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteOrder(order._id)}
                                                            className="px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition flex items-center justify-center"
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