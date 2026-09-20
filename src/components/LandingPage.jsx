import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Play, 
  Pause, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Mail, 
  Sliders, 
  Activity, 
  Layers, 
  Box, 
  ShieldCheck, 
  Zap, 
  Compass, 
  X,
  ChevronRight,
  TrendingUp,
  Cpu,
  Eye,
  Check
} from 'lucide-react';
import { MACHINES } from '../data/machines';

export default function LandingPage({ onGetStarted, onLoginClick, onSelectMachine }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(42);
  const [activeToggle1, setActiveToggle1] = useState(true);
  const [activeToggle2, setActiveToggle2] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [activeNav, setActiveNav] = useState('Product');
  const [showModal, setShowModal] = useState(false);

  // Video timeline simulation ticker
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setVideoProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const searchResults = Object.values(MACHINES).filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLaunchMachine = (machineId) => {
    if (onSelectMachine) {
      onSelectMachine(machineId);
    } else if (onGetStarted) {
      onGetStarted();
    }
  };

  return (
    <div className="landing-ui-root">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="landing-navbar">
        {/* Brand Logo */}
        <div className="landing-brand" onClick={() => setActiveNav('Home')}>
          <div className="landing-logo-icon">
            <div className="logo-diamond-inner" />
          </div>
          <span className="landing-brand-text">LOREM IPSUM</span>
        </div>

        {/* Center Nav Links */}
        <nav className="landing-nav-links">
          <button 
            className={`landing-nav-link ${activeNav === 'Home' ? 'active' : ''}`}
            onClick={() => {
              setActiveNav('Home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Home
            {activeNav === 'Home' && <span className="nav-active-pill" />}
          </button>

          <button 
            className={`landing-nav-link ${activeNav === 'Product' ? 'active' : ''}`}
            onClick={() => setActiveNav('Product')}
          >
            Product
            {activeNav === 'Product' && <span className="nav-active-pill" />}
          </button>

          <button 
            className={`landing-nav-link ${activeNav === 'About' ? 'active' : ''}`}
            onClick={() => setActiveNav('About')}
          >
            About us
            {activeNav === 'About' && <span className="nav-active-pill" />}
          </button>

          <button 
            className={`landing-nav-link ${activeNav === 'FAQ' ? 'active' : ''}`}
            onClick={() => setActiveNav('FAQ')}
          >
            FAQ
            {activeNav === 'FAQ' && <span className="nav-active-pill" />}
          </button>

          <button 
            className={`landing-nav-link ${activeNav === 'Login' ? 'active' : ''}`}
            onClick={() => {
              if (onLoginClick) onLoginClick();
              else setShowModal(true);
            }}
          >
            Log in
            {activeNav === 'Login' && <span className="nav-active-pill" />}
          </button>
        </nav>

        {/* Right Search Input Bar */}
        <div className="landing-search-container">
          <div className="landing-search-bar">
            <input 
              type="text" 
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (searchQuery.length > 0) setShowSearchDropdown(true);
              }}
              className="landing-search-input"
            />
            <button 
              className="landing-search-btn"
              onClick={() => {
                if (searchQuery.trim().length > 0) setShowSearchDropdown(true);
              }}
              aria-label="Search"
            >
              <Search size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Search suggestions dropdown */}
          {showSearchDropdown && (
            <div className="landing-search-dropdown anim-scale-up">
              <div className="dropdown-header">
                <span>WORKSHOP SIMULATIONS ({searchResults.length})</span>
                <button onClick={() => setShowSearchDropdown(false)} className="close-dropdown">
                  <X size={14} />
                </button>
              </div>
              <div className="dropdown-results">
                {searchResults.map((machine) => (
                  <div 
                    key={machine.id} 
                    className="dropdown-item"
                    onClick={() => {
                      setShowSearchDropdown(false);
                      handleLaunchMachine(machine.id);
                    }}
                  >
                    <div className="dropdown-item-info">
                      <span className="dropdown-item-title">{machine.name}</span>
                      <span className="dropdown-item-sub">{machine.tagline}</span>
                    </div>
                    <ChevronRight size={14} className="dropdown-item-arrow" />
                  </div>
                ))}
                {searchResults.length === 0 && (
                  <div className="dropdown-no-results">
                    No machine found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. MAIN HERO SPLIT VIEW WITH ORGANIC WAVE */}
      <main className="landing-hero-section">
        {/* SVG Background Wave Divider */}
        <div className="landing-wave-backdrop">
          <svg 
            className="wave-svg" 
            viewBox="0 0 1440 900" 
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="waveDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#181A22" />
                <stop offset="45%" stopColor="#1E2230" />
                <stop offset="100%" stopColor="#252A3B" />
              </linearGradient>
            </defs>
            {/* Organic Fluid S-Wave Curve */}
            <path 
              d="M0,0 L680,0 C630,180 570,330 670,470 C760,590 820,680 840,900 L0,900 Z" 
              fill="url(#waveDarkGrad)" 
            />
          </svg>
        </div>

        {/* 3D Decorative Floating Elements */}
        <div className="floating-3d-torus anim-float-slow">
          <div className="torus-ring-gradient" />
        </div>

        <div className="floating-3d-sphere-lg anim-float-reverse">
          <div className="sphere-gradient" />
        </div>

        <div className="floating-3d-sphere-sm anim-float-fast">
          <div className="sphere-gradient-sm" />
        </div>

        {/* HERO CONTAINER */}
        <div className="landing-hero-container">
          {/* LEFT COLUMN: HERO CONTENT */}
          <section className="landing-hero-left">
            {/* UI/UX Pre-heading Tag */}
            <div className="hero-category-wrap">
              <h2 className="hero-category-gradient">UI/UX</h2>
            </div>

            {/* Main Headline */}
            <h1 className="hero-main-title">Landing Page</h1>

            {/* Paragraph Text */}
            <p className="hero-paragraph">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam.
            </p>

            {/* CTA Button */}
            <div className="hero-cta-wrap">
              <button 
                className="hero-get-started-btn"
                onClick={() => {
                  if (onGetStarted) onGetStarted();
                  else setShowModal(true);
                }}
              >
                <span>Get Started</span>
              </button>
            </div>

            {/* Interactive Feature Badges */}
            <div className="hero-footer-features">
              <div className="feature-pill" onClick={() => handleLaunchMachine('lathe')}>
                <Zap size={14} color="#FF7A1A" />
                <span>7 Interactive 3D Machines</span>
              </div>
              <div className="feature-pill" onClick={() => handleLaunchMachine('welding')}>
                <ShieldCheck size={14} color="#FF5B37" />
                <span>Full Safety Simulator</span>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: SMARTPHONE MOCKUP & FLOATING CARDS */}
          <section className="landing-hero-right">
            <div className="showcase-stage">
              
              {/* Floating Widget 1: Dual Toggle Switch */}
              <div className="floating-widget-toggle anim-float-medium">
                <div className="toggle-pair">
                  <div 
                    className={`micro-toggle ${activeToggle1 ? 'on' : 'off'}`}
                    onClick={() => setActiveToggle1(!activeToggle1)}
                  >
                    <div className="toggle-thumb" />
                  </div>
                  <div 
                    className={`micro-toggle ${activeToggle2 ? 'on' : 'off'}`}
                    onClick={() => setActiveToggle2(!activeToggle2)}
                  >
                    <div className="toggle-thumb" />
                  </div>
                </div>
              </div>

              {/* Floating Widget 2: Wave / Area Analytics Chart */}
              <div className="floating-card-chart anim-float-slow">
                <div className="chart-card-header">
                  <span className="chart-dot red" />
                  <span className="chart-dot orange" />
                </div>
                <div className="chart-wave-body">
                  <svg viewBox="0 0 200 80" className="chart-svg">
                    <defs>
                      <linearGradient id="chartWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FF4B2B" stopOpacity="0.9" />
                        <stop offset="60%" stopColor="#FF7A1A" stopOpacity="0.75" />
                        <stop offset="100%" stopColor="#FFA41B" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                    {/* Glowing Area Curve */}
                    <path 
                      d="M0,60 Q25,55 50,48 T100,52 T150,15 T200,42 L200,80 L0,80 Z" 
                      fill="url(#chartWaveGrad)" 
                    />
                    <path 
                      d="M0,60 Q25,55 50,48 T100,52 T150,15 T200,42" 
                      fill="none" 
                      stroke="#FF4B2B" 
                      strokeWidth="2" 
                    />
                  </svg>
                </div>
              </div>

              {/* Floating Widget 3: Orange Bar Chart Card */}
              <div className="floating-card-bars anim-float-fast">
                <div className="bar-chart-card">
                  <div className="bar-col bar-1" style={{ height: '70%' }} />
                  <div className="bar-col bar-2" style={{ height: '95%' }} />
                  <div className="bar-col bar-3" style={{ height: '55%' }} />
                  <div className="bar-col bar-4" style={{ height: '85%' }} />
                </div>
              </div>

              {/* Floating Widget 4: Mail / Notification Snippet */}
              <div className="floating-card-notification anim-float-reverse">
                <div className="mail-icon-wrap">
                  <Mail size={16} color="#B4BFD2" />
                </div>
              </div>

              {/* Floating Widget 5: Skeleton Content Card 1 */}
              <div className="floating-card-skeleton-1 anim-float-slow">
                <div className="skeleton-line-long" />
                <div className="skeleton-line-med" />
                <div className="skeleton-line-short" />
              </div>

              {/* Floating Widget 6: Skeleton Content Card 2 */}
              <div className="floating-card-skeleton-2 anim-float-medium">
                <div className="skeleton-avatar-box" />
                <div className="skeleton-lines">
                  <div className="skeleton-line-med" />
                  <div className="skeleton-line-short" />
                </div>
              </div>

              {/* Floating Widget 7: Checklist lines */}
              <div className="floating-card-checklist anim-float-fast">
                <div className="checklist-row">
                  <div className="checklist-bullet" />
                  <div className="checklist-line" />
                </div>
                <div className="checklist-row">
                  <div className="checklist-bullet" />
                  <div className="checklist-line short" />
                </div>
                <div className="checklist-row">
                  <div className="checklist-bullet" />
                  <div className="checklist-line med" />
                </div>
              </div>

              {/* CENTRAL REALISTIC SMARTPHONE MOCKUP */}
              <div className="smartphone-wrapper">
                <div className="smartphone-body">
                  {/* Phone Speaker Cutout */}
                  <div className="smartphone-notch">
                    <div className="speaker-slit" />
                    <div className="camera-lens" />
                  </div>

                  {/* Phone Inner Screen Content */}
                  <div className="smartphone-screen">
                    
                    {/* Top Section: Media Player Card */}
                    <div className="phone-media-card">
                      {/* Interactive Play Button */}
                      <button 
                        className={`phone-play-btn ${isPlaying ? 'playing' : ''}`}
                        onClick={() => setIsPlaying(!isPlaying)}
                        aria-label={isPlaying ? 'Pause simulation preview' : 'Play simulation preview'}
                      >
                        {isPlaying ? (
                          <Pause size={24} fill="#FFFFFF" color="#FFFFFF" />
                        ) : (
                          <Play size={24} fill="#FFFFFF" color="#FFFFFF" style={{ marginLeft: '3px' }} />
                        )}
                      </button>

                      {/* Video Scrubber Timeline Bar */}
                      <div className="phone-timeline-container">
                        <div className="phone-timeline-track">
                          <div 
                            className="phone-timeline-fill"
                            style={{ width: `${videoProgress}%` }}
                          />
                          <div 
                            className="phone-timeline-scrubber"
                            style={{ left: `${videoProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section: App Interface Mockup */}
                    <div className="phone-app-card">
                      {/* App Inner Card Header with Thumbnail */}
                      <div className="phone-app-header">
                        <div className="phone-thumb-box">
                          <div className="thumb-graphic">
                            <Box size={14} color="#FF7A1A" />
                          </div>
                        </div>
                        <div className="phone-header-lines">
                          <div className="phone-red-pill-line" />
                          <div className="phone-thin-gray-line" />
                        </div>
                      </div>

                      {/* App Rating Pill Badge (Floating on right) */}
                      <div className="phone-rating-badge">
                        <div className="rating-stars">
                          <Star size={9} fill="#FFB703" color="#FFB703" />
                          <Star size={9} fill="#FFB703" color="#FFB703" />
                          <Star size={9} fill="#FFB703" color="#FFB703" />
                          <Star size={9} fill="#FFB703" color="#FFB703" />
                          <Star size={9} fill="#FFB703" color="#FFB703" />
                        </div>
                        <div className="rating-score">4.9</div>
                      </div>

                      {/* App List Item Rows */}
                      <div className="phone-list-items">
                        <div 
                          className="phone-list-row"
                          onClick={() => handleLaunchMachine('lathe')}
                        >
                          <div className="row-thumb" />
                          <div className="row-text-group">
                            <div className="row-line-primary" />
                            <div className="row-line-secondary" />
                          </div>
                        </div>

                        <div 
                          className="phone-list-row"
                          onClick={() => handleLaunchMachine('milling')}
                        >
                          <div className="row-thumb" />
                          <div className="row-text-group">
                            <div className="row-line-primary short" />
                            <div className="row-line-secondary" />
                          </div>
                        </div>
                      </div>

                      {/* Phone Bottom Pill Indicator */}
                      <div className="phone-home-indicator" />
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>
      </main>

      {/* 3. MODAL: GET STARTED / WORKSHOP QUICK LAUNCH */}
      {showModal && (
        <div className="landing-modal-backdrop anim-fade-in" onClick={() => setShowModal(false)}>
          <div className="landing-modal-card anim-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="landing-logo-icon sm">
                  <div className="logo-diamond-inner" />
                </div>
                <h3>Welcome to Virtual Workshop</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <p className="modal-desc">
              Experience the next-generation mechanical engineering workshop simulation. Choose how you want to get started:
            </p>

            <div className="modal-actions-grid">
              <button 
                className="modal-action-card primary"
                onClick={() => {
                  setShowModal(false);
                  if (onGetStarted) onGetStarted();
                }}
              >
                <div className="action-icon-circle">
                  <Zap size={20} color="#FFFFFF" />
                </div>
                <div className="action-text">
                  <strong>Launch Interactive 3D Workshop</strong>
                  <span>Direct instant access with full machine simulator</span>
                </div>
                <ArrowRight size={18} />
              </button>

              <button 
                className="modal-action-card secondary"
                onClick={() => {
                  setShowModal(false);
                  if (onLoginClick) onLoginClick();
                }}
              >
                <div className="action-icon-circle light">
                  <CheckCircle2 size={20} color="#FF5B37" />
                </div>
                <div className="action-text">
                  <strong>Student & Instructor Login</strong>
                  <span>Track quiz scores, ISO safety badges, and certificates</span>
                </div>
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="modal-quick-machines">
              <span className="quick-machines-label">Quick Jump to Machine:</span>
              <div className="quick-machines-chips">
                {Object.values(MACHINES).map((m) => (
                  <button
                    key={m.id}
                    className="machine-chip"
                    onClick={() => {
                      setShowModal(false);
                      handleLaunchMachine(m.id);
                    }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
