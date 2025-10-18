import React from "react";
import "../Footer.css";
import { Link } from 'react-router-dom';


const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <h2>Shiksha<span> </span></h2>
          <p>
            "Empowerment  through  Education "</p>
         
          <div className="flex">
            <div className="address">
              <h4>Address</h4>
              <p>Aizawl, Mizoram<br />796009</p>
            </div>
            <div className="contact">
              <h4>Contact</h4>
              <p>+91 xxxxxxxxxx</p>
            </div>
          </div>

        </div>

        <div className="footer-info">

 <div className="contact">
            <h4>Company</h4>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/courses">Courses</Link></li>
            <li><Link to="/service">Services</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </div>

          <div className="contact">
            <h4>Classes</h4>
            <li>Class 8</li>
            <li>Class 9</li>
            <li>Class 10</li>
            <li>Class 11</li>
            <li>Class 12</li>
          </div>

          <div className="contact">
            <h4>Subjects</h4>
            <li>English</li>
            <li>Mathematics</li>
            <li>Physics</li>
            <li>Chemistry</li>
            <li>Biology</li>
            <li>Computer</li>
          </div>

          <div className="contact">
            <h4>Centres</h4>
            <li>Siliguri</li>
            <li>Mizoram</li>
            <li>Gurgaon</li>
            <li>Nagaland</li>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        ©2025, Shiksha.inc
      </div>
    </footer>
  );
};

export default Footer;
