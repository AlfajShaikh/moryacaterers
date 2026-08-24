import { useState, useEffect } from "react";
import {
    CalendarDaysIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    UserIcon,
    TagIcon,
    ClockIcon,
    ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { getCalendar } from "../Home/homeSlice"; // Adjust path if necessary

export function EventCalendarModal({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const { calendar } = useSelector((state) => state.dashboard);

    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Instead of a single event, we select a specific DATE to show all its events and shift capacity
    const [selectedDateEvents, setSelectedDateEvents] = useState(null);
    const [selectedDateObj, setSelectedDateObj] = useState(null);

    useEffect(() => {
        if (isOpen) {
            dispatch(getCalendar());
            setSelectedDateEvents(null);
            setSelectedDateObj(null);
        }
    }, [dispatch, isOpen]);

    if (!isOpen) return null;

    // --- Calendar Logic ---
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"];
    const daysOfWeek = ["रवि", "सोम", "मंगळ", "बुध", "गुरू", "शुक्र", "शनी"];
    const ALL_SHIFTS = ["सकाळ", "संध्याकाळ", "रात्र"];
    const MAX_BOOKINGS_PER_SHIFT = 3;

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDateEvents(null);
        setSelectedDateObj(null);
    };
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDateEvents(null);
        setSelectedDateObj(null);
    };

    // --- Helper: Status Colors ---
    const getStatusStyles = (status) => {
        switch (status) {
            case "Confirmed":
                return { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-800", dot: "bg-emerald-500" };
            case "Inquiry":
                return { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-800", dot: "bg-blue-500" };
            case "Cancel":
                return { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-800", dot: "bg-rose-500" };
            case "Pending":
            default:
                return { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-800", dot: "bg-amber-500" };
        }
    };

    // --- Helper: Calculate Shift Capacity ---
    const calculateShiftCounts = (dayEvents) => {
        const counts = { "सकाळ": 0, "संध्याकाळ": 0, "रात्र": 0 };
        dayEvents.forEach(event => {
            // Only count if not cancelled (adjust logic if you want to count pending/inquiry differently)
            if (event.extendedProps?.status !== "Cancel") {
                const shifts = event.extendedProps?.shifts || [];
                shifts.forEach(shift => {
                    if (counts[shift] !== undefined) {
                        counts[shift] += 1;
                    }
                });
            }
        });
        return counts;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
            {/* Modal Container */}
            <div className="bg-white rounded-none md:rounded-[2rem] w-full h-full md:h-auto md:max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col md:max-h-[95vh]">

                {/* Modal Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-4 md:p-5 flex items-center justify-between flex-shrink-0 z-20 relative">
                    <div className="flex items-center gap-3">
                        <div className="p-2 md:p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm border border-indigo-200/50">
                            <CalendarDaysIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-slate-800">कार्यक्रमाचे वेळापत्रक</h2>
                            <p className="text-xs md:text-sm font-semibold text-slate-500 tracking-wide">Event Booking Calendar</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 md:p-2.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition-all shadow-sm"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Calendar Body Area */}
                <div className="relative flex-1 overflow-y-auto p-3 md:p-8 bg-white z-0">

                    {/* --- DAILY DETAILS OVERLAY --- */}
                    {selectedDateEvents && selectedDateObj && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-white/90 backdrop-blur-sm md:rounded-b-[2rem] animate-in fade-in duration-300">
                            <div className="bg-white border border-slate-200 shadow-2xl rounded-[1.5rem] p-5 md:p-6 w-full max-w-lg relative animate-in zoom-in-95 duration-300 max-h-full flex flex-col">

                                <button
                                    onClick={() => { setSelectedDateEvents(null); setSelectedDateObj(null); }}
                                    className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors z-10"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>

                                {/* Date Header */}
                                <div className="mb-5 border-b border-slate-100 pb-4 pr-8">
                                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                                        {selectedDateObj.getDate()} {monthNames[selectedDateObj.getMonth()]} {selectedDateObj.getFullYear()}
                                    </h3>
                                    <p className="text-sm font-bold text-slate-500 mt-1">दैनिक बुकिंग अहवाल (Daily Booking Report)</p>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                                    
                                    {/* --- SHIFT CAPACITY DASHBOARD --- */}
                                    <div className="mb-6">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                            <ClockIcon className="w-4 h-4 text-indigo-400" /> शिफ्ट्स क्षमता (Shift Capacity)
                                        </h4>
                                        <div className="space-y-3">
                                            {ALL_SHIFTS.map(shift => {
                                                const counts = calculateShiftCounts(selectedDateEvents);
                                                const currentCount = counts[shift];
                                                const isFull = currentCount >= MAX_BOOKINGS_PER_SHIFT;
                                                const percentage = Math.min((currentCount / MAX_BOOKINGS_PER_SHIFT) * 100, 100);

                                                return (
                                                    <div key={shift} className={`p-3 rounded-xl border ${isFull ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className={`font-bold text-sm ${isFull ? 'text-rose-800' : 'text-slate-700'}`}>{shift} शिफ्ट</span>
                                                            {isFull ? (
                                                                <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded shadow-sm uppercase tracking-wider animate-pulse">
                                                                    Booked Full
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                                                                    {currentCount} / {MAX_BOOKINGS_PER_SHIFT} Booked
                                                                </span>
                                                            )}
                                                        </div>
                                                        {/* Visual Progress Bar */}
                                                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                            <div 
                                                                className={`h-1.5 rounded-full ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* --- EVENTS LIST FOR THIS DATE --- */}
                                    <div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                            <UserIcon className="w-4 h-4 text-blue-400" /> बुकिंग तपशील (Bookings)
                                        </h4>
                                        
                                        {selectedDateEvents.length === 0 ? (
                                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                                <p className="text-sm font-bold text-slate-400">या तारखेला कोणतेही बुकिंग नाही.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {selectedDateEvents.map((event, idx) => {
                                                    const statusStyle = getStatusStyles(event.extendedProps?.status);
                                                    return (
                                                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-2 shadow-sm">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h5 className="font-bold text-slate-900 text-sm">{event.extendedProps?.customerName}</h5>
                                                                    <p className="text-xs font-medium text-slate-500">{event.extendedProps?.eventType}</p>
                                                                </div>
                                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
                                                                    {event.extendedProps?.status}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 mt-1 border-t border-slate-100 pt-2">
                                                                {event.extendedProps?.shifts?.map(s => (
                                                                    <span key={s} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                                                        {s}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>

                                </div>

                                <button
                                    onClick={() => { setSelectedDateEvents(null); setSelectedDateObj(null); }}
                                    className="mt-5 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors flex-shrink-0"
                                >
                                    बंद करा (Close)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Calendar Controls */}
                    <div className="flex items-center justify-between mb-4 md:mb-6 z-10 relative">
                        <h3 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight">
                            {monthNames[currentDate.getMonth()]} <span className="text-indigo-600">{currentDate.getFullYear()}</span>
                        </h3>
                        <div className="flex items-center gap-1 md:gap-2">
                            <button onClick={prevMonth} className="p-1.5 md:p-2 border-2 border-slate-200 rounded-lg md:rounded-xl hover:bg-slate-50 hover:border-indigo-300 transition-colors active:scale-95">
                                <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
                            </button>
                            <button onClick={nextMonth} className="p-1.5 md:p-2 border-2 border-slate-200 rounded-lg md:rounded-xl hover:bg-slate-50 hover:border-indigo-300 transition-colors active:scale-95">
                                <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 md:gap-3 z-10 relative">
                        {/* Weekday Headers */}
                        {daysOfWeek.map((day, idx) => (
                            <div key={idx} className="text-center text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider pb-1 md:pb-2 border-b-2 border-slate-100">
                                {day}
                            </div>
                        ))}

                        {/* Empty Slots for first day offset */}
                        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="min-h-[100px] md:min-h-[120px] rounded-xl md:rounded-2xl bg-slate-50/50 border border-transparent"></div>
                        ))}

                        {/* Days of the month */}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                            const date = idx + 1;
                            const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);

                            // Filter all events that match this specific day
                            const dayEvents = calendar?.filter((item) => {
                                const eventDate = new Date(item.start);
                                return (
                                    eventDate.getDate() === currentDay.getDate() &&
                                    eventDate.getMonth() === currentDay.getMonth() &&
                                    eventDate.getFullYear() === currentDay.getFullYear()
                                );
                            }) || [];

                            const hasEvent = dayEvents.length > 0;
                            const isToday = new Date().toDateString() === currentDay.toDateString();

                            // Calculate shifts to show visual warning on the calendar cell
                            const shiftCounts = calculateShiftCounts(dayEvents);
                            const anyShiftFull = Object.values(shiftCounts).some(count => count >= MAX_BOOKINGS_PER_SHIFT);

                            let cardBgClass = 'bg-white';
                            let cardBorderClass = 'border-slate-200';
                            let dateTextClass = 'text-slate-500';

                            if (hasEvent) {
                                // If any shift is full, color the card slightly red, otherwise use the first event's color
                                if(anyShiftFull) {
                                    cardBgClass = 'bg-rose-50';
                                    cardBorderClass = 'border-rose-300';
                                    dateTextClass = 'text-rose-800';
                                } else {
                                    const primaryStyle = getStatusStyles(dayEvents[0].extendedProps?.status);
                                    cardBgClass = primaryStyle.bg;
                                    cardBorderClass = primaryStyle.border;
                                    dateTextClass = primaryStyle.text;
                                }
                            } else if (isToday) {
                                cardBgClass = 'bg-indigo-50 shadow-[inset_0_0_0_2px_rgba(99,102,241,0.2)]';
                                cardBorderClass = 'border-indigo-200';
                                dateTextClass = 'text-indigo-700';
                            }

                            return (
                                <div
                                    key={date}
                                    onClick={() => {
                                        setSelectedDateEvents(dayEvents);
                                        setSelectedDateObj(currentDay);
                                    }}
                                    className={`relative flex flex-col min-h-[100px] md:min-h-[120px] p-1.5 md:p-2.5 rounded-xl md:rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer
                                        ${cardBgClass} ${cardBorderClass}
                                        hover:shadow-md hover:scale-[1.02] hover:z-10
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1 md:mb-1.5 pl-0.5">
                                        <span className={`text-xs md:text-sm font-black ${dateTextClass}`}>
                                            {date}
                                        </span>
                                        {anyShiftFull && (
                                            <ExclamationCircleIcon className="w-3.5 h-3.5 text-rose-500" title="A shift is full" />
                                        )}
                                    </div>

                                    {/* Event User Names inside the card */}
                                    <div className="flex flex-col gap-1 overflow-y-auto scrollbar-hide flex-1">
                                        {dayEvents.map((event, eventIdx) => {
                                            const statusStyle = getStatusStyles(event.extendedProps?.status);
                                            return (
                                                <div
                                                    key={event.id || eventIdx}
                                                    className={`flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[10px] font-bold truncate px-1.5 py-0.5 rounded ${statusStyle.text} bg-white/60 border border-white shadow-sm`}
                                                    title={event.extendedProps?.customerName}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} flex-shrink-0`}></span>
                                                    <span className="truncate leading-tight">{event.extendedProps?.customerName}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Tiny Shift Summary at bottom of cell if events exist */}
                                    {hasEvent && (
                                        <div className="mt-1 pt-1 border-t border-slate-200/50 flex flex-wrap gap-0.5 justify-start">
                                           {ALL_SHIFTS.map(s => {
                                               if(shiftCounts[s] > 0) {
                                                   return (
                                                       <div key={s} className={`text-[7px] md:text-[8px] font-black px-1 py-0.5 rounded-sm ${shiftCounts[s] >= MAX_BOOKINGS_PER_SHIFT ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                           {s.charAt(0)}: {shiftCounts[s]}
                                                       </div>
                                                   )
                                               }
                                               return null;
                                           })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 md:mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4 text-[10px] md:text-xs font-bold text-slate-500 pb-4 md:pb-0">
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-300"></span> Confirmed</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-amber-50 border border-amber-300"></span> Pending</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-blue-50 border border-blue-300"></span> Inquiry</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-rose-50 border border-rose-300"></span> Cancelled / Full Shift</div>
                    </div>

                </div>
            </div>
        </div>
    );
}