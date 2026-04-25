import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import './HeroHeader.css';

const HeroHeader = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  const scale = useTransform(smoothProgress, [0, 1], [1, 1.05]);
  const rotateX = useTransform(smoothProgress, [0, 1], [0, 5]);

  const titleText = "Empowering communities through smart volunteering.";
  const words = titleText.split(" ");

  return (
    <motion.section 
      ref={containerRef}
      className="hero-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.div 
        className="badge-wrapper"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="badge-border-glow">
          <svg width="100%" height="100%" viewBox="0 0 200 40" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <rect x="1" y="1" width="198" height="38" rx="19" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2"/>
            <motion.rect
              x="1" y="1" width="198" height="38" rx="19"
              fill="none" stroke="url(#badge-gradient)" strokeWidth="2.5" strokeDasharray="60 140"
              animate={{ strokeDashoffset: [0, -200] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ filter: 'drop-shadow(0 0 8px #3b82f6)' }}
            />
            <defs>
              <linearGradient id="badge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" /><stop offset="50%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="badge">
          <span className="badge-tag">NEW</span>
          <span className="badge-text">SevaSetu 1.0 is live</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </motion.div>

      <motion.h1 className="hero-title">
        {words.map((word, i) => (
          <motion.span 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.21, 0.45, 0.32, 0.9] }}
            style={{ display: 'inline-block', marginRight: '0.25em' }}
          >
            {word}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p 
        className="hero-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        Build efficient resource allocation workflows. Connect volunteers with NGOs and manage disaster relief operations with precision across your entire network.
      </motion.p>

      <div className="hero-actions" style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <motion.button 
          className="btn btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { window.location.href = 'http://localhost:5174/'; }}
        >
          Get the Volunteer App
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
        </motion.button>
        <motion.button 
          className="btn btn-secondary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { window.location.href = 'http://localhost:5173/'; }}
        >
          Admin Dashboard
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
        </motion.button>
      </div>

      <motion.div className="hero-image-container" style={{ scale, rotateX }}>
        <div className="hero-image-placeholder">
          <div className="placeholder-grid">
            <div className="placeholder-card">
              <div className="placeholder-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div><strong>2,847</strong><br/><span style={{color:'#6b6375', fontSize:'12px'}}>Active Volunteers</span></div>
            </div>
            <div className="placeholder-card">
              <div className="placeholder-icon" style={{ background: '#05966915', color: '#059669' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <div><strong>156</strong><br/><span style={{color:'#6b6375', fontSize:'12px'}}>Active Campaigns</span></div>
            </div>
            <div className="placeholder-card">
              <div className="placeholder-icon" style={{ background: '#8b5cf615', color: '#8b5cf6' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              </div>
              <div><strong>98.7%</strong><br/><span style={{color:'#6b6375', fontSize:'12px'}}>Task Completion</span></div>
            </div>
            <div className="placeholder-card">
              <div className="placeholder-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div><strong>4.9★</strong><br/><span style={{color:'#6b6375', fontSize:'12px'}}>User Rating</span></div>
            </div>
          </div>
        </div>
        <div className="hero-image-vignette" />
      </motion.div>
    </motion.section>
  );
};

export default HeroHeader;
