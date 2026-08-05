import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllMenus, saveCustomerMenu } from "./menuSlice";
import {
    CheckCircleIcon as CheckCircleSolid,
    ShoppingCartIcon,
    BanknotesIcon
} from "@heroicons/react/24/solid";
import { ChatBubbleLeftRightIcon, EnvelopeIcon, PhoneIcon, PlusCircleIcon, TrashIcon, UserIcon, XMarkIcon, ClockIcon, CalendarDaysIcon, TagIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { SelectEventCalenderModel } from "../EventCalendarModal/SelectEventCalenderModel/selectEventCalenderModel";
import logo from "../../assets/images/logomoryaremovebg.png"; // तुमचा लोगो इम्पोर्ट करा (पाथ तपासा)

// --- नवीन Splash Screen कंपोनंट ---
export function MenuSplashScreen() {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white overflow-hidden">
            {/* ॲनिमेटेड बॅकग्राउंड इफेक्ट्स */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/30 rounded-full blur-[120px] animate-[pulse_3s_ease-in-out_infinite]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[120px] animate-[pulse_4s_ease-in-out_infinite_animation-delay-1000]"></div>

            {/* मुख्य ॲनिमेटेड कंटेनर */}
            <div className="relative z-10 flex flex-col items-center animate-in zoom-in-75 fade-in duration-1000">
                
                {/* लोगो */}
                <div className="w-36 h-36 md:w-48 md:h-48 bg-white/10 backdrop-blur-xl p-6 rounded-full shadow-[0_0_50px_rgba(217,70,239,0.3)] mb-8 border border-white/20 flex items-center justify-center animate-[bounce_2s_infinite]">
                    <img
                        src={logo}
                        alt="Morya Caterers"
                        className="w-full h-full object-contain drop-shadow-2xl"
                        onError={(e) => {
                            // जर लोगो लोड झाला नाही, तर हा आयकॉन दिसेल
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                        }}
                    />
                    <SparklesIcon className="w-20 h-20 text-fuchsia-300 hidden" style={{ display: 'none' }} />
                </div>
                
                {/* स्वागत संदेश */}
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-lg text-center animate-in slide-in-from-bottom-5 duration-1000 delay-300">
                    मोरया <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-pink-300">कॅटरर्स</span>
                </h1>
                
                <p className="text-lg md:text-xl font-bold text-white/80 tracking-[0.2em] uppercase animate-pulse">
                    स्वादिष्ट भोजनाचा अनुभव...
                </p>

                {/* लोडिंग बार */}
                <div className="mt-12 w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-fuchsia-400 to-pink-400 w-full rounded-full origin-left animate-[scale-x_2.5s_ease-in-out]"></div>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes scale-x {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                }
            `}</style>
        </div>
    );
}

