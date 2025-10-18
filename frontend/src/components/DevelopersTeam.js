import React from "react";
import "./Contact2.css";
import possumImage from "../images/cartoon-like-possum-illustration.jpg";
import NilimaImage from "../images/Nilima.jpeg";
import EvelynImage from "../images/Evelyn.jpg";
import JohnImage from "../images/John.jpg";
import teteiImage from "../images/tetei.jpg";
import PuipuiImage from "../images/Puipui.jpg";
import SimonImage from "../images/Simon.jpg";
import sayantaneeImage from "../images/sayantanee.jpg";

const DevelopersTeam = () => {
  const teamMembers = [
    {
      name: "Nilima Mahata",
      role: "Developer",
      email: "nilimahata0409@gmail.com",
      image: NilimaImage
    },
    {
      name: "Evelyn Lallawmzuali",
      role: "Developer",
      email: "zualijongte16@gmail.com",
      image: EvelynImage
    },
    {
      name: "John Lalruatpuia",
      role: "Developer",
      email: "johnruatpuia@gmail.com",
      image: JohnImage

    },
    {
      name: "K.Lallawmsangzuali",
      role: "Developer",
      email: "teteikhupngai54@gmail.com",
      image: teteiImage
    },
    {
      name: "C. Lalrinpuii",
      role: "Developer",
      email: "rinpuii17@gmail.com",
      image: PuipuiImage
    },
    {
      name: "Simon Lalramdinhngeta",
      role: "Developer",
      email: "simonxblaze@gmail.com",
      image: SimonImage
    },
    {
      name: "Sayantanee Santra",
      role: "Developer",
      email: "santrasayantanee2310@gmail.com ",
      image: sayantaneeImage
    },
  ];

  return (
    <div className="contact2-container">
      <header className="contact2-header">
        <h1>Developers Team</h1>
        <p>Meet our talented developers building the future of education technology.</p>
      </header>

      <section className="contact2-employees">
        <div className="employee-cards">
          {teamMembers.map((member, index) => (
            <div key={index} className="employee-card">
              <img src={member.image} alt={member.name} className="profile-pic" />
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

export default DevelopersTeam;
