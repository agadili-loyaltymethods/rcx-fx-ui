import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth/useAuth';
import { useAlert } from '../../services/alert/useAlert';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { errorAlert } = useAlert();
  
  // Get token from URL query parameters
  const token = new URLSearchParams(location.search).get('token') || '';
  
  // Validate passwords match when either field changes
  useEffect(() => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setPasswordsMatch(false);
    } else {
      setPasswordsMatch(true);
    }
  }, [newPassword, confirmPassword]);
  
  // Password policy validation
  const passwordPolicies = (password: string, atLeast: number): boolean => {
    const minLength = 9;
    const policies = [
      /[a-z]/g, // lowercase
      /[A-Z]/g, // uppercase
      /\d/g,    // numeric
      /[@%+'.#^$(-/):-?{}-~!\\^_`\[\]]/g, // special characters
    ];
    
    let matchedTimes = 0;
    
    policies.forEach((regex) => {
      if (password.match(regex)) {
        matchedTimes++;
      }
    });
    
    return matchedTimes >= atLeast && password.length >= minLength;
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setErrorMessage(null);
    setInfoMessage(null);
    
    // Validate password policies
    if (!passwordPolicies(newPassword, 3)) {
      setErrorMessage(
        'Invalid password<br>Your password must be at least nine (9) characters long and ' +
        'contain some combination of at least three (3) of the following classes of characters:' +
        '<ul style="margin-left: 20px;"><li>' +
        'lowercase' +
        '</li><li>' +
        'uppercase' +
        '</li><li>' +
        'numeric' +
        '</li><li>' +
        'special (e.g. $, %, ^, *, [, ], {, }, etc.)' +
        '</li></ul>'
      );
      return;
    }
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setErrorMessage('The two passwords do not match');
      return;
    }
    
    // Validate token
    if (!token) {
      setErrorMessage('Invalid token');
      return;
    }
    
    // Submit password reset request
    try {
      const params = {
        password: newPassword,
        token: token,
      };
      
      const response = await resetPassword(params);
      
      if (response) {
        setInfoMessage(response.message);
      }
    } catch (error: any) {
      const message = error.errorMessage || 'Failed to Reset Password!';
      setErrorMessage(message);
      errorAlert(message);
    }
  };
  
  return (
    <div className="flex h-screen w-full">
      <div className="bg-orange-500 opacity-80 flex items-end w-3/5 p-[75px] z-0">
        <h1 className="text-white mb-[60px] pl-[70px] text-[34px] font-bold">
          WELCOME TO FEEDXCHANGE PORTAL
        </h1>
      </div>
      
      <div className="bg-gray-100 flex justify-center items-center w-2/5">
        <div className="w-[350px] flex flex-col items-center">
          <img
            className="w-[250px] mb-[40px]"
            src="/assets/images/reactor_cx_logo.png"
            alt="ReactorCX FeedX Portal"
          />
          
          <div className="w-full">
            {errorMessage && (
              <div className="flex items-start bg-red-100 text-red-700 p-4 mb-5 rounded">
                <span className="material-icons text-lg mr-2">info_outline</span>
                <div dangerouslySetInnerHTML={{ __html: errorMessage }} />
              </div>
            )}
            
            {infoMessage && (
              <div className="flex items-start bg-orange-100 text-orange-700 p-4 mb-5 rounded">
                <span className="material-icons text-2xl mr-2">warning</span>
                <span>{infoMessage}</span>
              </div>
            )}
            
            {!infoMessage && (
              <form 
                className="flex flex-col gap-4"
                onSubmit={handlePasswordSubmit}
              >
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 border border-orange-500 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full p-3 border ${!passwordsMatch ? 'border-red-500' : 'border-orange-500'} rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500`}
                    />
                    {!passwordsMatch && (
                      <p className="text-red-500 text-sm mt-1">Passwords Do Not Match</p>
                    )}
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={!newPassword || !confirmPassword || !passwordsMatch}
                  className="bg-orange-500 text-white p-3 rounded-md flex items-center justify-center gap-2 uppercase font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-icons text-lg">login</span>
                  <span>Reset Password</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;