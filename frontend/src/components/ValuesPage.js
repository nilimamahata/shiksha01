import React from "react";
import "./About2.css";

const ValuesPage = () => {
  return (
    <div className="about2-container">
      <header className="about2-header">
        <h1>Our Values</h1>
      </header>
      <section className="about2-cards">
        <div className="about2-card">
          <p>
            At Shiksha, our values are the foundation of everything we do.
            Commitment to excellence ensures we deliver the highest quality
            education. Quality in our content and services empowers learners to
            succeed. Inclusivity means we welcome and support learners from all
            backgrounds, making education accessible to everyone. Innovation
            drives us to continuously improve and adapt to the evolving needs of
            our community. These values guide our decisions and inspire our team
            to create a positive impact in the world of education.
          </p>
          <p>
            Digital Mode of Learning aims to enhance teaching and learning
            through technology integration. - Mobile schools or “ m-learning”
            bring education directly to remote communities, often incorporating
            digital tools. - Platforms like Zoom & Google Meet are provided for
            easily accessible and high interactive education through digital
            learning materials.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ValuesPage;
