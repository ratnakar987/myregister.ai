import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Payment, Student } from '../types';
import { 
  Plus, 
  Search, 
  CreditCard, 
  Calendar,
  Download,
  Printer,
  User
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const studentsQuery = query(collection(db, 'students'), where('institutionId', '==', user.uid));
    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      const studentMap: Record<string, Student> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data() as Student;
        studentMap[data.studentId] = data;
      });
      setStudents(studentMap);
    });

    const paymentsQuery = query(collection(db, 'payments'), where('institutionId', '==', user.uid));
    const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
      const paymentData = snapshot.docs.map(doc => doc.data() as Payment);
      setPayments(paymentData.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)));
      setLoading(false);
    });

    return () => {
      unsubStudents();
      unsubPayments();
    };
  }, [user]);

  const filteredPayments = payments.filter(payment => {
    const student = students[payment.studentId];
    return student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           payment.receiptNumber.includes(searchTerm);
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Payments</h1>
          <p className="text-gray-500">Track and manage all student fee transactions.</p>
        </div>
        <Link 
          to="/payments/add" 
          className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
        >
          <Plus className="w-5 h-5" />
          Record New Payment
        </Link>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by student name or receipt number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Receipt No</th>
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Student</th>
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Amount</th>
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Date</th>
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Method</th>
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">Loading payments...</td>
                </tr>
              ) : filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                <tr key={payment.paymentId} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4">
                    <span className="text-sm font-bold text-gray-900">#{payment.receiptNumber}</span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{students[payment.studentId]?.name || 'Unknown Student'}</p>
                        <p className="text-xs text-gray-500">Class {students[payment.studentId]?.class}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(payment.amount)}</span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{payment.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all shadow-sm">
                        <Printer className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all shadow-sm">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">No payments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
