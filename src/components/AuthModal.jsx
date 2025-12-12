import { useState } from 'react';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import '../pages/login.css';

export default function AuthModal({ open, onClose }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('admin@gmail.com'); // default admin email
  const [password, setPassword] = useState('medi@123'); // default admin password
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        setStatus({ loading: false, error: '', success: 'Signed in successfully.' });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setStatus({ loading: false, error: '', success: 'Account created and signed in.' });
      }
    } catch (error) {
      const message = error?.message || 'Something went wrong. Please try again.';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  const switchMode = () => {
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
    setStatus({ loading: false, error: '', success: '' });
  };

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <div>
            <p className="auth-kicker">Secure access</p>
            <h3 className="auth-title">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h3>
            <p className="auth-subtitle">
              Sign in with your email to continue to MediConnect.
            </p>
          </div>
          <button className="auth-close" onClick={onClose} aria-label="Close login">
            ×
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="auth-label">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </label>

          {status.error && <p className="auth-alert error">{status.error}</p>}
          {status.success && <p className="auth-alert success">{status.success}</p>}

          <button className="auth-submit" type="submit" disabled={status.loading}>
            {status.loading
              ? 'Please wait...'
              : mode === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <span>{mode === 'signin' ? 'New here?' : 'Already have an account?'}</span>
          <button className="auth-switch" type="button" onClick={switchMode}>
            {mode === 'signin' ? 'Create one' : 'Sign in instead'}
          </button>
        </div>
      </div>
    </div>
  );
}

