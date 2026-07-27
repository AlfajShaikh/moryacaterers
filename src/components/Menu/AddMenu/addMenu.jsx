import { useEffect, useState } from "react";
import {
    DocumentPlusIcon,
    PlusCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowsUpDownIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useDispatch, useSelector } from "react-redux";
import { createMenu, deleteMenuItem, getMenus, updateMenuItem } from "./addMenuSlice";

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
    const [sortOrder, setSortOrder] = useState(""); // "", "price-asc", "price-desc"

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
            alert(editing ? "मेन्यू अपडेट झाला." : "मेन्यू जतन झाला.");
        } else {
            alert("Operation Failed");
        }
    };

    const [categories, setCategories] = useState([
        "नाश्ता", "स्टार्टर", "सूप", "सॅलड", "मुख्य जेवण",
        "पंजाबी", "चायनीज", "दक्षिण भारतीय", "महाराष्ट्रीयन",
        "भाताचे पदार्थ", "डाळ", "पोळी / भाकरी / नान", "गोड पदार्थ",
        "डेझर्ट", "आईस्क्रीम", "पेय", "ज्यूस", "मॉकटेल",
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

    // Total Items Count for Mobile Bottom Bar
    const totalItemsCount = menus ? menus.reduce((acc, curr) => acc + curr.menuItems.length, 0) : 0;

    return (
        <div className="relative min-h-screen bg-slate-50/50 font-sans text-slate-800 p-4 md:p-8 pb-24 lg:pb-8 overflow-hidden">
            {/* Animated Ambient Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-[pulse_6s_ease-in-out_infinite]"></div>
                <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-[pulse_7s_ease-in-out_infinite_animation-delay-2000]"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[30rem] h-[30rem] bg-pink-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-50 animate-[pulse_8s_ease-in-out_infinite_animation-delay-4000]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Form Container */}
                <div className="lg:col-span-5 w-full bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-5 md:p-8">

                    <div className="mb-8 text-center flex flex-col items-center">
                        <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-4 rounded-full mb-4 shadow-inner">
                            <DocumentPlusIcon className="w-8 h-8 text-pink-600" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-pink-600">
                            {editing ? "मेन्यू अपडेट करा" : "मेन्यू आयटम जोडा"}
                        </h1>
                        <p className="text-slate-500 mt-2 text-sm font-medium">
                            खाद्यपदार्थाची माहिती भरा
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Category */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold text-slate-700">पदार्थाचा प्रकार</label>
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryInput(!showCategoryInput)}
                                    className="flex items-center gap-1 text-purple-600 text-sm font-bold hover:text-purple-700 transition-colors"
                                >
                                    <PlusCircleIcon className="w-4 h-4" />
                                    नवीन प्रकार
                                </button>
                            </div>

                            {!showCategoryInput ? (
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    required
                                >
                                    <option value="">प्रकार निवडा</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="नवीन प्रकार..."
                                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
                                        autoFocus
                                    />
                                    <button type="button" onClick={handleAddCategory} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 rounded-xl transition-colors">
                                        जोडा
                                    </button>
                                    <button type="button" onClick={() => setShowCategoryInput(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 rounded-xl transition-colors">
                                        रद्द
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Items Array */}
                        {formData.menuItems?.map((item, index) => (
                            <div key={index} className="border border-slate-100 rounded-2xl p-4 md:p-5 bg-white/40 relative">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="font-bold text-slate-700">पदार्थ #{index + 1}</h2>
                                    {formData.menuItems.length > 1 && (
                                        <button type="button" onClick={() => removeMenuItem(index)} className="text-rose-500 hover:text-rose-700 text-sm font-bold flex items-center gap-1">
                                            <TrashIcon className="w-4 h-4" /> हटवा
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <input name="itemName" value={item.itemName} onChange={(e) => handleItemChange(index, e)} placeholder="पदार्थाचे नाव" required className="w-full bg-white/50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none" />
                                    <input name="url" value={item.url} onChange={(e) => handleItemChange(index, e)} placeholder="फोटो URL" required className="w-full bg-white/50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none" />
                                    <input type="number" name="price" value={item.price} onChange={(e) => handleItemChange(index, e)} placeholder="किंमत (₹)" required className="w-full bg-white/50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none" />
                                    <textarea name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} placeholder="वर्णन" required rows="2" className="w-full bg-white/50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
                                </div>

                                <div className="flex items-center justify-between mt-4 bg-white/60 p-3 rounded-xl border border-slate-100">
                                    <span className="text-sm font-bold text-slate-600">
                                        किंमत दाखवा (मेन्यू मध्ये)
                                    </span>

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
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>
                            </div>
                        ))}

                        {!editing && (
                            <button type="button" onClick={addMenuItem} className="w-full border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2">
                                <PlusCircleIcon className="w-5 h-5" /> आणखी पदार्थ जोडा
                            </button>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-md hover:-translate-y-0.5 transition-all">
                                {editing ? "अपडेट करा" : "मेन्यू जतन करा"}
                            </button>
                            <button type="button" onClick={handleReset} className="flex-1 bg-white text-slate-600 font-bold py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                                रद्द करा
                            </button>
                        </div>
                    </form>
                </div>

                {/* Mobile Overlay Background */}
                {isListOpen && (
                    <div
                        className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsListOpen(false)}
                    ></div>
                )}

                {/* Right Column / Mobile Dialog: Menu List */}
                <div className={`
                    ${isListOpen ? "fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom-full duration-300" : "hidden"}
                    lg:block lg:col-span-7 lg:relative lg:z-auto
                `}>
                    <div className="bg-white/95 lg:bg-white/70 backdrop-blur-xl border-t lg:border border-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-t-3xl lg:rounded-3xl p-5 md:p-6 flex flex-col h-[90vh] lg:h-[85vh]">

                        <div className="flex-shrink-0 mb-5">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl lg:text-2xl font-extrabold text-slate-800">सर्व मेन्यू</h2>
                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                        {filteredMenusData.reduce((acc, curr) => acc + curr.menuItems.length, 0)} Items
                                    </span>
                                </div>
                                {/* Mobile Close Button */}
                                <button
                                    onClick={() => setIsListOpen(false)}
                                    className="lg:hidden p-1.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Searching & Filters UI */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                {/* Search Bar */}
                                <div className="sm:col-span-6 relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="पदार्थ शोधा..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 lg:bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                    />
                                </div>

                                {/* Category Filter */}
                                <div className="sm:col-span-3 relative">
                                    <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-white/80 lg:bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none transition-all"
                                    >
                                        <option value="">सर्व प्रकार</option>
                                        {availableCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sort Filter */}
                                <div className="sm:col-span-3 relative">
                                    <ArrowsUpDownIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-white/80 lg:bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none transition-all"
                                    >
                                        <option value="">सॉर्ट</option>
                                        <option value="price-asc">किंमत: कमी-जास्त</option>
                                        <option value="price-desc">किंमत: जास्त-कमी</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Menu List */}
                        <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pb-4">

                            {loading && <div className="text-center text-slate-500 my-10">लोड होत आहे...</div>}

                            {!loading && filteredMenusData.length === 0 && (
                                <div className="flex flex-col items-center justify-center text-center h-40 opacity-60">
                                    <MagnifyingGlassIcon className="w-12 h-12 text-slate-300 mb-2" />
                                    <p className="text-slate-500 font-medium">कोणताही पदार्थ सापडला नाही.</p>
                                </div>
                            )}

                            {filteredMenusData.map((menu) => (
                                <div key={menu._id} className="bg-white/40 border border-white/60 rounded-2xl p-4 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-800 bg-white/90 inline-block px-4 py-1.5 rounded-lg shadow-sm border border-slate-100 mb-4">
                                        {menu.category}
                                    </h3>

                                    <div className="space-y-3">
                                        {menu.menuItems?.map((item) => (
                                            <div key={item._id} className="group flex flex-col sm:flex-row gap-3 bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-blue-100 transition-all">

                                                <img
                                                    src={item.url}
                                                    alt={item.itemName}
                                                    className="w-full sm:w-20 h-32 sm:h-20 rounded-lg object-cover bg-slate-50"
                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image" }}
                                                />

                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-slate-800">{item.itemName}</h4>
                                                        {item.showPrice ? (
                                                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Price On</span>
                                                        ) : (
                                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">Price Off</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
                                                    <p className="text-emerald-600 font-black mt-1">₹ {item.price}</p>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex sm:flex-col justify-end gap-2 shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setFormData({ category: menu.category, menuItems: [{ ...item }] });
                                                            setEditing({ categoryId: menu._id, itemId: item._id });
                                                            // Close mobile dialog on Edit
                                                            setIsListOpen(false);
                                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                                        }}
                                                        className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                                                    >
                                                        <PencilSquareIcon className="w-4 h-4" /> Edit
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm("हा पदार्थ हटवायचा आहे का?")) {
                                                                dispatch(deleteMenuItem({ categoryId: menu._id, itemId: item._id }));
                                                            }
                                                        }}
                                                        className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                                                    >
                                                        <TrashIcon className="w-4 h-4" /> Delete
                                                    </button>
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
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200 px-5 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex justify-between items-center animate-in slide-in-from-bottom-full">
                <div>
                    <p className="text-xs font-bold text-slate-500">एकूण पदार्थ</p>
                    <p className="text-lg font-black text-slate-800">{totalItemsCount}</p>
                </div>
                <button
                    onClick={() => setIsListOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
                >
                    सर्व मेन्यू पहा
                </button>
            </div>

        </div>
    );
}