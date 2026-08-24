import { useState, useEffect } from "react";
import {
    ArrowsRightLeftIcon,
    ArrowsUpDownIcon,
    UsersIcon,
    InformationCircleIcon,
    PrinterIcon
} from "@heroicons/react/24/outline";

export function Planning() {
    // --- Inputs State ---
    const [hallWidth, setHallWidth] = useState(50); // in feet
    const [hallLength, setHallLength] = useState(80); // in feet
    const [guests, setGuests] = useState(200);

    // --- Calculations State ---
    const [area, setArea] = useState(0);
    const [status, setStatus] = useState({ type: "success", message: "" });
    const [tables, setTables] = useState(0);

    // --- Calculation Logic ---
    useEffect(() => {
        const totalArea = hallWidth * hallLength;
        setArea(totalArea);

        // Standard rules for catering events:
        // 1. Stage needs approx 10% area.
        // 2. Buffet needs approx 15% area.
        // 3. Round table seating requires approx 12 to 15 sq.ft per person.

        const requiredAreaForGuests = guests * 12; // 12 sq ft per person minimum
        const requiredTotalArea = requiredAreaForGuests + 500; // Adding 500 sq ft buffer for stage/buffet

        if (totalArea < requiredTotalArea) {
            setStatus({
                type: "danger",
                message: `हॉल खूप लहान आहे! ${guests} पाहुण्यांसाठी अंदाजे ${requiredTotalArea} sq.ft जागेची आवश्यकता आहे.`
            });
        } else if (totalArea > requiredTotalArea * 2) {
            setStatus({
                type: "warning",
                message: `हॉल खूप मोठा आहे. जागा मोकळी वाटू शकते, टेबल थोडे लांब ठेवता येतील.`
            });
        } else {
            setStatus({
                type: "success",
                message: `हॉलचा आकार एकदम योग्य आहे! (Perfect Size)`
            });
        }

        // Calculate tables (assuming 8 people per round table)
        setTables(Math.ceil(guests / 8));

    }, [hallWidth, hallLength, guests]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* --- HEADER --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                            स्मार्ट <span className="text-indigo-600">प्लॅनिंग</span>
                        </h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            हॉलचे माप टाका आणि आपोआप फ्लोअर प्लॅन (Floor Plan) मिळवा.
                        </p>
                    </div>
                    <button onClick={() => window.print()} className="hidden md:flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100 transition">
                        <PrinterIcon className="w-5 h-5" /> प्लॅन प्रिंट करा
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* --- CONTROLS SECTION (Left Column) --- */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Input Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">हॉलची माहिती भरा (Dimensions)</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1.5">
                                        <ArrowsRightLeftIcon className="w-4 h-4 text-indigo-500" /> रुंदी (Width - ft)
                                    </label>
                                    <input
                                        type="number" value={hallWidth} onChange={(e) => setHallWidth(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1.5">
                                        <ArrowsUpDownIcon className="w-4 h-4 text-indigo-500" /> लांबी (Length - ft)
                                    </label>
                                    <input
                                        type="number" value={hallLength} onChange={(e) => setHallLength(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1.5">
                                        <UsersIcon className="w-4 h-4 text-indigo-500" /> पाहुण्यांची संख्या (Guests)
                                    </label>
                                    <input
                                        type="number" value={guests} onChange={(e) => setGuests(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className={`p-5 rounded-2xl border-2 flex items-start gap-3 
                            ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                                status.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                                    'bg-rose-50 border-rose-200 text-rose-800'}`}
                        >
                            <InformationCircleIcon className="w-6 h-6 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold mb-1">{status.type === 'danger' ? 'सावधान (Warning)' : 'विश्लेषण (Analysis)'}</h4>
                                <p className="text-sm font-medium opacity-90">{status.message}</p>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">एकूण क्षेत्रफळ</p>
                                <p className="text-2xl font-black text-indigo-600 mt-1">{area} <span className="text-sm font-bold text-slate-500">sq.ft</span></p>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">लागणारे टेबल्स</p>
                                <p className="text-2xl font-black text-fuchsia-600 mt-1">{tables} <span className="text-sm font-bold text-slate-500">नग</span></p>
                            </div>
                        </div>

                    </div>

                    {/* --- VISUAL CANVAS SECTION (Right Column) --- */}
                    <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">2D Floor Plan (नकाशा)</h3>
                            <div className="flex gap-4 text-xs font-bold text-slate-500">
                                <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-300 rounded"></div> स्टेज</span>
                                <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-300 rounded"></div> बुफे</span>
                                <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-300 rounded-full"></div> टेबल्स</span>
                            </div>
                        </div>

                        {/* Auto-Scaling Canvas Box */}
                        <div className="flex-1 bg-slate-100 rounded-xl border-4 border-slate-800 p-2 relative overflow-hidden flex items-center justify-center min-h-[500px]">

                            {/* The Hall Layout Container (Dynamic Aspect Ratio) */}
                            <div
                                className="relative bg-white border-2 border-dashed border-slate-300 shadow-inner"
                                style={{
                                    // Calculate aspect ratio dynamically based on input
                                    width: hallWidth >= hallLength ? '90%' : `${(hallWidth / hallLength) * 90}%`,
                                    height: hallLength > hallWidth ? '90%' : `${(hallLength / hallWidth) * 90}%`,
                                    maxWidth: '100%',
                                    maxHeight: '100%'
                                }}
                            >
                                {/* Dimension Labels */}
                                <div className="absolute -top-6 w-full text-center text-xs font-black text-slate-400">{hallWidth} ft (रुंदी)</div>
                                <div className="absolute -left-12 h-full flex items-center -rotate-90 text-xs font-black text-slate-400">{hallLength} ft (लांबी)</div>

                                {/* 1. STAGE (Top Center) */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-[15%] bg-amber-200 border-2 border-amber-500 shadow-sm flex items-center justify-center rounded-b-xl">
                                    <span className="font-black text-amber-800 text-xs md:text-sm">स्टेज (Stage)</span>
                                </div>

                                {/* 2. ENTRANCE (Bottom Center) */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-[8%] bg-sky-200 border-2 border-sky-500 border-b-0 shadow-sm flex items-center justify-center rounded-t-lg">
                                    <span className="font-black text-sky-800 text-[10px] md:text-xs">प्रवेशद्वार</span>
                                </div>

                                {/* 3. BUFFET LINE (Right Edge) */}
                                <div className="absolute top-[20%] right-2 w-[15%] h-[60%] bg-orange-200 border-2 border-orange-500 shadow-sm flex items-center justify-center rounded-lg">
                                    <span className="font-black text-orange-800 text-xs rotate-90 whitespace-nowrap">बुफे (Buffet)</span>
                                </div>

                                {/* 4. DINING AREA (Center / Left) */}
                                <div className="absolute top-[20%] left-2 right-[20%] bottom-[15%] border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-lg p-2 flex content-start flex-wrap justify-center gap-2 overflow-hidden">
                                    {/* Render Tables dynamically */}
                                    {Array.from({ length: tables }).map((_, i) => (
                                        <div key={i} className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-200 border-2 border-emerald-500 flex items-center justify-center shadow-sm">
                                            <span className="text-[8px] font-black text-emerald-800">{i + 1}</span>
                                        </div>
                                    ))}

                                    {/* Overflow Warning visually inside canvas if too many tables */}
                                    {tables > (hallWidth * hallLength) / 100 && (
                                        <div className="w-full text-center text-rose-500 text-[10px] font-bold bg-white/80 p-1 rounded mt-2">
                                            जागा कमी पडत आहे!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}