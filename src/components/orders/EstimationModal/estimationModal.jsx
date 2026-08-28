import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // नेव्हिगेशनसाठी जोडले
import { 
    XMarkIcon, 
    PrinterIcon, 
    DocumentTextIcon, 
    SparklesIcon,
    ArrowLeftIcon, // Back बटणसाठी
    ReceiptPercentIcon // Invoice बटणसाठी
} from "@heroicons/react/24/outline";
import logo from "../../../assets/images/morayaorignal.png";

export function EstimationModal({ order, onClose }) {
    const navigate = useNavigate(); // राऊटर नेव्हिगेशन हुक
    const [withPrice, setWithPrice] = useState(true);

    if (!order) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleGoToInvoice = () => {
        onClose(); // आधी मॉडेल बंद करा
        navigate("/invoice"); // नंतर इनव्हॉइस पेजवर रीडायरेक्ट करा
    };

    // --- Calculations ---
    const calculatePerPlatePrice = (order) => {
        let total = 0;
        order.shifts?.forEach((shift) => {
            shift.categories?.forEach((category) => {
                if (category.categoryPrice !== undefined && category.categoryPrice !== "") {
                    total += Number(category.categoryPrice);
                } else {
                    category.selectedItems?.forEach((item) => {
                        total += Number(item.price || 0);
                    });
                }
            });
        });
        return total;
    };

    const perPlatePrice = calculatePerPlatePrice(order);
    const grandTotal = Number(order.grandTotal || 0);
    const advance = Number(order.advance || 0);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 print:absolute print:inset-auto print:top-0 print:left-0 print:w-full print:h-auto print:block print:bg-white print:p-0 printable-modal-wrapper">

            {/* The ULTIMATE print fix for multi-page Data Leakage & Overlapping */}
            <style>{`
                @media print {
                    html, body { height: auto !important; overflow: visible !important; background: white !important; font-size: 12px !important; }
                    body * { visibility: hidden; }
                    * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; print-color-adjust: exact !important; }
                    .printable-modal-wrapper, .printable-modal-wrapper * { visibility: visible; }
                    .printable-modal-wrapper { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; height: auto !important; display: block !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
                    tr, td, th, .avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
                    table { page-break-inside: auto !important; }
                    /* Reduced margin to 8mm to fit more content on a single page */
                    @page { size: A4 portrait; margin: 8mm; }
                }
            `}</style>

            {/* Modal Container */}
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden print:block print:w-full print:h-auto print:max-h-none print:shadow-none print:rounded-none print:overflow-visible print:border-none pt-10 print:pt-2">

                {/* Header - Hidden on Print */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 print:hidden">
                    
                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 font-bold text-sm transition-all shadow-sm">
                            <ArrowLeftIcon className="w-4 h-4" /> मागे जा
                        </button>
                        <button onClick={handleGoToInvoice} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl hover:bg-indigo-100 font-bold text-sm transition-all shadow-sm">
                            <ReceiptPercentIcon className="w-4 h-4" /> इनव्हॉइस पेज
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Toggle Switch */}
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                            <span className={`text-sm font-bold ${!withPrice ? 'text-indigo-600' : 'text-slate-400'}`}>Without Price</span>
                            <button
                                onClick={() => setWithPrice(!withPrice)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${withPrice ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${withPrice ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <span className={`text-sm font-bold ${withPrice ? 'text-indigo-600' : 'text-slate-400'}`}>With Price</span>
                        </div>

                        <button onClick={handlePrint} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200">
                            <PrinterIcon className="w-5 h-5" /> Print
                        </button>
                        <button onClick={onClose} className="p-2.5 rounded-full bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-200">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Area - Decreased padding for print */}
                <div className="flex-1 overflow-y-auto p-8 print:block print:h-auto print:overflow-visible print:p-2">
                    <div className="max-w-4xl mx-auto print:scale-[0.98] print:origin-top">

                        {/* Bill Header */}
                        <div className="text-center border-b-[3px] border-slate-800 pb-6 print:pb-3 mb-8 print:mb-4 avoid-break flex justify-between items-center">
                            <div>
                                {/* Shrunk Logo for print */}
                                <img src={logo} alt="Morya Caterers" className="h-28 m-auto print:h-16" />
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm print:text-xs mt-2 font-semibold text-left">
                                    टिळक स्मारक हॉल टिळक चौक सांगली <br />
                                    महाराष्ट्र ४१६४१६ <br /> संपर्क: +91 7887777093
                                </p>
                            </div>
                        </div>

                        {/* Customer & Event Details */}
                        <div className="grid grid-cols-2 gap-8 print:gap-4 mb-8 print:mb-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 print:bg-transparent print:border-none print:p-0 avoid-break">
                            <div>
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 print:mb-0.5">ग्राहकाचे नाव</p>
                                <p className="text-xl print:text-base font-black text-slate-800">{order.customerName}</p>
                                <p className="text-sm print:text-xs font-bold text-slate-500 mt-1 print:mt-0">मोबाईल: {order.mobile}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 print:mb-0.5">कार्यक्रमाचा तपशील</p>
                                <p className="text-xl print:text-base font-black text-slate-800">{order.eventType || "इतर कार्यक्रम"}</p>
                                <p className="text-sm print:text-xs font-bold text-slate-500 mt-1 print:mt-0">
                                    दिनांक: {new Date(order.eventDate).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Selected Services (Chips) */}
                        {order.services && order.services.length > 0 && (
                            <div className="mb-8 print:mb-4 avoid-break">
                                <h4 className="text-sm print:text-xs font-black text-slate-800 flex items-center gap-2 print:gap-1 mb-3 print:mb-1.5">
                                    <SparklesIcon className="w-5 h-5 print:w-4 print:h-4 text-indigo-500" /> निवडलेल्या सेवा (Services)
                                </h4>
                                <div className="flex flex-wrap gap-2 print:gap-1">
                                    {order.services.map((service, idx) => (
                                        <span key={idx} className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-1.5 print:px-2 print:py-0.5 rounded-full text-sm print:text-[10px] font-bold">
                                            {service}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Menu Breakdown */}
                        <div className="space-y-8 print:space-y-3 mb-10 print:mb-4">
                            {order.shifts?.map((shift, sIdx) => {
                                if (!shift.categories || shift.categories.length === 0) return null;

                                return (
                                    <div key={sIdx} className="border border-slate-200 rounded-2xl print:rounded-lg overflow-hidden print:border-slate-300 avoid-break">
                                        <div className="bg-slate-800 text-white px-5 py-3 print:px-3 print:py-1.5 flex items-center justify-between print:bg-slate-100 print:text-slate-800 print:border-b print:border-slate-300">
                                            <h3 className="font-black text-lg print:text-sm tracking-wide uppercase">{shift.shift} Shift</h3>
                                        </div>

                                        <div className="bg-white">
                                            <table className="w-full text-left border-collapse">
                                                <tbody>
                                                    {shift.categories?.map((cat, cIdx) => {
                                                        const catTotal = cat.categoryPrice !== undefined && cat.categoryPrice !== "" 
                                                            ? cat.categoryPrice 
                                                            : cat.selectedItems.reduce((acc, item) => acc + Number(item.price || 0), 0);

                                                        return (
                                                        <React.Fragment key={cIdx}>
                                                            <tr className="bg-slate-50 print:bg-transparent avoid-break">
                                                                <td colSpan={withPrice ? 1 : 2} className="py-2.5 px-5 print:py-1 print:px-3 text-sm print:text-[11px] font-black text-indigo-600 border-b border-slate-200 bg-indigo-50/50 print:border-b print:border-slate-300 print:text-slate-800">
                                                                    {cat.category}
                                                                </td>
                                                                {withPrice && (
                                                                    <td className="py-2.5 px-5 print:py-1 print:px-3 text-sm print:text-[11px] font-black text-indigo-600 border-b border-slate-200 bg-indigo-50/50 print:border-b print:border-slate-300 print:text-slate-800 text-right w-32 print:w-20">
                                                                        ₹{catTotal}
                                                                    </td>
                                                                )}
                                                            </tr>
                                                            {cat.selectedItems?.map((item, iIdx) => (
                                                                <tr key={iIdx} className="border-b border-slate-100 last:border-b-0 print:border-slate-200 avoid-break">
                                                                    <td colSpan={2} className="py-2.5 px-5 print:py-1 print:px-3 text-sm print:text-xs font-bold text-slate-700">
                                                                        <span className="flex items-center gap-2">
                                                                            <span className="w-1.5 h-1.5 print:w-1 print:h-1 rounded-full bg-slate-400 print:bg-slate-600"></span>
                                                                            {item.itemName}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </React.Fragment>
                                                    )})}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary & Totals (Always shows Guest Count) */}
                        <div className="flex justify-end mb-12 print:mb-4 avoid-break">
                            <div className="bg-slate-50 rounded-2xl print:rounded-lg p-6 print:p-3 w-full max-w-sm border border-slate-200 print:border-slate-300 print:bg-transparent">
                                
                                {withPrice && (
                                    <div className="flex justify-between items-center mb-2 print:mb-1">
                                        <span className="text-sm print:text-xs font-bold text-slate-500">प्रति थाळी (Per Plate)</span>
                                        <span className="text-base print:text-sm font-black text-slate-700">₹{perPlatePrice}</span>
                                    </div>
                                )}
                                
                                {/* Guest Count (नेहमी दिसेल) */}
                                <div className="flex justify-between items-center mb-4 print:mb-1">
                                    <span className="text-sm print:text-xs font-bold text-slate-500">पाहुण्यांची संख्या (Guests)</span>
                                    <span className="text-base print:text-sm font-black text-slate-700">× {order.guestCount || 0}</span>
                                </div>

                                {withPrice && (
                                    <>
                                        <div className="flex justify-between items-center pt-3 print:pt-1 pb-2 print:pb-1 border-t border-slate-300 print:border-slate-400">
                                            <span className="text-base print:text-sm font-black text-slate-800 uppercase tracking-wider">Grand Total</span>
                                            <span className="text-xl print:text-base font-black text-indigo-600 print:text-slate-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                                        </div>

                                        {advance > 0 && (
                                            <div className="flex justify-between items-center pt-2 print:pt-0.5 pb-2 print:pb-0.5 text-emerald-600 print:text-emerald-700">
                                                <span className="text-sm print:text-[11px] font-bold uppercase tracking-wider">Advance Paid</span>
                                                <span className="text-lg print:text-sm font-black">- ₹{advance.toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Signatures Area */}
                        <div className="flex justify-between items-end mt-16 print:mt-4 pt-10 print:pt-4 border-t border-slate-200 print:border-slate-300 avoid-break">
                            <div className="text-center">
                                <div className="w-48 print:w-32 border-b-2 border-slate-800 mb-2 print:mb-1"></div>
                                <p className="text-sm print:text-[10px] font-bold text-slate-600 uppercase tracking-widest">ग्राहकाची सही</p>
                                <p className="text-xs print:text-[9px] font-semibold text-slate-400 mt-1 print:mt-0">(Customer Signature)</p>
                            </div>
                            <div className="text-center">
                                <div className="w-48 print:w-32 border-b-2 border-slate-800 mb-2 print:mb-1"></div>
                                <p className="text-sm print:text-[10px] font-bold text-slate-600 uppercase tracking-widest">मॅनेजर / मालक</p>
                                <p className="text-xs print:text-[9px] font-semibold text-slate-400 mt-1 print:mt-0">Morya Caterers</p>
                            </div>
                        </div>

                        {/* Footer Notes */}
                        <div className="text-center mt-12 print:mt-4 pt-6 print:pt-2 pb-4 print:pb-0 opacity-70 avoid-break">
                            <p className="text-[11px] print:text-[9px] font-bold text-slate-400">टीप: हे एस्टिमेशन आहे. प्रत्यक्ष बिलामध्ये गरजेनुसार बदल असू शकतो.</p>
                            <p className="text-[11px] print:text-[9px] font-bold text-slate-400 mt-1 print:mt-0">आपल्या विश्वासाबद्दल धन्यवाद!</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}