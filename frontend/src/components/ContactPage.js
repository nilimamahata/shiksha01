import React from "react";
import "../ContactPage.css";

const ContactPage = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-text">
          <h2>
            Feed <span>back</span>
          </h2>
          <p>
            "We’d love to hear from you! Your feedback helps us improve and serve you better."
          </p>
          <p className="contact-email">info@shikshacom.com</p>
        </div>

        <form className="contact-form">
          <label>
            Name (required)
            <div className="name-inputs">
              <input type="text" placeholder="First Name" required />
              <input type="text" placeholder="Last Name" required />
            </div>
          </label>

          <label>
            Email (required)
            <input type="email" placeholder="Email" required />
          </label>

          <label>
            Message (required)
            <textarea placeholder="Your message..." required></textarea>
          </label>

          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
