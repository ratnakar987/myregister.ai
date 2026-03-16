import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Student, Payment } from '../types';
import { 
  ArrowLeft, 
  User, 
  GraduationCap, 
  Calendar, 
  Phone, 
  MapPin, 
  CreditCard,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchStudent = async () => {
      const docRef = doc(db, 'students', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStudent(docSnap.data() as Student);
      }
      setLoading(false);
    };

    const q = query(collection(db, 'payments'), where('studentId', '==', id));
    const unsubPayments = onSnapshot(q, (snapshot) => {
      setPayments(snapshot.docs.map(doc => doc.data() as Payment).sort((a, b) => b.paymentDate.localeCompare(a.paymentDate)));
    });

    fetchStudent();
    return unsubPayments;
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>;
  if (!student) return <div className="text-center py-20 text-gray-500">Student not found</div>;

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = Math.max(0, student.monthlyFee - totalPaid);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-xl border border-gray-200"><ArrowLeft className="w-6 h-6" /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-gray-500">Roll Number: {student.rollNumber} • Class {student.class}-{student.section}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to={`/students/edit/${student.studentId}`} className="px-6 py-3 rounded-xl font-bold border border-gray-200 hover:bg-white transition-all">Edit Profile</Link>
          <Link to="/payments/add" className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
            <Plus className="w-5 h-5" /> Record Payment
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-400">
              <User className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
            <p className="text-gray-500 text-sm mb-6">Student ID: {student.studentId.slice(0, 8)}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Class</p>
                <p className="font-bold text-gray-900">{student.class}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Section</p>
                <p className="font-bold text-gray-900">{student.section}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" /> Personal Info
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Gender</span>
                <span className="font-medium">{student.gender}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">DOB</span>
                <span className="font-medium">{format(new Date(student.dob), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Admission</span>
                <span className="font-medium">{format(new Date(student.admissionDate), 'MMM dd, yyyy')}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" /> Contact Info
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Father</span>
                  <span className="font-medium">{student.fatherName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mother</span>
                  <span className="font-medium">{student.motherName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">{student.phone}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 block mb-1">Address</span>
                  <span className="font-medium text-gray-700">{student.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Fee</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(student.monthlyFee)}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Paid</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Balance</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(balance)}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" /> Payment History
            </h3>
            <div className="space-y-4">
              {payments.length > 0 ? payments.map((payment) => (
                <div key={payment.paymentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">#{payment.receiptNumber}</p>
                      <p className="text-xs text-gray-500">{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(payment.amount)}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{payment.paymentMethod}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-gray-400">No payments recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
