import { useState, useRef, useEffect } from "react";
import {
    Bars3Icon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/morayaorignal.png"

export default function Header({ setIsLoggedIn }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Replace with Redux or localStorage values
    const user = JSON.parse(localStorage.getItem("user")) || {
        name: "User",
        role: "Admin",
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        const confirmLogout = window.confirm(
            "तुम्हाला खात्री आहे का की लॉगआउट करायचे आहे?"
        );

        if (!confirmLogout) return;

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");

        setIsLoggedIn(false);
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-white/80 transition-all duration-300">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* 👇 Decreased container height from h-16 md:h-20 to h-12 md:h-16 */}
                <div className="flex items-center justify-between h-12 md:h-16 transition-all">

                    {/* Logo Section */}
                    <div
                        className="flex items-center gap-3 relative group cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        {/* Subtle glow effect on hover */}
                        <div className="absolute inset-0 bg-indigo-400 blur-xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"></div>
                        
                        {/* 👇 Decreased logo size from h-10 md:h-12 to h-8 md:h-10 */}
                        <img
                            src={logo}
                            className="h-8 md:h-10 object-contain relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                            alt="Morya Logo"
                        />
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3 md:gap-5 relative z-10">

                        {/* Profile Dropdown Container */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setOpen(!open)}
                                className={`relative flex items-center gap-2 md:gap-3 rounded-full py-1 pl-1 pr-3 md:pr-4 transition-all duration-300 border-2 active:scale-95
                                    ${open
                                        ? "bg-indigo-50 border-indigo-200 shadow-md shadow-indigo-100/50"
                                        : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50"
                                    }`}
                            >
                                {/* 👇 Decreased Avatar size from w-8/10 h-8/10 to w-7/9 h-7/9 */}
                                <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm md:text-base shadow-md border-2 border-white">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>

                                <div className="hidden md:flex flex-col items-start justify-center">
                                    <p className="text-sm font-extrabold text-slate-800 leading-none mb-0.5">
                                        {user.name}
                                    </p>
                                    <p className="text-[10px] font-bold tracking-wider uppercase text-indigo-500 leading-none">
                                        {user.role}
                                    </p>
                                </div>

                                <ChevronDownIcon
                                    className={`w-4 h-4 ml-1 transition-transform duration-300 ${open ? "rotate-180 text-indigo-600" : "text-slate-400"
                                        }`}
                                />
                            </button>

                            {/* Floating Dropdown Menu */}
                            {open && (
                                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-3xl rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200 z-50">

                                    {/* Mobile User Info (Visible only on small screens) */}
                                    <div className="md:hidden px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                                        <p className="text-sm font-extrabold text-slate-800">
                                            {user.name}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase text-indigo-500 mt-0.5">
                                            {user.role}
                                        </p>
                                    </div>

                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => {
                                                setOpen(false);
                                                navigate("/profile");
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-700 font-bold hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                                        >
                                            <div className="bg-slate-100 group-hover:bg-indigo-100 p-2 rounded-xl text-slate-500 group-hover:text-indigo-600 transition-colors">
                                                <UserCircleIcon className="w-5 h-5" />
                                            </div>
                                            प्रोफाइल (Profile)
                                        </button>

                                        <div className="h-px bg-slate-100 my-2 mx-4"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-600 font-bold hover:bg-rose-50 hover:text-rose-700 transition-colors group"
                                        >
                                            <div className="bg-rose-50 group-hover:bg-rose-100 p-2 rounded-xl text-rose-500 group-hover:text-rose-600 transition-colors">
                                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                            </div>
                                            लॉगआउट (Logout)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="lg:hidden p-2 rounded-xl bg-white border-2 border-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all shadow-sm">
                            <Bars3Icon className="w-5 h-5" />
                        </button>

                    </div>
                </div>
            </div>
        </header>
    );
}