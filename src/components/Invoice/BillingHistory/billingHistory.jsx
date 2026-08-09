import React, { useState } from "react";
import { useSelector } from "react-redux";
import { 
    ArrowLeftIcon, 
    MagnifyingGlassIcon, 
    DocumentTextIcon, 
    CheckCircleIcon, 
    ClockIcon 
} from "@heroicons/react/24/outline";

export function BillingHistory({ onBack }) {
    const { invoices, loading } = useSelector((state) => state.invoice);
    const [searchTerm, setSearchTerm] = useState("");

    // फिल्टरिंग: नाव, मोबाईल किंवा इन्व्हॉइस नंबर ने शोधण्यासाठी
    const filteredHistory = invoices?.filter(inv => 
        inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        inv.mobile?.includes(searchTerm) ||
        inv.status?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="relative min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-20 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-100/40 via-purple-50/40 to-emerald-50/40 pointer-events-none -z-10"></div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-8 md:py-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack}
                            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-1 flex items-center gap-3">
                                <ClockIcon className="w-8 h-8 text-indigo-600" />
                                बिलिंग <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">इतिहास</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-sm">
                                जनरेट केलेले सर्व इन्व्हॉइस आणि त्यांचा इतिहास.
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-96">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="नाव किंवा मोबाईल ने शोधा..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium shadow-sm transition-all"
                        />
                    </div>
                </div>

                {/* History List */}
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 p-6 md:p-8">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">
                            <DocumentTextIcon className="w-16 h-16 mx-auto text-slate-300 mb-3" />
                            <h3 className="text-xl font-bold text-slate-700">कोणतेही बिल आढळले नाही</h3>
                            <p className="text-sm mt-1">इतिहास रिकामा आहे किंवा शोधलेले नाव अस्तित्वात नाही.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="border-b-2 border-slate-100 bg-slate-50/50">
                                        <th className="py-4 px-5 text-sm font-black text-slate-400 uppercase tracking-wider">Customer</th>
                                        <th className="py-4 px-5 text-sm font-black text-slate-400 uppercase tracking-wider">Event Date</th>
                                        <th className="py-4 px-5 text-sm font-black text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-5 text-sm font-black text-slate-400 uppercase tracking-wider">Payment</th>
                                        <th className="py-4 px-5 text-sm font-black text-slate-400 uppercase tracking-wider text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredHistory.map((inv, idx) => (
                                        <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                                            <td className="py-4 px-5">
                                                <p className="font-bold text-slate-800 text-base">{inv.customerName}</p>
                                                <p className="text-xs font-semibold text-slate-500">{inv.mobile}</p>
                                            </td>
                                            <td className="py-4 px-5 font-semibold text-slate-700">
                                                {inv.eventDate ? new Date(inv.eventDate).toLocaleDateString("en-IN") : "-"}
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className={`text-xs font-bold px-3 py-1.5 rounded-md ${inv.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <span className={`text-xs font-bold px-3 py-1.5 rounded-md ${
                                                    inv.paymentStatus === "Paid" ? "bg-green-100 text-green-700 flex items-center gap-1 w-max" 
                                                    : inv.paymentStatus === "Partially Paid" ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-rose-100 text-rose-700"
                                                }`}>
                                                    {inv.paymentStatus === "Paid" && <CheckCircleIcon className="w-3.5 h-3.5" />}
                                                    {inv.paymentStatus || "Unpaid"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-right">
                                                <span className="font-black text-lg text-slate-900">
                                                    ₹{inv.grandTotal?.toLocaleString("en-IN") || inv.totalAmount?.toLocaleString("en-IN") || "0"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}