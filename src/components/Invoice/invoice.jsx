import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getConfirmedInvoices, getInvoiceDetails, searchInvoice, submitInvoice } from "./invoiceSlice";
import React from "react";
import {
    MagnifyingGlassIcon,
    ReceiptPercentIcon,
    UserIcon,
    PhoneIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    InboxIcon,
    BanknotesIcon,
    HashtagIcon,
    PrinterIcon,
    ClockIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import { BillingHistory } from "./BillingHistory/billingHistory";
import { QRCodeSVG } from "qrcode.react";
import logo from "../../assets/images/morayaorignal.png";

// 🚨 Helper: Recalculate everything (Per Plate, Per Shift Total, Grand Total, Balance, Payment Status)
const recalculateTotals = (shifts, discount, advance, isMerged, globalGuestCount) => {
    let perPlateSum = 0;
    let grandTotal = 0;

    shifts.forEach(shift => {
        let shiftPerPlate = 0;
        shift.categories?.forEach(cat => {
            if (cat.categoryPrice !== undefined && cat.categoryPrice !== null && cat.categoryPrice !== "") {
                shiftPerPlate += Number(cat.categoryPrice);
            } else {
                cat.selectedItems?.forEach(item => { shiftPerPlate += Number(item.price || 0); });
            }
        });

        shift.shiftPerPlate = shiftPerPlate;
        shift.shiftCalculatedTotal = shiftPerPlate * Number(shift.guestCount || globalGuestCount || 0);

        perPlateSum += shiftPerPlate;
        if (isMerged) {
            grandTotal += shift.shiftCalculatedTotal;
        }
    });

    if (!isMerged) {
        grandTotal = perPlateSum * Number(globalGuestCount || 0);
    }

    const finalBalance = grandTotal - Number(discount || 0) - Number(advance || 0);

    // 🚨 Auto Update Payment Status 
    let calcPaymentStatus = "Unpaid";
    if (finalBalance <= 0) calcPaymentStatus = "Partially Paid";
    else if (Number(advance) > 0) calcPaymentStatus = "Paid";

    return {
        shifts,
        perPlatePrice: perPlateSum,
        grandTotal: grandTotal,
        balanceAmount: finalBalance,
        paymentStatus: calcPaymentStatus
    };
};

export function Invoice() {
    const dispatch = useDispatch();

    const UPI_ID = "moryacaterers@upi";
    const UPI_NAME = "Morya Caterers";

    const generateUPIUrl = (amount, invoiceNo) => {
        const upiUrl = new URL("upi://pay");
        upiUrl.searchParams.set("pa", UPI_ID);
        upiUrl.searchParams.set("pn", UPI_NAME);
        upiUrl.searchParams.set("am", Number(amount || 0).toFixed(2));
        upiUrl.searchParams.set("cu", "INR");
        upiUrl.searchParams.set("tn", `Invoice ${invoiceNo || ""}`);
        return upiUrl.toString();
    };


    // --- Share Handlers ---
    const handleWhatsAppShare = () => {
        const message = `नमस्कार ${editableInvoice.customerName},\n\nतुमचे Morya Caterers चे बिल तयार आहे.\n\n*इन्व्हॉइस नंबर:* ${editableInvoice.invoiceNo}\n*इव्हेंट:* ${editableInvoice.eventType}\n*एकूण रक्कम:* ₹${editableInvoice.grandTotal?.toLocaleString('en-IN')}\n*बाकी रक्कम:* ₹${editableInvoice.balanceAmount?.toLocaleString('en-IN')}\n\nधन्यवाद!`;
        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/91${editableInvoice.mobile}?text=${encodedMessage}`;
        window.open(url, "_blank");
    };

    const handleEmailShare = () => {
        const subject = `Invoice ${editableInvoice.invoiceNo} - Morya Caterers`;
        const body = `नमस्कार ${editableInvoice.customerName},\n\nतुमचे Morya Caterers चे बिल तयार आहे.\n\nइन्व्हॉइस नंबर: ${editableInvoice.invoiceNo}\nइव्हेंट: ${editableInvoice.eventType}\nएकूण रक्कम: ₹${editableInvoice.grandTotal?.toLocaleString('en-IN')}\nबाकी रक्कम: ₹${editableInvoice.balanceAmount?.toLocaleString('en-IN')}\n\nधन्यवाद!`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const { invoices, loading } = useSelector((state) => state.invoice);
    const [name, setName] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [editableInvoice, setEditableInvoice] = useState(null);

    useEffect(() => {
        dispatch(getConfirmedInvoices());
    }, [dispatch]);

    const handleSearch = () => {
        if (!name.trim()) return;
        dispatch(searchInvoice(name));
    };

    // --- Group Invoices by Mobile Number ---
    const groupedInvoicesList = Object.values(
        [...invoices].reduce((acc, item) => {
            const key = item.mobile;
            if (!acc[key]) {
                acc[key] = {
                    ...item,
                    subOrders: [item],
                    allEventTypes: [item.eventType],
                    combinedGrandTotal: item.grandTotal || item.totalAmount || 0
                };
            } else {
                acc[key].subOrders.push(item);
                acc[key].combinedGrandTotal += (item.grandTotal || item.totalAmount || 0);
                if (!acc[key].allEventTypes.includes(item.eventType)) {
                    acc[key].allEventTypes.push(item.eventType);
                }
            }
            return acc;
        }, {})
    ).sort((a, b) => {
        const order = { "Unpaid": 0, "Partially Paid": 1, "Paid": 2 };
        return (order[a.paymentStatus] ?? 99) - (order[b.paymentStatus] ?? 99);
    });

    // --- Handle Click & Fetch Details ---
    // --- Handle Click & Fetch Details ---
    const handleInvoiceClick = async (groupedItem) => {
        // Check if any sub-order is not confirmed
        const hasUnconfirmed = groupedItem.subOrders.some(o => o.status !== "Confirmed");
        if (hasUnconfirmed) {
            setStatusMessage("⏳ काही ऑर्डर्स अद्याप Pending किंवा Cancelled आहेत. इन्व्हॉइस बनवता येणार नाही.");
            setEditableInvoice(null);
            return;
        }

        setStatusMessage(`सर्व इव्हेंट्सची माहिती मिळवत आहे...`);

        try {
            const response = await dispatch(getInvoiceDetails(groupedItem.mobile)).unwrap();
            const invoiceData = response.data;

            // 🚨 NEW LOGIC: Filter out "Paid" events. Only keep Pending/Unpaid.
            const pendingEvents = (invoiceData.events || []).filter(
                (ev) => ev.paymentStatus !== "Paid"
            );

            // If all events are somehow paid, stop and show a message
            if (pendingEvents.length === 0) {
                setStatusMessage("✅ या ग्राहकाचे सर्व इव्हेंट्स आधीच Paid आहेत. कोणतेही नवीन बिलिंग बाकी नाही.");
                setEditableInvoice(null);
                return;
            }

            // Use only the pending events for all further calculations[cite: 5]
            const events = pendingEvents;
            const isMerged = events.length > 1;

            let mergedShifts = [];
            let orderIds = [];
            let allEvents = [];
            let totalAdvance = 0;

            events.forEach(res => {
                orderIds.push(res.orderId);
                allEvents.push(res.eventType);
                totalAdvance += (Number(res.advance) || 0);

                const modifiedShifts = (res.shifts || []).map(s => ({
                    ...s,
                    shift: isMerged ? `${s.shift} - ${res.eventType} (${new Date(res.eventDate).toLocaleDateString('en-IN')})` : s.shift,
                    guestCount: Number(res.guestCount || 0)
                }));

                mergedShifts.push(...modifiedShifts);
            });

            const eventTypeStr = Array.from(new Set(allEvents)).join(" & ");
            const globalGuestCount = events.length === 1 ? (events[0].guestCount || 0) : 0;

            // Calculate Initial Totals accurately based ONLY on pending events[cite: 5]
            const calc = recalculateTotals(mergedShifts, 0, totalAdvance, isMerged, globalGuestCount);

            setEditableInvoice({
                customerName: invoiceData.customerName,
                mobile: invoiceData.mobile,
                orderIds,
                isMerged,
                shifts: calc.shifts,
                eventType: eventTypeStr,
                eventDate: events[0]?.eventDate || new Date().toISOString(),
                invoiceNo: events[0]?.invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
                paymentMethod: events[0]?.paymentMethod || "Cash",
                paymentStatus: calc.paymentStatus,
                estimationRefNo: events[0]?.estimationRefNo || "",
                advancePayment: totalAdvance,
                discount: 0,
                transactionId: events[0]?.transactionId || "",
                paymentDate: new Date().toISOString().split("T")[0],
                perPlatePrice: calc.perPlatePrice,
                guestCount: globalGuestCount,
                grandTotal: calc.grandTotal,
                balanceAmount: calc.balanceAmount
            });

            setStatusMessage("");
        } catch (error) {
            console.error("Failed to fetch mobile-wise details.", error);
            setStatusMessage("❌ माहिती मिळवण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
            setEditableInvoice(null);
        }
    };

    const handlePaymentConfirmation = async () => {
        const confirmed = window.confirm("Have you verified that the payment was received?");
        if (!confirmed) return;

        const payload = {
            orderId: editableInvoice.orderIds[0],
            invoiceNo: editableInvoice.invoiceNo,
            paymentStatus: "Paid",
            paymentMethod: "UPI / Online",
            advanceAmount: Number(editableInvoice.grandTotal),
            discount: Number(editableInvoice.discount || 0),
            finalAmount: 0,
            status: "success"
        };

        try {
            await dispatch(submitInvoice(payload)).unwrap();
            setEditableInvoice(prev => ({ ...prev, paymentStatus: "Paid", advancePayment: prev.grandTotal, balanceAmount: 0 }));
            alert("Payment confirmed. Billing generated successfully.");

            // 🚨 Refresh Invoice List UI
            dispatch(getConfirmedInvoices());

            setTimeout(() => window.print(), 500);
        } catch (error) {
            alert("Failed to generate billing.");
        }
    };

    const handleFieldChange = (field, value) => {
        setEditableInvoice(prev => {
            const updated = { ...prev, [field]: value };

            // Manual selection override
            if (field === 'paymentStatus') return updated;

            const calc = recalculateTotals(updated.shifts, updated.discount, updated.advancePayment, updated.isMerged, updated.guestCount);

            if (field === 'guestCount') return { ...updated, ...calc };

            if (['grandTotal', 'discount', 'advancePayment'].includes(field)) {
                updated.balanceAmount = calc.balanceAmount;
                updated.paymentStatus = calc.paymentStatus; // 🚨 Auto switch Payment Status
            }
            return updated;
        });
    };

    const handleShiftGuestChange = (shiftIndex, newGuests) => {
        setEditableInvoice(prev => {
            const updated = { ...prev };
            updated.shifts[shiftIndex].guestCount = Number(newGuests);
            const calc = recalculateTotals(updated.shifts, updated.discount, updated.advancePayment, updated.isMerged, updated.guestCount);
            return { ...updated, ...calc };
        });
    };

    const handleCategoryPriceChange = (shiftIndex, catIndex, newPrice) => {
        setEditableInvoice(prev => {
            const updated = { ...prev };
            updated.shifts[shiftIndex].categories[catIndex].categoryPrice = Number(newPrice);
            const calc = recalculateTotals(updated.shifts, updated.discount, updated.advancePayment, updated.isMerged, updated.guestCount);
            return { ...updated, ...calc };
        });
    };

    const handlePriceChange = (shiftIndex, catIndex, itemIndex, newPrice) => {
        setEditableInvoice(prev => {
            const updated = { ...prev };
            updated.shifts[shiftIndex].categories[catIndex].selectedItems[itemIndex].price = Number(newPrice);

            const newCatSum = updated.shifts[shiftIndex].categories[catIndex].selectedItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
            updated.shifts[shiftIndex].categories[catIndex].categoryPrice = newCatSum;

            const calc = recalculateTotals(updated.shifts, updated.discount, updated.advancePayment, updated.isMerged, updated.guestCount);
            return { ...updated, ...calc };
        });
    };

    const handleSubmitAndPrint = async () => {
        const isConfirmed = window.confirm("Are you sure you want to submit the invoice?");
        if (!isConfirmed) return;

        const payload = {
            orderId: editableInvoice.orderIds[0],
            invoiceNo: editableInvoice.invoiceNo,
            invoiceDate: editableInvoice.paymentDate,
            customerName: editableInvoice.customerName,
            mobile: editableInvoice.mobile,
            paymentMode: editableInvoice.paymentMethod,
            paymentStatus: editableInvoice.paymentStatus,
            advanceAmount: Number(editableInvoice.advancePayment),
            discount: Number(editableInvoice.discount),
            gst: Number(editableInvoice.gst || 0),
            items: [],
            totalAmount: Number(editableInvoice.grandTotal), // 🚨 FIXED: Was perPlatePrice earlier
            finalAmount: Number(editableInvoice.balanceAmount),
            status: "success"
        };

        // 🚨 ADDED: Restore mapping items into payload to prevent empty array submit
        editableInvoice.shifts?.forEach((shift) => {
            shift.categories?.forEach((category) => {
                category.selectedItems?.forEach((item) => {
                    payload.items.push({ name: item.itemName, price: Number(item.price || 0) });
                });
            });
        });

        try {
            await dispatch(submitInvoice(payload)).unwrap();
            alert("Invoice Submitted Successfully");

            // 🚨 Refresh Invoice List UI to show updated payment status immediately
            dispatch(getConfirmedInvoices());

            window.print();
        } catch (err) {
            alert(err?.message || "Failed to submit invoice");
        }
    };

    if (showHistory) {
        return <BillingHistory onBack={() => setShowHistory(false)} />;
    }

    return (
        <div className="w-full bg-slate-50/50">
            {/* 🖨️ PRINT STYLES */}
            <style>{`
                @media print {
                    body, html, main, #root { 
                        background-color: white !important; 
                        -webkit-print-color-adjust: exact !important; 
                        color-adjust: exact !important;
                        margin: 0 !important; 
                        padding: 0 !important;
                        height: auto !important;
                        overflow: visible !important;
                    }
                    header, nav, aside, footer, 
                    .sidebar, .navbar, .drawer, [class*="sidebar"], [class*="header"] { display: none !important; }
                    .screen-layout { display: none !important; }
                    .print-layout {
                        display: block !important;
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100vw !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                    }
                    tr, td, th, .avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
                    table { page-break-inside: auto !important; }
                    @page { size: A4 portrait; margin: 15mm; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}</style>

            <div className="screen-layout relative min-h-screen font-sans text-slate-800 pb-20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-100/40 via-purple-50/40 to-emerald-50/40 pointer-events-none -z-10"></div>

                <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-8 md:py-10">
                    {statusMessage && (
                        <div className="mb-5 rounded-xl border border-yellow-300 bg-yellow-50 p-4 shadow-sm animate-in fade-in flex items-center gap-3">
                            <p className="font-semibold text-yellow-800">{statusMessage}</p>
                        </div>
                    )}

                    <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3 flex items-center justify-center md:justify-start gap-3">
                                <ReceiptPercentIcon className="w-10 h-10 text-indigo-600" />
                                इन्व्हॉइस <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">जनरेटर</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-lg">ग्राहकांची पक्की बिले (Invoices) संपादित करा आणि प्रिंट करा.</p>
                        </div>
                        <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 px-5 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95">
                            <ClockIcon className="w-6 h-6 text-indigo-500" /> बिलिंग इतिहास
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* 👈 LEFT SIDEBAR */}
                        <div className="w-full lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-6">
                            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[1.5rem] p-5 shadow-xl shadow-slate-200/50">
                                <div className="relative group mb-4">
                                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input type="text" value={name} placeholder="ग्राहकाचे नाव शोधा..." onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all" />
                                </div>
                                <button onClick={handleSearch} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3.5 rounded-xl font-black transition-all active:scale-95 shadow-md shadow-indigo-600/30">
                                    Search Invoice
                                </button>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[1.5rem] p-5 shadow-xl shadow-slate-200/50 flex-1 max-h-[600px] overflow-y-auto custom-scrollbar">
                                <h3 className="font-black text-slate-800 text-lg mb-4 flex justify-between items-center">
                                    इन्व्हॉइस यादी <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full">{groupedInvoicesList.length}</span>
                                </h3>

                                {!loading && groupedInvoicesList.length > 0 && (
                                    <div className="space-y-3">
                                        {groupedInvoicesList.map((item) => {
                                            const isActive = editableInvoice?.orderIds?.includes(item._id);
                                            const isPaid = item.paymentStatus === "Paid";
                                            const isMerged = item.subOrders.length > 1;

                                            return (
                                                <div key={item._id} onClick={() => { if (!isPaid) handleInvoiceClick(item); }} className={`p-4 rounded-2xl border-2 transition-all duration-200 ${isPaid ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed grayscale-[30%]" : isActive ? "bg-indigo-50 border-indigo-500 shadow-md ring-4 ring-indigo-50 cursor-pointer scale-[1.02]" : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm cursor-pointer"}`}>
                                                    <h4 className={`font-black text-lg truncate flex justify-between ${isActive ? "text-indigo-700" : "text-slate-800"}`}>
                                                        <p>{item.customerName}</p>
                                                        <p className="text-sm font-semibold text-slate-500">
                                                            {isMerged ? "Multiple Dates" : (item?.eventDate ? new Date(item.eventDate).toLocaleDateString("en-IN") : "-")}
                                                        </p>
                                                    </h4>
                                                    <div className="flex justify-between items-center mt-3">
                                                        <div className="flex gap-2">
                                                            {isMerged && (
                                                                <span className="text-[10px] font-black px-2 py-1 rounded-md bg-purple-100 text-purple-700 uppercase tracking-widest border border-purple-200">
                                                                    {item.subOrders.length} Events
                                                                </span>
                                                            )}
                                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${item.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                                                {item.paymentStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 👉 RIGHT MAIN PANEL */}
                        <div className="w-full lg:w-2/3">
                            {!editableInvoice && !loading && groupedInvoicesList.length > 0 && !statusMessage && (
                                <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400">
                                    <InboxIcon className="w-20 h-20 text-slate-300 mb-4" />
                                    <h2 className="text-2xl font-black text-slate-500 mb-2">इन्व्हॉइस निवडा</h2>
                                    <p className="font-medium text-slate-400">एकाच व्यक्तीचे अनेक इव्हेंट असतील तर ते एकत्र दिसतील.</p>
                                </div>
                            )}

                            {editableInvoice && !loading && (
                                <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                                    <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                            <p className="font-bold text-indigo-800 text-sm">You are currently editing this invoice</p>
                                        </div>
                                        <button onClick={handleSubmitAndPrint} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-600/30">
                                            <PrinterIcon className="w-5 h-5" /> Submit & Print
                                        </button>
                                    </div>

                                    <div className="p-6 md:p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 mb-8">
                                            <div className="space-y-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100 text-indigo-500"><UserIcon className="w-6 h-6" /></div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Customer Name</p>
                                                        <p className="font-black text-xl text-slate-800">{editableInvoice.customerName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-100 text-indigo-500"><PhoneIcon className="w-6 h-6" /></div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Mobile Number</p>
                                                        <p className="font-bold text-slate-700 text-lg">{editableInvoice.mobile}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4 md:text-right flex flex-col md:items-end justify-center">
                                                <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-indigo-100 w-max text-left">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">Event Detail</p>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-black text-lg text-indigo-600 leading-tight">{editableInvoice.eventType}</span>
                                                        {!editableInvoice.isMerged && (
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
                                                                <span className="font-bold text-slate-600 text-sm">
                                                                    {new Date(editableInvoice.eventDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 mb-8">
                                            <h4 className="font-black text-slate-800 text-xl flex items-center gap-2">
                                                <DocumentTextIcon className="w-6 h-6 text-indigo-500" /> Order Details
                                            </h4>

                                            {/* 🚨 Shift and Sub-total calculations mapping */}
                                            {editableInvoice.shifts?.map((shift, shiftIndex) => (
                                                <div key={shiftIndex} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                                    <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
                                                        <h3 className="font-black text-slate-800 text-lg uppercase tracking-wider">{shift.shift}</h3>

                                                        {/* Show specific calculations if merged invoice */}
                                                        {editableInvoice.isMerged && (
                                                            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                                                                <div className="text-center border-r border-slate-200 pr-4">
                                                                    <span className="text-[10px] uppercase text-slate-500 font-bold block mb-0.5">Guests</span>
                                                                    <input type="number" value={shift.guestCount || 0} onChange={(e) => handleShiftGuestChange(shiftIndex, e.target.value)} className="w-16 px-1 py-1 text-sm outline-none text-center font-black text-slate-800 bg-slate-50 border border-slate-200 rounded-md" />
                                                                </div>
                                                                <div className="text-center border-r border-slate-200 pr-4">
                                                                    <span className="text-[10px] uppercase text-slate-500 font-bold block mb-0.5">Per Plate</span>
                                                                    <span className="text-sm font-black text-indigo-600">₹{shift.shiftPerPlate}</span>
                                                                </div>
                                                                <div className="text-center">
                                                                    <span className="text-[10px] uppercase text-indigo-500 font-bold block mb-0.5">Total</span>
                                                                    <span className="text-sm font-black text-indigo-700">₹{shift.shiftCalculatedTotal?.toLocaleString('en-IN')}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-5 bg-white space-y-5">
                                                        {shift.categories?.map((category, catIndex) => {
                                                            const currentCatPrice = category.categoryPrice !== undefined && category.categoryPrice !== null && category.categoryPrice !== "" ? category.categoryPrice : category.selectedItems.reduce((acc, item) => acc + Number(item.price || 0), 0);
                                                            return (
                                                                <div key={catIndex} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <h4 className="text-sm font-black text-indigo-700 uppercase tracking-widest bg-indigo-100 px-3 py-1 rounded-md">{category.category}</h4>
                                                                        <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm">
                                                                            <span className="bg-slate-100 px-3 py-2 text-slate-500 text-xs font-bold border-r border-slate-300 uppercase tracking-wider">Total ₹</span>
                                                                            <input type="number" value={currentCatPrice} onChange={(e) => handleCategoryPriceChange(shiftIndex, catIndex, e.target.value)} className="w-24 px-3 py-2 text-sm outline-none text-right font-black text-slate-800" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="overflow-hidden bg-white border border-slate-200 rounded-lg">
                                                                        <table className="w-full text-left border-collapse">
                                                                            <tbody className="divide-y divide-slate-100">
                                                                                {category.selectedItems?.map((item, index) => (
                                                                                    <tr key={index} className="hover:bg-slate-50">
                                                                                        <td className="py-2.5 px-4 font-semibold text-slate-600 text-sm">
                                                                                            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>{item.itemName}</span>
                                                                                        </td>
                                                                                        <td className="py-2.5 px-4 text-right">
                                                                                            <div className="flex items-center justify-end gap-2">
                                                                                                <span className="font-bold text-slate-400 text-sm">₹</span>
                                                                                                <input type="number" value={item.price || 0} onChange={(e) => handlePriceChange(shiftIndex, catIndex, index, e.target.value)} className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-right font-bold text-slate-800 text-sm outline-none" />
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 p-6 md:p-8 rounded-3xl shadow-sm">

                                            {/* 🚨 Math Row Adjustments for Merged Invoices */}
                                            {editableInvoice.isMerged ? (
                                                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8">
                                                    <div className="px-4 border-l-4 border-indigo-500">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Merged Events</p>
                                                        <p className="text-xl font-black text-indigo-700">{editableInvoice.orderIds.length} इव्हेंट्स एकत्र केले</p>
                                                    </div>
                                                    <div className="text-center px-4 hidden md:block">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Combined Per Plate Total</p>
                                                        <p className="text-2xl font-black text-slate-800">₹{editableInvoice.perPlatePrice?.toLocaleString('en-IN')}</p>
                                                    </div>
                                                    <div className="text-indigo-300 font-light text-3xl hidden md:block">=</div>
                                                    <div className="text-center bg-indigo-100 px-6 py-3 rounded-xl border border-indigo-200">
                                                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Combined Grand Total</p>
                                                        <p className="text-2xl font-black text-indigo-700">₹{editableInvoice.grandTotal.toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8">
                                                    <div className="text-center px-4">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">प्रति थाळी (Per Plate)</p>
                                                        <p className="text-2xl font-black text-slate-800">₹{editableInvoice.perPlatePrice?.toLocaleString('en-IN')}</p>
                                                    </div>
                                                    <div className="text-indigo-300 font-light text-3xl">×</div>
                                                    <div className="text-center px-4">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">पाहुणे (Guests)</p>
                                                        <input type="number" value={editableInvoice.guestCount} onChange={(e) => handleFieldChange('guestCount', e.target.value)} className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-2xl font-black text-slate-800 outline-none focus:border-indigo-500 text-center" />
                                                    </div>
                                                    <div className="text-indigo-300 font-light text-3xl">=</div>
                                                    <div className="text-center bg-indigo-100 px-6 py-3 rounded-xl border border-indigo-200">
                                                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Calculated Total</p>
                                                        <p className="text-2xl font-black text-indigo-700">₹{editableInvoice.grandTotal?.toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Dropdowns Status Control */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><BanknotesIcon className="w-4 h-4" /> Payment Method</label>
                                                    <select value={editableInvoice.paymentMethod} onChange={(e) => handleFieldChange('paymentMethod', e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                                                        <option>Cash</option><option>UPI / Online</option><option>Bank Transfer</option><option>Cheque</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><ReceiptPercentIcon className="w-4 h-4" /> Payment Status</label>
                                                    <select value={editableInvoice.paymentStatus} onChange={(e) => handleFieldChange('paymentStatus', e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                                                        <option>Paid</option><option>Unpaid</option><option>Partially Paid</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 border-b border-slate-200 pb-8">
                                                <div className="flex flex-col bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Grand Total</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl font-bold text-slate-400">₹</span>
                                                        <input type="number" value={editableInvoice.grandTotal} onChange={(e) => handleFieldChange('grandTotal', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xl font-black text-slate-800 outline-none" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                    <label className="text-xs font-black text-rose-500 uppercase tracking-widest mb-2">Discount (-)</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl font-bold text-rose-400">₹</span>
                                                        <input type="number" value={editableInvoice.discount} onChange={(e) => handleFieldChange('discount', e.target.value)} className="w-full bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xl font-bold text-rose-700 outline-none" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
                                                    <label className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">Advance (-)</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl font-bold text-emerald-400">₹</span>
                                                        <input type="number" value={editableInvoice.advancePayment} onChange={(e) => handleFieldChange('advancePayment', e.target.value)} className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xl font-bold text-emerald-700 outline-none" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                                                <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-sm shadow-md">
                                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Final Summary</h4>
                                                    <div className="flex justify-between items-center mb-2 text-sm">
                                                        <span className="font-bold text-slate-500">Grand Total</span>
                                                        <span className="font-black text-slate-700">₹{Number(editableInvoice.grandTotal || 0).toLocaleString('en-IN')}</span>
                                                    </div>
                                                    {Number(editableInvoice.discount) > 0 && (
                                                        <div className="flex justify-between items-center mb-2 text-sm"><span className="font-bold text-rose-500">Discount</span><span className="font-black text-rose-600">- ₹{Number(editableInvoice.discount).toLocaleString('en-IN')}</span></div>
                                                    )}
                                                    {Number(editableInvoice.advancePayment) > 0 && (
                                                        <div className="flex justify-between items-center mb-4 text-sm"><span className="font-bold text-emerald-600">Advance Paid</span><span className="font-black text-emerald-700">- ₹{Number(editableInvoice.advancePayment).toLocaleString('en-IN')}</span></div>
                                                    )}
                                                    <div className="flex justify-between items-center pt-4 border-t border-dashed border-slate-200">
                                                        <span className="text-lg font-black text-slate-900 uppercase">Balance</span>
                                                        <span className="text-2xl font-black text-indigo-600">₹{Number(editableInvoice.balanceAmount || 0).toLocaleString('en-IN')}</span>
                                                    </div>
                                                </div>

                                              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
    {Number(editableInvoice.balanceAmount || 0) > 0 && (
        <div className="flex flex-col items-center gap-3">
            {/* QR Code */}
            <div className="text-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm w-full">
                <QRCodeSVG value={generateUPIUrl(editableInvoice.balanceAmount, editableInvoice.invoiceNo)} size={110} level="H" includeMargin={false} className="mx-auto" />
                <p className="text-[10px] font-black mt-2 text-slate-700 tracking-widest uppercase">Scan & Pay</p>
            </div>
            
            {/* Share Buttons */}
            <div className="flex gap-2 w-full">
                <button 
                    onClick={handleWhatsAppShare}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border border-green-200 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                </button>
                <button 
                    onClick={handleEmailShare}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-200 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Email
                </button>
            </div>
        </div>
    )}

    <button onClick={handlePaymentConfirmation} className="flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-emerald-500/30 h-full min-h-[140px]">
        <CheckCircleIcon className="w-10 h-10" /><span>Payment<br />Received</span>
    </button>
</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 🖨️ PRINT ONLY LAYOUT */}
            {editableInvoice && (
                <div className="print-layout hidden print:block bg-white text-black font-sans">
                    <div className="text-center border-b-[3px] border-gray-800 pb-4 mb-6 mt-4 avoid-break">
                        <h1 className="text-4xl font-black uppercase text-gray-900 tracking-wider"><img src={logo} alt="Morya Caterers" className="h-28 m-auto" onError={(e) => e.target.style.display = 'none'} /></h1>
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mt-1">Tax Invoice / Bill</p>
                    </div>

                    <div className="flex justify-between items-start mb-8 text-sm avoid-break">
                        <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl w-[48%]">
                            <p className="mb-2"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Customer Name</span> <strong className="text-lg">{editableInvoice.customerName}</strong></p>
                            <p className="mb-1"><span className="font-bold">Mobile:</span> {editableInvoice.mobile}</p>
                            <p className="mb-1"><span className="font-bold">Events:</span> {editableInvoice.eventType}</p>
                        </div>
                        <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl w-[48%] text-right">
                            <p className="mb-2"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Invoice No</span> <strong className="text-lg">{editableInvoice.invoiceNo}</strong></p>
                            <p className="mb-1"><span className="font-bold">Date:</span> {new Date(editableInvoice.paymentDate).toLocaleDateString("en-IN")}</p>
                            <p className="mb-1"><span className="font-bold">Payment Method:</span> {editableInvoice.paymentMethod}</p>
                            <p className="mb-1"><span className="font-bold">Status:</span> {editableInvoice.paymentStatus}</p>
                        </div>
                    </div>

                    <div className="mb-8 space-y-6">
                        {editableInvoice.shifts?.map((shift, sIdx) => {
                            if (!shift.categories || shift.categories.length === 0) return null;
                            return (
                                <div key={sIdx} className="border border-gray-300 rounded-xl overflow-hidden avoid-break">
                                    <div className="bg-gray-800 text-white px-4 py-2 border-b border-gray-300 flex justify-between items-center">
                                        <h3 className="font-black tracking-wider text-sm">{shift.shift}</h3>

                                        {/* 🚨 Print layout details for multiple invoices */}
                                        {editableInvoice.isMerged && (
                                            <div className="text-xs font-bold flex gap-4 text-gray-300 bg-gray-900 px-3 py-1 rounded-lg border border-gray-700">
                                                <span>Guests: <span className="text-white">{shift.guestCount}</span></span>
                                                <span>₹/Plate: <span className="text-white">₹{shift.shiftPerPlate}</span></span>
                                                <span>Total: <span className="text-white">₹{shift.shiftCalculatedTotal?.toLocaleString('en-IN')}</span></span>
                                            </div>
                                        )}
                                    </div>
                                    <table className="w-full text-left border-collapse">
                                        <tbody>
                                            {shift.categories?.map((cat, cIdx) => {
                                                const catTotal = cat.categoryPrice !== undefined && cat.categoryPrice !== null && cat.categoryPrice !== "" ? cat.categoryPrice : cat.selectedItems.reduce((acc, item) => acc + Number(item.price || 0), 0);
                                                return (
                                                    <React.Fragment key={cIdx}>
                                                        <tr className="bg-gray-100 avoid-break border-b-2 border-gray-200">
                                                            <td className="py-2 px-4 text-sm font-black text-gray-800 uppercase">{cat.category}</td>
                                                            <td className="py-2 px-4 text-sm font-black text-gray-800 text-right w-32">₹{catTotal}</td>
                                                        </tr>
                                                        {/* हॉरिझॉन्टल लिस्ट लेआउट */}
                                                        <tr className="border-b border-gray-200 last:border-0 avoid-break">
                                                            <td colSpan={2} className="py-3 px-4 text-sm font-semibold text-gray-700 leading-relaxed">
                                                                {cat.selectedItems?.map((item) => item.itemName).join(", ")}
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end mb-12 avoid-break">
                        <div className="bg-gray-50 border border-gray-300 rounded-xl p-5 w-full max-w-sm">
                            {!editableInvoice.isMerged && (
                                <>
                                    <div className="flex justify-between items-center mb-2"><span className="text-sm font-bold text-gray-500">प्रति थाळी (Per Plate)</span><span className="text-base font-black text-gray-700">₹{editableInvoice.perPlatePrice?.toLocaleString('en-IN')}</span></div>
                                    <div className="flex justify-between items-center mb-4"><span className="text-sm font-bold text-gray-500">पाहुण्यांची संख्या (Guests)</span><span className="text-base font-black text-gray-700">× {editableInvoice.guestCount}</span></div>
                                </>
                            )}
                            <div className={`flex justify-between items-center pb-2 ${!editableInvoice.isMerged ? 'pt-3 border-t border-gray-300' : ''}`}>
                                <span className="text-base font-black text-gray-800 uppercase tracking-wider">Grand Total</span>
                                <span className="text-xl font-black text-gray-900">₹{editableInvoice.grandTotal?.toLocaleString('en-IN')}</span>
                            </div>
                            {editableInvoice.discount > 0 && <div className="flex justify-between items-center pt-1 pb-1 text-gray-600"><span className="text-sm font-bold uppercase tracking-wider">Discount</span><span className="text-base font-black">- ₹{editableInvoice.discount?.toLocaleString('en-IN')}</span></div>}
                            {editableInvoice.advancePayment > 0 && <div className="flex justify-between items-center pt-1 pb-2 text-gray-600"><span className="text-sm font-bold uppercase tracking-wider">Advance Paid</span><span className="text-base font-black">- ₹{editableInvoice.advancePayment?.toLocaleString('en-IN')}</span></div>}
                            <div className="flex justify-between items-center pt-3 border-t border-gray-400 mt-2">
                                <span className="text-lg font-black text-gray-900 uppercase tracking-wider">Balance Due</span>
                                <span className="text-2xl font-black text-gray-900">₹{editableInvoice.balanceAmount?.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}