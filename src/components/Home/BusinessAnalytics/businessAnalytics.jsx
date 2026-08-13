import React, { useState, useEffect } from "react";
import { 
    ArrowLeftIcon, 
    ChartBarIcon, 
    CurrencyRupeeIcon, 
    ShoppingBagIcon, 
    UsersIcon,
    StarIcon,
    FireIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { getAnalytics } from "./businessAnalyticsSlice";

// तुमचा Redux action import करा (पाथ योग्य असल्याची खात्री करा)

export function BusinessAnalytics() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [timeRange, setTimeRange] = useState("6months");

    // Redux State
    const { data, loading, error } = useSelector((state) => state.analytics);

    // Fetch Analytics Data on component mount
    useEffect(() => {
        dispatch(getAnalytics());
    }, [dispatch]);

    // --- DATA MAPPING LOGIC (API ते UI) ---
    const summary = data?.summary || {};
    const orderStatus = data?.orderStatus || {};
    const shiftsData = data?.shifts || [];
    const revenueStats = data?.revenue || {};
    const popularItems = data?.popularItems || [];
    const topCustomers = data?.topCustomers || [];

    // १. महसूल आणि ऑर्डर्स (Revenue Trend) - Time Range नुसार बदल
    let chartRevenueData = [];
    if (revenueStats) {
        if (timeRange === "1month" && revenueStats.dayWise) {
            chartRevenueData = revenueStats.dayWise.map(d => ({
                name: new Date(d.date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' }),
                revenue: d.revenue,
                orders: d.invoiceCount
            }));
        } else if (timeRange === "6months" && revenueStats.monthWise) {
            chartRevenueData = revenueStats.monthWise.map(d => ({
                name: new Date(d.month + "-01").toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                revenue: d.revenue,
                orders: d.invoiceCount
            }));
        } else if (timeRange === "1year" && revenueStats.yearWise) {
            chartRevenueData = revenueStats.yearWise.map(d => ({
                name: d.year,
                revenue: d.revenue,
                orders: d.invoiceCount
            }));
        }
    }

    // २. ऑर्डर स्थिती (Order Status)
    const orderStatusData = [
        { name: "Confirmed", value: orderStatus.Confirmed || 0, color: "#10b981" }, // Emerald
        { name: "Pending", value: orderStatus.Pending || 0, color: "#f59e0b" },   // Amber
        { name: "Inquiry", value: orderStatus.Inquiry || 0, color: "#3b82f6" },   // Blue
        { name: "Cancelled", value: orderStatus.Cancel || 0, color: "#ef4444" },  // Red
    ].filter(item => item.value > 0); // फक्त ० पेक्षा जास्त मूल्य असलेले दाखवा

    // ३. लोकप्रिय शिफ्ट्स (Shifts)
    const formattedShiftData = shiftsData.map(s => ({
        name: s.shift,
        events: s.bookings
    }));

    // --- Custom Tooltip ---
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200 p-4 rounded-xl shadow-lg">
                    <p className="font-bold text-slate-800 mb-2">{label}</p>
                    <p className="text-indigo-600 font-semibold text-sm">
                        Revenue: ₹{(payload[0]?.value || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-emerald-600 font-semibold text-sm">
                        Orders: {payload[1]?.value || 0}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-opacity-75"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-red-500 font-bold text-lg">Error loading analytics data: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans relative overflow-hidden">
            
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-100/50 via-purple-100/20 to-transparent pointer-events-none -z-10"></div>

            <div className="max-w-7xl mx-auto space-y-6 relative z-10">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
                                <ChartBarIcon className="w-7 h-7 text-indigo-600" />
                                व्यवसाय विश्लेषण (Analytics)
                            </h1>
                            <p className="text-slate-500 font-medium text-sm mt-1">
                                तुमच्या केटरिंग व्यवसायाचा आलेख आणि आकडेवारी
                            </p>
                        </div>
                    </div>

                    {/* Time Range Filter */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === "1month" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            onClick={() => setTimeRange("1month")}
                        >
                            1 Month
                        </button>
                        <button 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === "6months" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            onClick={() => setTimeRange("6months")}
                        >
                            6 Months
                        </button>
                        <button 
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === "1year" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                            onClick={() => setTimeRange("1year")}
                        >
                            1 Year
                        </button>
                    </div>
                </div>

                {/* --- KPI SUMMARY CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
                        <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 bg-white/20 rounded-xl"><CurrencyRupeeIcon className="w-6 h-6"/></div>
                        </div>
                        <p className="text-indigo-100 font-semibold mb-1 relative z-10">Total Revenue</p>
                        <h3 className="text-3xl font-black relative z-10">₹{(summary.totalRevenue || 0).toLocaleString('en-IN')}</h3>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
                        <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 bg-white/20 rounded-xl"><ShoppingBagIcon className="w-6 h-6"/></div>
                        </div>
                        <p className="text-emerald-100 font-semibold mb-1 relative z-10">Total Orders</p>
                        <h3 className="text-3xl font-black relative z-10">{summary.totalOrders || 0}</h3>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
                        <div className="absolute right-[-10%] top-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 bg-white/20 rounded-xl"><UsersIcon className="w-6 h-6"/></div>
                        </div>
                        <p className="text-purple-100 font-semibold mb-1 relative z-10">Average Order Value</p>
                        <h3 className="text-3xl font-black relative z-10">₹{(summary.averageOrderValue || 0).toLocaleString('en-IN')}</h3>
                    </div>
                </div>

                {/* --- CHARTS SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Main Area Chart (Revenue Trend) */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">महसूल आणि ऑर्डर्सचा आलेख (Revenue Trend)</h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₹${value >= 1000 ? value/1000 + 'k' : value}`} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut Chart (Order Statuses) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">ऑर्डर स्थिती (Order Status)</h3>
                        {orderStatusData.length > 0 ? (
                            <>
                                <div className="flex-1 min-h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={orderStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {orderStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                                                itemStyle={{fontWeight: 'bold'}}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Custom Legend */}
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    {orderStatusData.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                            <span className="text-sm font-medium text-slate-600">{item.name} ({item.value})</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400 font-medium">कोणताही डेटा उपलब्ध नाही</div>
                        )}
                    </div>
                    
                </div>

                {/* --- ADDITIONAL INSIGHTS (New Section based on API) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
                    
                    {/* Popular Items List */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FireIcon className="w-5 h-5 text-orange-500" />
                            लोकप्रिय पदार्थ (Top Items)
                        </h3>
                        <div className="space-y-4">
                            {popularItems.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">{item.itemName}</h4>
                                            <p className="text-xs text-slate-500">Ordered {item.quantity} times</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bar Chart (Popular Shifts) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">शिफ्ट बुकिंग (Shift Events)</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={formattedShiftData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} allowDecimals={false}/>
                                    <Tooltip 
                                        cursor={{fill: '#f1f5f9'}} 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Bar dataKey="events" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Customers */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <StarIcon className="w-5 h-5 text-yellow-500" />
                            उत्कृष्ट ग्राहक (Top Customers)
                        </h3>
                        <div className="space-y-4">
                            {topCustomers.slice(0, 5).map((customer, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm uppercase">{customer.customerName}</h4>
                                        <p className="text-xs text-slate-500 font-medium">📞 {customer.mobile}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-indigo-600 text-sm">₹{customer.revenue.toLocaleString('en-IN')}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{customer.invoices} Orders</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}