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
    const eventTypes = ["लग्न", "साखरपुडा", "वाढदिवस", "गृहप्रवेश", "मुंज", "नामकरण", "कॉर्पोरेट इव्हेंट", "इतर"];

    const [showSplash, setShowSplash] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    // --- 🚨 NEW: Per-Date Configuration State ---
    // Structure: [{ date: "2026-08-08", bookedShifts: [], eventType: "", shifts: [] }]
    const [selectedDatesConfig, setSelectedDatesConfig] = useState([]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const [customer, setCustomer] = useState({
        name: "", mobile: "", whatsapp: "", email: "",
    });

    const [showMenu, setShowMenu] = useState(false);
    const { menus, loading } = useSelector((state) => state.menuList);

    // --- 🚨 NEW: Selected Items mapped to "Date_Shift" key ---
    // Example: { "2026-08-08_सकाळ": [item1, item2] }
    const [selectedItems, setSelectedItems] = useState({});
    
    // Active tab looks like "2026-08-08_सकाळ"
    const [activeTabKey, setActiveTabKey] = useState("");
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        dispatch(getAllMenus());
    }, [dispatch]);

    useEffect(() => {
        document.body.style.overflow = isCartOpen ? "hidden" : "auto";
        return () => document.body.style.overflow = "auto";
    }, [isCartOpen]);

    // Format Date for UI (e.g. "12 ऑगस्ट 2026")
    const formatMarathiDate = (dateStr) => {
        const d = new Date(dateStr);
        const months = ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    // Update specific property of a date config
    const updateDateConfig = (date, key, value) => {
        setSelectedDatesConfig(prev => prev.map(config => 
            config.date === date ? { ...config, [key]: value } : config
        ));
    };

    // Toggle shift selection for a specific date
    const toggleConfigShift = (date, shift) => {
        setSelectedDatesConfig(prev => prev.map(config => {
            if (config.date === date) {
                const isSelected = config.shifts.includes(shift);
                return {
                    ...config,
                    shifts: isSelected ? config.shifts.filter(s => s !== shift) : [...config.shifts, shift]
                };
            }
            return config;
        }));
    };

    // Remove a selected date entirely
    const removeDateConfig = (date) => {
        setSelectedDatesConfig(prev => prev.filter(c => c.date !== date));
        
        // Clean up selected items for this date
        const newSelectedItems = { ...selectedItems };
        Object.keys(newSelectedItems).forEach(key => {
            if (key.startsWith(date)) delete newSelectedItems[key];
        });
        setSelectedItems(newSelectedItems);
    };

    const handleContinue = () => {
        if (!customer.name.trim()) { alert("Please enter customer name"); return; }
        if (customer.mobile.length !== 10) { alert("Please enter valid 10-digit mobile number"); return; }
        if (selectedDatesConfig.length === 0) { alert("Please select at least one date from calendar"); return; }
        
        for (const config of selectedDatesConfig) {
            if (!config.eventType) { alert(`कृपया ${formatMarathiDate(config.date)} साठी कार्यक्रम (Event) निवडा`); return; }
            if (config.shifts.length === 0) { alert(`कृपया ${formatMarathiDate(config.date)} साठी किमान एक शिफ्ट निवडा`); return; }
        }

        // Generate all tabs and set the first one as active
        const allTabs = selectedDatesConfig.flatMap(c => c.shifts.map(s => `${c.date}_${s}`));
        setActiveTabKey(allTabs[0]);
        setShowMenu(true);
    };

    const handleToggleItem = (item) => {
        const currentItems = selectedItems[activeTabKey] || [];
        const exists = currentItems.find((i) => i._id === item._id);

        if (exists) {
            setSelectedItems({
                ...selectedItems,
                [activeTabKey]: currentItems.filter((i) => i._id !== item._id),
            });
        } else {
            setSelectedItems({
                ...selectedItems,
                [activeTabKey]: [...currentItems, item],
            });
        }
    };

    // Calculate Totals
    const activeShiftTotal = (selectedItems[activeTabKey] || []).reduce((total, item) => total + (item.showPrice ? Number(item.price || 0) : 0), 0);
    const grandTotal = Object.values(selectedItems).flat().reduce((total, item) => total + (item.showPrice ? Number(item.price || 0) : 0), 0);
    const totalSelectedItemsAcrossShifts = Object.values(selectedItems).flat().length;

    // --- 🚨 NEW: Bulk Submit API Logic ---
    const handleConfirmOrder = async () => {
        try {
            // प्रत्येक तारखेसाठी एक स्वतंत्र Order Payload बनवा
            const promises = selectedDatesConfig.map((config) => {
                const shiftsForDate = config.shifts.map((shift) => {
                    const tabKey = `${config.date}_${shift}`;
                    const itemsForTab = selectedItems[tabKey] || [];
                    
                    const categories = menus.map((category) => {
                        const items = category.menuItems
                            .filter((menuItem) => itemsForTab.some((selected) => selected._id === menuItem._id))
                            .map((item) => ({
                                itemId: item._id,
                                itemName: item.itemName,
                                price: item.showPrice ? Number(item.price) : 0,
                            }));
                        if (items.length === 0) return null;
                        return { category: category.category, selectedItems: items };
                    }).filter(Boolean);

                    return { shift, categories };
                });

                const payload = {
                    customerName: customer.name,
                    mobile: customer.mobile,
                    whatsapp: customer.whatsapp,
                    email: customer.email,
                    eventDate: config.date,
                    eventType: config.eventType,
                    advance: "0",
                    paymentStatus: "Unpaid",
                    shifts: shiftsForDate,
                };

                return dispatch(saveCustomerMenu(payload)).unwrap();
            });

            // सर्व ऑर्डर्स एकाच वेळी सेव्ह करा
            await Promise.all(promises);
            
            alert("All Orders Saved Successfully!");
            setCustomer({ name: "", mobile: "", whatsapp: "", email: "" });
            setSelectedDatesConfig([]);
            setSelectedItems({});
            setShowMenu(false);

        } catch (err) {
            alert(err.message || "Unable to save orders");
        }
    };

    // Generate Tabs List for UI Navigation
    const allTabsConfig = selectedDatesConfig.flatMap(c => 
        c.shifts.map(s => ({ key: `${c.date}_${s}`, date: c.date, shift: s, eventType: c.eventType }))
    );

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

    return (
        <div className="relative min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-24 lg:pb-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-br from-indigo-100/40 via-purple-50/40 to-emerald-50/40 pointer-events-none -z-10"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
                
                <div className="mb-8 lg:mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
                        आमचा <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">मेन्यू</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">तुमच्या आवडीचे पदार्थ निवडा आणि तुमची थाळी तयार करा.</p>
                </div>

                {/* --- PHASE 1: CUSTOMER & DATES CONFIGURATION --- */}
                {!showMenu && (
                    <div className="mt-4 mb-5 bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-3xl">
                        
                        {/* 1. Global Customer Details */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 shadow-sm">
                                <UserIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-800">ग्राहक माहिती (Customer Details)</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                            <div className="mb-2">
                                <label className="text-sm font-bold text-slate-700">ग्राहकाचे नाव<span className="text-rose-500">*</span></label>
                                <div className="relative mt-2">
                                    <UserIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                                    <input type="text" placeholder="नाव लिहा" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value.toUpperCase() })} className="w-full rounded-xl border border-slate-300 bg-white/50 pl-12 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition" />
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

                        <div className="h-px w-full bg-slate-200 mb-8"></div>

                        {/* 2. Multi-Date Event Configuration */}
                        <div className="mb-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-800">कार्यक्रमाचा तपशील</h3>
                                <p className="text-sm font-medium text-slate-500">तुम्ही एकापेक्षा जास्त तारखा निवडू शकता</p>
                            </div>
                            <button onClick={() => setIsCalendarOpen(true)} className="px-5 py-2.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-xl font-bold flex items-center gap-2 transition-colors">
                                <CalendarDaysIcon className="w-5 h-5" /> तारखा निवडा
                            </button>
                        </div>

                        {/* Render Sub-Cards for each selected date */}
                        <div className="space-y-5">
                            {selectedDatesConfig.map((config) => (
                                <div key={config.date} className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 relative shadow-sm">
                                    <button onClick={() => removeDateConfig(config.date)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors" title="तारीख काढा">
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                    
                                    <h4 className="font-black text-lg text-indigo-700 mb-4 flex items-center gap-2">
                                        <CalendarDaysIcon className="w-5 h-5" /> {formatMarathiDate(config.date)}
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 mb-2 block">कार्यक्रम <span className="text-rose-500">*</span></label>
                                            <select 
                                                value={config.eventType} 
                                                onChange={(e) => updateDateConfig(config.date, 'eventType', e.target.value)}
                                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                                            >
                                                <option value="">कार्यक्रम निवडा</option>
                                                {eventTypes.map(event => <option key={event} value={event}>{event}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-slate-700 mb-2 block">शिफ्ट्स <span className="text-rose-500">*</span></label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {SHIFT_OPTIONS.map(shift => {
                                                    const isBooked = config.bookedShifts.includes(shift);
                                                    const isSelected = config.shifts.includes(shift);
                                                    return (
                                                        <button
                                                            key={shift} type="button" disabled={isBooked}
                                                            onClick={() => toggleConfigShift(config.date, shift)}
                                                            className={`py-2 text-sm font-bold rounded-xl border transition-all ${
                                                                isBooked ? "bg-rose-50 border-rose-200 text-rose-400 cursor-not-allowed opacity-60 line-through" :
                                                                isSelected ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                                                            }`}
                                                        >
                                                            {shift}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {selectedDatesConfig.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                    <p className="font-bold text-slate-400">अद्याप कोणतीही तारीख निवडलेली नाही.</p>
                                </div>
                            )}
                        </div>

                        <button onClick={handleContinue} className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all">
                            मेनू पहा →
                        </button>
                    </div>
                )}


                {/* --- PHASE 2: MENU SELECTION BY TABS --- */}
                {showMenu && (
                    <div className="animate-in fade-in duration-500">
                        <button onClick={() => setShowMenu(false)} className="mb-6 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 font-bold shadow-sm hover:bg-slate-50 transition-colors">
                            ← Back to Details
                        </button>

                        {/* Shift/Date Navigation Tabs */}
                        {allTabsConfig.length > 1 && (
                            <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide">
                                {allTabsConfig.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTabKey(tab.key)}
                                        className={`whitespace-nowrap flex flex-col items-start px-5 py-3 rounded-2xl transition-all duration-300 border-2 
                                            ${activeTabKey === tab.key
                                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/30"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                                            }`}
                                    >
                                        <span className="text-xs font-semibold opacity-80">{formatMarathiDate(tab.date)}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-extrabold text-base">{tab.shift} ({tab.eventType})</span>
                                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${activeTabKey === tab.key ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
                                                {(selectedItems[tab.key] || []).length}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="grid lg:grid-cols-12 gap-8 items-start">
                            {/* Left Column: Menu Items */}
                            <div className="lg:col-span-7 xl:col-span-8 space-y-10 lg:space-y-12">
                                {menus.map((category) => (
                                    <div key={category._id} className="scroll-mt-28">
                                        <div className="flex items-center gap-4 mb-6">
                                            <h2 className="text-xl lg:text-2xl font-bold text-slate-800 bg-white shadow-sm border border-slate-100 px-5 py-2 lg:px-6 lg:py-2.5 rounded-full inline-flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                                                {category.category}
                                            </h2>
                                            <div className="h-px bg-gradient-to-r from-slate-200 to-transparent flex-1 mt-1"></div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                                            {category.menuItems.map((item) => {
                                                const isSelected = (selectedItems[activeTabKey] || []).some((i) => i._id === item._id);
                                                
                                                // Find if item is selected in OTHER tabs
                                                const otherTabs = Object.entries(selectedItems)
                                                    .filter(([key, items]) => key !== activeTabKey && items.some(i => i._id === item._id))
                                                    .map(([key]) => key);

                                                return (
                                                    <div
                                                        key={item._id} onClick={() => handleToggleItem(item)}
                                                        className={`group relative flex items-center gap-4 p-4 rounded-3xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-[0_2px_15px_rgba(0,0,0,0.03)]
                                                            ${isSelected ? "bg-emerald-50/80 border-emerald-400 shadow-md transform scale-[1.02]" : "bg-white border-transparent hover:border-blue-200 hover:shadow-lg"}`}
                                                    >
                                                        {otherTabs.length > 0 && (
                                                            <div className={`absolute -top-3 right-4 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm z-20 ${isSelected ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'}`}>
                                                                इतर शिफ्ट्समध्ये देखील आहे
                                                            </div>
                                                        )}
                                                        <div className="absolute top-3 right-3 z-10">
                                                            {isSelected ? <CheckCircleSolid className="w-7 h-7 text-emerald-500 animate-in zoom-in" /> : <PlusCircleIcon className="w-7 h-7 text-slate-300 group-hover:text-blue-500" />}
                                                        </div>
                                                        <div className="relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0">
                                                            <img src={item.url} alt={item.itemName} className={`w-full h-full object-cover rounded-2xl ${isSelected ? "ring-2 ring-emerald-400" : "group-hover:shadow-md"}`} onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }} />
                                                        </div>
                                                        <div className="flex-1 pr-6">
                                                            <h3 className={`font-bold text-base lg:text-lg leading-tight mb-1 ${isSelected ? "text-emerald-900" : "text-slate-800"}`}>{item.itemName}</h3>
                                                            <p className="text-xs text-slate-500 line-clamp-2 mb-2 font-medium leading-relaxed">{item.description}</p>
                                                            {item.showPrice && <div className={`text-base lg:text-lg font-black ${isSelected ? "text-emerald-600" : "text-slate-700"}`}>₹{item.price}</div>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Right Column: Dynamic Thali/Cart */}
                            {isCartOpen && <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>}
                            
                            <div className={`${isCartOpen ? "fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom-full duration-300" : "hidden"} lg:block lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 lg:z-auto`}>
                                <div className="bg-white/95 lg:bg-white/80 backdrop-blur-2xl border-t lg:border border-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:rounded-3xl p-5 lg:p-6 flex flex-col h-[85vh] lg:h-[calc(100vh-8rem)]">
                                    <div className="flex-shrink-0 flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100/50">
                                                <ShoppingCartIcon className="w-5 h-5 lg:w-6 lg:h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-extrabold text-slate-800 flex flex-col">
                                                    चालू थाळी 
                                                    <span className="text-[10px] text-indigo-600 tracking-wider">
                                                        {activeTabKey.split('_').join(' - ')}
                                                    </span>
                                                </h2>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(selectedItems[activeTabKey] || []).length > 0 && (
                                                <button onClick={() => setSelectedItems({ ...selectedItems, [activeTabKey]: [] })} className="text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-full transition-colors">रिकामी करा</button>
                                            )}
                                            <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                                        </div>
                                    </div>

                                    <div className="flex-1 py-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                                        {(selectedItems[activeTabKey] || []).length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-200">
                                                    <ShoppingCartIcon className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="font-bold text-slate-500 text-base">थाळी रिकामी आहे</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {menus.map((category) => {
                                                    const selectedInCategory = category.menuItems.filter((menuItem) => (selectedItems[activeTabKey] || []).some((selected) => selected._id === menuItem._id));
                                                    if (selectedInCategory.length === 0) return null;
                                                    
                                                    return (
                                                        <div key={category._id} className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                                                            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{category.category}
                                                            </h3>
                                                            <div className="space-y-2">
                                                                {selectedInCategory.map((item) => (
                                                                    <div key={item._id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                                            <img src={item.url} alt={item.itemName} className="w-10 h-10 rounded-lg object-cover" />
                                                                            <span className="text-sm font-bold text-slate-800 truncate">{item.itemName}</span>
                                                                        </div>
                                                                        <button onClick={() => handleToggleItem(item)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-shrink-0 pt-4 mt-2 border-t border-slate-100">
                                        <div className="flex justify-between items-center mb-4 px-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">या शिफ्टची रक्कम</span>
                                                <span className="text-xl font-black text-slate-800">₹{activeShiftTotal}</span>
                                            </div>
                                            {allTabsConfig.length > 1 && (
                                                <div className="flex flex-col items-end border-l-2 border-slate-200 pl-4">
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase">सर्व तारखांची एकूण रक्कम</span>
                                                    <span className="text-xl font-black text-emerald-600">₹{grandTotal}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleConfirmOrder}
                                            disabled={allTabsConfig.some(tab => (selectedItems[tab.key] || []).length === 0)}
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-2xl shadow-[0_8px_20px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            सर्व ऑर्डर्स निश्चित करा
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Bottom Action Bar */}
            {showMenu && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200 px-5 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase truncate w-24">करंट टॅब: {activeTabKey.split('_')[1]}</p>
                        <p className="text-lg font-black text-slate-800">₹{activeShiftTotal}</p>
                    </div>
                    <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg">
                        थाळी पहा <span className="bg-white/20 px-2 py-0.5 rounded-md text-xs">{(selectedItems[activeTabKey] || []).length}</span>
                    </button>
                </div>
            )}

            <SelectEventCalenderModel
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
                onSelectDate={(datesDetails) => {
                    const newConfig = datesDetails.map(detail => {
                        const existing = selectedDatesConfig.find(c => c.date === detail.date);
                        return {
                            date: detail.date,
                            bookedShifts: detail.bookedShifts || [],
                            eventType: existing ? existing.eventType : "",
                            shifts: existing ? existing.shifts.filter(s => !detail.bookedShifts.includes(s)) : []
                        };
                    });
                    setSelectedDatesConfig(newConfig);
                    setIsCalendarOpen(false);
                }}
            />
        </div>
    );
}