import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import './Auth.css';

function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || email.trim() === '') {
      setError('Email is required.');
      return;
    }
    if (!password || password === '') {
      setError('Password is required.');
      return;
    }
    
    setLoading(true);

    const payload = { email: email.trim(), password };
    console.log('Submitting teacher login with:', payload);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Login response:', { status: response.status, data });

      if (!response.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      // Verify it's a teacher
      if (data.user.role !== 'teacher') {
        setError('This account is a student account. Please use student login.');
        setLoading(false);
        return;
      }

      // Store user in sessionStorage and redirect
      sessionStorage.setItem('currentUser', JSON.stringify(data.user));
      console.log('Teacher login successful, redirecting to /teacher');
      setLoading(false);
      navigate('/teacher');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError('Network error. Please check if the backend is running.');
      console.error('Login error:', errorMsg, err);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <span className="auth-logo__icon">⬡</span>
          <span className="auth-logo__text">Vi-SlideS</span>
        </Link>
        <h1 className="auth-title">Teacher Login</h1>
        <p className="auth-subtitle">Sign in to your teacher account</p>
        {error && <div className="auth-error"><span>⚠</span> {error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input id="email" className="auth-input" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <input id="password" className="auth-input" type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Sign in as Teacher'}
          </button>
        </form>
        <p className="auth-switch">
          Don't have a teacher account? <Link to="/signup?role=teacher" className="auth-link">Create one →</Link>
        </p>
        <p className="auth-switch">
          Are you a student? <Link to="/student-login" className="auth-link">Student Login →</Link>
        </p>
      </div>
      <div className="auth-art" aria-hidden="true">
        <div className="auth-art__blob auth-art__blob--1" />
        <div className="auth-art__blob auth-art__blob--2" />
        <div className="auth-art__quote">
          <p>"The best classrooms are driven by questions, not answers."</p>
          <span>— Vi-SlideS principle</span>
        </div>
      </div>
    </div>
  );
}
export default TeacherLogin;
