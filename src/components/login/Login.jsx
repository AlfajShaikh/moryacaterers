import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "./loginSlice";
import logo from "../../assets/images/morayaorignal.png";
import { EnvelopeIcon, LockClosedIcon, ArrowRightOnRectangleIcon, EyeSlashIcon, EyeIcon } from "@heroicons/react/24/outline";

export default function Login({ setIsLoggedIn }) {
    const dispatch = useDispatch();

    const { loading, error } = useSelector((state) => state.login);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        const result = await dispatch(
            loginUser({
                email,
                password,
            })
        );

        if (loginUser.fulfilled.match(result)) {
             // User has interacted with the page, so fullscreen request is allowed
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    }
            setIsLoggedIn(true);
        } else {
            alert(result.payload?.message || "Invalid Email or Password");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">
            
            {/* Colorful Ambient Background Blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-300/40 to-purple-300/40 blur-[80px] pointer-events-none -z-10 animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-300/30 to-cyan-300/30 blur-[100px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: "2s" }}></div>

            <div className="relative z-10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-indigo-100/50 border border-white rounded-[2rem] w-full max-w-md p-8 md:p-10 transition-all duration-300 hover:shadow-indigo-200/50">

                {/* Logo & Header Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-white p-2  mb-5">
                        <img src={logo} alt="Morya Caterers" className="h-20 w-auto rounded-xl object-contain" />
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 tracking-tight text-center">
                        सुस्वागतम!
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm font-medium text-center">
                        तुमच्या खात्यात साइन इन करण्यासाठी कृपया खालील तपशील भरा.
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                            ईमेल पत्ता
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                placeholder="admin@gmail.com"
                                required
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 placeholder-slate-400 font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                   {/* Password */} <div> 
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1"> पासवर्ड </label>
                     <div className="relative"> {/* Lock Icon */} 
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"> 
                            <LockClosedIcon className="h-5 w-5 text-slate-400" /> </div> <input type={showPassword ? "text" : "password"} placeholder="••••••••" required className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 placeholder-slate-400 font-medium" value={password} onChange={(e) => setPassword(e.target.value)} /> {/* Show / Hide Password */}
                             <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors" aria-label={showPassword ? "Hide password" : "Show password"} > {showPassword ? ( <EyeSlashIcon className="h-5 w-5" /> ) : ( <EyeIcon className="h-5 w-5" /> )} </button> </div> </div> {/* Error */} {error && ( <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold text-center border border-red-100"> {error.message || error} </div> )}

                    {/* Options Row */}
                    {/* <div className="flex items-center justify-between text-sm px-1 pt-2">
                        <label className="flex items-center text-slate-600 cursor-pointer hover:text-indigo-600 transition-colors font-medium">
                            <input type="checkbox" className="mr-2.5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                            Remember me
                        </label>
                        <a href="#" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                            पासवर्ड विसरलात?
                        </a>
                    </div> */}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold text-center border border-red-100 animate-in fade-in zoom-in duration-300">
                            {error.message || error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 mt-4"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing In...
                            </>
                        ) : (
                            <>
                                साइन इन करा
                                <ArrowRightOnRectangleIcon className="w-5 h-5 opacity-90" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}