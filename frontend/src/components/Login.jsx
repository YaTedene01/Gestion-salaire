import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Building2, Shield, ArrowRight } from 'lucide-react';
import { authAPI } from '../utils/api';
import { validateLoginData, hasErrors } from '../utils/validation';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des données
    const validationErrors = validateLoginData({ email, password });
    if (hasErrors(validationErrors)) {
      const firstError = Object.values(validationErrors)[0];
      setError(firstError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data;

      // Stocker les informations d'authentification
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('email', user.email);
      localStorage.setItem('userId', user.id.toString());

      // Stocker l'ID de l'entreprise si l'utilisateur en a une
      if (user.companyId) {
        localStorage.setItem('selectedCompanyId', user.companyId.toString());
      }

      // Rediriger vers le dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Erreur de connexion';
      setError(errorMessage);
      console.error('Erreur login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
         
          <p className="text-blue-200">Psalaire</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Connexion</h2>
            <p className="text-slate-600">Accédez à votre espace de gestion</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-100 transition outline-none text-slate-800"
                  placeholder="exemple@entreprise.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-100 transition outline-none text-slate-800"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-slate-600">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
                Mot de passe oublié ?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              <span>Se connecter</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            
          </div>

          {/* Role Selection Info */}

        </div>

        {/* Footer */}
        

        {/* Version Info */}
        <div className="text-center mt-4">
          <p className="text-green-300 text-xs">Version 1.0.0 - © 2025 Psalaire</p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;
