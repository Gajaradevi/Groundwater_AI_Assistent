import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertCircle, CheckCircle2, Droplets } from 'lucide-react';
import './Auth.css';

const ResetPassword = ({ token, onViewChange }) => {
  const { resetPassword } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!password || !confirmPassword) {
      setErrorMsg('Please enter and confirm your new password.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    if (!token) {
      setErrorMsg('Reset token is missing. Please click the reset link in your email again.');
      return;
    }

    setIsLoading(true);
    
    const result = await resetPassword(token, password);
    
    setIsLoading(false);
    
    if (result.success) {
      setSuccessMsg(result.message || 'Password reset successful! You can now log in.');
      setPassword('');
      setConfirmPassword('');
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-glow">
            <Droplets size={28} />
          </div>
          <h2>Set New Password</h2>
          <p>Choose a secure, strong password for your Groundwater AI Assistant account</p>
        </div>

        {errorMsg && (
          <div className="auth-alert auth-alert-error">
            <AlertCircle size={18} className="auth-alert-icon" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert auth-alert-success">
            <CheckCircle2 size={18} className="auth-alert-icon" />
            <span>{successMsg}</span>
          </div>
        )}

        {!successMsg && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label htmlFor="password">New Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? <div className="auth-spinner" /> : 'Update Password'}
            </button>
          </form>
        )}

        {successMsg && (
          <button 
            className="auth-btn" 
            onClick={() => onViewChange('login')}
            style={{ marginTop: '10px' }}
          >
            Back to Sign In
          </button>
        )}

        <div className="auth-footer">
          Cancel and return to
          <span className="auth-link" onClick={() => onViewChange('login')}>
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
