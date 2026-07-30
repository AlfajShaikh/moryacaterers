import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createMenu, deleteMenuItem, getMenus, updateMenuItem } from "./addMenuSlice";
import {
    DocumentPlusIcon,
    PlusCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowsUpDownIcon,
    XMarkIcon,
    PhotoIcon,
    CurrencyRupeeIcon,
    TagIcon,
    DocumentTextIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";

export function AddMenu() {
    const dispatch = useDispatch();
    const [editing, setEditing] = useState(null);

    const { loading, error, menus } = useSelector((state) => state.menu);

    // Mobile specific state for "All Menus" Dialog
    const [isListOpen, setIsListOpen] = useState(false);

    useEffect(() => {
        dispatch(getMenus());
    }, [dispatch]);

    // Lock body scroll when mobile list is open
    useEffect(() => {
        if (isListOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isListOpen]);

    // --- Form State ---
    const [formData, setFormData] = useState({
        category: "",
        menuItems: [
            {
                itemName: "",
                url: "",
                price: "",
                description: "",
                showPrice: false
            },
        ],
    });

    // --- Search and Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [sortOrder, setSortOrder] = useState(""); 

    const addMenuItem = () => {
        setFormData({
            ...formData,
            menuItems: [
                ...formData.menuItems,
                { itemName: "", url: "", price: "", description: "", showPrice: false },
            ],
        });
    };

    const removeMenuItem = (index) => {
        const updated = [...formData.menuItems];
        updated.splice(index, 1);
        setFormData({ ...formData, menuItems: updated });
    };

    const handleItemChange = (index, e) => {
        const updated = [...formData.menuItems];
        updated[index][e.target.name] = e.target.value;
        setFormData({ ...formData, menuItems: updated });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let result;

        if (editing) {
            result = await dispatch(
                updateMenuItem({
                    categoryId: editing.categoryId,
                    itemId: editing.itemId,
                    data: {
                        category: formData.category,
                        ...formData.menuItems[0],
                    },
                })
            );
        } else {
            result = await dispatch(createMenu(formData));
        }

        if (createMenu.fulfilled.match(result) || updateMenuItem.fulfilled.match(result)) {
            dispatch(getMenus());
            handleReset();
            setEditing(null);
            alert(editing ? "मेन्यू यशस्वीरित्या अपडेट झाला! 🎉" : "नवीन मेन्यू जतन झाला! 🎉");
        } else {
            alert("ऑपरेशन अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.");
        }
    };

    const [categories, setCategories] = useState([
        "नाश्ता", "स्टार्टर", "सूप", "रायता / सॅलड","आमटी / करी", "मुख्य जेवण",
        "पंजाबी", "चायनीज", "दक्षिण भारतीय", "महाराष्ट्रीयन","चटणी","व्हेज भाजी",  
        "भाताचे पदार्थ","पनीर भाजी", "डाळ", "पोळी / भाकरी / नान", "गोड पदार्थ",
        "डेझर्ट", "आईस्क्रीम", "पेय", "ज्यूस","उसळ","चायनिज स्नॅक्स ","उपवास ",  "मॉकटेल",
        "स्नॅक्स", "फास्ट फूड", "विशेष मेन्यू",
    ]);

    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [newCategory, setNewCategory] = useState("");

    const handleAddCategory = () => {
        const category = newCategory.trim();
        if (!category) return;
        if (categories.includes(category)) {
            alert("हा प्रकार आधीपासून उपलब्ध आहे.");
            return;
        }
        setCategories([...categories, category]);
        setFormData({ ...formData, category });
        setNewCategory("");
        setShowCategoryInput(false);
    };

    const handleReset = () => {
        setFormData({
            category: "",
            menuItems: [{ itemName: "", url: "", price: "", description: "", showPrice: false, }],
        });
        setShowCategoryInput(false);
        setNewCategory("");
        setEditing(null);
    };

    // --- Search & Filter Logic ---
    const getFilteredMenus = () => {
        if (!menus) return [];

        let filtered = menus.map((menu) => {
            let items = menu.menuItems.filter((item) =>
                item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                menu.category.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (filterCategory && menu.category !== filterCategory) {
                items = [];
            }

            if (sortOrder === "price-asc") {
                items.sort((a, b) => Number(a.price) - Number(b.price));
            } else if (sortOrder === "price-desc") {
                items.sort((a, b) => Number(b.price) - Number(a.price));
            }

            return { ...menu, menuItems: items };
        });

        return filtered.filter((menu) => menu.menuItems.length > 0);
    };

    const filteredMenusData = getFilteredMenus();
    const availableCategories = menus ? [...new Set(menus.map(m => m.category))] : [];
    const totalItemsCount = menus ? menus.reduce((acc, curr) => acc + curr.menuItems.length, 0) : 0;

    return (
        <div className="relative min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8 pb-24 lg:pb-8 overflow-hidden">
            
            {/* Soft Animated Background Orbs */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-[pulse_8s_ease-in-out_infinite]"></div>
                <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-rose-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-[pulse_10s_ease-in-out_infinite_animation-delay-2000]"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-30 animate-[pulse_12s_ease-in-out_infinite_animation-delay-4000]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-start">

                {/* --- LEFT COLUMN: Form Container --- */}
                <div className="lg:col-span-5 w-full bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white p-6 md:p-8">

                    <div className="mb-8 text-center flex flex-col items-center">
                        <div className="bg-gradient-to-br from-indigo-100 to-fuchsia-100 p-4 rounded-2xl mb-5 shadow-sm border border-white">
                            <DocumentPlusIcon className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-fuchsia-600 mb-2">
                            {editing ? "मेन्यू अपडेट करा" : "मेन्यू आयटम जोडा"}
                        </h1>
                        <p className="text-slate-500 text-sm font-semibold">
                            तुमच्या मेन्यूमध्ये नवीन स्वादिष्ट पदार्थ जोडा
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* Category Dropdown */}
                        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-500">पदार्थाचा प्रकार (Category)</label>
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryInput(!showCategoryInput)}
                                    className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full transition-all active:scale-95"
                                >
                                    <PlusCircleIcon className="w-4 h-4" /> नवीन प्रकार
                                </button>
                            </div>

                            {!showCategoryInput ? (
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all font-semibold text-slate-700 appearance-none shadow-sm cursor-pointer"
                                    required
                                >
                                    <option value="" disabled>प्रकार निवडा...</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="flex gap-2 animate-in fade-in zoom-in-95 duration-200">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="प्रकाराचे नाव..."
                                        className="flex-1 bg-white border border-indigo-200 rounded-xl px-4 py-3.5 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-semibold shadow-sm"
                                        autoFocus
                                    />
                                    <button type="button" onClick={handleAddCategory} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 rounded-xl transition-colors shadow-md shadow-indigo-200">
                                        जोडा
                                    </button>
                                    <button type="button" onClick={() => setShowCategoryInput(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 rounded-xl transition-colors">
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Items Array */}
                        <div className="space-y-4">
                            {formData.menuItems?.map((item, index) => (
                                <div key={index} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative animate-in slide-in-from-bottom-4 duration-300">
                                    
                                    <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                                        <h2 className="font-black text-slate-800 flex items-center gap-2">
                                            <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">{index + 1}</span>
                                            पदार्थ तपशील
                                        </h2>
                                        {formData.menuItems.length > 1 && (
                                            <button type="button" onClick={() => removeMenuItem(index)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors">
                                                <TrashIcon className="w-4 h-4" /> हटवा
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {/* Name Input */}
                                        <div className="relative group">
                                            <TagIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <input name="itemName" value={item.itemName} onChange={(e) => handleItemChange(index, e)} placeholder="पदार्थाचे नाव (उदा. पनीर मसाला)" required className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none font-semibold transition-all" />
                                        </div>
                                        
                                        {/* Grid for Price & URL */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="relative group">
                                                <CurrencyRupeeIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                                <input type="number" name="price" value={item.price} onChange={(e) => handleItemChange(index, e)} placeholder="किंमत (₹)" required className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none font-semibold transition-all" />
                                            </div>
                                            <div className="relative group">
                                                <PhotoIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                                <input name="url" value={item.url} onChange={(e) => handleItemChange(index, e)} placeholder="फोटोची URL" required className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none font-semibold transition-all" />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="relative group">
                                            <DocumentTextIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <textarea name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} placeholder="पदार्थाचे वर्णन (Optional)" rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none font-semibold transition-all resize-none" />
                                        </div>

                                        {/* Price Visibility Toggle */}
                                        <div className="flex items-center justify-between mt-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                                            <div>
                                                <span className="block text-sm font-bold text-slate-700">ग्राहकांना किंमत दाखवा</span>
                                                <span className="block text-[10px] font-medium text-slate-500">मेन्यू कार्डवर किंमत दिसेल</span>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={item.showPrice}
                                                    onChange={(e) => {
                                                        const updated = [...formData.menuItems];
                                                        updated[index].showPrice = e.target.checked;
                                                        setFormData({ ...formData, menuItems: updated });
                                                    }}
                                                />
                                                <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 shadow-inner"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add More Button */}
                        {!editing && (
                            <button type="button" onClick={addMenuItem} className="w-full border-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 font-bold py-4 rounded-2xl transition-all flex justify-center items-center gap-2 group">
                                <PlusCircleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" /> 
                                आणखी एक पदार्थ जोडा
                            </button>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200/60">
                            <button type="submit" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-95 transition-all text-lg flex items-center justify-center gap-2">
                                <CheckCircleIcon className="w-6 h-6" />
                                {editing ? "बदल सेव्ह करा" : "मेन्यू जतन करा"}
                            </button>
                            <button type="button" onClick={handleReset} className="flex-1 bg-white text-slate-700 font-bold py-4 rounded-xl border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all text-lg">
                                रद्द करा
                            </button>
                        </div>
                    </form>
                </div>

                {/* Mobile Overlay Background */}
                {isListOpen && (
                    <div
                        className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsListOpen(false)}
                    ></div>
                )}

                {/* --- RIGHT COLUMN: Menu List (Also acts as Mobile Bottom Sheet) --- */}
                <div className={`
                    ${isListOpen ? "fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom-full duration-300" : "hidden"}
                    lg:block lg:col-span-7 lg:relative lg:z-auto
                `}>
                    <div className="bg-white/90 backdrop-blur-2xl border border-white lg:border-white/50 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-t-[2rem] lg:rounded-[2rem] p-5 md:p-8 flex flex-col h-[90vh] lg:h-[85vh]">

                        {/* List Header & Filters */}
                        <div className="flex-shrink-0 mb-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">सध्याचे मेन्यू</h2>
                                    <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center gap-2">
                                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-black">एकूण: {totalItemsCount}</span>
                                        पदार्थ उपलब्ध आहेत
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsListOpen(false)}
                                    className="lg:hidden p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                                <div className="sm:col-span-5 relative group">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="शोधा..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm font-semibold shadow-sm transition-all"
                                    />
                                </div>
                                <div className="sm:col-span-4 relative group">
                                    <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm font-semibold appearance-none shadow-sm transition-all"
                                    >
                                        <option value="">सर्व प्रकार</option>
                                        {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="sm:col-span-3 relative group">
                                    <ArrowsUpDownIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-sm font-semibold appearance-none shadow-sm transition-all"
                                    >
                                        <option value="">सॉर्ट</option>
                                        <option value="price-asc">कमी किंमत</option>
                                        <option value="price-desc">जास्त किंमत</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable List */}
                        <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent pb-4">
                            {loading && (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            )}

                            {!loading && filteredMenusData.length === 0 && (
                                <div className="flex flex-col items-center justify-center text-center h-48 opacity-60">
                                    <MagnifyingGlassIcon className="w-14 h-14 text-slate-300 mb-3" />
                                    <p className="text-slate-500 font-bold text-lg">कोणताही पदार्थ सापडला नाही.</p>
                                </div>
                            )}

                            {filteredMenusData.map((menu) => (
                                <div key={menu._id} className="relative">
                                    {/* Category Sticky Header */}
                                    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md py-2 mb-4 border-b border-slate-100">
                                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 inline-block px-4 py-1.5 rounded-lg border border-indigo-100">
                                            {menu.category}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {menu.menuItems?.map((item) => (
                                            <div key={item._id} className="group flex flex-col sm:flex-row bg-white border border-slate-100 rounded-2xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden">

                                                {/* Image */}
                                                <div className="relative w-full sm:w-28 h-40 sm:h-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                                    <img
                                                        src={item.url}
                                                        alt={item.itemName}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image" }}
                                                    />
                                                    <div className="absolute top-2 left-2">
                                                        {item.showPrice ? (
                                                            <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">Visible</span>
                                                        ) : (
                                                            <span className="bg-slate-800/70 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">Hidden</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex flex-col flex-1 mt-3 sm:mt-0 sm:ml-4">
                                                    <h4 className="font-black text-slate-800 text-base leading-tight mb-1 group-hover:text-indigo-700 transition-colors">
                                                        {item.itemName}
                                                    </h4>
                                                    <p className="text-xs font-medium text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                                                        {item.description || "कोणतेही वर्णन नाही"}
                                                    </p>
                                                    <div className="mt-auto flex items-center justify-between">
                                                        <p className="text-lg font-black text-emerald-600">₹{item.price}</p>
                                                        
                                                        {/* Action Buttons */}
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setFormData({ category: menu.category, menuItems: [{ ...item }] });
                                                                    setEditing({ categoryId: menu._id, itemId: item._id });
                                                                    setIsListOpen(false);
                                                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                                                }}
                                                                className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors"
                                                                title="अपडेट करा (Edit)"
                                                            >
                                                                <PencilSquareIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm("हा पदार्थ कायमचा हटवायचा आहे का?")) {
                                                                        dispatch(deleteMenuItem({ categoryId: menu._id, itemId: item._id }));
                                                                    }
                                                                }}
                                                                className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                                                                title="हटवा (Delete)"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Sticky Bar (Visible only on mobile devices) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-5 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex justify-between items-center animate-in slide-in-from-bottom-full">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">एकूण मेन्यू</p>
                    <p className="text-xl font-black text-indigo-700">{totalItemsCount} <span className="text-sm font-bold text-slate-600">पदार्थ</span></p>
                </div>
                <button
                    onClick={() => setIsListOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
                >
                    <DocumentPlusIcon className="w-5 h-5" />
                    सर्व मेन्यू पहा
                </button>
            </div>

        </div>
    );
}