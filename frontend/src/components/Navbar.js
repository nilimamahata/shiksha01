import React from "react";
import "../Navbar.css";
import logo from "../images/Shiksa_logo.png";

function Navbar({ onLoginClick, onSignupClick }) {
  return (
    <nav className="navbar">
      {/* Left side: logo + name */}
      <div className="navbar-left">
        <img src={logo} alt="Logo" className="logo" />
        <span className="brand-name">
          <span className="black">Shik</span>
          <span className="green">sha</span>
        </span>
      </div>

      {/* Middle: navigation links */}
      <ul className="navbar-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      {/* Right side: login/signup */}
      <div className="navbar-auth" style={{ display: 'flex', justifyContent: 'center', gap: '8px', width: 'auto' }}>
        <button onClick={onLoginClick} className="login-btn" style={{ width: '70px', height: '28px', fontSize: '13px' }}>Login</button>
        <button onClick={onSignupClick} className="signup-btn" style={{ width: '70px', height: '28px', fontSize: '13px' }}>Signup</button>
      </div>
    </nav>
  );
}

export default Navbar;
