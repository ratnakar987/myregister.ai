import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, User, Users, GraduationCap, MapPin, Phone } from 'lucide-react';

export default function AddStudent() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    class: '',
    section: '',
    rollNumber: '',
    fatherName: '',
    motherName: '',
    phone: '',
    address: '',
    classTeacher: '',
    admissionDate: new Date().toISOString().split('T')[0],
    monthlyFee: 0
  });

  useEffect(() => {
    if (id) {
      const fetchStudent = async () => {
        const docRef = doc(db, 'students', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data() as any);
        }
      };
      fetchStudent();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'monthlyFee' ? parseFloat(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const studentId = id || crypto.randomUUID();
      const studentData = {
        ...formData,
        studentId,
        institutionId: user.uid,
        createdAt: id ? (formData as any).createdAt : new Date().toISOString()
      };

      await setDoc(doc(db, 'students', studentId), studentData);
      navigate('/students');
    } catch (error) {
      console.error("Error saving student:", error);
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
            className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{id ? 'Edit Student' : 'Add New Student'}</h1>
            <p className="text-gray-500">Fill in the details to {id ? 'update' : 'enroll'} a student.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                placeholder="Student's full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Date of Birth</label>
              <input
                name="dob"
                type="date"
                required
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Admission Date</label>
              <input
                name="admissionDate"
                type="date"
                required
                value={formData.admissionDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
              />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Academic Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Class</label>
              <input
                name="class"
                type="text"
                required
                value={formData.class}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                placeholder="e.g. 10th"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Section</label>
              <input
                name="section"
                type="text"
                required
                value={formData.section}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                placeholder="e.g. A"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Roll Number</label>
              <input
                name="rollNumber"
                type="text"
                required
                value={formData.rollNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                placeholder="e.g. 101"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Class Teacher</label>
              <input
                name="classTeacher"
                type="text"
                value={formData.classTeacher}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                placeholder="Teacher's name"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Monthly Fee Amount (₹)</label>
              <input
                name="monthlyFee"
                type="number"
                required
                value={formData.monthlyFee}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Parent & Contact Details */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Parent & Contact Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Father's Name</label>
              <input
                name="fatherName"
                type="text"
                required
                value={formData.fatherName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Mother's Name</label>
              <input
                name="motherName"
                type="text"
                required
                value={formData.motherName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Parent Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                <textarea
                  name="address"
                  required
                  rows={1}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-12 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg shadow-black/10"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : id ? 'Update Student' : 'Save Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
