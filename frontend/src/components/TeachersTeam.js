import React from "react";
import "./Contact2.css";

const TeachersTeam = () => {
  const teamMembers = [
    {
      name: "Janet Lalhmangaihzuali",
      qualification: "Bachelor of Arts",
      subject: "History",
      
    },
    {
      name: "Lalnunmawii",
      qualification: "Master of commerce",
      subject: "Economics",
      
    },
    {
      name: "Vanlalhluzuali",
      qualification: "M.A(History & Ethnography)",
      subject: "History",
    },
    {
      name: "Mimi Lalramthari",
      qualification: "M.A(History & Ethnography)",
      subject: "English",
    },
    {
      name: "Eric Lalsiamliana",
      qualification: "M.A(History & Ethnography)",
      subject: "History",
    },
    {
      name: "Vanlalhmuthai",
      qualification: "Master of Commerce",
     subject: "Business Studies",
    },
    {
      name: "Lalduhsaka",
      qualification: "M.A(Political Science) , B.Ed",
      subject: "Political Science",
    },
    {
      name: "Zothanpuia",
      qualification: "M.A(Political Science) , B.Ed",
      subject: "Political Science",
    },
    {
      name: "Lallawmthari",
      qualification: "Master of Commerce",
      subject: "Business Mathematics",
    },
    {
      name: "Dinah Lalremhlui",
      qualification: "B.Sc(Zoology), B.Ed",
     subject: "Biology",
    },
    {
      name: "R.Laldinpuii",
      qualification: "M.A(Sociology), B.Ed",
      subject: "Sociology",
    },
    {
      name: "Laltlanmawii",
      qualification: "Master of Commerce",
      subject: "Financial Accounting",
    
    },
    {
      name: "Lalsiamliani",
      qualification: "Master of Commerce",
      subject: "Mathematics and Economics",
     
    },
    {
      name: "V.Lalrindika",
      qualification: "M.Sc(Geography), B.Ed ",
      subject: "Geography",
    },
    {
      name: "Jayson Lalrindika",
      qualification: "Bachelor of Science (Biotechnology)", 
      subject: "Biology",
    }
    

  ];

  return (
    <div className="contact2-container">
      <header className="contact2-header">
        <h1>Teachers Team</h1>
        <p>Meet our dedicated educators and content creators.</p>
      </header>

      <section className="contact2-employees">
        <div className="employee-cards">
          {teamMembers.map((member, index) => (
            <div key={index} className="employee-card">
              <h3>{member.name}</h3>
              <p><strong>{member.qualification}</strong></p>
              <p>{member.subject}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TeachersTeam;