import { useState, useEffect } from "react";
import {
    CalendarDaysIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TagIcon,
    ClockIcon,
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
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Get today's date and strip time for accurate past-date comparison
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const ALL_SHIFTS = ["सकाळ", "संध्याकाळ", "रात्र"];

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
            case "Cancelled":
                return { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-800", dot: "bg-rose-500" };
            case "Pending":
            default:
                return { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-800", dot: "bg-amber-500" };
        }
    };

    // --- Helper: Dynamic Animated Gradient for MIXED cards ---
    const getMixedGradientClasses = (statuses) => {
        const hasConfirmed = statuses.includes("Confirmed");
        const hasPending = statuses.includes("Pending");
        const hasInquiry = statuses.includes("Inquiry");

        let classes = [];

        if (hasConfirmed) classes.push("from-emerald-300");
        else if (hasPending) classes.push("from-amber-300");
        else if (hasInquiry) classes.push("from-blue-300");
        else classes.push("from-slate-300");

        if (hasConfirmed && hasPending && hasInquiry) {
            classes.push("via-amber-300");
        } else if (hasPending && hasInquiry) {
            classes.push("via-blue-300");
        }

        if (hasInquiry && !classes.includes("from-blue-300") && !classes.includes("via-blue-300")) classes.push("to-blue-300");
        else if (hasPending && !classes.includes("from-amber-300")) classes.push("to-amber-300");
        else classes.push("to-indigo-300");

        return classes.join(" ");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
            <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[95vh]">

                {/* Modal Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-center justify-between flex-shrink-0 z-20 relative">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm border border-indigo-200/50">
                            <CalendarDaysIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800">तारीख निवडा</h2>
                            <p className="text-sm font-semibold text-slate-500 tracking-wide">Select Event Date</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition-all shadow-sm"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Calendar Body Area */}
                <div className="relative flex-1 overflow-y-auto p-5 md:p-8 bg-white z-0">

                    {/* Event Details Overlay (Shows when an event is clicked) */}
                    {selectedEvent && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-white/70 backdrop-blur-md rounded-b-[2rem] animate-in fade-in duration-300">
                            <div className="bg-white border border-slate-200 shadow-2xl rounded-[1.5rem] p-6 w-full max-w-sm relative animate-in zoom-in-95 duration-300">

                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>

                                <div className="mb-6">
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold mb-4
                                        ${getStatusStyles(selectedEvent.extendedProps?.status).bg} 
                                        ${getStatusStyles(selectedEvent.extendedProps?.status).border} 
                                        ${getStatusStyles(selectedEvent.extendedProps?.status).text}`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusStyles(selectedEvent.extendedProps?.status).dot}`}></span>
                                        {selectedEvent.extendedProps?.status} Order
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight">
                                        {selectedEvent.extendedProps?.customerName}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <TagIcon className="w-5 h-5 text-indigo-500" />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">कार्यक्रम (Event)</p>
                                            <p className="font-bold text-slate-800">{selectedEvent.extendedProps?.eventType}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <CalendarDaysIcon className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">तारीख (Date)</p>
                                            <p className="font-bold text-slate-800">
                                                {new Date(selectedEvent.start).toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <ClockIcon className="w-5 h-5 text-amber-500 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">शिफ्ट्स (Shifts)</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedEvent.extendedProps?.shifts?.map((shift, idx) => (
                                                    <span key={idx} className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                                                        {shift}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="mt-6 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Calendar Controls */}
                    <div className="flex items-center justify-between mb-6 z-10 relative">
                        <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                            {monthNames[currentDate.getMonth()]} <span className="text-indigo-600">{currentDate.getFullYear()}</span>
                        </h3>
                        <div className="flex items-center gap-2">
                            <button onClick={prevMonth} className="p-2 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-300 transition-colors active:scale-95">
                                <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
                            </button>
                            <button onClick={nextMonth} className="p-2 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-300 transition-colors active:scale-95">
                                <ChevronRightIcon className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1.5 md:gap-3 z-10 relative">
                        {/* Weekday Headers */}
                        {daysOfWeek.map((day, idx) => (
                            <div key={idx} className="text-center text-xs font-black text-slate-400 uppercase tracking-wider pb-2 border-b-2 border-slate-100">
                                {day}
                            </div>
                        ))}

                        {/* Empty Slots for first day offset */}
                        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="h-24 md:h-32 rounded-2xl bg-slate-50/50 border border-transparent"></div>
                        ))}

                        {/* Days of the month */}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                            const date = idx + 1;
                            const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);

                            // RULE 1: Filter events for this specific day AND IGNORE CANCELLED EVENTS!
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

                            const hasEvent = dayEvents.length > 0;
                            const isToday = new Date().toDateString() === currentDay.toDateString();

                            // RULE 2: ONLY 'Confirmed' Events block the shifts.
                            const confirmedShifts = new Set();
                            dayEvents.forEach((event) => {
                                if (event.extendedProps?.status === "Confirmed" && Array.isArray(event.extendedProps?.shifts)) {
                                    event.extendedProps.shifts.forEach((shift) => confirmedShifts.add(shift));
                                }
                            });

                            const isFullyBooked = confirmedShifts.size === ALL_SHIFTS.length;
                            const availableShifts = ALL_SHIFTS.filter((shift) => !confirmedShifts.has(shift));

                            // Check conditions for selection rule
                            const isPastDate = currentDay < todayDate;
                            const isSelectable = !isPastDate && !isFullyBooked; // It is selectable if not past and not fully booked

                            // Find unique statuses for the Mixed Color logic
                            const uniqueStatuses = Array.from(new Set(dayEvents.map(e => e.extendedProps?.status)));
                            const isMixed = uniqueStatuses.length > 1;

                            // Determine whole card style
                            let cardBgClass = 'bg-white';
                            let cardBorderClass = 'border-slate-200';
                            let dateTextClass = 'text-slate-500';

                            if (hasEvent) {
                                if (!isMixed) {
                                    const primaryStyle = getStatusStyles(uniqueStatuses[0]);
                                    cardBgClass = primaryStyle.bg;
                                    cardBorderClass = primaryStyle.border;
                                    dateTextClass = primaryStyle.text;
                                } else {
                                    cardBgClass = 'bg-white';
                                    cardBorderClass = 'border-indigo-300 shadow-md shadow-indigo-100/50';
                                    dateTextClass = 'text-indigo-900';
                                }
                            } else if (isPastDate) {
                                cardBgClass = 'bg-slate-50';
                                cardBorderClass = 'border-slate-100';
                                dateTextClass = 'text-slate-300';
                            } else if (isToday) {
                                cardBgClass = 'bg-indigo-50 shadow-[inset_0_0_0_2px_rgba(99,102,241,0.2)]';
                                cardBorderClass = 'border-indigo-200';
                                dateTextClass = 'text-indigo-700';
                            }

                            return (
                                <div
                                    key={date}
                                    onClick={() => {
                                        // RULE 3: Select Date logic
                                        // If the date is valid (not past & not fully booked by confirmed events), select it and CLOSE modal immediately.
                                        if (isSelectable) {
                                            handleDateSelect(currentDay, Array.from(confirmedShifts));
                                            onClose(); // Automatically close the calendar upon selection!
                                        }
                                    }}
                                    className={`relative flex flex-col h-24 md:h-32 p-1.5 md:p-2 rounded-2xl border transition-all duration-300 overflow-hidden
                                        ${cardBgClass} ${cardBorderClass}
                                        ${!isSelectable && !hasEvent ? 'cursor-not-allowed opacity-60' : ''}
                                        ${isSelectable ? 'cursor-pointer hover:border-indigo-400 hover:shadow-md hover:scale-[1.02] hover:z-10' : ''}
                                    `}
                                >
                                    {/* DYNAMIC MIXED ANIMATED GRADIENT */}
                                    {isMixed && (
                                        <div className={`absolute inset-0 bg-gradient-to-br ${getMixedGradientClasses(uniqueStatuses)} opacity-30 animate-pulse pointer-events-none -z-0`}></div>
                                    )}

                                    <span className={`relative z-10 text-xs md:text-sm font-black mb-1 shrink-0 ${dateTextClass}`}>
                                        {date}
                                    </span>

                                    {/* Event User Names inside the card */}
                                    <div className="relative z-10 flex flex-col gap-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 flex-1 pb-1">
                                        {dayEvents.map((event, eventIdx) => {
                                            const statusStyle = getStatusStyles(event.extendedProps?.status);
                                            return (
                                                <div
                                                    key={event.id || eventIdx}
                                                    onClick={(e) => {
                                                        // Stop Propagation: This ensures clicking the event name just opens details and DOES NOT select the date
                                                        e.stopPropagation();
                                                        setSelectedEvent(event);
                                                    }}
                                                    className={`flex items-center gap-1.5 text-[9px] md:text-[11px] font-bold truncate px-1.5 py-1 rounded-md border bg-white/90 backdrop-blur-sm shadow-sm cursor-pointer hover:opacity-80 hover:scale-[1.02] transition-all active:scale-95 shrink-0 ${statusStyle.text} ${statusStyle.border}`}
                                                    title={event.extendedProps?.customerName}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} flex-shrink-0`}></span>
                                                    <span className="truncate">{event.extendedProps?.customerName}</span>
                                                </div>
                                            );
                                        })}

                                        {/* --- SHIFTS AVAILABILITY BADGES --- */}
                                        {!isPastDate && confirmedShifts.size > 0 && !isFullyBooked && (
                                            <div className="mt-auto pt-1 shrink-0 pointer-events-none">
                                                <span className="bg-emerald-100/90 backdrop-blur-sm text-emerald-800 border border-emerald-300 text-[8px] md:text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm w-full block truncate text-center">
                                                    उपलब्ध: {availableShifts.join(', ')}
                                                </span>
                                            </div>
                                        )}

                                        {!isPastDate && isFullyBooked && (
                                            <div className="mt-auto pt-1 shrink-0 pointer-events-none">
                                                <span className="bg-rose-100/90 backdrop-blur-sm text-rose-800 border border-rose-300 text-[8px] md:text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm w-full block truncate text-center">
                                                    संपूर्ण बुक
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-[10px] md:text-xs font-bold text-slate-500">
                        <div className="text-rose-500 flex items-center gap-1.5">
                            * मागील तारखा आणि संपूर्ण बुक (Full Booked) झालेल्या तारखा निवडता येणार नाहीत.
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-300"></span> Confirmed</div>
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-amber-50 border border-amber-300"></span> Pending</div>
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-blue-50 border border-blue-300"></span> Inquiry</div>
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-indigo-50 border border-indigo-300"></span> Mixed / Animated</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}