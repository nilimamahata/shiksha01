import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import bgImage from '../images/bg.jpg';
import '../Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="home-section"
      style={{
        backgroundImage: 'url(' + bgImage + ')',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',

      }}
    >


      {/* Social Links at Bottom Left */}
      <div className="social-links">
        <a href="https://www.facebook.com/profile.php?id=61580053190184" target="_blank" rel="noreferrer"><FaFacebookF /></a>
        <a href="https://www.instagram.com/shikshacom/" target="_blank" rel="noreferrer"><FaInstagram /></a>
        <a href="https://www.youtube.com/@Shikshacom-edu" target="_blank" rel="noreferrer"><FaYoutube /></a>
      </div>



      {/* Main Content Card */}
      <div className="home-card">
        <h1>Welcome to <span className="brand-name-home">Shiksha</span></h1>
        <p className="initial-text">Your gateway to live and recorded classes from Class 8 to 12, virtual education accessible anywhere!</p>
        <p className="comfort-text">"Empowerment through Education"</p>
        <button className="get-started-btn" onClick={() => navigate('/courses')}>Get Started</button>

      </div>
    </section>
  );
};


export default Home;

