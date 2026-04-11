import {  useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
function SignUp() {
    const [name,setname]=useState("");
    const [role,setrole]=useState<"student"|"teacher">("student");
    const [email,setemail]=useState("");
    const [password,setpassword]=useState("");
    const [confirmPassword,setconfirmPassword]=useState("");
    const navigate=useNavigate();
    
    const handleSubmit=(e:React.FormEvent)=>{
        e.preventDefault();
        if(password!==confirmPassword){
            alert("Passwords do not match");
            return;
        }

        // Handle sign up logic here (e.g., API call)

        //using session storage for demo purpose, later we have to replace it with the api call and also we have to handle the token and role based routing
            
        const newUser = { name, email, password, role };
        // Retrieve existing users or empty array
        const users = JSON.parse(sessionStorage.getItem("users") || "[]");
        const exists = users.some((u: any) => u.email === email);
        if (exists) {
            alert("User with this email already exists");
            return;
        }
        // Add new user
        users.push(newUser);
        // Save back to sessionStorage
        sessionStorage.setItem("users", JSON.stringify(users));
        alert("Signup successful!");

        navigate("/login");
    }
    return (
        <div className="page">
            <h1 className="page-title">Sign Up</h1>
            <form className="form" onSubmit={handleSubmit}>
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
                        <input type="text" value={name} onChange={(e)=>setname(e.target.value)} required />
                    </label>
                </div>

                <div className="field">
                    <label>
                        Email:
                        <input type="email" value={email} onChange={(e)=>setemail(e.target.value)} required />
                    </label>
                </div>
                <div className="field">
                    <label>
                        Password:
                        <input type="password" value={password} onChange={(e)=>setpassword(e.target.value)} required />
                    </label>
                </div>
                <div className="field">
                    <label>
                        Confirm Password:
                        <input type="password" value={confirmPassword} onChange={(e)=>setconfirmPassword(e.target.value)} required />
                    </label>
                </div>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}
export default SignUp;