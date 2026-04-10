import { Link } from 'react-router-dom';
function Home() {
  return (
    <div>
        <h1>Vi-Slides</h1>
        <p>Welcome to Vi-Slides, a platform for creating and sharing interactive presentations.</p>
    <div>
        <Link to="/login">
            Login
        </Link>
    </div>

    <div>
        <Link to="/signup">
            Sign Up
        </Link>
    </div>

    </div>
  );
}
export default Home;