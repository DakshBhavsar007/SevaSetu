import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './HowItWorks.css';

const words = ["NGOS", "VOLUNTEERS", "COMMUNITIES", "RESPONDERS"];

const FeatureCard = ({ step, index }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      className="process-card"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.21, 0.45, 0.32, 0.9] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="process-image-box" style={{ transform: "translateZ(50px)" }}>
        <div className="step-icon-container">
          {step.icon}
        </div>
        <motion.div 
          className="step-number-float"
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 + index * 0.1 }}
        >
          {step.id}
        </motion.div>
      </div>
      <div style={{ transform: "translateZ(30px)" }}>
        <h3 className="process-step-title">{step.title}</h3>
        <p className="process-step-desc">{step.desc}</p>
      </div>
    </motion.div>
  );
};

const HowItWorks = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      title: "Register & Onboard",
      desc: "Sign up as an NGO admin or volunteer. Set up your profile and define your area of expertise and availability.",
      id: "01",
      icon: <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
    },
    {
      title: "Create Campaigns",
      desc: "Set up relief campaigns with specific requirements, locations, and resource needs. Our system handles the logistics.",
      id: "02",
      icon: <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    },
    {
      title: "Smart Matching",
      desc: "SevaSetu intelligently matches volunteers to campaigns based on skills, location, and availability automatically.",
      id: "03",
      icon: <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    },
    {
      title: "Track & Report",
      desc: "Monitor campaign progress in real-time, manage resources, and generate impact reports for all stakeholders.",
      id: "04",
      icon: <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    }
  ];

  return (
    <section className="process-section" id="process-section">
      <div className="process-header">
        <div className="scrolling-text-container">
          FOR 
          <div className="scrolling-word-wrapper">
            <AnimatePresence mode="wait">
              <motion.div
                key={words[index]}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ position: 'absolute' }}
              >
                {words[index]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <motion.h2 
          className="process-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.21, 0.45, 0.32, 0.9] }}
        >
          One platform. <br />Better impact.
        </motion.h2>
        <motion.p 
          className="process-subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.21, 0.45, 0.32, 0.9] }}
        >
          From volunteer onboarding, to smart matching, to impact tracking—manage your entire social impact pipeline in one place.
        </motion.p>
      </div>

      <div className="process-grid">
        {steps.map((step, i) => (
          <FeatureCard key={i} step={step} index={i} />
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
