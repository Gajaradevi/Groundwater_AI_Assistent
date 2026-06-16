import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, CheckCircle2, Droplets } from 'lucide-react';
import './Auth.css';

const Login = ({ onViewChange }) => {
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle URL parameters for verification notifications
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      setSuccessMsg('Email verified successfully! You can now log in.');
      // Clean up the URL search params so the message doesn't persist forever
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('error')) {
      setErrorMsg(params.get('error'));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    
    const result = await login(email.trim(), password);
    
    if (!result.success) {
      setErrorMsg(result.error);
      setIsLoading(false);
    }
    // Success will automatically trigger AuthContext state update which App.jsx renders dashboard
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-glow">
            <Droplets size={28} />
          </div>
          <h2>Groundwater AI</h2>
          <p>Login to explore live groundwater metrics and get AI conservation recommendations</p>
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

          <div className="auth-input-group">
            <label htmlFor="password">Password</label>
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

          <div className="auth-helper-links">
            <span 
              className="auth-link" 
              onClick={() => onViewChange('forgot-password')}
              style={{ fontSize: '0.8rem' }}
            >
              Forgot Password?
            </span>
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? <div className="auth-spinner" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?
          <span className="auth-link" onClick={() => onViewChange('register')}>
            Sign Up
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
