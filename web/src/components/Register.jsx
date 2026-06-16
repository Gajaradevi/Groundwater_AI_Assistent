import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, CheckCircle2, Droplets } from 'lucide-react';
import './Auth.css';

const Register = ({ onViewChange }) => {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMsg('All fields are required.');
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

    setIsLoading(true);

    const result = await register(fullName.trim(), email.trim(), password);

    setIsLoading(false);

    if (result.success) {
      setSuccessMsg(result.message || 'Registration successful! Please check your email to verify your account.');
      // Clear inputs
      setFullName('');
      setEmail('');
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
          <h2>Create Account</h2>
          <p>Register to start analyzing groundwater levels across districts using AI</p>
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
              <label htmlFor="fullName">Full Name</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <User size={18} />
                </span>
                <input
                  id="fullName"
                  type="text"
                  className="auth-input"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

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

            <div className="auth-input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
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
              {isLoading ? <div className="auth-spinner" /> : 'Register'}
            </button>
          </form>
        )}

        {successMsg && (
          <button 
            className="auth-btn" 
            onClick={() => onViewChange('login')}
            style={{ marginTop: '10px' }}
          >
            Go to Login
          </button>
        )}

        <div className="auth-footer">
          Already have an account?
          <span className="auth-link" onClick={() => onViewChange('login')}>
            Sign In
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
