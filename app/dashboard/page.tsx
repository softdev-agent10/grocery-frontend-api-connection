/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Box,
  AlertCircle,
  ClipboardList,
  ChevronDown,
  ArrowUpRight,
  Users,
  DollarSign,
  CheckSquare,
  Building2,
} from "lucide-react";

/* ---------------- MOCK DATA ---------------- */

const salesData = [
  { name: "Mon", sales: 100 },
  { name: "Tue", sales: 650 },
  { name: "Wed", sales: 150 },
  { name: "Thu", sales: 200 },
  { name: "Fri", sales: 600 },
];

const paymentData = [
  { name: "Cash", value: 400 },
  { name: "Card", value: 300 },
  { name: "Bkash", value: 300 },
 
];

const hourlySalesData = [
  { time: "08:00", sales: 120 },
  { time: "10:00", sales: 300 },
  { time: "12:00", sales: 450 },
  { time: "14:00", sales: 380 },
  { time: "16:00", sales: 520 },
  { time: "18:00", sales: 600 },
  { time: "20:00", sales: 400 },
];

const stockDistributionData = [
  { name: "track", value: 382 },
  { name: "track", value: 502 },
  { name: "track", value: 582 },
];

const supplierData = [
  { name: "track", performance: 182 },
   { name: "track", performance: 282 },
    { name: "track", performance: 482 },
     { name: "track", performance: 682 },
];

const COLORS = ["#2563eb", "#8b5cf6", "#f97316"];
const STOCK_COLORS = ["#ff4d6d"]; 

/* ---------------- EMPLOYEE DASHBOARD DATA ---------------- */

const employeeSalesData = [
  { name: "Sales", employees: 60, sales: 1200 },
  { name: "Marketing", employees: 50, sales: 850 },
  { name: "IT", employees: 45, sales: 480 },
  { name: "HR", employees: 30, sales: 220 },
  { name: "Finance", employees: 25, sales: 310 },
];

const deptDistributionData = [
  { name: "Sales", value: 400 },
  { name: "Marketing", value: 300 },
  { name: "IT", value: 300 },
  { name: "HR", value: 200 },
  { name: "Finance", value: 100 },
];

const DEPT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

const employeeGrowthData = [
  { year: "2019", count: 800 },
  { year: "2020", count: 900 },
  { year: "2021", count: 1000 },
  { year: "2022", count: 1150 },
  { year: "2023", count: 1240 },
];

/* ---------------- DASHBOARD ---------------- */

export default function App() {
  return (
    <div className="w-full min-h-screen bg-white p-4 md:p-8 space-y-12 font-sans">

      {/* ================= HEADER ================= */}
      <div className="rounded-3xl bg-gradient-to-r from-yellow-400 to-yellow-900 p-20 text-white shadow-xl">
        <h1 className="text-3xl md:text-5xl font-black mx-10">
          Good Evening <span className="text-blue-400"></span>
        </h1>
        <p className="text-slate-300 mt-3 mx-10">
          Welcome back, Dashboard
        </p>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white border p-4 rounded-2xl shadow flex justify-between items-center hover:border-blue-200">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm">
          Global Overview
        </button>
        <div className="relative">
          <select className="appearance-none bg-blue-600 text-white p-2 pr-8 rounded-lg text-sm font-semibold outline-none border-none">
            <option>All Branches</option>
            <option>Dhaka Branch</option>
            <option>Chittagong Branch</option>
            <option>Rajshahi Board</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white"
          />
        </div>
      </div>

      {/* ================= POS OVERVIEW ================= */}
      <section>
        <div className="flex justify-between border p-6 rounded-2xl items-center mb-6 hover:border-blue-300">
           <h2 className="text-2xl font-black uppercase">POS Overview</h2>
           <select className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
              <option>Today</option>
              <option>Yeasterday</option>
              <option>Last Week </option>
              <option>Last Month</option>
              <option>6 Month</option>
              <option>Thia Day</option>
            <option>Custom Date Range</option>
           </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
          <StatCard title="Total Sales " value="$600.00" detail="1 orders" />
          <StatCard title="Today's Revenue" value="$0.00" detail="0% from yesterday" />
          <StatCard title="Avg. Transaction" value="$600.00" detail="+100% from yesterday" />
          <StatCard title="Inventory Status" value="11 critical" detail="0 out of stock" isAlert />
        </div>
      </section>
      
      {/* ================= SALES TREND & TOP PRODUCTS ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <ChartCard title="Sales Trend">
          <AreaChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="sales" stroke="#2dd4bf" fill="#f0fdfa" strokeWidth={3} />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Top Selling Products">
          <BarChart data={[
            {name: "Beef - Diced", qty: 4},
            {name: "Chicken Breast", qty: 1},
            {name: "Salmon Fillet", qty: 1},
            {name: "Tilapia Whole", qty: 1},
          ]}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="qty" fill="#c4b5fd" radius={[4,4,0,0]} barSize={60} />
          </BarChart>
        </ChartCard>
      </div>

      {/* ================= RECENT TRANSACTIONS & LOW STOCK ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TableCard title="Recent Transactions" headers={["Time","Product","Amount","Payment","Status"]}>
          <tr className="border-b">
            <td className="p-4 text-gray-500">12:52:07 AM</td>
            <td className="p-4">3 items</td>
            <td className="p-4">$600.00</td>
            <td className="p-4">cash</td>
            <td className="p-4 text-gray-400">completed</td>
          </tr>
          <tr className="border-b">
            <td className="p-4 text-gray-500">9:57:51 PM</td>
            <td className="p-4">1 items</td>
            <td className="p-4">$450.00</td>
            <td className="p-4">cash</td>
            <td className="p-4 text-gray-400">completed</td>
          </tr>
        </TableCard>

        <TableCard title="Low Stock Alerts" headers={["Product","Category","Stock","Status"]}>
          <tr className="border-b">
            <td className="p-4">Chicken Breast</td>
            <td className="p-4">test 01</td>
            <td className="p-4">4.00</td>
            <td className="p-4 text-orange-400">low stock</td>
          </tr>
          <tr className="border-b">
            <td className="p-4">Milk 1 Liter</td>
            <td className="p-4">test 01</td>
            <td className="p-4">7.00</td>
            <td className="p-4 text-orange-400">Low stock</td>
          </tr>
        </TableCard>
      </div>

      {/* ================= NEW: PAYMENT & HOURLY SALES ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <ChartCard title="Payment Method Distribution">
          <PieChart>
            <Pie
              data={paymentData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {paymentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>

        <ChartCard title="Hourly Sales">
          <LineChart data={hourlySalesData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ChartCard>
      </div>

      {/* ================= INVENTORY OVERVIEW ================= */}
      <section>
        <div className="flex justify-between border p-6 rounded-2xl items-center mb-6 hover:border-blue-300">
           <h2 className="text-2xl font-black uppercase">Inventory Overview</h2>
           <select className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last Week </option>
              <option>Last Month</option>
              <option>6 Month</option>
              <option>This Day</option>
            <option>Custom Date Range</option>
           </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Products Qty" value="3132" detail="14 unique products" />
          <StatCard title="Low Stock Items" value="11" detail="0 out of stock" isAlert />
          <StatCard title="Product Categories" value="3" detail="across all branches" />
          <StatCard title="Out of Stock" value="0" detail="items need restocking" />
        </div>
      </section>

      {/* ================= STOCK & SUPPLIER ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <ChartCard title="Stock Distribution">
          <PieChart>
            <Pie 
              data={stockDistributionData} 
              dataKey="value" 
              cx="50%" 
              cy="50%" 
              outerRadius={120} 
            >
              <Cell fill={STOCK_COLORS[0]} />
            </Pie>
            <Tooltip />
          </PieChart>
          <div className="flex justify-center items-center gap-2 mt-[-20px]">
             <div className="w-3 h-3 bg-[#ff4d6d]"></div>
             <span className="text-xs font-bold text-gray-600">track</span>
          </div>
        </ChartCard>

        <ChartCard title="Supplier Performance">
          <BarChart data={supplierData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} domain={[0, 600]} />
            <Tooltip />
            <Bar dataKey="performance" fill="#93c5fd" barSize={300} />
          </BarChart>
        </ChartCard>
      </div>

      {/* ================= RECENT INVENTORY ACTIVITY ================= */}
      <TableCard title="Recent Inventory Activity" headers={["Product", "Category", "Status", "Last Updated"]}>
          <tr className="border-b">
            <td className="p-4">Benana</td>
            <td className="p-4 text-gray-400 italic">Undefined</td>
            <td className="p-4 text-gray-500">Restocked</td>
            <td className="p-4 text-gray-500">2/28/2026</td>
          </tr>
          <tr className="border-b">
            <td className="p-4">Butter 500g</td>
            <td className="p-4 text-gray-400 italic">Undefined</td>
            <td className="p-4 text-gray-500">Restocked</td>
            <td className="p-4 text-gray-500">2/28/2026</td>
          </tr>
          <tr className="border-b">
            <td className="p-4">Milk 1 Liter</td>
            <td className="p-4 text-gray-400 italic">Undefined</td>
            <td className="p-4 text-gray-500">Restocked</td>
            <td className="p-4 text-gray-500">2/28/2026</td>
          </tr>
      </TableCard>

      {/* ================================================================= */}
      {/* ================= EMPLOYEE MANAGEMENT DASHBOARD ================= */}
      {/* ================================================================= */}
      
      <div className="bg-white mx-8 md:-mx-8 p-4 md:p-8 space-y-8 text-black   ">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border p-6 rounded-2xl hover:border-blue-300">
          <h2 className="text-3xl text-black  font-bold">Employee Management Dashboard</h2>
          <div className="bg-white border border-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-semibold ">
            <span>2023 Q4</span>
 
            
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <EmployeeStatCard 
            title="Total Employees" 
            value="1,240" 
            detail="+15% YoY growth" 
            icon={<Users className="text-blue-400" size={20} />}
          />
          <EmployeeStatCard 
            title="Payroll Amount" 
            value="$2.4M" 
            detail="Monthly expenditure" 
            icon={<DollarSign className="text-yellow-500" size={20} />}
          />
          <EmployeeStatCard 
            title="Active Employees" 
            value="1,112" 
            detail="98% active rate" 
            icon={<CheckSquare className="text-green-400" size={20} />}
          />
          <EmployeeStatCard 
            title="Departments" 
            value="14" 
            detail="5 new teams added" 
            icon={<Building2 className="text-slate-400" size={20} />}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 ">
          <div className="bg-white p-6 rounded-3xl border border-white/5 shadow-lg">
            <h3 className="text-indigo-400 font-bold mb-8 text-lg">Employee vs Total Sales</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeSalesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                  <Bar dataKey="employees" name="Employees" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="sales" name="Sales ($K)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-white/5 shadow-lg">
            <h3 className="text-indigo-400 font-bold mb-8 text-lg">Department Distribution</h3>
            <div className="h-[400px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deptDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                  />
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-3/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Total</p>
                <p className="text-2xl font-black">1,300</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 ">
          <div className="bg-white p-6 rounded-3xl border border-white/5 shadow-lg overflow-hidden hover:border-blue-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-green-400 font-bold text-lg">Recent Employees</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-black font-bold border-b border-white/10">
                  <tr>
                    <th className="pb-4">Name</th>
                    <th className="pb-4">Position</th>
                    <th className="pb-4">Department</th>
                    <th className="pb-4">Join Date</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 font-medium">Sarah Johnson</td>
                    <td className="py-4">Sales Executive</td>
                    <td className="py-4">Marketing</td>
                    <td className="py-4 text-slate-400">2023-11-15</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 font-medium">Michael Chen</td>
                    <td className="py-4">Software Engineer</td>
                    <td className="py-4">IT</td>
                    <td className="py-4 text-slate-400">2023-11-12</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-white/5 shadow-lg overflow-hidden hover:border-blue-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-green-400 font-bold text-lg">Top Performers</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-black font-bold border-b border-white/10">
                  <tr>
                    <th className="pb-4">Employee</th>
                    <th className="pb-4">Sales</th>
                    <th className="pb-4">Hours</th>
                    <th className="pb-4">Performance</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 font-medium">Emma Wilson</td>
                    <td className="py-4">$152K</td>
                    <td className="py-4">220h</td>
                    <td className="py-4">
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-[10px] font-bold uppercase">Excellent</span>
                    </td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 font-medium">James Smith</td>
                    <td className="py-4">$128K</td>
                    <td className="py-4">240h</td>
                    <td className="py-4">
                      <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-[10px] font-bold uppercase">Good</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-white p-6 rounded-3xl border border-white/5 shadow-lg">
          <h3 className="text-indigo-400 font-bold mb-8 text-lg">Employee Growth</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={employeeGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 1400]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#f59e0b" 
                  fillOpacity={1} 
                  fill="url(#colorGrowth)" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#1e293b' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}


/* ---------------- COMPONENTS ---------------- */

const StatCard = ({ title, value, detail, isAlert }: any) => (
  <div className="bg-white p-12 rounded-2xl shadow flex flex-col justify-between border border-gray-100 hover:-translate-y-1.5 hover:border-blue-300  transition-transform duration-300">
    <p className="text-blue-600 font-bold text-md">{title}</p>
    <h4 className={`text-2xl font-bold mt-2 text-black`}>{value}</h4>
    <p className={`text-xs mt-2 font-semibold ${isAlert ? 'text-red-500' : 'text-green-500'}`}>{detail}</p>
  </div>
);

const EmployeeStatCard = ({ title, value, detail, icon }: any) => (
  <div className="bg-white p-12  rounded-2xl border border-gray-300 shadow-lg flex flex-col justify-between hover:-translate-y-1.5   hover:border-blue-300  transition-transform duration-300">
    <div className="flex justify-between items-start">
      <p className="text-black font-bold text-md">{title}</p>
      <div className="p-2 bg-white rounded-lg border border-white/5">
        {icon}
      </div>
    </div>
    <div className="mt-4">
      <h4 className="text-xl font-black text-black">{value}</h4>
      <p className="text-[10px] mt-1 font-medium text-blue-500">{detail}</p>
    </div>
  </div>
);

const ChartCard = ({ title, children }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
    <h3 className="text-blue-600 font-bold mb-6">{title}</h3>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

const TableCard = ({ title, headers, children }: any) => (
  <div className="bg-white border rounded-2xl p-6 shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-blue-600 font-bold  text-lg">{title}</h3>
      <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs flex items-center gap-1 font-bold hover:cursor-pointer transition-colors hover:bg-blue-700">
        See More <ArrowUpRight size={14} />
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50 text-black font-black">
          <tr>
            {headers.map((h: string, i: number) => (
              <th key={i} className="p-4 border-b">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-700">{children}</tbody>
      </table>
    </div>
  </div>
); 




