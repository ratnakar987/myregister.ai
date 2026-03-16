import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Save, 
  Shield, 
  Bell,
  Moon,
  Globe
} from 'lucide-react';

export default function Settings() {
  const { institution, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: institution?.name || '',
    adminName: institution?.adminName || '',
    phone: institution?.phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'institutions', user.uid), formData);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your institution profile and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <button className="w-full flex items-center gap-3 p-4 bg-black text-white rounded-2xl shadow-lg shadow-black/10">
            <Building2 className="w-5 h-5" />
            <span className="font-bold text-sm">Institution Profile</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 bg-white text-gray-600 rounded-2xl hover:bg-gray-50 transition-all border border-gray-100">
            <Shield className="w-5 h-5" />
            <span className="font-bold text-sm">Security & Privacy</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 bg-white text-gray-600 rounded-2xl hover:bg-gray-50 transition-all border border-gray-100">
            <Bell className="w-5 h-5" />
            <span className="font-bold text-sm">Notifications</span>
          </button>
          <button className="w-full flex items-center gap-3 p-4 bg-white text-gray-600 rounded-2xl hover:bg-gray-50 transition-all border border-gray-100">
            <Globe className="w-5 h-5" />
            <span className="font-bold text-sm">Regional Settings</span>
          </button>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Institution Details</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Institution Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Admin Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address (Read-only)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    disabled
                    value={institution?.email || ''}
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg shadow-black/10"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Dark Mode</p>
                    <p className="text-xs text-gray-500">Switch to a darker interface</p>
                  </div>
                </div>
                <button className="w-12 h-6 bg-gray-200 rounded-full relative transition-all">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
