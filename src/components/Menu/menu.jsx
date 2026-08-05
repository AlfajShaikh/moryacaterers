import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllMenus, saveCustomerMenu } from "./menuSlice";
import {
    CheckCircleIcon as CheckCircleSolid,
    ShoppingCartIcon,
    BanknotesIcon
} from "@heroicons/react/24/solid";
import { ChatBubbleLeftRightIcon, EnvelopeIcon, PhoneIcon, PlusCircleIcon, TrashIcon, UserIcon, XMarkIcon, ClockIcon, CalendarDaysIcon, TagIcon } from "@heroicons/react/24/outline";
import { SelectEventCalenderModel } from "../EventCalendarModal/SelectEventCalenderModel/selectEventCalenderModel";

export function Menu() {
    const dispatch = useDispatch();
    const SHIFT_OPTIONS = ["सकाळ", "संध्याकाळ", "रात्र"];

    // --- नवीन: Splash Screen State ---
    const [showSplash, setShowSplash] = useState(true);

    // --- नवीन: Splash Screen Timer (२.५ सेकंदानंतर मेन्यू दिसेल) ---
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2500); // 2500 milliseconds = 2.5 seconds

        return () => clearTimeout(timer);
    }, []);



    const [selectedShifts, setSelectedShifts] = useState([]);

    // NEW STATE: Tracks which shifts are already booked for the selected date
    const [bookedShifts, setBookedShifts] = useState([]);

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const [customer, setCustomer] = useState({
        name: "",
        mobile: "",
        whatsapp: "",
        email: "",
        eventDate: "",
        eventType: "",
    });

    const eventTypes = [
        "लग्न",
        "साखरपुडा",
        "वाढदिवस",
        "गृहप्रवेश",
        "मुंज",
        "नामकरण",
        "कॉर्पोरेट इव्हेंट",
        "इतर"
    ];

    const [eventDetails, setEventDetails] = useState({
        eventDate: "",
        eventType: "",
    });

    const createPayload = () => {
        const shifts = Object.entries(selectedItems)
            .filter(([_, items]) => items.length > 0)
            .map(([shift, items]) => ({
                shift,
                selectedItems: items.map(item => ({
                    itemId: item._id,
                    itemName: item.itemName,
                    price: item.showPrice ? Number(item.price) : 0
                }))
            }));

        return {
            customerName: customer.name,
            mobile: customer.mobile,
            eventDate: customer.eventDate,
            eventType: customer.eventType,
            shifts
        };
    };

    const [showMenu, setShowMenu] = useState(false);
    const { menus, loading } = useSelector((state) => state.menuList);

    const [selectedItems, setSelectedItems] = useState({
        "सकाळ": [],
        "संध्याकाळ": [],
        "रात्र": [],
    });

    const [activeShift, setActiveShift] = useState("सकाळ");

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        dispatch(getAllMenus());
    }, [dispatch]);

    // Get names of OTHER shifts where this item is already selected
    const getOtherSelectedShifts = (itemId) => {
        const shifts = [];
        Object.entries(selectedItems).forEach(([shift, items]) => {
            if (shift !== activeShift && items.some(i => i._id === itemId)) {
                shifts.push(shift);
            }
        });
        return shifts;
    };

    const handleToggleItem = (item) => {
        const exists = ((selectedItems[activeShift] || []) || []).find((i) => i._id === item._id);

        if (exists) {
            // Remove item if already selected in current shift
            setSelectedItems({
                ...selectedItems,
                [activeShift]: ((selectedItems[activeShift] || []) || []).filter((i) => i._id !== item._id),
            });
            return;
        }

        // Add item to current shift (Allowed even if selected in other shifts)
        setSelectedItems({
            ...selectedItems,
            [activeShift]: [...((selectedItems[activeShift] || []) || []), item],
        });
    };

    // Calculate Active Shift Total
    const activeShiftTotal = (((selectedItems[activeShift] || []) || []) || []).reduce(
        (total, item) =>
            total + (item.showPrice ? Number(item.price || 0) : 0),
        0
    );

    // Calculate Grand Total across ALL selected shifts
    const grandTotal = Object.values(selectedItems)
        .flat()
        .reduce((total, item) => total + (item.showPrice ? Number(item.price || 0) : 0), 0);

    const totalSelectedItemsAcrossShifts = Object.values(selectedItems).flat().length;

    useEffect(() => {
        if (isCartOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
    }, [isCartOpen]);

    const handleContinue = () => {
        if (!customer.name.trim()) { alert("Please enter customer name"); return; }
        if (customer.mobile.length !== 10) { alert("Please enter valid 10-digit mobile number"); return; }
        if (selectedShifts.length === 0) { alert("Please select at least one shift"); return; }

        setActiveShift(selectedShifts[0]); // Default to first selected shift
        setShowMenu(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <span className="relative flex h-16 w-16 mb-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-16 w-16 bg-blue-600"></span>
                </span>
                <h2 className="text-xl font-bold text-slate-600 animate-pulse">मेनू लोड होत आहे...</h2>
            </div>
        );
    }

    const handleConfirmOrder = async () => {
        const shifts = selectedShifts.map((shift) => {
            const categories = menus
                .map((category) => {
                    const items = category.menuItems
                        .filter((menuItem) =>
                            selectedItems[shift].some(
                                (selected) => selected._id === menuItem._id
                            )
                        )
                        .map((item) => ({
                            itemId: item._id,
                            itemName: item.itemName,
                            price: item.showPrice ? Number(item.price) : 0,
                        }));

                    if (items.length === 0) return null;

                    return {
                        category: category.category,
                        selectedItems: items,
                    };
                })
                .filter(Boolean);

            return {
                shift,
                categories,
            };
        });

        const payload = {
            customerName: customer.name,
            mobile: customer.mobile,
            whatsapp: customer.whatsapp,
            email: customer.email,
            eventDate: eventDetails.eventDate,
            eventType: eventDetails.eventType,
            advance : "0",
            paymentStatus:"Unpaid",
            shifts,
        };

        try {
            await dispatch(saveCustomerMenu(payload)).unwrap();
            alert("Order Saved Successfully");

            // reset customer
            setCustomer({ name: "", mobile: "", whatsapp: "", email: "" });
            setEventDetails({ eventDate: "", eventType: "" });
            setSelectedShifts([]);
            setBookedShifts([]); // Reset booked shifts
            setSelectedItems({ "सकाळ": [], "संध्याकाळ": [], "रात्र": [] });
            setShowMenu(false);
            setActiveShift("सकाळ");

        } catch (err) {
            alert(err.message || "Unable to save");
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-24 lg:pb-10 overflow-hidden">
            {/* Premium Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-br from-indigo-100/40 via-purple-50/40 to-emerald-50/40 pointer-events-none -z-10"></div>
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-200/20 blur-[120px] pointer-events-none -z-10 animate-[pulse_8s_ease-in-out_infinite]"></div>
            <div className="fixed bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-200/20 blur-[120px] pointer-events-none -z-10 animate-[pulse_10s_ease-in-out_infinite]"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">

                {/* Header */}
                <div className="mb-8 lg:mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
                        आमचा <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">मेन्यू</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        तुमच्या आवडीचे पदार्थ निवडा आणि तुमची थाळी तयार करा.
                    </p>
                </div>

                {/* Customer Details Form */}
                {!showMenu && (
                    <div className="mt-4 mb-5 bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-3xl">

                        <div className="mb-8">
                            <label className="text-lg font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                                <ClockIcon className="w-6 h-6 text-blue-600" />
                                कार्यक्रमाची शिफ्ट (किंवा शिफ्ट्स) निवडा <span className="text-rose-500">*</span>
                            </label>

                            {!eventDetails.eventDate && (
                                <p className="text-sm font-bold text-amber-600 mb-3 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                                    कृपया शिफ्ट्स निवडण्यापूर्वी खाली कार्यक्रमाचा दिनांक निवडा.
                                </p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {SHIFT_OPTIONS.map((shift) => {
                                    const checked = selectedShifts.includes(shift);
                                    // MODIFIED: Check if shift is in the booked array
                                    const isBooked = bookedShifts.includes(shift);

                                    return (
                                        <button
                                            key={shift}
                                            type="button"
                                            disabled={isBooked || !eventDetails.eventDate}
                                            onClick={() => {
                                                if (checked) setSelectedShifts(selectedShifts.filter((s) => s !== shift));
                                                else setSelectedShifts([...selectedShifts, shift]);
                                            }}
                                            className={`rounded-2xl py-4 font-bold text-lg border-2 transition-all transform active:scale-95 flex flex-col items-center justify-center gap-1.5
                                                ${!eventDetails.eventDate ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" :
                                                    isBooked ? "bg-rose-50 border-rose-200 text-slate-400 cursor-not-allowed opacity-75" :
                                                        checked ? "bg-blue-50 border-blue-600 text-blue-700 shadow-md" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50"}`}
                                        >
                                            <span>{shift}</span>
                                            {isBooked && (
                                                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest px-2 py-0.5 bg-white rounded-md border border-rose-200 shadow-sm">
                                                    आधीच बुक
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="h-px w-full bg-slate-200 mb-8"></div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 shadow-sm">
                                <UserIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-800">Customer Details</h3>
                                <p className="text-sm font-medium text-slate-500">कृपया तुमची माहिती भरा</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div className="mb-2">
                                <label className="text-sm font-bold text-slate-700">कार्यक्रम दिनांक <span className="text-rose-500">*</span></label>
                                <div className="relative mt-2">
                                    <CalendarDaysIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        readOnly
                                        placeholder="कार्यक्रम दिनांक निवडा"
                                        value={eventDetails.eventDate}
                                        onClick={() => setIsCalendarOpen(true)}
                                        className="w-full rounded-xl border border-slate-300 bg-white/50 pl-12 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition cursor-pointer hover:bg-slate-50 font-bold text-indigo-700"
                                    />
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="text-sm font-bold text-slate-700">ग्राहकाचे नाव<span className="text-rose-500">*</span></label>
                                <div className="relative mt-2">
                                    <UserIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                                    <input type="text" placeholder="तुमचे नाव लिहा" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white/50 pl-12 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition" />
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="text-sm font-bold text-slate-700">
                                    कार्यक्रम <span className="text-rose-500">*</span>
                                </label>

                                <div className="relative mt-2">
                                    <TagIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 pointer-events-none" />

                                    <select
                                        value={eventDetails.eventType}
                                        onChange={(e) =>
                                            setEventDetails({
                                                ...eventDetails,
                                                eventType: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white/50 pl-12 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition appearance-none"
                                    >
                                        <option value="">कार्यक्रम निवडा</option>

                                        {eventTypes.map((event, index) => (
                                            <option key={index} value={event}>
                                                {event}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Dropdown Arrow */}
                                    <svg
                                        className="absolute right-4 top-4 w-5 h-5 text-slate-400 pointer-events-none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="text-sm font-bold text-slate-700">मोबाईल क्रमांक <span className="text-rose-500">*</span></label>
                                <div className="relative mt-2">
                                    <PhoneIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                                    <input type="tel" maxLength={10} placeholder="9876543210" value={customer.mobile} onChange={(e) => setCustomer({ ...customer, mobile: e.target.value.replace(/\D/g, '') })} className="w-full rounded-xl border border-slate-300 bg-white/50 pl-12 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition" />
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="text-sm font-bold text-slate-700">व्हॉट्सअॅप क्रमांक</label>
                                <div className="relative mt-2">
                                    <ChatBubbleLeftRightIcon className="w-5 h-5 absolute left-4 top-3.5 text-emerald-500" />
                                    <input type="tel" maxLength={10} placeholder="ऐच्छिक" value={customer.whatsapp} onChange={(e) => setCustomer({ ...customer, whatsapp: e.target.value.replace(/\D/g, '') })} className="w-full rounded-xl border border-slate-300 bg-white/50 pl-12 pr-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition" />
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="text-sm font-bold text-slate-700">ई-मेल पत्ता</label>
                                <div className="relative mt-2">
                                    <EnvelopeIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                                    <input type="email" placeholder="ऐच्छिक" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white/50 pl-12 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition" />
                                </div>
                            </div>
                        </div>

                        <button onClick={handleContinue} className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
                            मेनू पहा →
                        </button>
                    </div>
                )}


                {/* Menu Selection Section */}
                {showMenu && (
                    <div className="animate-in fade-in duration-500">
                        <button onClick={() => setShowMenu(false)} className="mb-6 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 font-bold shadow-sm hover:bg-slate-50 transition-colors">
                            ← Back to Details
                        </button>

                        {/* Shift Navigation Tabs */}
                        {selectedShifts.length > 1 && (
                            <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide">
                                {selectedShifts.map((shift) => (
                                    <button
                                        key={shift}
                                        onClick={() => setActiveShift(shift)}
                                        className={`whitespace-nowrap flex items-center gap-2 px-6 py-3.5 rounded-2xl font-extrabold text-lg transition-all duration-300 border-2 
                                            ${activeShift === shift
                                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/30"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                                            }`}
                                    >
                                        {shift} ची मेनू
                                        <span className={`px-2.5 py-0.5 rounded-lg text-sm font-bold ml-1 ${activeShift === shift ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                                            }`}>
                                            {selectedItems[shift].length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="grid lg:grid-cols-12 gap-8 items-start">

                            {/* Left Column: Menu Items */}
                            <div className="lg:col-span-7 xl:col-span-8 space-y-10 lg:space-y-12">
                                {menus.map((category) => (
                                    <div key={category._id} className="scroll-mt-28">

                                        {/* Category Title */}
                                        <div className="flex items-center gap-4 mb-6">
                                            <h2 className="text-xl lg:text-2xl font-bold text-slate-800 bg-white shadow-sm border border-slate-100 px-5 py-2 lg:px-6 lg:py-2.5 rounded-full inline-flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${activeShift === "सकाळ"
                                                    ? "bg-amber-400"
                                                    : activeShift === "संध्याकाळ"
                                                        ? "bg-orange-500"
                                                        : "bg-indigo-500"}`}></span>
                                                {category.category}
                                            </h2>
                                            <div className="h-px bg-gradient-to-r from-slate-200 to-transparent flex-1 mt-1"></div>
                                        </div>

                                        {/* Items Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                                            {category.menuItems.map((item) => {
                                                const isSelected = ((selectedItems[activeShift] || []) || []).some((i) => i._id === item._id);
                                                const otherShifts = getOtherSelectedShifts(item._id);

                                                return (
                                                    <div
                                                        key={item._id}
                                                        onClick={() => handleToggleItem(item)}
                                                        className={`group relative flex items-center gap-4 p-4 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-[0_2px_15px_rgba(0,0,0,0.03)]
                                                            ${isSelected
                                                                ? "bg-emerald-50/80 border-emerald-400 shadow-md transform scale-[1.02]"
                                                                : "bg-white border-transparent hover:border-blue-200 hover:shadow-lg"
                                                            }`}
                                                    >
                                                        {/* Badge: Inform if already selected in another shift */}
                                                        {otherShifts.length > 0 && (
                                                            <div className={`absolute -top-3 right-4 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm z-20 transition-colors
                                                                ${isSelected ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'}`}>
                                                                यामध्ये देखील : {otherShifts.join(' & ')}
                                                            </div>
                                                        )}

                                                        <div className="absolute top-3 right-3 z-10">
                                                            {isSelected ? (
                                                                <CheckCircleSolid className="w-7 h-7 text-emerald-500 drop-shadow-sm animate-in zoom-in duration-300" />
                                                            ) : (
                                                                <PlusCircleIcon className="w-7 h-7 text-slate-300 group-hover:text-blue-500 transition-colors duration-300" />
                                                            )}
                                                        </div>

                                                        <div className="relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0">
                                                            <img
                                                                src={item.url}
                                                                alt={item.itemName}
                                                                className={`w-full h-full object-cover rounded-2xl transition-all duration-300 ${isSelected ? "ring-2 ring-emerald-400 ring-offset-2" : "group-hover:shadow-md"}`}
                                                                onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
                                                            />
                                                        </div>

                                                        <div className="flex-1 pr-6">
                                                            <h3 className={`font-bold text-base lg:text-lg leading-tight mb-1 transition-colors ${isSelected ? "text-emerald-900" : "text-slate-800"}`}>
                                                                {item.itemName}
                                                            </h3>
                                                            <p className="text-xs text-slate-500 line-clamp-2 mb-2 font-medium leading-relaxed">
                                                                {item.description}
                                                            </p>
                                                            {item.showPrice && (
                                                                <div className={`text-base lg:text-lg font-black ${isSelected ? "text-emerald-600" : "text-slate-700"}`}>
                                                                    ₹{item.price}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Mobile Overlay Background */}
                            {isCartOpen && (
                                <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
                            )}

                            {/* Right Column / Mobile Dialog: Animated Thali UI */}
                            <div className={`
                                ${isCartOpen ? "fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom-full duration-300" : "hidden"}
                                lg:block lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 lg:z-auto
                            `}>
                                <div className="bg-white/95 lg:bg-white/80 backdrop-blur-2xl border-t lg:border border-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-t-3xl lg:rounded-3xl p-5 lg:p-6 flex flex-col h-[85vh] lg:h-[calc(100vh-8rem)]">

                                    {/* Thali Header */}
                                    <div className="flex-shrink-0 flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 lg:p-3 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100/50">
                                                <ShoppingCartIcon className="w-5 h-5 lg:w-6 lg:h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg lg:text-xl font-extrabold text-slate-800 flex items-center gap-2">
                                                    तुमची थाळी
                                                    {selectedShifts.length > 1 && <span className="bg-blue-100 text-blue-700 text-[10px] lg:text-xs px-2 py-0.5 rounded-md uppercase tracking-wider">{activeShift}</span>}
                                                </h2>
                                                <p className="text-xs lg:text-sm font-semibold text-slate-500">
                                                    निवडलेले पदार्थ : {(((selectedItems[activeShift] || []) || []) || []).length}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Clear Cart Button */}
                                            {(((selectedItems[activeShift] || []) || []) || []).length > 0 && (
                                                <button onClick={() => setSelectedItems({ ...selectedItems, [activeShift]: [] })} className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full transition-colors">
                                                    रिकामी करा
                                                </button>
                                            )}
                                            {/* Close Button for Mobile */}
                                            <button
                                                onClick={() => setIsCartOpen(false)}
                                                className="lg:hidden p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                                            >
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* List Format Thali Section with Categories */}
                                    <div className="flex-1 py-2 lg:py-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">                                        {(((selectedItems[activeShift] || []) || []) || []).length === 0 ? (

                                        <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500">
                                            <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-200">
                                                <ShoppingCartIcon className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-bold text-slate-500 text-base lg:text-lg">थाळी रिकामी आहे</p>
                                            <p className="text-sm text-slate-400 mt-1">मेनूमधून पदार्थ निवडा</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                                            {menus.map((category) => {
                                                const selectedInCategory = category.menuItems.filter((menuItem) =>
                                                    (((selectedItems[activeShift] || []) || []) || []).some(
                                                        (selected) => selected._id === menuItem._id
                                                    )
                                                );

                                                if (selectedInCategory.length === 0) return null;

                                                return (
                                                    <div key={category._id} className="bg-slate-50/50 rounded-2xl p-3 lg:p-4 border border-slate-100">
                                                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                            {category.category}
                                                            <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full ml-auto">
                                                                {selectedInCategory.length}
                                                            </span>
                                                        </h3>

                                                        <div className="space-y-2">
                                                            {selectedInCategory.map((item) => (
                                                                <div
                                                                    key={item._id}
                                                                    className="group flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                                                                >
                                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                                        <img
                                                                            src={item.url}
                                                                            alt={item.itemName}
                                                                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                                                                            onError={(e) => { e.target.style.display = 'none' }}
                                                                        />
                                                                        <div className="flex flex-col min-w-0">
                                                                            <span className="text-sm font-bold text-slate-800 truncate">
                                                                                {item.itemName}
                                                                            </span>
                                                                            {item.showPrice && (
                                                                                <span className="text-xs font-black text-emerald-600 mt-0.5">
                                                                                    ₹{item.price}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleToggleItem(item);
                                                                        }}
                                                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                                                                        title="काढून टाका"
                                                                    >
                                                                        <TrashIcon className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    </div>


                                    {/* Total and Action Button */}
                                    <div className="flex-shrink-0 pt-4 lg:pt-5 mt-2 border-t border-slate-100">
                                        <div className="flex justify-between items-center mb-4 lg:mb-5 px-1 bg-slate-50 p-3 lg:p-4 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex flex-col">
                                                <span className="text-xs lg:text-sm font-bold text-slate-500 uppercase tracking-wider">{activeShift} ची एकूण रक्कम</span>
                                                <span className="text-xl lg:text-2xl font-black text-slate-800">₹{activeShiftTotal}</span>
                                            </div>
                                            {selectedShifts.length > 1 && (
                                                <div className="flex flex-col items-end border-l-2 border-slate-200 pl-4">
                                                    <span className="text-xs lg:text-sm font-bold text-emerald-600 uppercase tracking-wider">एकूण रक्कम</span>
                                                    <span className="text-xl lg:text-2xl font-black text-emerald-600">₹{grandTotal}</span>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleConfirmOrder}
                                            disabled={
                                                selectedShifts.some(
                                                    (shift) => selectedItems[shift].length === 0
                                                )
                                            }
                                            className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base lg:text-lg py-3.5 lg:py-4 rounded-2xl shadow-[0_8px_20px_rgba(79,70,229,0.3)] transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none mb-20 lg:mb-0"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                ऑर्डर निश्चित करा
                                                <span className="bg-white/20 px-2.5 py-0.5 lg:px-3 lg:py-1 rounded-lg text-xs lg:text-sm">एकूण {totalSelectedItemsAcrossShifts} पदार्थ</span>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Bottom Sticky Bar */}
            {showMenu && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200 px-5 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex justify-between items-center animate-in slide-in-from-bottom-full">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">{activeShift} ची शिफ्ट</p>
                        <p className="text-lg font-black text-slate-800">₹{activeShiftTotal}</p>
                    </div>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
                    >
                        थाळी पहा
                        <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs">{(((selectedItems[activeShift] || []) || []) || []).length}</span>
                    </button>
                </div>
            )}

            {/* MODIFIED: Catch the booked shifts array from the Calendar component */}
            <SelectEventCalenderModel
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                onSelectDate={(date, booked) => {
                    setEventDetails({
                        ...eventDetails,
                        eventDate: date,
                    });

                    // Save the booked shifts passed from the calendar
                    const currentlyBooked = booked || [];
                    setBookedShifts(currentlyBooked);

                    // Automatically unselect any currently selected shift that is now booked
                    setSelectedShifts(prev => prev.filter(s => !currentlyBooked.includes(s)));

                    setIsCalendarOpen(false);
                }}
            />
        </div>
    );
}