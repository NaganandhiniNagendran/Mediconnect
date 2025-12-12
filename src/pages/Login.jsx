import { useState } from 'react';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import './login.css';

export default function LoginPage({ onBack }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('admin@gmail.com'); // default admin email
  const [password, setPassword] = useState('medi@123'); // default admin password
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

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
    <div className="login-page">
      <header className="login-topbar">
        <div className="logo-container">
          <div className="logo-box">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="logo-text">MediConnect</span>
        </div>
        <button className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
      </header>

      <main className="login-content">
        <div className="login-card">
          <p className="auth-kicker">Secure access</p>
          <h1 className="auth-title">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="auth-subtitle">
            Sign in with your email to continue to MediConnect.
          </p>

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
        <div className="login-illustration">
          <div className="login-illustration-card">
            <p className="login-pill">Telehealth</p>
            <h3>Healthcare, reimagined.</h3>
            <p>
              Connect with certified doctors 24/7, book consultations, and manage
              your health records securely.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

