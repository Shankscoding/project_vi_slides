import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        

        //using session storage for demo purpose, later we have to replace it with the api call and also we have to handle the token and role based routing
        const users = JSON.parse(sessionStorage.getItem("users") || "[]");

        // Find user by email & password
        const user = users.find((u: any) => u.email === email && u.password === password);

        if (user) {
            alert('Login successful!');
            sessionStorage.setItem("currentUser", JSON.stringify(user)); // Store current user in sessionStorage
            if (user.role === 'student') navigate('/student');
            else if (user.role === 'teacher') navigate('/teacher');
        } else {
            alert('Invalid email or password or user not found');
        }


        // try{
        //     const response = await fetch('http://localhost:5000/api/login', {   
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({ email, password }),
        //     });
        //     const data = await response.json();
        //     if (response.ok) {
        //         alert('Login successful!');
        //         if(data.role === 'student') {
        //             navigate('/student');
        //         } else if(data.role === 'teacher') {
        //             navigate('/teacher');
        //         }
        //     } else {
        //         alert(`Login failed: ${data.message}`);
        //     }
        // } catch (error) {
        //     alert('Server error');

        // }
};
//later we will add the
// Handle login logic here (e.g., API call)
//styling
//api logic is already there but commented, later we have to replace the local storage logic with the api call and also we have to handle the token and role based routing
//we have to prevent the direct access to the dashboard without login and also based on role
//we have to add a common layout for both student and teacher dashboard with sidebar and header
//we have to add the logout functionality and also we have to clear the token and user data from the local storage on logout
//we have to add the remember me functionality and also we have to persist the user data in the local storage or cookies based on the remember me option
//we have to add the forgot password functionality and also we have to handle the password reset logic



    return (
        <div className="page">
            <h1 className="page-title">Login</h1>
            <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                    <label>
                        Email:
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </label>
                </div>
                <div className="field">
                    <label>
                        Password:
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </label>
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}
export default Login;