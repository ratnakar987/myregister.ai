import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Student, Payment, DashboardStats } from '../types';
import { 
  Users, 
  IndianRupee, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFeesCollected: 0,
    pendingFees: 0,
    todayCollection: 0
  });
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const studentsQuery = query(collection(db, 'students'), where('institutionId', '==', user.uid));
    const paymentsQuery = query(collection(db, 'payments'), where('institutionId', '==', user.uid));

    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      const students = snapshot.docs.map(doc => doc.data() as Student);
      
      const unsubPayments = onSnapshot(paymentsQuery, (paySnapshot) => {
        const payments = paySnapshot.docs.map(doc => doc.data() as Payment);
        
        const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalExpected = students.reduce((sum, s) => sum + s.monthlyFee, 0);
        const today = new Date().toISOString().split('T')[0];
        const todayColl = payments
          .filter(p => p.paymentDate.startsWith(today))
          .reduce((sum, p) => sum + p.amount, 0);

        setStats({
          totalStudents: students.length,
          totalFeesCollected: totalCollected,
          pendingFees: Math.max(0, totalExpected - totalCollected),
          todayCollection: todayColl
        });

        setRecentPayments(payments.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)).slice(0, 5));

        // Prepare chart data (last 7 days)
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return format(d, 'yyyy-MM-dd');
        }).reverse();

        const data = last7Days.map(date => ({
          name: format(new Date(date), 'MMM dd'),
          amount: payments
            .filter(p => p.paymentDate.startsWith(date))
            .reduce((sum, p) => sum + p.amount, 0)
        }));
        setChartData(data);
      });

      return () => unsubPayments();
    });

    return () => unsubStudents();
  }, [user]);

  const cards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500', trend: '+12%', up: true },
    { label: 'Total Collected', value: formatCurrency(stats.totalFeesCollected), icon: IndianRupee, color: 'bg-emerald-500', trend: '+8%', up: true },
    { label: 'Pending Fees', value: formatCurrency(stats.pendingFees), icon: Clock, color: 'bg-orange-500', trend: '-2%', up: false },
    { label: "Today's Collection", value: formatCurrency(stats.todayCollection), icon: TrendingUp, color: 'bg-violet-500', trend: '+24%', up: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back to your institution management portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white", card.color)}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className={cn("flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full", card.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {card.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">Collection Trends</h2>
            <select className="bg-gray-50 border-none rounded-xl text-sm font-medium px-4 py-2 focus:ring-2 focus:ring-black">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Payments</h2>
          <div className="space-y-6">
            {recentPayments.length > 0 ? recentPayments.map((payment) => (
              <div key={payment.paymentId} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">₹{payment.amount}</p>
                    <p className="text-xs text-gray-500">{format(new Date(payment.paymentDate), 'MMM dd, hh:mm a')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-400">#{payment.receiptNumber}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full uppercase tracking-wider">Paid</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">No recent payments</p>
              </div>
            )}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-bold text-gray-900 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
