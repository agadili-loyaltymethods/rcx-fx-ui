import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useAlert } from '../../services/alert/useAlert';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, isLoggedIn } = useAuthContext();
  const { errorAlert } = useAlert();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await loginUser(formData);
      navigate('/dashboard');
    } catch (error: any) {
      errorAlert(error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/reset-password');
  };

  if (isLoggedIn()) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Welcome Section */}
      <div className="hidden lg:flex w-3/5 relative bg-gray-100">
        <div className="flex flex-col justify-end pl-16 pb-20 z-10 pr-20">
          <h1 className="text-4xl font-bold mb-20">
            WELCOME TO FEEDXCHANGE PORTAL
          </h1>
        </div>
        <div className="absolute inset-0 bg-primary/10"></div>
      </div>

      {/* Login Form Section */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-center mb-8">
              <img 
                src="/assets/logo.svg" 
                alt="Logo" 
                className="h-10"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label 
                  htmlFor="username" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  disabled={isSubmitting}
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    username: e.target.value
                  }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md 
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                            disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-1.5">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md 
                              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                              disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 
                              hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:text-secondary focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-primary text-white rounded-md
                          hover:bg-secondary focus:outline-none focus:ring-2 
                          focus:ring-offset-2 focus:ring-primary transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;