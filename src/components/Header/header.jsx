import { useState, useRef, useEffect } from "react";
import {
    Bars3Icon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logomoryaremovebg.png"

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
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/50">
            <div className=" mx-auto px-4 sm:px-6">

                {/* Decreased height from h-20 to h-16 */}
                <div className="flex items-center justify-between h-16">

                    {/* Logo Section */}
                    <div className="flex items-center gap-3 ">
                        <img
                            src={logo}
                            className="h-14 object-contain drop-shadow-sm transition-transform hover:scale-105"
                            alt="Morya Logo"
                        />
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3 md:gap-5">

                        {/* Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setOpen(!open)}
                                className={`flex items-center gap-2 md:gap-3 rounded-full py-1.5 pl-1.5 pr-3 md:pr-4 transition-all duration-300 border ${open
                                    ? "bg-blue-50 border-blue-200 shadow-sm"
                                    : "bg-white border-slate-200 hover:border-purple-300 hover:shadow-md"
                                    }`}
                            >
                                {/* Gradient Avatar */}
                                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-sm shadow-inner">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>

                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-bold text-slate-800 leading-tight">
                                        {user.name}
                                    </p>
                                    <p className="text-[11px] font-semibold text-slate-500">
                                        {user.role}
                                    </p>
                                </div>

                                <ChevronDownIcon
                                    className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${open ? "rotate-180 text-blue-600" : ""}`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {open && (
                                <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">

                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                setOpen(false);
                                                navigate("/profile"); // Assuming you have a profile route
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                        >
                                            <div className="bg-blue-100/50 p-1.5 rounded-lg text-blue-600">
                                                <UserCircleIcon className="w-5 h-5" />
                                            </div>
                                            प्रोफाइल
                                        </button>

                                        <div className="h-px bg-slate-100 my-1 mx-2"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 font-semibold hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                        >
                                            <div className="bg-rose-100/50 p-1.5 rounded-lg text-rose-600">
                                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                            </div>
                                            लॉगआउट
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition-colors">
                            <Bars3Icon className="w-6 h-6" />
                        </button>

                    </div>
                </div>
            </div>
        </header>
    );
}