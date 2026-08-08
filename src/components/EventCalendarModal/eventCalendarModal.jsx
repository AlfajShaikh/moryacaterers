import { useState, useEffect } from "react";
import {
    CalendarDaysIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    UserIcon,
    TagIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { getCalendar } from "../Home/homeSlice"; // Adjust path if necessary

export function EventCalendarModal({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const { calendar } = useSelector((state) => state.dashboard);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        if (isOpen) {
            dispatch(getCalendar());
            setSelectedEvent(null);
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
        setSelectedEvent(null);
    };
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedEvent(null);
    };

    // --- Helper: Status Colors for the WHOLE CARD ---
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
            {/* Modal Container: Full screen on mobile, rounded on desktop */}
            <div className="bg-white rounded-none md:rounded-[2rem] w-full h-full md:h-auto md:max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col md:max-h-[95vh]">

                {/* Modal Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-4 md:p-5 flex items-center justify-between flex-shrink-0 z-20 relative">
                    <div className="flex items-center gap-3">
                        <div className="p-2 md:p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm border border-indigo-200/50">
                            <CalendarDaysIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-slate-800">कार्यक्रमाचे वेळापत्रक</h2>
                            <p className="text-xs md:text-sm font-semibold text-slate-500 tracking-wide">Event Schedule</p>
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

                    {/* Event Details Overlay */}
                    {selectedEvent && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm md:rounded-b-[2rem] animate-in fade-in duration-300">
                            <div className="bg-white border border-slate-200 shadow-2xl rounded-[1.5rem] p-5 md:p-6 w-full max-w-sm relative animate-in zoom-in-95 duration-300">

                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>

                                <div className="mb-5">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold mb-3
                                        ${getStatusStyles(selectedEvent.extendedProps.status).bg} 
                                        ${getStatusStyles(selectedEvent.extendedProps.status).border} 
                                        ${getStatusStyles(selectedEvent.extendedProps.status).text}`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusStyles(selectedEvent.extendedProps.status).dot}`}></span>
                                        {selectedEvent.extendedProps.status} Order
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                                        {selectedEvent.extendedProps.customerName}
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <TagIcon className="w-5 h-5 text-indigo-500" />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">कार्यक्रम (Event)</p>
                                            <p className="font-bold text-sm text-slate-800">{selectedEvent.extendedProps.eventType}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <CalendarDaysIcon className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">तारीख (Date)</p>
                                            <p className="font-bold text-sm text-slate-800">
                                                {new Date(selectedEvent.start).toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <ClockIcon className="w-5 h-5 text-amber-500 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">शिफ्ट्स (Shifts)</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedEvent.extendedProps.shifts?.map((shift, idx) => (
                                                    <span key={idx} className="bg-white border border-slate-200 text-slate-700 text-[11px] font-bold px-2 py-1 rounded-md shadow-sm">
                                                        {shift}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="mt-6 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors"
                                >
                                    Close Details
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
                            <div key={`empty-${idx}`} className="min-h-[100px] md:min-h-[112px] rounded-xl md:rounded-2xl bg-slate-50/50 border border-transparent"></div>
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

                            // Determine whole card style based on first event status (if any)
                            let cardBgClass = 'bg-white';
                            let cardBorderClass = 'border-slate-200';
                            let dateTextClass = 'text-slate-500';

                            if (hasEvent) {
                                const primaryStyle = getStatusStyles(dayEvents[0].extendedProps?.status);
                                cardBgClass = primaryStyle.bg;
                                cardBorderClass = primaryStyle.border;
                                dateTextClass = primaryStyle.text;
                            } else if (isToday) {
                                cardBgClass = 'bg-indigo-50 shadow-[inset_0_0_0_2px_rgba(99,102,241,0.2)]';
                                cardBorderClass = 'border-indigo-200';
                                dateTextClass = 'text-indigo-700';
                            }

                            return (
                                <div
                                    key={date}
                                    onClick={() => hasEvent && setSelectedEvent(dayEvents[0])}
                                    className={`relative flex flex-col min-h-[100px] md:min-h-[112px] p-1 md:p-2 rounded-xl md:rounded-2xl border transition-all duration-300 overflow-hidden
                                        ${cardBgClass} ${cardBorderClass}
                                        ${hasEvent ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] hover:z-10' : 'hover:bg-slate-50 hover:border-slate-300'}
                                    `}
                                >
                                    <span className={`text-xs md:text-sm font-black mb-1 md:mb-1.5 pl-0.5 ${dateTextClass}`}>
                                        {date}
                                    </span>

                                    {/* Event User Names inside the card */}
                                    <div className="flex flex-col gap-1 overflow-y-auto scrollbar-hide flex-1">
                                        {dayEvents.map((event, eventIdx) => {
                                            const statusStyle = getStatusStyles(event.extendedProps?.status);
                                            return (
                                                <div
                                                    key={event.id || eventIdx}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedEvent(event);
                                                    }}
                                                    className={`flex items-center gap-1 md:gap-1.5 text-[10px] md:text-[11px] font-bold truncate px-1 py-0.5 rounded cursor-pointer hover:bg-slate-900/10 transition-colors ${statusStyle.text} bg-white/40 border border-white/40 shadow-sm`}
                                                    title={event.extendedProps?.customerName}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} flex-shrink-0`}></span>
                                                    <span className="truncate leading-tight">{event.extendedProps?.customerName}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 md:mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4 text-[10px] md:text-xs font-bold text-slate-500 pb-4 md:pb-0">
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-300"></span> Confirmed</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-amber-50 border border-amber-300"></span> Pending</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-blue-50 border border-blue-300"></span> Inquiry</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-rose-50 border border-rose-300"></span> Cancelled</div>
                    </div>

                </div>
            </div>
        </div>
    );
}