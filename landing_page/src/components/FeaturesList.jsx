import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import './FeaturesList.css';

const FeatureCard = ({ feature, index }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const backgroundGlow = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(450px circle at ${x}px ${y}px, ${feature.color}35, transparent 80%)`
  );

  return (
    <motion.div
      className={`feature-card ${feature.size}`}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.21, 0.45, 0.32, 0.9] }}
    >
      <motion.div className="feature-glow-overlay" style={{ background: backgroundGlow }} />
      <div className="card-top-accent" style={{ background: feature.color }} />
      <div className="feature-icon-wrapper" style={{ background: `${feature.color}15`, color: feature.color }}>
        {feature.iconSVG}
      </div>
      <div className="feature-content">
        <h3 className="feature-title">{feature.title}</h3>
        <p className="feature-description">{feature.description}</p>
      </div>
      <div className="feature-detail-badge" style={{ borderColor: `${feature.color}30`, color: feature.color }}>
        {feature.tag}
      </div>
    </motion.div>
  );
};

const FeaturesList = () => {
  const features = [
    { 
      title: "Smart Volunteer Matching", 
      description: "AI-driven matching of volunteers to campaigns based on skills, location, and availability.", 
      iconSVG: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      color: "#3b82f6", tag: "CORE", size: "tall" 
    },
    { 
      title: "Resource Allocation", 
      description: "Automated resource distribution based on campaign needs and volunteer capacity.", 
      iconSVG: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
      color: "#059669", tag: "NEW", size: "wide" 
    },
    { 
      title: "Real-time Tracking", 
      description: "Monitor volunteer activities and campaign progress with live dashboards.", 
      iconSVG: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
      color: "#1a1c1e", tag: "GPS", size: "small" 
    },
    { 
      title: "Impact Analytics", 
      description: "Comprehensive reports on campaign effectiveness and volunteer engagement metrics.", 
      iconSVG: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
      color: "#8b5cf6", tag: "DATA", size: "small" 
    },
    { 
      title: "Instant Deployment", 
      description: "From campaign creation to volunteer deployment in minutes, not days.", 
      iconSVG: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
      color: "#f59e0b", tag: "FAST", size: "wide" 
    },
    { 
      title: "Team Coordination", 
      description: "Collaborate across regions with real-time updates and communication tools.", 
      iconSVG: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
      color: "#ec4899", tag: "TEAM", size: "small" 
    }
  ];

  return (
    <section className="features-section" id="features-section">
      <div className="features-container">
        <div className="features-header-small">Capabilities</div>
        <h2 className="features-main-title">Built for social impact at scale.</h2>
        <div className="features-bento-grid">
          {features.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesList;
