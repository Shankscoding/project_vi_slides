import { Link } from 'react-router-dom';
function Home() {
  return (
  <div className="page page-hero">
        <h1 className="page-title">Vi-Slides</h1>
    <p className="page-subtitle">AI-powered, question-driven classroom support for teachers, students, and academic mentors.</p>
  <div className="cta-row" style={{ justifyContent: "center" }}>
        <Link className="link-btn" to="/login">
            Login
        </Link>
    <Link className="link-btn ghost-btn" to="/signup">
            Sign Up
        </Link>
    </div>

    </div>
  );
}
export default Home;