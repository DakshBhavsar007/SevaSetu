import React from 'react';
import { motion } from 'framer-motion';
import './LogoCloud.css';

const CompanyLogo = ({ name, icon }) => (
  <div className="logo-item-wrapper">
    <div className="logo-symbol">{icon}</div>
    <span className="logo-name">{name}</span>
  </div>
);

const companies = [
  { name: "Red Cross", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z"/></svg> },
  { name: "UNICEF", icon: <circle cx="10" cy="10" r="8" fill="currentColor" stroke="none" /> },
  { name: "WHO", icon: <rect width="20" height="10" rx="5" fill="currentColor" /> },
  { name: "Habitat", icon: <path d="M2 12h20M12 2v20" stroke="currentColor" strokeWidth="2" /> },
  { name: "Care India", icon: <path d="M12 2l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7-5.5-4h7l2-7z" fill="currentColor" /> }
];

const institutes = [
  { name: "GiveIndia", icon: <circle cx="10" cy="10" r="10" stroke="currentColor" strokeWidth="2" fill="none"/> },
  { name: "Teach For India", icon: <rect x="2" y="2" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"/> },
  { name: "Akshaya Patra", icon: <rect x="5" y="5" width="14" height="14" fill="currentColor" /> },
  { name: "Pratham", icon: <circle cx="10" cy="10" r="10" stroke="currentColor" strokeWidth="2" fill="none"/> }
];

const MarqueeRow = ({ items, direction = "left", speed = 60 }) => {
  return (
    <div className="marquee-container">
      <motion.div 
        className="marquee-content"
        animate={{ 
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"]
        }}
        transition={{ 
          duration: speed, 
          repeat: Infinity, 
          ease: "linear",
          initial: { x: direction === "left" ? "-25%" : "-25%" }
        }}
        style={{ x: "-25%" }}
      >
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <CompanyLogo key={i} name={item.name} icon={item.icon} />
        ))}
      </motion.div>
    </div>
  );
};

const LogoCloud = () => {
  return (
    <section className="logo-cloud-section">
      <div className="logo-cloud-container">
        <motion.p 
          className="logo-cloud-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Trusted by leading NGOs and humanitarian organizations worldwide.
        </motion.p>
        
        <MarqueeRow items={companies} direction="left" speed={40} />
        
        <div className="marquee-spacer" />
        
        <motion.p 
          className="logo-cloud-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Partnered with top social impact organizations across India.
        </motion.p>
        
        <MarqueeRow items={institutes} direction="right" speed={50} />
      </div>
    </section>
  );
};

export default LogoCloud;
