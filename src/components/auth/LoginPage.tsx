import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { GraduationCap, ShieldCheck, UserCheck, Lock, User as UserIcon, Eye, EyeOff, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useCollege();
  const [activeRoleTab, setActiveRoleTab] = useState<'student' | 'admin'>('student');
  const [username, setUsername] = useState('alex.morgan');
  const [password, setPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setError(res.message || 'Invalid username or password.');
      }
      setIsSubmitting(false);
    }, 200);
  };

  const handleRoleTabChange = (role: 'student' | 'admin') => {
    setActiveRoleTab(role);
    setError(null);
    if (role === 'student') {
      setUsername('alex.morgan');
      setPassword('student123');
    } else {
      setUsername('admin');
      setPassword('admin123');
    }
  };

  const setDemoCredentials = (u: string, p: string, role: 'student' | 'admin') => {
    setActiveRoleTab(role);
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Crest & Title */}
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-700 flex items-center justify-center text-white shadow-lg shadow-blue-700/20">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 font-['Space_Grotesk']">
          Mini Patel Institute
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Integrated Student & Academic Administration Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {/* Role selector tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              id="tab-login-student"
              onClick={() => handleRoleTabChange('student')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeRoleTab === 'student'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Student Portal</span>
            </button>
            <button
              type="button"
              id="tab-login-admin"
              onClick={() => handleRoleTabChange('admin')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeRoleTab === 'admin'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin / Faculty</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="input-login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeRoleTab === 'student' ? 'e.g. alex.morgan' : 'e.g. admin'}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white shadow-sm transition-colors ${
                activeRoleTab === 'student'
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              } disabled:opacity-50`}
            >
              <span>{isSubmitting ? 'Authenticating...' : `Sign in as ${activeRoleTab === 'student' ? 'Student' : 'Admin'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Pill Strip */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-2.5 text-center">
              Quick Test Credentials (Click to autofill):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-quick-sayan"
                onClick={() => setDemoCredentials('sayan.pandit', 'student123', 'student')}
                className="text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-xs cursor-pointer"
              >
                <span className="font-semibold text-slate-800 block truncate">Mr. Sayan Pandit (Student)</span>
                <span className="text-slate-500 block text-[11px]">sayan.pandit / student123</span>
              </button>
              <button
                type="button"
                id="btn-quick-admin"
                onClick={() => setDemoCredentials('admin', 'admin123', 'admin')}
                className="text-left p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/60 hover:border-indigo-300 transition-all text-xs cursor-pointer"
              >
                <span className="font-semibold text-indigo-900 block truncate">Mr. Sayan Pandit (Admin)</span>
                <span className="text-indigo-600 block text-[11px]">admin / admin123</span>
              </button>
            </div>
            <div className="mt-2 text-center">
              <button
                type="button"
                id="btn-quick-sophia"
                onClick={() => setDemoCredentials('sophia.chen', 'student123', 'student')}
                className="text-[11px] text-slate-500 hover:text-blue-600 underline"
              >
                Or login as Sophia Chen (CS2024-043)
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Apex University Academic Management System &bull; Secure Portal
        </p>
      </div>
    </div>
  );
};
