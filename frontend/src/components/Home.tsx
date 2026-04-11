import { Link } from 'react-router-dom';
function Home() {
  return (
    <div className="page">
        <h1 className="page-title">Vi-Slides</h1>
        <p className="page-subtitle">Welcome to Vi-Slides, a platform for creating and sharing interactive presentations.</p>
    <div className="cta-row">
        <Link className="link-btn" to="/login">
            Login
        </Link>
        <Link className="link-btn" to="/signup">
            Sign Up
        </Link>
    </div>

    </div>
  );
}
export default Home;