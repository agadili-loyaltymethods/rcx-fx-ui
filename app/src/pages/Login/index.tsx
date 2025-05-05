import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import styles from './Login.module.css';
// import { useAuth } from '@/services/auth/useAuth';
// import { useAlert } from '@/services/alert/useAlert';
import { MdInput } from 'react-icons/md';
import { useAuth } from '@/services/auth/useAuth';
import { useAlert } from '@/services/alert/useAlert';

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
    <div className={styles.loginContainer}>
      <div className={styles.leftPanel}>
        <h1 className={styles.welcomeText}>WELCOME TO FEEDXCHANGE PORTAL</h1>
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>
          <img src="/assets/images/reactor_cx_logo.png" title="ReactorCX FeedX Portal" className={styles.logo} />
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
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
                className={`${styles.inputField} ${touched.username && errors.username ? styles.errorInput : ''}`}
              />
              {touched.username && errors.username && (
                <div className={styles.errorText}>{errors.username}</div>
              )}
            </div>
            <div className={styles.inputGroup}>
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
                className={`${styles.inputField} ${touched.password && errors.password ? styles.errorInput : ''}`}
              />
              {touched.password && errors.password && (
                <div className={styles.errorText}>{errors.password}</div>
              )}
            </div>
            <button 
              type="submit" 
              className={`${styles.loginButton} ${(formData.username && formData.password) ? 'bg-[#0b4a87] text-[#fff]': ''}`} 
              disabled={(formData.username && formData.password) ? false : true}
            >
              <span className={styles.lockIcon}>
               <MdInput className="w-[18px] h-[22px]"></MdInput> </span> LOGIN
            </button>
            
            <div className={styles.formFooter}>
              <div className={styles.rememberMe}>
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
              <a href="#" className={styles.forgotPassword}>Forgot Password?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;