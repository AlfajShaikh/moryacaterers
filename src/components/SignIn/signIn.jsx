import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteUser, getUsers, registerUser, updateUser } from "./signInSlice";
import { PencilSquareIcon, TrashIcon, UserPlusIcon } from "@heroicons/react/24/outline";

export function SignIn() {
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector((state) => state.signin);

    useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);

    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let result;
        if (editingId) {
            result = await dispatch(
                updateUser({
                    id: editingId,
                    data: formData,
                })
            );
        } else {
            result = await dispatch(registerUser(formData));
        }

        setEditingId(null);
        setFormData({
            name: "",
            email: "",
            role: "",
            password: "",
        });
        dispatch(getUsers());

        if (registerUser.fulfilled.match(result) || updateUser.fulfilled.match(result)) {
            alert(editingId ? "User Updated Successfully" : "User Created Successfully");
        } else {
            alert(result.payload?.message || "Operation failed");
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-gray-900 overflow-hidden">

            {/* Animated Ambient Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-[pulse_6s_ease-in-out_infinite]"></div>
                <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-[pulse_7s_ease-in-out_infinite_animation-delay-2000]"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[30rem] h-[30rem] bg-pink-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-50 animate-[pulse_8s_ease-in-out_infinite_animation-delay-4000]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">

                {/* Form Section */}
                <div className="lg:col-span-5 w-full">
                    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-white/50 p-8">
                        <div className="mb-8 text-center flex flex-col items-center">
                            <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-4 rounded-full mb-4 shadow-inner">
                                <UserPlusIcon className="w-8 h-8 text-purple-600" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-pink-600">
                                {editingId ? "वापरकर्ता अपडेट करा" : "वापरकर्ता जोडा"}
                            </h2>
                            <p className="text-slate-500 mt-2 font-medium">
                                नवीन कर्मचारी किंवा ग्राहक नोंदवा
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    नाव
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="पूर्ण नाव"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    ईमेल पत्ता
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="ईमेल"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                                    required
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    रोल
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 appearance-none"
                                    required
                                >
                                    <option value="">भूमिका निवडा</option>
                                    <option value="Owner">मालक</option>
                                    <option value="Admin">प्रशासक (Admin)</option>
                                    <option value="Manager">व्यवस्थापक</option>
                                    <option value="Chef">मुख्य आचारी</option>
                                    <option value="Cook">आचारी</option>
                                    <option value="Kitchen Staff">स्वयंपाकघर कर्मचारी</option>
                                    <option value="Service Staff">वाढपी कर्मचारी</option>
                                    <option value="Supervisor">पर्यवेक्षक</option>
                                    <option value="Billing">बिलिंग कर्मचारी</option>
                                    <option value="Store Keeper">साठा व्यवस्थापक</option>
                                    <option value="Purchase">खरेदी विभाग</option>
                                    <option value="Delivery">वितरण कर्मचारी</option>
                                     <option value="Customer">ग्राहक</option>

                                </select>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    पासवर्ड
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="पासवर्ड"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                                    required={!editingId} // Usually don't require password on edit unless changing it
                                />
                            </div>

                            {error && (
                                <p className="text-rose-500 text-center font-medium mt-3 bg-rose-50 p-2 rounded-lg">
                                    {error.message || error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? "प्रक्रिया चालू आहे..." : (editingId ? "अपडेट करा" : "क्रिएट यूजर")}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null);
                                        setFormData({ name: "", email: "", role: "", password: "" });
                                    }}
                                    className="w-full bg-white text-slate-600 font-bold py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all duration-200 mt-2"
                                >
                                    रद्द करा (Cancel)
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* Users List Section */}
                <div className="lg:col-span-7 bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-white/50 p-6 md:p-8 flex flex-col h-[85vh]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-extrabold text-slate-800">
                            नोंदणीकृत वापरकर्ते
                        </h2>
                        <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-sm font-bold">
                            Total: {users.length}
                        </span>
                    </div>

                    {/* Custom Scrollbar Container */}
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        {users.map((user) => (
                            <div
                                key={user._id}
                                className="group flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/60 border border-white p-5 rounded-2xl hover:shadow-md hover:border-purple-200 transition-all duration-300"
                            >
                                <div className="mb-4 sm:mb-0">
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        {user.name}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-500 mb-2">
                                        {user.email}
                                    </p>
                                    <span className="inline-block bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                                        {user.role}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => {
                                            setEditingId(user._id);
                                            setFormData({
                                                name: user.name,
                                                email: user.email,
                                                role: user.role,
                                                password: "",
                                            });
                                        }}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 px-4 py-2 rounded-xl font-semibold transition-colors duration-200 border border-amber-100"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Are you sure you want to delete this user?")) {
                                                dispatch(deleteUser(user._id));
                                            }
                                        }}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 px-4 py-2 rounded-xl font-semibold transition-colors duration-200 border border-rose-100"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {users.length === 0 && !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                                <UserPlusIcon className="w-12 h-12 opacity-50" />
                                <p className="font-medium">कोणतेही वापरकर्ते आढळले नाहीत</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}