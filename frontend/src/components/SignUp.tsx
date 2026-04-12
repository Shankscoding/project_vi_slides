import {  useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, setUsers } from "../lib/storage";

function SignUp() {
    const [name,setname]=useState("");
    const [role,setrole]=useState<"student"|"teacher">("student");
    const [email,setemail]=useState("");
    const [password,setpassword]=useState("");
    const [confirmPassword,setconfirmPassword]=useState("");
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate=useNavigate();

    const validate = () => {
        let isValid = true;
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        setNameError("");
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");
        setSubmitError("");

        if (cleanName.length < 2) {
            setNameError("Name must be at least 2 characters.");
            isValid = false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setEmailError("Enter a valid email address.");
            isValid = false;
        }

        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            isValid = false;
        } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
            setPasswordError("Password must include letters and numbers.");
            isValid = false;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match.");
            isValid = false;
        }

        return isValid;
    };
    
    const handleSubmit=(e:React.FormEvent)=>{
        e.preventDefault();
        if(!validate()){
            return;
        }

        setIsSubmitting(true);
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const newUser = { name: cleanName, email: cleanEmail, password, role };
        const users = getUsers();
        const exists = users.some((u) => u.email.toLowerCase() === cleanEmail);
        if (exists) {
            setSubmitError("A user with this email already exists.");
            setIsSubmitting(false);
            return;
        }

        users.push(newUser);
        setUsers(users);
        setIsSubmitting(false);

        navigate("/login");
    }
    return (
        <div className="page">
            <h1 className="page-title">Sign Up</h1>
            <p className="page-subtitle">Create your account to start collaborative classroom sessions.</p>
            <form className="form" onSubmit={handleSubmit} noValidate>
                <div className="field">
                    <label>
                        Role:
                        <select value={role} onChange={(e)=>setrole(e.target.value as "student" | "teacher")}>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </label>
                </div>

                <div className="field">
                    <label>
                        Name:
                        <input type="text" value={name} onChange={(e)=>setname(e.target.value)} aria-invalid={Boolean(nameError)} />
                    </label>
                    {nameError && <p className="field-error">{nameError}</p>}
                </div>

                <div className="field">
                    <label>
                        Email:
                        <input type="email" value={email} onChange={(e)=>setemail(e.target.value)} aria-invalid={Boolean(emailError)} />
                    </label>
                    {emailError && <p className="field-error">{emailError}</p>}
                </div>
                <div className="field">
                    <label>
                        Password:
                        <input type="password" value={password} onChange={(e)=>setpassword(e.target.value)} aria-invalid={Boolean(passwordError)} />
                    </label>
                    {passwordError && <p className="field-error">{passwordError}</p>}
                </div>
                <div className="field">
                    <label>
                        Confirm Password:
                        <input type="password" value={confirmPassword} onChange={(e)=>setconfirmPassword(e.target.value)} aria-invalid={Boolean(confirmPasswordError)} />
                    </label>
                    {confirmPasswordError && <p className="field-error">{confirmPasswordError}</p>}
                </div>
                {submitError && <p className="field-error">{submitError}</p>}
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Sign Up"}</button>
            </form>
        </div>
    );
}
export default SignUp;