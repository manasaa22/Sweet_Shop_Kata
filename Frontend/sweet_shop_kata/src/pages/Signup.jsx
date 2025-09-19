// pages/Signup.jsx
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  User,
  UserPlus
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Form validation
  const isUsernameValid = username.trim().length >= 3;
  const isEmailValid = email.includes('@') && email.includes('.');
  const isPasswordValid = password.length >= 6;
  const isFormValid = isUsernameValid && isEmailValid && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const apiUrl = import.meta.env.VITE_BASE_API;

    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (res.ok) {
        setSuccess("Account created successfully! Redirecting to login...");

        // Small delay to show success message
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.detail || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <UserPlus className="text-white" size={28} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Join Sweet Shop</h1>
              <p className="text-green-100">Create your account to get started</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  <p className="text-green-800 font-medium">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User size={16} className="text-green-500" />
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:ring-4 outline-none transition-all duration-300 text-gray-800 font-medium bg-gray-50/50 ${username ? (isUsernameValid ? 'border-green-300 focus:border-green-500 focus:ring-green-100' : 'border-red-300 focus:border-red-500 focus:ring-red-100') : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                      }`}
                    placeholder="Enter your username"
                    required
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  {username && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {isUsernameValid ? (
                        <CheckCircle className="text-green-500" size={18} />
                      ) : (
                        <AlertCircle className="text-red-500" size={18} />
                      )}
                    </div>
                  )}
                </div>
                {username && !isUsernameValid && (
                  <p className="text-red-600 text-xs">Username must be at least 3 characters</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Mail size={16} className="text-green-500" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:ring-4 outline-none transition-all duration-300 text-gray-800 font-medium bg-gray-50/50 ${email ? (isEmailValid ? 'border-green-300 focus:border-green-500 focus:ring-green-100' : 'border-red-300 focus:border-red-500 focus:ring-red-100') : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                      }`}
                    placeholder="Enter your email"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  {email && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      {isEmailValid ? (
                        <CheckCircle className="text-green-500" size={18} />
                      ) : (
                        <AlertCircle className="text-red-500" size={18} />
                      )}
                    </div>
                  )}
                </div>
                {email && !isEmailValid && (
                  <p className="text-red-600 text-xs">Please enter a valid email address</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Lock size={16} className="text-green-500" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-12 pr-16 py-4 border-2 rounded-xl focus:ring-4 outline-none transition-all duration-300 text-gray-800 font-medium bg-gray-50/50 ${password ? (isPasswordValid ? 'border-green-300 focus:border-green-500 focus:ring-green-100' : 'border-red-300 focus:border-red-500 focus:ring-red-100') : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                      }`}
                    placeholder="Create a password"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {password && (
                      <div>
                        {isPasswordValid ? (
                          <CheckCircle className="text-green-500" size={18} />
                        ) : (
                          <AlertCircle className="text-red-500" size={18} />
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {password && !isPasswordValid && (
                  <p className="text-red-600 text-xs">Password must be at least 6 characters</p>
                )}
              </div>

              <div className="flex gap-4 my-8">
                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="w-1/2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      <span>Create</span>
                    </>
                  )}
                </button>

                {/* Login Link */}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-1/2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 py-4 px-6 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-semibold text-lg border border-gray-300 hover:border-gray-400 transform hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  <LogIn size={20} />
                  <span>Sign In</span>
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          {/* <div className="bg-gray-50 px-8 py-6 text-center border-t border-gray-100">
            <p className="text-gray-600 text-sm">
              By creating an account, you agree to our terms of service
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500 font-medium">Secure Registration</span>
            </div>
          </div> */}
        </div>

        {/* Security Info Card */}
        {/* <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
          <div className="text-center">
            <div className="text-green-600 font-semibold text-sm mb-1">🔒 Your data is secure</div>
            <div className="text-xs text-gray-600">
              We use industry-standard encryption to protect your information
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}