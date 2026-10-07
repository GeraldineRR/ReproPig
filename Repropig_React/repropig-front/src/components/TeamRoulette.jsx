import React, { useState, useEffect } from 'react';
import './TeamRoulette.css';

import team1 from '../assets/team/andry_new.png';
import team2 from '../assets/team/team2.jpeg';
import team3 from '../assets/team/team3.jpeg';
import team4 from '../assets/team/team4.jpeg';
import team5 from '../assets/team/team5.png';
import team6 from '../assets/team/team6.jpeg';

const teamMembers = [
  {
    id: 1,
    name: "Andry Girley Rubiano Padilla",
    email: "andryrubiano6@gmail.com",
    image: team1,
    role: "Analista y Desarrolladora",
    description: "Organizadora con habilidades de liderazgo. Mantiene al equipo enfocado y asegura la calidad del proyecto."
  },
  {
    id: 2,
    name: "Liseth Natalia Pulido Gomez",
    email: "pulidoliseth906@gmail.com",
    image: team2,
    role: "Analista y Desarrolladora",
    description: "Enfocada en interfaces de usuario y experiencia visual. Aporta creatividad para el diseño del sistema."
  },
  {
    id: 3,
    name: "Maria Alejandra Perez Paramo",
    email: "paramomali@gmail.com",
    image: team3,
    role: "Analista y Desarrolladora",
    description: "Encargada del testeo y estructuración. Asegura que los procesos cumplan con los requerimientos técnicos."
  },
  {
    id: 4,
    name: "Geraldine Rodriguez Rondon",
    email: "geraldinerondon2008@gmail.com",
    image: team4,
    role: "Analista y Desarrolladora",
    description: "Colabora en el modelado de datos y desarrollo funcional. Mantiene la integridad de las soluciones aportadas."
  },
  {
    id: 5,
    name: "Juan Felipe Lopez Cuellar",
    email: "juan.felipe3086@gmail.com",
    image: team5,
    role: "Analista y Desarrollador",
    description: "Enfocado en bases de datos y arquitectura de servidores. Garantiza el correcto flujo de la información."
  },
  {
    id: 6,
    name: "David Santiago Hernandez Sosa",
    email: "davidher15141@gmail.com",
    image: team6,
    role: "Analista y Desarrollador",
    description: "Especializado en la lógica de negocio. Enfocado en la optimización y funcionalidad de la aplicación."
  }
];

function TeamRoulette() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % teamMembers.length);
    }, 4000); // Rota cada 4 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="roulette-container">
      <div className="roulette-slider">
        {teamMembers.map((member, index) => {
          let className = "roulette-card";
          if (index === activeIndex) {
            className += " active";
          } else if (index === (activeIndex - 1 + teamMembers.length) % teamMembers.length) {
            className += " prev";
          } else if (index === (activeIndex + 1) % teamMembers.length) {
            className += " next";
          } else {
            className += " hidden";
          }

          return (
            <div key={member.id} className={className} onClick={() => setActiveIndex(index)}>
              <div className="card-image-wrapper">
                <img src={member.image} alt={`Team member ${member.id}`} />
              </div>
              <div className="card-content">
                <h3>{member.name}</h3>
                <span className="role">{member.role}</span>
                <p className="desc">{member.description}</p>
                <a href={`mailto:${member.email}`} className="email">
                  {member.email}
                </a>
              </div>
            </div>
          );
        })}
      </div>
      <div className="roulette-indicators">
        {teamMembers.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default TeamRoulette;
