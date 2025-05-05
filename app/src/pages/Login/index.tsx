import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { MdInput } from 'react-icons/md';
import { useAuth } from '../../services/auth/useAuth';
import { useAlert } from '../../services/alert/useAlert';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const { errorAlert } = useAlert();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    locale: "en",
    rememberMe: false
  });

  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });

  const [touched, setTouched] = useState({
    username: false,
    password: false
  });

  // Validate form when inputs change
  useEffect(() => {
    if (touched.username) {
      setErrors(prev => ({
        ...prev,
        username: formData.username ? '' : 'Username is required'
      }));
    }

    if (touched.password) {
      setErrors(prev => ({
        ...prev,
        password: formData.password ? '' : 'Password is required'
      }));
    }
  }, [formData, touched]);

  const handleBlur = (field: 'username' | 'password') => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Set all fields as touched to trigger validation
    setTouched({
      username: true,
      password: true
    });

    // Check if there are any validation errors
    const hasUsernameError = !formData.username;
    const hasPasswordError = !formData.password;

    if (hasUsernameError) {
      setErrors(prev => ({
        ...prev,
        username: 'Username is required'
      }));
    }

    if (hasPasswordError) {
      setErrors(prev => ({
        ...prev,
        password: 'Password is required'
      }));
    }

    // If there are errors, don't proceed with login
    if (hasUsernameError || hasPasswordError) {
      return;
    }
    
    try {
      await loginUser(formData);
      navigate('/dashboard');
    } catch (error: any) {
      errorAlert(error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="flex h-screen w-full">
      <div className="bg-[#F47B20] opacity-80 flex items-end w-3/5 p-[75px] z-0">
        <h1 className="text-white mb-[60px] pl-[70px] text-[34px] font-bold">
          WELCOME TO FEEDXCHANGE PORTAL
        </h1>
      </div>
      
      <div className="bg-gray-100 flex justify-center items-center w-2/5">
        <div className="w-[42%] max-w-[400px] flex flex-col items-center">
          <img 
            src="/assets/images/reactor_cx_logo.png" 
            alt="ReactorCX FeedX Portal" 
            className="w-[250px] mb-[40px]"
          />
          
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            <div className="w-full mb-[15px]">
              <input
                type="text"
                id="username"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  username: e.target.value
                }))}
                onBlur={() => handleBlur('username')}
                className={`w-full p-3 border border-[#F47B20] rounded-md text-base focus:border-gray-500 focus:ring-0 ${touched.username && errors.username ? 'border-red-600 bg-white' : ''}`}
              />
              {touched.username && errors.username && (
                <div className="text-red-600 text-base font-medium mt-1 text-left">
                  {errors.username}
                </div>
              )}
            </div>
            
            <div className="w-full mb-[15px]">
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
                onBlur={() => handleBlur('password')}
                className={`w-full p-3 border border-[#F47B20] rounded-md text-base focus:border-gray-500 focus:ring-0 ${touched.password && errors.password ? 'border-red-600 bg-white' : ''}`}
              />
              {touched.password && errors.password && (
                <div className="text-red-600 text-base font-medium mt-1 text-left">
                  {errors.password}
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className={`w-full p-[10px] border-none rounded-md font-bold cursor-pointer flex justify-center items-center gap-2 mt-[10px] text-xs ${(formData.username && formData.password) ? 'bg-[#0b4a87] text-white' : 'bg-gray-300 text-gray-600 opacity-50'}`}
              disabled={!(formData.username && formData.password)}
            >
              <span className="text-base">
                <MdInput className="w-[18px] h-[22px]" />
              </span> 
              LOGIN
            </button>
            
            <div className="flex justify-between items-center w-full mt-[10px]">
              <div className="flex items-center gap-[5px]">
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    rememberMe: e.target.checked
                  }))}
                />
                <label htmlFor="rememberMe">Remember Login</label>
              </div>
              <a href="#" className="text-blue-700 no-underline hover:underline">
                Forgot Password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;