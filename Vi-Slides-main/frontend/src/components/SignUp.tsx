import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import './Auth.css';

function SignUp() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get role from URL query parameter if provided
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'student' || roleParam === 'teacher') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!name || name.trim() === '') { 
      setError('Name is required.'); 
      return; 
    }
    if (!email || email.trim() === '') { 
      setError('Email is required.'); 
      return; 
    }
    if (!password || password === '') { 
      setError('Password is required.'); 
      return;
    }
    if (!confirmPassword || confirmPassword === '') { 
      setError('Confirm password is required.'); 
      return;
    }
    if (password !== confirmPassword) { 
      setError('Passwords do not match.'); 
      return; 
    }
    if (password.length < 6) { 
      setError('Password must be at least 6 characters.'); 
      return; 
    }
    
    setLoading(true);
    
    const payload = {
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
      confirmPassword: confirmPassword.trim(),
      role
    };
    
    console.log('Submitting signup with:', payload);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Signup response:', { status: response.status, data });

      if (!response.ok) {
        setError(data.message || 'Sign up failed');
        setLoading(false);
        return;
      }

      // Store signup info for reference
      sessionStorage.setItem('signupComplete', JSON.stringify({ email, role }));
      console.log('Signup successful, redirecting to', role === 'student' ? '/student-login' : '/teacher-login');
      setLoading(false);
      
      if (role === 'student') {
        navigate('/student-login');
      } else {
        navigate('/teacher-login');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError('Network error. Please check if the backend is running.');
      console.error('Signup error:', errorMsg, err);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--signup">
      <div className="auth-art" aria-hidden="true">
        <div className="auth-art__blob auth-art__blob--1" />
        <div className="auth-art__blob auth-art__blob--2" />
        <div className="auth-art__quote">
          <p>"The best classrooms are driven by questions, not answers."</p>
          <span>— Vi-SlideS principle</span>
        </div>
      </div>
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <span className="auth-logo__icon">⬡</span>
          <span className="auth-logo__text">Vi-SlideS</span>
        </Link>
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Join as a student or teacher to get started</p>
        <div className="role-toggle">
          <button type="button"
            className={`role-toggle__btn ${role === 'student' ? 'role-toggle__btn--active' : ''}`}
            onClick={() => setRole('student')}>🎓 Student</button>
          <button type="button"
            className={`role-toggle__btn ${role === 'teacher' ? 'role-toggle__btn--active role-toggle__btn--teacher' : ''}`}
            onClick={() => setRole('teacher')}>📊 Teacher</button>
        </div>
        {error && <div className="auth-error"><span>⚠</span> {error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="name">Full name</label>
            <input id="name" className="auth-input" type="text" placeholder="Your name"
              value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email</label>
            <input id="email" className="auth-input" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <input id="password" className="auth-input" type="password" placeholder="Min. 6 characters"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="confirm">Confirm password</label>
            <input id="confirm" className="auth-input" type="password" placeholder="Repeat your password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit"
            className={`auth-submit ${role === 'teacher' ? 'auth-submit--teacher' : ''}`}
            disabled={loading}>
            {loading ? <span className="auth-spinner" /> : `Create ${role} account`}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to={role === 'student' ? "/student-login" : "/teacher-login"} className="auth-link">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
export default SignUp;