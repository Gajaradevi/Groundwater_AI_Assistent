import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, AlertCircle, CheckCircle2, Droplets } from 'lucide-react';
import './Auth.css';

const ForgotPassword = ({ onViewChange }) => {
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    
    const result = await forgotPassword(email.trim());
    
    setIsLoading(false);
    
    if (result.success) {
      setSuccessMsg(result.message || 'Password reset link sent! Check your inbox.');
      setEmail('');
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
          <h2>Reset Password</h2>
          <p>Enter your email and we'll send you a secure link to reset your account password</p>
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
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  className="auth-input"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? <div className="auth-spinner" /> : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Remember your password?
          <span className="auth-link" onClick={() => onViewChange('login')}>
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
