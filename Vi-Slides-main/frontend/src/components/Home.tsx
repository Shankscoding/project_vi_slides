import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <nav className="home-nav">
        <div className="home-nav__logo">
          <span className="home-nav__logo-icon">⬡</span>
          <span className="home-nav__logo-text">Vi-SlideS</span>
        </div>
        <div className="home-nav__actions">
          <Link to="/student-login" className="btn btn--ghost">Student Login</Link>
          <Link to="/teacher-login" className="btn btn--ghost">Teacher Login</Link>
          <Link to="/signup" className="btn btn--primary">Get started</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero__eyebrow">
          <span className="hero__badge">AI-Powered Classroom</span>
        </div>
        <h1 className="hero__title">
          Teaching shaped by<br />
          <span className="hero__title--accent">student curiosity</span>
        </h1>
        <p className="hero__subtitle">
          Vi-SlideS transforms lectures into adaptive, question-driven experiences.
          AI analyzes class mood, triages questions, and lets teachers focus on
          what matters most.
        </p>
        <div className="hero__cta">
          <Link to="/signup" className="btn btn--primary btn--lg">Start for free</Link>
          <Link to="/student-login" className="btn btn--outline btn--lg">Student Login</Link>
          <Link to="/teacher-login" className="btn btn--outline btn--lg">Teacher Login</Link>
        </div>

        <div className="hero__mockup">
          <div className="mockup-window">
            <div className="mockup-window__bar">
              <span /><span /><span />
            </div>
            <div className="mockup-window__body">
              <div className="mockup-sidebar">
                <div className="mockup-sidebar__item mockup-sidebar__item--active">
                  <span className="mockup-dot mockup-dot--purple" /> Live Session
                </div>
                <div className="mockup-sidebar__item">
                  <span className="mockup-dot mockup-dot--teal" /> Questions
                </div>
                <div className="mockup-sidebar__item">
                  <span className="mockup-dot mockup-dot--gray" /> Analytics
                </div>
              </div>
              <div className="mockup-main">
                <div className="mockup-stat-row">
                  <div className="mockup-stat">
                    <span className="mockup-stat__val">24</span>
                    <span className="mockup-stat__label">Questions</span>
                  </div>
                  <div className="mockup-stat">
                    <span className="mockup-stat__val mockup-stat__val--green">87%</span>
                    <span className="mockup-stat__label">Engaged</span>
                  </div>
                  <div className="mockup-stat">
                    <span className="mockup-stat__val mockup-stat__val--purple">12</span>
                    <span className="mockup-stat__label">AI answered</span>
                  </div>
                </div>
                <div className="mockup-cards">
                  <div className="mockup-card mockup-card--ai">
                    <span className="mockup-card__tag mockup-card__tag--ai">AI</span>
                    <span className="mockup-card__text">What is supervised learning?</span>
                  </div>
                  <div className="mockup-card mockup-card--teacher">
                    <span className="mockup-card__tag mockup-card__tag--teacher">Teacher</span>
                    <span className="mockup-card__text">How does backpropagation handle vanishing gradients?</span>
                  </div>
                  <div className="mockup-card mockup-card--ai">
                    <span className="mockup-card__tag mockup-card__tag--ai">AI</span>
                    <span className="mockup-card__text">Define overfitting in simple terms.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <p className="features__label">How it works</p>
        <h2 className="features__title">Three steps to adaptive teaching</h2>
        <div className="features__grid">
          <div className="feature-card">
            <div className="feature-card__num">01</div>
            <h3 className="feature-card__title">Introduce & collect</h3>
            <p className="feature-card__body">Teacher gives a 5–10 minute overview. Students submit questions anonymously or identified.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__num">02</div>
            <h3 className="feature-card__title">AI analyzes & triages</h3>
            <p className="feature-card__body">Classifies questions by cognitive complexity, detects class mood, and instantly answers factual queries.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__num">03</div>
            <h3 className="feature-card__title">Teacher focuses & guides</h3>
            <p className="feature-card__body">Complex questions surface on the teacher's dashboard. Override AI answers, guide discussion dynamically.</p>
          </div>
        </div>
      </section>

      <section className="roles">
        <div className="role-card role-card--student">
          <div className="role-card__icon">🎓</div>
          <h3 className="role-card__title">For Students</h3>
          <ul className="role-card__list">
            <li>Submit questions anonymously or with your name</li>
            <li>Track whether AI or teacher answered</li>
            <li>See your questions shape class direction</li>
            <li>Get instant answers on factual doubts</li>
          </ul>
          <Link to="/signup" className="btn btn--primary role-card__btn">Join as student</Link>
        </div>
        <div className="role-card role-card--teacher">
          <div className="role-card__icon">📊</div>
          <h3 className="role-card__title">For Teachers</h3>
          <ul className="role-card__list">
            <li>Real-time dashboard with class mood & motivation</li>
            <li>AI-prioritized queue of complex questions</li>
            <li>Suggested teaching direction based on gaps</li>
            <li>Override or approve AI-generated answers</li>
          </ul>
          <Link to="/signup" className="btn btn--accent role-card__btn">Join as teacher</Link>
        </div>
      </section>

      <footer className="home-footer">
        <span className="home-nav__logo-text">Vi-SlideS</span>
        <p>AI-powered adaptive classroom · Built by Rohit Sharma</p>
      </footer>
    </div>
  );
}

export default Home;