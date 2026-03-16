import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Student } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  Phone, 
  GraduationCap,
  Trash2,
  Edit2,
  Eye
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'students'), where('institutionId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentData = snapshot.docs.map(doc => doc.data() as Student);
      setStudents(studentData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleDelete = async (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteDoc(doc(db, 'students', studentId));
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.rollNumber.includes(searchTerm);
    const matchesClass = selectedClass === 'All' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const classes = ['All', ...Array.from(new Set(students.map(s => s.class)))];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-500">Manage and track all your enrolled students.</p>
        </div>
        <Link 
          to="/students/add" 
          className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
        >
          <Plus className="w-5 h-5" />
          Add New Student
        </Link>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or roll number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-black appearance-none cursor-pointer"
              >
                {classes.map(c => <option key={c} value={c}>{c === 'All' ? 'All Classes' : `Class ${c}`}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Student</th>
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Class/Section</th>
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Roll No</th>
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Parent Contact</th>
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider">Monthly Fee</th>
                <th className="pb-4 font-semibold text-gray-400 text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">Loading students...</td>
                </tr>
              ) : filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <tr key={student.studentId} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">Joined {new Date(student.admissionDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{student.class} - {student.section}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm font-medium text-gray-600">{student.rollNumber}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {student.phone}
                    </div>
                  </td>
                  <td className="py-4 font-bold text-gray-900">{formatCurrency(student.monthlyFee)}</td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/students/${student.studentId}`}
                        className="p-2 text-gray-400 hover:text-black hover:bg-white rounded-lg transition-all shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        to={`/students/edit/${student.studentId}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(student.studentId)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">No students found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
