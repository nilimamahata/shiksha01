import React from "react";
import "./Contact2.css";

const CeoFounderTeam = () => {
  const teamMembers = [
    {
      name: "Dhanandjay  Kumar",
      role: "CEO & Founder",
      bio: "he is the visionary behind Shiksha, with over 20 years of experience in education technology. He founded the company to revolutionize online learning.",
      email: "info@shikshacom.com",
    }
  ];

  return (
    <div className="contact2-container">
      <header className="contact2-header">
        <h1>CEO and Shiksha Team</h1>
        <p>Meet our leadership team driving the vision of Shiksha.</p>
      </header>

      <section className="contact2-employees">
        <div className="employee-cards">
          {teamMembers.map((member, index) => (
            <div key={index} className="employee-card">
              <h3>{member.name}</h3>
              <p><strong>{member.role}</strong></p>
              <p>{member.bio}</p>
              <p><strong>Email:</strong> {member.email}</p>
              
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CeoFounderTeam;
