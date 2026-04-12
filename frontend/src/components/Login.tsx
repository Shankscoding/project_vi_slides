import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { login } from '../lib/authApi';
import { setAuthSession } from '../lib/storage';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        let isValid = true;
        const cleanEmail = email.trim().toLowerCase();

        setEmailError("");
        setPasswordError("");
        setSubmitError("");

        if (!cleanEmail) {
            setEmailError("Email is required.");
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setEmailError("Enter a valid email address.");
            isValid = false;
        }

        if (!password) {
            setPasswordError("Password is required.");
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const session = await login({
                email: email.trim().toLowerCase(),
                password
            });

            setAuthSession(session);

            if (session.user.role === 'student') {
                navigate('/student');
            } else {
                navigate('/teacher');
            }
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Login failed.');
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="page">
            <h1 className="page-title">Login</h1>
            <p className="page-subtitle">Continue to your classroom workspace.</p>
            <form className="form" onSubmit={handleSubmit} noValidate>
                <div className="field">
                    <label>
                        Email:
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(emailError)} autoComplete="email" />
                    </label>
                    {emailError && <p className="field-error">{emailError}</p>}
                </div>
                <div className="field">
                    <label>
                        Password:
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={Boolean(passwordError)} autoComplete="current-password" />
                    </label>
                    {passwordError && <p className="field-error">{passwordError}</p>}
                </div>
                {submitError && <p className="field-error">{submitError}</p>}
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Login"}</button>
            </form>
        </div>
    );
}
export default Login;