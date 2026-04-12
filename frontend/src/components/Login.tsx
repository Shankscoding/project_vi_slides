import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getUsers, setCurrentUser } from '../lib/storage';

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }

        setIsSubmitting(true);
        const cleanEmail = email.trim().toLowerCase();
        const users = getUsers();
        const user = users.find((u) => u.email.toLowerCase() === cleanEmail && u.password === password);

        if (!user) {
            setSubmitError('Invalid email or password.');
            setIsSubmitting(false);
            return;
        }

        setCurrentUser(user);
        setIsSubmitting(false);
        if (user.role === 'student') navigate('/student');
        else navigate('/teacher');
    };



    return (
        <div className="page">
            <h1 className="page-title">Login</h1>
            <p className="page-subtitle">Continue to your classroom workspace.</p>
            <form className="form" onSubmit={handleSubmit} noValidate>
                <div className="field">
                    <label>
                        Email:
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(emailError)} />
                    </label>
                    {emailError && <p className="field-error">{emailError}</p>}
                </div>
                <div className="field">
                    <label>
                        Password:
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={Boolean(passwordError)} />
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