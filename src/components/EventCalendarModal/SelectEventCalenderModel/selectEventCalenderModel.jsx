import { useState, useEffect } from "react";
import {
    CalendarDaysIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { getCalendar } from "../../Home/homeSlice"; // Adjust path if necessary

export function SelectEventCalenderModel({
    isOpen,
    onClose,
    onSelectDate,
}) {
    const dispatch = useDispatch();
    const { calendar } = useSelector((state) => state.dashboard);

    const handleDateSelect = (date, bookedShifts) => {
        if (!onSelectDate) return;
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        onSelectDate(`${year}-${month}-${day}`, bookedShifts);
    };

    const [currentDate, setCurrentDate] = useState(new Date());

    // Get today's date and strip time for accurate past-date comparison
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const ALL_SHIFTS = ["सकाळ", "संध्याकाळ", "रात्र"];
    const MAX_BOOKINGS_PER_SHIFT = 3; // प्रत्येक शिफ्टसाठी कमाल मर्यादा

    useEffect(() => {
        if (isOpen) {
            dispatch(getCalendar());
        }
    }, [dispatch, isOpen]);

    if (!isOpen) return null;

    // --- Calendar Logic ---
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"];
    const daysOfWeek = ["रवि", "सोम", "मंगळ", "बुध", "गुरू", "शुक्र", "शनी"];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // --- Helper: Render beautiful shift badges ---
    const renderShiftBadge = (shift, remaining) => {
        const isFull = remaining <= 0;
        
        let themeClasses = "";
        let icon = "";
        
        if (isFull) {
            themeClasses = "bg-rose-50 text-rose-600 border-rose-100 shadow-[inset_0_0_8px_rgba(225,29,72,0.05)] opacity-80";
            icon = "🔒";
        } else if (shift === "सकाळ") {
            themeClasses = "bg-amber-50/80 text-amber-700 border-amber-200/60 group-hover:bg-amber-100 group-hover:border-amber-300";
            icon = "🌅";
        } else if (shift === "संध्याकाळ") {
            themeClasses = "bg-orange-50/80 text-orange-700 border-orange-200/60 group-hover:bg-orange-100 group-hover:border-orange-300";
            icon = "🌇";
        } else {
            themeClasses = "bg-indigo-50/80 text-indigo-700 border-indigo-200/60 group-hover:bg-indigo-100 group-hover:border-indigo-300";
            icon = "🌙";
        }

        return (
            <div key={shift} className={`flex items-center justify-between w-full px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg border text-[9px] md:text-[10px] font-bold transition-all duration-300 ${themeClasses}`}>
                <span className="flex items-center gap-1 md:gap-1.5">
                    <span className="text-[10px] md:text-xs drop-shadow-sm">{icon}</span>
                    <span className="tracking-wide">{shift}</span>
                </span>
                <span className={isFull ? "font-black text-rose-600" : "font-extrabold"}>
                    {isFull ? "फुल्ल" : `${remaining} बाकी`}
                </span>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-sm transition-opacity">
            <div className="bg-slate-50 rounded-[2rem] w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[95vh] md:max-h-[90vh]">

                {/* Premium Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 p-5 flex items-center justify-between flex-shrink-0 z-20 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-white/10 text-white rounded-xl shadow-lg backdrop-blur-md border border-white/20">
                            <CalendarDaysIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">तारीख निवडा</h2>
                            <p className="text-sm font-medium text-slate-400 tracking-wide mt-0.5">उपलब्ध तारखा आणि शिफ्ट्स (Available Slots)</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="relative z-10 p-2.5 rounded-full bg-white/10 border border-white/10 text-slate-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm active:scale-95"
                    >
                        <XMarkIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Calendar Body Area */}
                <div className="relative flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 z-0 scrollbar-thin scrollbar-thumb-slate-300">

                    {/* Calendar Controls */}
                    <div className="flex items-center justify-between mb-6 md:mb-8 bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            {monthNames[currentDate.getMonth()]} 
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                {currentDate.getFullYear()}
                            </span>
                        </h3>
                        <div className="flex items-center gap-2 md:gap-3">
                            <button onClick={prevMonth} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors active:scale-95 shadow-sm">
                                <ChevronLeftIcon className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                            </button>
                            <button onClick={nextMonth} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors active:scale-95 shadow-sm">
                                <ChevronRightIcon className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 md:gap-3 z-10 relative">
                        {/* Weekday Headers */}
                        {daysOfWeek.map((day, idx) => (
                            <div key={idx} className="text-center text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest pb-3">
                                {day}
                            </div>
                        ))}

                        {/* Empty Initial Slots */}
                        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="min-h-[120px] md:min-h-[140px] rounded-2xl bg-slate-100/50 border border-transparent"></div>
                        ))}

                        {/* Days Logic */}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                            const date = idx + 1;
                            const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);

                            // Get events for the current day
                            const dayEvents = calendar?.filter((item) => {
                                const eventDate = new Date(item.start);
                                const status = item.extendedProps?.status;
                                const isNotCancelled = status !== "Cancel" && status !== "Cancelled";

                                return (
                                    isNotCancelled &&
                                    eventDate.getDate() === currentDay.getDate() &&
                                    eventDate.getMonth() === currentDay.getMonth() &&
                                    eventDate.getFullYear() === currentDay.getFullYear()
                                );
                            }) || [];

                            const isToday = new Date().toDateString() === currentDay.toDateString();

                            // Calculate shifts
                            const shiftCounts = { "सकाळ": 0, "संध्याकाळ": 0, "रात्र": 0 };
                            
                            dayEvents.forEach((event) => {
                                if (event.extendedProps?.status === "Confirmed" && Array.isArray(event.extendedProps?.shifts)) {
                                    event.extendedProps.shifts.forEach((shift) => {
                                        if (shiftCounts[shift] !== undefined) {
                                            shiftCounts[shift] += 1;
                                        }
                                    });
                                }
                            });

                            const fullyBookedShifts = ALL_SHIFTS.filter((shift) => shiftCounts[shift] >= MAX_BOOKINGS_PER_SHIFT);
                            const isFullyBooked = fullyBookedShifts.length === ALL_SHIFTS.length;

                            const isPastDate = currentDay < todayDate;
                            const isSelectable = !isPastDate && !isFullyBooked; 

                            // Styling setup
                            let cardBgClass = 'bg-white';
                            let cardBorderClass = 'border-slate-200/60 shadow-sm';
                            let dateTextClass = 'text-slate-700';
                            let indicatorClass = 'hidden'; // For 'Today' indicator

                            if (isPastDate) {
                                cardBgClass = 'bg-slate-100/60';
                                cardBorderClass = 'border-transparent';
                                dateTextClass = 'text-slate-400';
                            } else if (isFullyBooked) {
                                cardBgClass = 'bg-rose-50/40';
                                cardBorderClass = 'border-rose-100';
                                dateTextClass = 'text-rose-800 opacity-60';
                            } else if (isToday) {
                                cardBgClass = 'bg-blue-50/50';
                                cardBorderClass = 'border-blue-400 shadow-md shadow-blue-100';
                                dateTextClass = 'text-blue-800';
                                indicatorClass = 'block';
                            }

                            return (
                                <div
                                    key={date}
                                    onClick={() => {
                                        if (isSelectable) {
                                            handleDateSelect(currentDay, fullyBookedShifts);
                                            onClose(); 
                                        }
                                    }}
                                    className={`group relative flex flex-col min-h-[120px] md:min-h-[145px] p-2 md:p-3 rounded-2xl border transition-all duration-300 overflow-hidden
                                        ${cardBgClass} ${cardBorderClass}
                                        ${!isSelectable ? 'cursor-not-allowed grayscale-[20%]' : ''}
                                        ${isSelectable ? 'cursor-pointer hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1 hover:z-10 bg-white' : ''}
                                    `}
                                >
                                    {/* Today Indicator */}
                                    <div className={`absolute top-0 right-0 w-8 h-8 overflow-hidden rounded-tr-2xl ${indicatorClass}`}>
                                        <div className="absolute top-0 right-0 bg-blue-500 w-full h-full transform translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                                    </div>

                                    {/* Date Header */}
                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <span className={`text-sm md:text-lg font-black shrink-0 ${dateTextClass} ${isSelectable ? 'group-hover:text-indigo-700' : ''}`}>
                                            {date}
                                        </span>
                                        {isToday && <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded mr-1">आज</span>}
                                    </div>

                                    {/* Remaining Slots */}
                                    {!isPastDate && (
                                        <div className="relative z-10 flex flex-col gap-1.5 mt-auto w-full">
                                            {ALL_SHIFTS.map((shift) => {
                                                const remaining = MAX_BOOKINGS_PER_SHIFT - (shiftCounts[shift] || 0);
                                                return renderShiftBadge(shift, remaining);
                                            })}
                                        </div>
                                    )}

                                    {/* Past Date Message */}
                                    {isPastDate && (
                                        <div className="mt-auto flex items-center justify-center h-full opacity-40">
                                            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest rotate-[-15deg]">
                                                मागील तारीख
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Helper Legend */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-6 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-500">
                            <span className="w-3 h-3 rounded-full bg-rose-100 border border-rose-300 shadow-sm flex items-center justify-center text-[8px]">🔒</span>
                            संपूर्ण बुक
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-500">
                            <span className="w-3 h-3 rounded-full bg-blue-400 shadow-sm"></span>
                            आजची तारीख
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-500">
                            <span className="w-3 h-3 rounded-full bg-slate-200 shadow-sm"></span>
                            मागील तारखा (निवडता येणार नाहीत)
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}