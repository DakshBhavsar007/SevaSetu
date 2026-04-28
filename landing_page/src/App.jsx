import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import HeroHeader from './components/HeroHeader'
import LogoCloud from './components/LogoCloud'
import HowItWorks from './components/HowItWorks'
import FeaturesList from './components/FeaturesList'
import DetailedShowcase from './components/DetailedShowcase'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

function App() {
  const [pendingScroll, setPendingScroll] = useState(null);

  useEffect(() => {
    // Run tour if first time
    if (!localStorage.getItem('landing_tour_done')) {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        smoothScroll: true,
        stagePadding: 6,
        stageRadius: 12,
        popoverClass: 'premium-tour-theme',
        overlayColor: 'rgba(15, 23, 42, 0.55)',
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: "Got it! 🚀",
        progressText: '{{current}} of {{total}}',
        steps: [
          {
            element: '.hero-fullscreen',
            popover: {
              title: '🌟 Welcome to SevaSetu!',
              description: 'India\'s smart volunteer management platform. Let us give you a quick tour of what we offer.',
              side: 'bottom', align: 'center'
            }
          },
          {
            element: '.hero-actions',
            popover: {
              title: '🚀 Get Started Instantly',
              description: 'Download the Volunteer App to join the field, or open the Admin Dashboard to manage campaigns & teams.',
              side: 'top', align: 'center'
            }
          },
          {
            element: '.hero-stats-row',
            popover: {
              title: '📊 Real-Time Impact',
              description: 'These numbers update live — see active volunteers, running campaigns, and community ratings at a glance.',
              side: 'top', align: 'center'
            }
          },
          {
            element: '.navbar',
            popover: {
              title: '🧭 Explore More',
              description: 'Use this navigation bar to discover features, learn how it works, check pricing, or jump to any section.',
              side: 'bottom', align: 'start'
            }
          }
        ],
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep() || window.confirm('Are you sure you want to skip the tour?')) {
            driverObj.destroy();
            localStorage.setItem('landing_tour_done', 'true');
          }
        },
      });
      setTimeout(() => {
        driverObj.drive();
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (pendingScroll) {
      const el = document.getElementById(pendingScroll);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
          setPendingScroll(null);
        }, 100);
      }
    }
  }, [pendingScroll]);

  const handleNavigate = (targetView) => {
    const sectionElements = {
      'pricing': 'pricing',
      'features': 'features-section',
      'how-it-works': 'process-section'
    };

    if (targetView === 'landing' || targetView === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (sectionElements[targetView]) {
      const el = document.getElementById(sectionElements[targetView]);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
  };

  return (
    <div style={{ padding: '0', backgroundColor: 'white', minHeight: '100vh' }}>
      {/* Fixed navbar floats above everything */}
      <Navbar onNavigate={handleNavigate} />
      <main>
        {/* Hero fills full viewport — navbar is fixed so no offset needed */}
        <HeroHeader />
        <LogoCloud />
        <HowItWorks />
        <FeaturesList />
        <DetailedShowcase onNavigate={handleNavigate} />
        <Pricing />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  )
}

export default App
