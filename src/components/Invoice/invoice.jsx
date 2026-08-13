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
    MapPinIcon,
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
import logo from "../../assets/images/morayaorignal.png"


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

    const { invoices, invoiceDetails, loading } = useSelector((state) => state.invoice);
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

    const handleInvoiceClick = (item) => {
        if (item.status !== "Confirmed") {
            switch (item.status) {
                case "Pending":
                    setStatusMessage("⏳ This order is Pending. Invoice can be generated only after confirmation.");
                    break;
                case "Inquiry":
                    setStatusMessage("📞 This order is in Inquiry status. Please confirm the order first.");
                    break;
                case "Cancel":
                    setStatusMessage("❌ This order has been Cancelled. Invoice cannot be generated.");
                    break;
                default:
                    setStatusMessage("Invoice cannot be generated.");
            }
            setEditableInvoice(null);
            return;
        }

        setStatusMessage("");
        dispatch(getInvoiceDetails(item._id));
    };

    useEffect(() => {
        if (invoiceDetails && invoiceDetails.status === "Confirmed") {
            let perPlatePrice = 0;
            invoiceDetails.shifts?.forEach(shift => {
                shift.categories?.forEach(cat => {
                    if (cat.categoryPrice !== undefined && cat.categoryPrice !== "") {
                        perPlatePrice += Number(cat.categoryPrice);
                    } else {
                        cat.selectedItems?.forEach(item => {
                            perPlatePrice += Number(item.price || 0);
                        });
                    }
                });
            });

            const guestCount = Number(invoiceDetails.guestCount || 0);
            const calculatedGrandTotal = perPlatePrice * guestCount;
            const advanceAmount = Number(invoiceDetails.advance || invoiceDetails.advancePayment || 0);
            const discount = Number(invoiceDetails.discount || 0);
            const finalGrandTotal = invoiceDetails.grandTotal || calculatedGrandTotal;

            setEditableInvoice({
                ...JSON.parse(JSON.stringify(invoiceDetails)),
                orderId: invoiceDetails.id,
                invoiceNo: invoiceDetails.invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
                paymentMethod: invoiceDetails.paymentMethod || "Cash",
                paymentStatus: invoiceDetails.paymentStatus || "Paid",
                estimationRefNo: invoiceDetails.estimationRefNo || "",
                advancePayment: advanceAmount,
                discount: discount,
                transactionId: invoiceDetails.transactionId || "",
                paymentDate: invoiceDetails.paymentDate || new Date().toISOString().split("T")[0],
                perPlatePrice: perPlatePrice,
                guestCount: guestCount,
                grandTotal: finalGrandTotal,
                balanceAmount: finalGrandTotal - advanceAmount - discount
            });
        } else {
            setEditableInvoice(null);
        }
    }, [invoiceDetails]);

    const handlePaymentConfirmation = async () => {
        const confirmed = window.confirm("Have you verified that the payment was received?");
        if (!confirmed) return;

        const payload = {
            orderId: editableInvoice.orderId,
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
            setEditableInvoice(prev => ({
                ...prev,
                paymentStatus: "Paid",
                advancePayment: prev.grandTotal,
                balanceAmount: 0
            }));
            alert("Payment confirmed. Billing generated successfully.");
            setTimeout(() => window.print(), 500);
        } catch (error) {
            alert("Failed to generate billing.");
        }
    };

    const handleFieldChange = (field, value) => {
        setEditableInvoice(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'guestCount') {
                updated.grandTotal = Number(updated.perPlatePrice || 0) * Number(value || 0);
            }
            if (['grandTotal', 'discount', 'advancePayment', 'guestCount'].includes(field)) {
                updated.balanceAmount = Number(updated.grandTotal || 0) - Number(updated.discount || 0) - Number(updated.advancePayment || 0);
            }
            return updated;
        });
    };

    const handleCategoryPriceChange = (shiftIndex, catIndex, newPrice) => {
        setEditableInvoice(prev => {
            const updated = { ...prev };
            updated.shifts[shiftIndex].categories[catIndex].categoryPrice = Number(newPrice);

            let perPlate = 0;
            updated.shifts.forEach((shift) => {
                shift.categories.forEach(cat => {
                    if (cat.categoryPrice !== undefined && cat.categoryPrice !== "") {
                        perPlate += Number(cat.categoryPrice);
                    } else {
                        cat.selectedItems.forEach(item => { perPlate += Number(item.price || 0); });
                    }
                });
            });

            updated.perPlatePrice = perPlate;
            updated.grandTotal = perPlate * Number(updated.guestCount || 0);
            updated.balanceAmount = updated.grandTotal - Number(updated.discount || 0) - Number(updated.advancePayment || 0);
            return updated;
        });
    };

    const handlePriceChange = (shiftIndex, catIndex, itemIndex, newPrice) => {
        setEditableInvoice(prev => {
            const updated = { ...prev };
            updated.shifts[shiftIndex].categories[catIndex].selectedItems[itemIndex].price = Number(newPrice);

            const newCatSum = updated.shifts[shiftIndex].categories[catIndex].selectedItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
            updated.shifts[shiftIndex].categories[catIndex].categoryPrice = newCatSum;

            let perPlate = 0;
            updated.shifts.forEach((shift) => {
                shift.categories.forEach(cat => {
                    if (cat.categoryPrice !== undefined && cat.categoryPrice !== "") {
                        perPlate += Number(cat.categoryPrice);
                    } else {
                        cat.selectedItems.forEach(item => { perPlate += Number(item.price || 0); });
                    }
                });
            });

            updated.perPlatePrice = perPlate;
            updated.grandTotal = perPlate * Number(updated.guestCount || 0);
            updated.balanceAmount = updated.grandTotal - Number(updated.discount || 0) - Number(updated.advancePayment || 0);
            return updated;
        });
    };

    const handleSubmitAndPrint = async () => {
        const isConfirmed = window.confirm("Are you sure you want to submit the invoice?");
        if (!isConfirmed) return;

        const payload = {
            orderId: invoiceDetails.id,
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
            totalAmount: Number(editableInvoice.perPlatePrice),
            finalAmount: Number(editableInvoice.balanceAmount),
            status: "success"
        };

        editableInvoice.shifts?.forEach((shift) => {
            shift.categories?.forEach((category) => {
                category.selectedItems?.forEach((item) => {
                    payload.items.push({ name: item.itemName, price: Number(item.price) });
                });
            });
        });

        try {
            await dispatch(submitInvoice(payload)).unwrap();
            alert("Invoice Submitted Successfully");
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
                    .sidebar, .navbar, .drawer, [class*="sidebar"], [class*="header"] {
                        display: none !important;
                    }
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
                    tr, td, th, .avoid-break {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    table { page-break-inside: auto !important; }
                    @page { size: A4 portrait; margin: 15mm; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}</style>

            {/* 🖥️ SCREEN LAYOUT */}
            <div className="screen-layout relative min-h-screen font-sans text-slate-800 pb-20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-100/40 via-purple-50/40 to-emerald-50/40 pointer-events-none -z-10"></div>

                <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-8 md:py-10">

                    {statusMessage && (
                        <div className="mb-5 rounded-xl border border-yellow-300 bg-yellow-50 p-4 shadow-sm animate-in fade-in flex items-center gap-3">
                            <p className="font-semibold text-yellow-800">{statusMessage}</p>
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3 flex items-center justify-center md:justify-start gap-3">
                                <ReceiptPercentIcon className="w-10 h-10 text-indigo-600" />
                                इन्व्हॉइस <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">जनरेटर</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-lg">ग्राहकांची पक्की बिले (Invoices) संपादित करा आणि प्रिंट करा.</p>
                        </div>
                        <button
                            onClick={() => setShowHistory(true)}
                            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 px-5 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95"
                        >
                            <ClockIcon className="w-6 h-6 text-indigo-500" />
                            बिलिंग इतिहास
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* 👈 LEFT SIDEBAR */}
                        <div className="w-full lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-6">
                            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[1.5rem] p-5 shadow-xl shadow-slate-200/50">
                                <div className="relative group mb-4">
                                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={name}
                                        placeholder="ग्राहकाचे नाव शोधा..."
                                        onChange={(e) => setName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-bold text-slate-700 transition-all"
                                    />
                                </div>
                                <button onClick={handleSearch} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3.5 rounded-xl font-black transition-all active:scale-95 shadow-md shadow-indigo-600/30">
                                    Search Invoice
                                </button>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[1.5rem] p-5 shadow-xl shadow-slate-200/50 flex-1 max-h-[600px] overflow-y-auto custom-scrollbar">
                                <h3 className="font-black text-slate-800 text-lg mb-4 flex justify-between items-center">
                                    इन्व्हॉइस यादी <span className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full">{invoices.length}</span>
                                </h3>
                                {loading && (
                                    <div className="flex justify-center py-8">
                                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                    </div>
                                )}
                                {!loading && invoices.length === 0 && (
                                    <div className="text-center py-10 text-slate-500">
                                        <MagnifyingGlassIcon className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                                        <p className="font-bold">कोणतेही इन्व्हॉइस आढळले नाही</p>
                                    </div>
                                )}
                                {!loading && invoices.length > 0 && (
                                    <div className="space-y-3">
                                        {[...invoices]
                                            .sort((a, b) => {
                                                const order = { "Unpaid": 0, "Partially Paid": 1, "Paid": 2 };
                                                return (order[a.paymentStatus] ?? 99) - (order[b.paymentStatus] ?? 99);
                                            })
                                            .map((item) => {
                                                const isActive = invoiceDetails?.id === item._id;
                                                const isPaid = item.paymentStatus === "Paid";
                                                return (
                                                    <div
                                                        key={item._id}
                                                        onClick={() => { if (!isPaid) handleInvoiceClick(item); }}
                                                        className={`p-4 rounded-2xl border-2 transition-all duration-200 ${isPaid ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed grayscale-[30%]"
                                                            : isActive ? "bg-indigo-50 border-indigo-500 shadow-md ring-4 ring-indigo-50 cursor-pointer scale-[1.02]"
                                                                : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm cursor-pointer"
                                                            }`}
                                                    >
                                                        <h4 className={`font-black text-lg truncate flex justify-between ${isActive ? "text-indigo-700" : "text-slate-800"}`}>
                                                            <p>{item.customerName}</p>
                                                            <p className="text-sm font-semibold text-slate-500">
                                                                {item?.eventDate ? new Date(item.eventDate).toLocaleDateString("en-IN") : "-"}
                                                            </p>
                                                        </h4>
                                                        <div className="flex justify-between items-center mt-3">
                                                            <div className="flex gap-2">
                                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${item.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                                                    {item.status}
                                                                </span>
                                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${item.paymentStatus === "Paid" ? "bg-green-100 text-green-700"
                                                                    : item.paymentStatus === "Partially Paid" ? "bg-yellow-100 text-yellow-700"
                                                                        : "bg-red-100 text-red-700"
                                                                    }`}>
                                                                    {item.paymentStatus || "Unpaid"}
                                                                </span>
                                                            </div>
                                                            <span className={`font-black text-lg ${isActive ? "text-indigo-700" : "text-slate-800"}`}>
                                                                ₹{item.grandTotal?.toLocaleString("en-IN") || item.totalAmount?.toLocaleString("en-IN")}
                                                            </span>
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
                            {!editableInvoice && !loading && invoices.length > 0 && !statusMessage && (
                                <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400">
                                    <InboxIcon className="w-20 h-20 text-slate-300 mb-4" />
                                    <h2 className="text-2xl font-black text-slate-500 mb-2">इन्व्हॉइस निवडा</h2>
                                    <p className="font-medium text-slate-400">सविस्तर माहिती पाहण्यासाठी डावीकडील यादीतून एखादी Confirmed ऑर्डर निवडा.</p>
                                </div>
                            )}

                            {editableInvoice && !loading && (
                                <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                                    {/* Top Submit Bar */}
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
                                        {/* Billing Control Panel */}
                                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 shadow-sm">
                                            <div>
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1"><HashtagIcon className="w-4 h-4" /> Invoice No</label>
                                                <input type="text" value={editableInvoice.invoiceNo} onChange={(e) => handleFieldChange('invoiceNo', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1"><BanknotesIcon className="w-4 h-4" /> Payment Method</label>
                                                <select value={editableInvoice.paymentMethod} onChange={(e) => handleFieldChange('paymentMethod', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all cursor-pointer">
                                                    <option>Cash</option><option>UPI / Online</option><option>Bank Transfer</option><option>Cheque</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1"><ReceiptPercentIcon className="w-4 h-4" /> Billing Status</label>
                                                <select value={editableInvoice.paymentStatus} onChange={(e) => handleFieldChange('paymentStatus', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all cursor-pointer">
                                                    <option>Paid</option><option>Unpaid</option><option>Partially Paid</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Payment Date</label>
                                                <input type="date" value={editableInvoice.paymentDate} onChange={(e) => handleFieldChange('paymentDate', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Transaction ID</label>
                                                <input type="text" placeholder="Txn ID if online" value={editableInvoice.transactionId} onChange={(e) => handleFieldChange('transactionId', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Est. Ref No.</label>
                                                <input type="text" placeholder="Ref No." value={editableInvoice.estimationRefNo} onChange={(e) => handleFieldChange('estimationRefNo', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all" />
                                            </div>
                                        </div>

                                        {/* Screen Customer Info */}
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
                                                <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-indigo-100 w-max">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">Event Detail</p>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-black text-lg text-indigo-600">{editableInvoice.eventType}</span>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                        <div className="flex items-center gap-1.5">
                                                            <CalendarDaysIcon className="w-5 h-5 text-slate-400" />
                                                            <span className="font-bold text-slate-700">
                                                                {new Date(editableInvoice.eventDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Shifts Editable Items */}
                                        <div className="space-y-6 mb-8">
                                            <h4 className="font-black text-slate-800 text-xl flex items-center gap-2">
                                                <DocumentTextIcon className="w-6 h-6 text-indigo-500" /> Order Details
                                            </h4>
                                            {editableInvoice.shifts?.map((shift, shiftIndex) => (
                                                <div key={shiftIndex} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                                    <div className="bg-slate-100 px-5 py-3 border-b border-slate-200">
                                                        <h3 className="font-black text-slate-800 text-lg uppercase tracking-wider">{shift.shift} Shift</h3>
                                                    </div>
                                                    <div className="p-5 bg-white space-y-5">
                                                        {shift.categories?.map((category, catIndex) => {
                                                            const currentCatPrice = category.categoryPrice !== undefined && category.categoryPrice !== ""
                                                                ? category.categoryPrice
                                                                : category.selectedItems.reduce((acc, item) => acc + Number(item.price || 0), 0);

                                                            return (
                                                                <div key={catIndex} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <h4 className="text-sm font-black text-indigo-700 uppercase tracking-widest bg-indigo-100 px-3 py-1 rounded-md">
                                                                            {category.category}
                                                                        </h4>
                                                                        <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                                                                            <span className="bg-slate-100 px-3 py-2 text-slate-500 text-xs font-bold border-r border-slate-300 uppercase tracking-wider">
                                                                                Total ₹
                                                                            </span>
                                                                            <input
                                                                                type="number"
                                                                                value={currentCatPrice}
                                                                                onChange={(e) => handleCategoryPriceChange(shiftIndex, catIndex, e.target.value)}
                                                                                className="w-24 px-3 py-2 text-sm outline-none text-right font-black text-slate-800"
                                                                                placeholder="0"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="overflow-hidden bg-white border border-slate-200 rounded-lg">
                                                                        <table className="w-full text-left border-collapse">
                                                                            <tbody className="divide-y divide-slate-100">
                                                                                {category.selectedItems?.map((item, index) => (
                                                                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                                                        <td className="py-2.5 px-4 font-semibold text-slate-600 text-sm">
                                                                                            <span className="flex items-center gap-2">
                                                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                                                                {item.itemName}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="py-2.5 px-4 text-right">
                                                                                            <div className="flex items-center justify-end gap-2">
                                                                                                <span className="font-bold text-slate-400 text-sm">₹</span>
                                                                                                <input
                                                                                                    type="number"
                                                                                                    value={item.price || 0}
                                                                                                    onChange={(e) => handlePriceChange(shiftIndex, catIndex, index, e.target.value)}
                                                                                                    className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-right font-bold text-slate-800 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                                                                                />
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

                                        {/* 🧮 Enhanced & Redesigned Calculation Module */}
                                        <div className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 p-6 md:p-8 rounded-3xl shadow-sm">

                                            {/* Math Row */}
                                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8">
                                                <div className="text-center px-4">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">प्रति थाळी (Per Plate)</p>
                                                    <p className="text-2xl font-black text-slate-800">₹{editableInvoice.perPlatePrice?.toLocaleString('en-IN')}</p>
                                                </div>
                                                <div className="text-indigo-300 font-light text-3xl">×</div>
                                                <div className="text-center px-4">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">पाहुणे (Guests)</p>
                                                    <input
                                                        type="number"
                                                        value={editableInvoice.guestCount}
                                                        onChange={(e) => handleFieldChange('guestCount', e.target.value)}
                                                        className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-2xl font-black text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-center transition-all"
                                                    />
                                                </div>
                                                <div className="text-indigo-300 font-light text-3xl">=</div>
                                                <div className="text-center bg-indigo-100 px-6 py-3 rounded-xl border border-indigo-200">
                                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">Calculated Total</p>
                                                    <p className="text-2xl font-black text-indigo-700">₹{(editableInvoice.perPlatePrice * editableInvoice.guestCount).toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>

                                            {/* Inputs for Totals */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 border-b border-slate-200 pb-8">
                                                <div className="flex flex-col bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Grand Total</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl font-bold text-slate-400">₹</span>
                                                        <input type="number" value={editableInvoice.grandTotal} onChange={(e) => handleFieldChange('grandTotal', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xl font-black text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                    <label className="text-xs font-black text-rose-500 uppercase tracking-widest mb-2">Discount (-)</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl font-bold text-rose-400">₹</span>
                                                        <input type="number" value={editableInvoice.discount} onChange={(e) => handleFieldChange('discount', e.target.value)} className="w-full bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xl font-bold text-rose-700 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-2 md:col-span-1">
                                                    <label className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">Advance (-)</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl font-bold text-emerald-400">₹</span>
                                                        <input type="number" value={editableInvoice.advancePayment} onChange={(e) => handleFieldChange('advancePayment', e.target.value)} className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xl font-bold text-emerald-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Final Summary & Actions */}
                                            <div className="flex flex-col md:flex-row justify-between items-end gap-8">

                                                {/* Summary Card replaces the "..." placeholder */}
                                                <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-sm shadow-md">
                                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Final Summary</h4>

                                                    <div className="flex justify-between items-center mb-2 text-sm">
                                                        <span className="font-bold text-slate-500">Grand Total</span>
                                                        <span className="font-black text-slate-700">₹{Number(editableInvoice.grandTotal || 0).toLocaleString('en-IN')}</span>
                                                    </div>

                                                    {Number(editableInvoice.discount) > 0 && (
                                                        <div className="flex justify-between items-center mb-2 text-sm">
                                                            <span className="font-bold text-rose-500">Discount</span>
                                                            <span className="font-black text-rose-600">- ₹{Number(editableInvoice.discount).toLocaleString('en-IN')}</span>
                                                        </div>
                                                    )}

                                                    {Number(editableInvoice.advancePayment) > 0 && (
                                                        <div className="flex justify-between items-center mb-4 text-sm">
                                                            <span className="font-bold text-emerald-600">Advance Paid</span>
                                                            <span className="font-black text-emerald-700">- ₹{Number(editableInvoice.advancePayment).toLocaleString('en-IN')}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center pt-4 border-t border-dashed border-slate-200">
                                                        <span className="text-lg font-black text-slate-900 uppercase">Balance</span>
                                                        <span className="text-2xl font-black text-indigo-600">
                                                            ₹{Number(editableInvoice.balanceAmount || 0).toLocaleString('en-IN')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                                    {/* UPI QR Code */}
                                                    {Number(editableInvoice.balanceAmount || 0) > 0 && (
                                                        <div className="text-center bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                                                            <QRCodeSVG
                                                                value={generateUPIUrl(editableInvoice.balanceAmount, editableInvoice.invoiceNo)}
                                                                size={110}
                                                                level="H"
                                                                includeMargin={false}
                                                            />
                                                            <p className="text-[10px] font-black mt-2 text-slate-700 tracking-widest uppercase">Scan & Pay</p>
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={handlePaymentConfirmation}
                                                        className="flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-emerald-500/30 h-full min-h-[140px]"
                                                    >
                                                        <CheckCircleIcon className="w-10 h-10" />
                                                        <span>Payment<br />Received</span>
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
                        <h1 className="text-4xl font-black uppercase text-gray-900 tracking-wider"><img src={logo} alt="" className="h-28" /></h1>
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mt-1">Tax Invoice / Bill</p>
                    </div>

                    <div className="flex justify-between items-start mb-8 text-sm avoid-break">
                        <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl w-[48%]">
                            <p className="mb-2"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Customer Name</span> <strong className="text-lg">{editableInvoice.customerName}</strong></p>
                            <p className="mb-1"><span className="font-bold">Mobile:</span> {editableInvoice.mobile}</p>
                            {editableInvoice.address && <p className="mb-1"><span className="font-bold">Address:</span> {editableInvoice.address}</p>}
                            <p className="mb-1"><span className="font-bold">Event Type:</span> {editableInvoice.eventType} ({new Date(editableInvoice.eventDate).toLocaleDateString("en-IN")})</p>
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
                                    <div className="bg-gray-800 text-white px-4 py-2 border-b border-gray-300">
                                        <h3 className="font-black tracking-wider uppercase text-sm">{shift.shift} Shift</h3>
                                    </div>
                                    <table className="w-full text-left border-collapse">
                                        <tbody>
                                            {shift.categories?.map((cat, cIdx) => {
                                                const catTotal = cat.categoryPrice !== undefined && cat.categoryPrice !== ""
                                                    ? cat.categoryPrice : cat.selectedItems.reduce((acc, item) => acc + Number(item.price || 0), 0);
                                                return (
                                                    <React.Fragment key={cIdx}>
                                                        <tr className="bg-gray-100 avoid-break border-b-2 border-gray-200">
                                                            <td className="py-2 px-4 text-sm font-black text-gray-800 uppercase">{cat.category}</td>
                                                            <td className="py-2 px-4 text-sm font-black text-gray-800 text-right w-32">₹{catTotal}</td>
                                                        </tr>
                                                        {cat.selectedItems?.map((item, iIdx) => (
                                                            <tr key={iIdx} className="border-b border-gray-100 last:border-0 avoid-break">
                                                                <td colSpan={2} className="py-1.5 px-4 text-sm font-bold text-gray-700">
                                                                    <span className="flex items-center gap-2">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>{item.itemName}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
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
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-gray-500">प्रति थाळी (Per Plate)</span>
                                <span className="text-base font-black text-gray-700">₹{editableInvoice.perPlatePrice?.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-bold text-gray-500">पाहुण्यांची संख्या (Guests)</span>
                                <span className="text-base font-black text-gray-700">× {editableInvoice.guestCount}</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 pb-2 border-t border-gray-300">
                                <span className="text-base font-black text-gray-800 uppercase tracking-wider">Grand Total</span>
                                <span className="text-xl font-black text-gray-900">₹{editableInvoice.grandTotal?.toLocaleString('en-IN')}</span>
                            </div>
                            {editableInvoice.discount > 0 && (
                                <div className="flex justify-between items-center pt-1 pb-1 text-gray-600">
                                    <span className="text-sm font-bold uppercase tracking-wider">Discount</span>
                                    <span className="text-base font-black">- ₹{editableInvoice.discount?.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            {editableInvoice.advancePayment > 0 && (
                                <div className="flex justify-between items-center pt-1 pb-2 text-gray-600">
                                    <span className="text-sm font-bold uppercase tracking-wider">Advance Paid</span>
                                    <span className="text-base font-black">- ₹{editableInvoice.advancePayment?.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-3 border-t border-gray-400 mt-2">
                                <span className="text-lg font-black text-gray-900 uppercase tracking-wider">Balance Due</span>
                                <span className="text-2xl font-black text-gray-900">₹{editableInvoice.balanceAmount?.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mt-16 pt-10 border-t border-gray-300 avoid-break">
                        <div className="text-center">
                            <div className="w-48 border-b-2 border-gray-800 mb-2"></div>
                            <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Customer Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="w-48 border-b-2 border-gray-800 mb-2"></div>
                            <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Manager / Owner</p>
                            <p className="text-xs font-semibold text-gray-500 mt-1">Morya Caterers</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}