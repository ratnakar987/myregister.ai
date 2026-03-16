import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Student } from '../types';
import { ArrowLeft, Save, CreditCard, Search, User, Calendar, IndianRupee, FileText } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function AddPayment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
    notes: ''
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'students'), where('institutionId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => doc.data() as Student));
    });
    return unsub;
  }, [user]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber.includes(searchTerm)
  ).slice(0, 5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedStudent) return;

    setLoading(true);
    try {
      const paymentId = crypto.randomUUID();
      const paymentData = {
        ...formData,
        paymentId,
        studentId: selectedStudent.studentId,
        institutionId: user.uid,
        paymentDate: new Date(formData.paymentDate).toISOString()
      };

      await setDoc(doc(db, 'payments', paymentId), paymentData);
      navigate('/payments');
    } catch (error) {
      console.error("Error saving payment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-xl transition-all border border-gray-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
            <p className="text-gray-500">Add a new fee payment record for a student.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Select Student</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search student..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black"
              />
            </div>
            
            <div className="space-y-2">
              {filteredStudents.map(student => (
                <button
                  key={student.studentId}
                  onClick={() => setSelectedStudent(student)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                    selectedStudent?.studentId === student.studentId 
                      ? "bg-black text-white shadow-md" 
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    selectedStudent?.studentId === student.studentId ? "bg-white/20" : "bg-gray-100"
                  )}>
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{student.name}</p>
                    <p className={cn(
                      "text-[10px]",
                      selectedStudent?.studentId === student.studentId ? "text-white/60" : "text-gray-500"
                    )}>Class {student.class} • Roll {student.rollNumber}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedStudent && (
            <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-lg shadow-emerald-500/20">
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Monthly Fee</p>
              <p className="text-3xl font-bold">{formatCurrency(selectedStudent.monthlyFee)}</p>
              <div className="mt-4 pt-4 border-t border-emerald-400/30 flex justify-between text-sm">
                <span className="text-emerald-100">Student ID</span>
                <span className="font-mono">{selectedStudent.studentId.slice(0, 8)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Payment Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Payment Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Payment Method</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all appearance-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online Transfer">Online Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Receipt Number</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Notes (Optional)</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all resize-none"
                placeholder="Add any additional details..."
              />
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedStudent}
                className="bg-black text-white px-12 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg shadow-black/10"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
