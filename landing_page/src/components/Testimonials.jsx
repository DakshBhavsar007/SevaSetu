import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import './Testimonials.css';

const testimonials = [
  {
    quote: "SevaSetu transformed how we coordinate disaster relief. We deployed 200 volunteers across 5 districts in just 24 hours.",
    author: "Dr. Meera Patel",
    role: "Director @ Relief Foundation India",
    initials: "MP",
    color: "#3b82f6",
    size: "large"
  },
  {
    quote: "The volunteer matching is incredibly precise. It saved us weeks of manual coordination.",
    author: "Arjun Nair",
    role: "Operations Lead @ GreenHope",
    initials: "AN",
    color: "#10b981",
    size: "small"
  },
  {
    quote: "Finally, a platform that understands the unique challenges of NGO operations. The impact reports have been game-changing.",
    author: "Kavitha Rajan",
    role: "Program Manager @ HelpIndia",
    initials: "KR",
    color: "#f59e0b",
    size: "medium"
  },
  {
    quote: "Our volunteers are more engaged than ever. The app makes it so easy to find and join campaigns.",
    author: "Sanjay Gupta",
    role: "Founder @ YouthForChange",
    initials: "SG",
    color: "#8b5cf6",
    size: "medium"
  },
  {
    quote: "The best ROI we've seen from any volunteer management tool. Efficient, intuitive, and scalable.",
    author: "Fatima Sheikh",
    role: "VP Operations @ CareBridge",
    initials: "FS",
    color: "#ec4899",
    size: "large"
  },
  {
    quote: "A must-have for any organization working in disaster response. Simply outstanding.",
    author: "Raj Malhotra",
    role: "Emergency Coordinator @ NDRF",
    initials: "RM",
    color: "#1a1c1e",
    size: "small"
  }
];

const TestimonialCard = ({ t, index }) => {
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
      className={`testimonial-card-wrapper size-${t.size}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
    >
      <motion.div 
        className="testimonial-card"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="quote-icon-bg">
          <Quote size={80} opacity={0.05} />
        </div>
        
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill={t.color} color={t.color} opacity={0.4} />
          ))}
        </div>

        <p className="testimonial-quote">"{t.quote}"</p>
        
        <div className="testimonial-author">
          <div className="author-avatar" style={{ color: t.color }}>
            {t.initials}
          </div>
          <div className="author-info">
            <h4>{t.author}</h4>
            <p>{t.role}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <div className="testimonials-bg-glow" />
      
      <div className="testimonials-header">
        <motion.span 
          className="testimonials-label"
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ duration: 1 }}
        >
          Voices of Impact
        </motion.span>
        <motion.h2 
          className="testimonials-title"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.21, 0.45, 0.32, 0.9] }}
        >
          Trusted by Change Makers.
        </motion.h2>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} t={t} index={i} />
        ))}
      </div>

      <div className="company-logo-strip">
        <span className="company-logo">RELIEF_INDIA</span>
        <span className="company-logo">GREENH0PE</span>
        <span className="company-logo">HELPINDIA_</span>
        <span className="company-logo">CAREBRIDGE</span>
        <span className="company-logo">YOUTH_FC</span>
      </div>
    </section>
  );
};

export default Testimonials;
