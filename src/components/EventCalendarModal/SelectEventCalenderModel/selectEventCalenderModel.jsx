import { useState, useEffect } from "react";
import {
    CalendarDaysIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckCircleIcon
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

    const [selectedDatesMap, setSelectedDatesMap] = useState(new Map());
    const [currentDate, setCurrentDate] = useState(new Date());

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const ALL_SHIFTS = ["सकाळ", "संध्याकाळ", "रात्र"];
    const MAX_BOOKINGS_PER_SHIFT = 3;

    useEffect(() => {
        if (isOpen) {
            dispatch(getCalendar());
            setSelectedDatesMap(new Map()); 
        }
    }, [dispatch, isOpen]);

    if (!isOpen) return null;

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"];
    const daysOfWeek = ["रवि", "सोम", "मंगळ", "बुध", "गुरू", "शुक्र", "शनी"];

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleDateClick = (currentDay, fullyBookedShifts) => {
        const year = currentDay.getFullYear();
        const month = String(currentDay.getMonth() + 1).padStart(2, "0");
        const day = String(currentDay.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        setSelectedDatesMap(prev => {
            const newMap = new Map(prev);
            if (newMap.has(dateStr)) {
                newMap.delete(dateStr); 
            } else {
                newMap.set(dateStr, fullyBookedShifts); 
            }
            return newMap;
        });
    };

    // 🚨 MODIFIED: आता आपण प्रत्येक निवडलेल्या तारखेचा स्वतंत्र डेटा पाठवत आहोत
    const handleConfirmSelection = () => {
        if (!onSelectDate) return;

        // उदा. [{ date: "2026-08-08", bookedShifts: ["सकाळ"] }, { date: "2026-08-09", bookedShifts: [] }]
        const datesDetails = Array.from(selectedDatesMap.entries()).map(([date, bookedShifts]) => ({
            date,
            bookedShifts
        }));

        onSelectDate(datesDetails);
        onClose();
    };

    const renderShiftBadge = (shift, remaining, pendingCount) => {
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
                <div className="flex items-center gap-1.5">
                    {pendingCount > 0 && !isFull && (
                        <span className="text-[8px] bg-white text-slate-500 px-1 py-0.5 rounded border border-slate-200" title={`${pendingCount} Pending Orders`}>
                            {pendingCount} Pending
                        </span>
                    )}
                    <span className={isFull ? "font-black text-rose-600" : "font-extrabold"}>
                        {isFull ? "फुल्ल" : `${remaining} बाकी`}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-sm transition-opacity">
            <div className="bg-slate-50 rounded-[2rem] w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[95vh] md:max-h-[90vh]">
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 p-5 flex items-center justify-between flex-shrink-0 z-20 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-white/10 text-white rounded-xl shadow-lg backdrop-blur-md border border-white/20">
                            <CalendarDaysIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">तारखा निवडा</h2>
                            <p className="text-sm font-medium text-slate-400 tracking-wide mt-0.5">तुम्ही एकापेक्षा जास्त तारखा निवडू शकता</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-2.5 rounded-full bg-white/10 border border-white/10 text-slate-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm active:scale-95">
                        <XMarkIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                <div className="relative flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 z-0 scrollbar-thin scrollbar-thumb-slate-300">
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

                    <div className="grid grid-cols-7 gap-2 md:gap-3 z-10 relative pb-6">
                        {daysOfWeek.map((day, idx) => (
                            <div key={idx} className="text-center text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest pb-3">{day}</div>
                        ))}
                        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="min-h-[120px] md:min-h-[140px] rounded-2xl bg-slate-100/50 border border-transparent"></div>
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                            const date = idx + 1;
                            const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);

                            const yearStr = currentDay.getFullYear();
                            const monthStr = String(currentDay.getMonth() + 1).padStart(2, "0");
                            const dayStr = String(currentDay.getDate()).padStart(2, "0");
                            const currentDayStr = `${yearStr}-${monthStr}-${dayStr}`;

                            const dayEvents = calendar?.filter((item) => {
                                const eventDate = new Date(item.start);
                                return (
                                    eventDate.getDate() === currentDay.getDate() &&
                                    eventDate.getMonth() === currentDay.getMonth() &&
                                    eventDate.getFullYear() === currentDay.getFullYear()
                                );
                            }) || [];

                            const isToday = new Date().toDateString() === currentDay.toDateString();
                            const isSelected = selectedDatesMap.has(currentDayStr);

                            const confirmedCounts = { "सकाळ": 0, "संध्याकाळ": 0, "रात्र": 0 };
                            const pendingCounts = { "सकाळ": 0, "संध्याकाळ": 0, "रात्र": 0 };

                            dayEvents.forEach((event) => {
                                const status = event.extendedProps?.status?.toLowerCase() || "";
                                if (status === "cancel" || status === "cancelled") return;

                                if (Array.isArray(event.extendedProps?.shifts)) {
                                    event.extendedProps.shifts.forEach((shift) => {
                                        if (status === "confirmed") {
                                            if (confirmedCounts[shift] !== undefined) confirmedCounts[shift] += 1;
                                        } else if (status === "pending") {
                                            if (pendingCounts[shift] !== undefined) pendingCounts[shift] += 1;
                                        }
                                    });
                                }
                            });

                            const fullyBookedShifts = ALL_SHIFTS.filter((shift) => confirmedCounts[shift] >= MAX_BOOKINGS_PER_SHIFT);
                            const isFullyBooked = fullyBookedShifts.length === ALL_SHIFTS.length;

                            const isPastDate = currentDay < todayDate;
                            const isSelectable = !isPastDate && !isFullyBooked;

                            let cardBgClass = 'bg-white';
                            let cardBorderClass = 'border-slate-200/60 shadow-sm';
                            let dateTextClass = 'text-slate-700';

                            if (isPastDate) {
                                cardBgClass = 'bg-slate-100/60';
                                cardBorderClass = 'border-transparent';
                                dateTextClass = 'text-slate-400';
                            } else if (isSelected) {
                                cardBgClass = 'bg-indigo-50 shadow-md ring-2 ring-indigo-500';
                                cardBorderClass = 'border-indigo-400';
                                dateTextClass = 'text-indigo-800';
                            } else if (isFullyBooked) {
                                cardBgClass = 'bg-rose-50/40';
                                cardBorderClass = 'border-rose-100';
                                dateTextClass = 'text-rose-800 opacity-60';
                            } else if (isToday) {
                                cardBgClass = 'bg-blue-50/50';
                                cardBorderClass = 'border-blue-400 shadow-sm shadow-blue-100';
                                dateTextClass = 'text-blue-800';
                            }

                            return (
                                <div
                                    key={date}
                                    onClick={() => {
                                        if (isSelectable) {
                                            handleDateClick(currentDay, fullyBookedShifts);
                                        }
                                    }}
                                    className={`group relative flex flex-col min-h-[120px] md:min-h-[145px] p-2 md:p-3 rounded-2xl border transition-all duration-300 overflow-hidden
                                        ${cardBgClass} ${cardBorderClass}
                                        ${!isSelectable ? 'cursor-not-allowed grayscale-[20%]' : ''}
                                        ${isSelectable && !isSelected ? 'cursor-pointer hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100 hover:-translate-y-0.5 hover:z-10 bg-white' : ''}
                                    `}
                                >
                                    {isToday && !isSelected && (
                                        <div className={`absolute top-0 right-0 w-8 h-8 overflow-hidden rounded-tr-2xl block`}>
                                            <div className="absolute top-0 right-0 bg-blue-500 w-full h-full transform translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                                        </div>
                                    )}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2">
                                            <CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 animate-in zoom-in" />
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <span className={`text-sm md:text-lg font-black shrink-0 ${dateTextClass} ${isSelectable && !isSelected ? 'group-hover:text-indigo-700' : ''}`}>
                                            {date}
                                        </span>
                                        {isToday && !isSelected && <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded mr-1">आज</span>}
                                    </div>

                                    {!isPastDate && (
                                        <div className="relative z-10 flex flex-col gap-1.5 mt-auto w-full">
                                            {ALL_SHIFTS.map((shift) => {
                                                const remaining = MAX_BOOKINGS_PER_SHIFT - (confirmedCounts[shift] || 0);
                                                const pending = pendingCounts[shift] || 0;
                                                return renderShiftBadge(shift, remaining, pending);
                                            })}
                                        </div>
                                    )}
                                    {isPastDate && (
                                        <div className="mt-auto flex items-center justify-center h-full opacity-40">
                                            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest rotate-[-15deg]">मागील तारीख</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white border-t border-slate-200 p-4 md:p-5 flex items-center justify-between shrink-0 rounded-b-[2rem]">
                    <div className="text-sm font-bold text-slate-600 flex items-center gap-2">
                        निवडलेल्या तारखा:
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg text-lg">
                            {selectedDatesMap.size}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
                            रद्द करा
                        </button>
                        <button
                            onClick={handleConfirmSelection}
                            disabled={selectedDatesMap.size === 0}
                            className="px-6 py-2.5 rounded-xl font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            तारखा निश्चित करा
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}