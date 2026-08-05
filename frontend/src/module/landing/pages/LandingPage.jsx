import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Shield, 
  MonitorPlay, 
  Zap, 
  Folder, 
  CheckSquare, 
  Users, 
  Wallet, 
  PieChart,
  UserCheck,
  CheckCircle,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Phone,
  MapPin,
  ArrowRight
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {

  return (
    <div className="landing-page">
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
        <div className="lp-container">
          {/* Navbar */}
          <nav className="lp-navbar" style={{ borderBottom: 'none' }}>
            <Link to="/" className="lp-logo">
              <div className="lp-logo-icon">P</div>
              Planora
            </Link>
            <div className="lp-nav-links">
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#features">Features</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="lp-nav-actions">
              <Link to="/login" className="lp-btn lp-btn-primary">Login</Link>
            </div>
          </nav>
        </div>
      </div>
      
      <div className="lp-container">

        {/* Hero Section */}
        <section className="lp-hero" id="home">
          <div className="lp-hero-content">
            <div className="lp-badge">Project Monitoring & Management System</div>
            <h1 className="lp-hero-title">
              Plan Smarter.<br />Track Better.<br /><span>Deliver Faster.</span>
            </h1>
            <p className="lp-hero-subtitle">
              Planora is an enterprise-grade internal platform that empowers your organization to plan projects, monitor progress, allocate resources, and drive delivery — all from a single, unified dashboard.
            </p>
            <div className="lp-hero-actions">
              <Link to="/login" className="lp-btn lp-btn-primary">
                Access Dashboard <ArrowRight size={18} />
              </Link>
            </div>
            
            <div className="lp-hero-features">
              <div className="lp-hero-feature">
                <div className="lp-hero-feature-icon">
                  <Shield size={16} />
                </div>
                <div className="lp-hero-feature-text">
                  <h4>Role-Based Access</h4>
                  <p>Secure & Controlled</p>
                </div>
              </div>
              <div className="lp-hero-feature">
                <div className="lp-hero-feature-icon">
                  <MonitorPlay size={16} />
                </div>
                <div className="lp-hero-feature-text">
                  <h4>Real-time Tracking</h4>
                  <p>Stay Updated Always</p>
                </div>
              </div>
              <div className="lp-hero-feature">
                <div className="lp-hero-feature-icon">
                  <Zap size={16} />
                </div>
                <div className="lp-hero-feature-text">
                  <h4>Smart Analytics</h4>
                  <p>Data-Driven Decisions</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lp-hero-image" style={{ display: 'flex', alignItems: 'center' }}>
             <img 
               src="/dashboard-mockup.png" 
               alt="Planora Dashboard" 
               style={{ 
                 width: '100%', 
                 borderRadius: '12px', 
                 boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                 border: '1px solid #f3f4f6'
               }} 
             />
          </div>
        </section>

      </div>
      
      {/* About Us Section */}
      <div id="about" style={{backgroundColor: '#fff', borderTop: '1px solid #f8fafc', borderBottom: '1px solid #f8fafc'}}>
        <div className="lp-container">
          <section className="lp-features-list-section">
            <div className="lp-features-image">
               {/* Animated Dashboard Mockup */}
               <div className="lp-animated-dashboard">
                  <div className="lp-mockup-sidebar" style={{ background: '#111827' }}>
                    <div style={{color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '20px', background: 'var(--purple)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px'}}>P</div>
                    <div className="lp-mockup-sidebar-item" style={{background: 'var(--purple)'}}></div>
                    <div className="lp-mockup-sidebar-item"></div>
                    <div className="lp-mockup-sidebar-item"></div>
                    <div className="lp-mockup-sidebar-item"></div>
                  </div>
                  <div className="lp-mockup-content" style={{ padding: '16px', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '12px', border: '1px solid #e5e7eb', animation: 'slide-up-fade 0.5s ease-out' }}>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Total Projects</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>24</div>
                      </div>
                      <div style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '12px', border: '1px solid #e5e7eb', animation: 'slide-up-fade 0.5s ease-out 0.1s both' }}>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>In Progress</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>12</div>
                      </div>
                      <div style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '12px', border: '1px solid #e5e7eb', animation: 'slide-up-fade 0.5s ease-out 0.2s both' }}>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>Completed</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>8</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                      <div style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'slide-up-fade 0.5s ease-out 0.3s both' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '16px', width: '100%' }}>Project Progress</div>
                        <div className="anim-pie-chart">
                          <div className="anim-pie-inner">75%</div>
                        </div>
                      </div>
                      <div style={{ flex: 1.5, background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', animation: 'slide-up-fade 0.5s ease-out 0.4s both' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>Tasks Overview</div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flex: 1, paddingBottom: '8px' }}>
                          <div style={{ width: '12%', background: 'var(--purple-dim)', borderRadius: '4px 4px 0 0' }} className="anim-bar-1"></div>
                          <div style={{ width: '12%', background: 'var(--purple-dim)', borderRadius: '4px 4px 0 0' }} className="anim-bar-2"></div>
                          <div style={{ width: '12%', background: 'var(--purple)', borderRadius: '4px 4px 0 0' }} className="anim-bar-3"></div>
                          <div style={{ width: '12%', background: '#c4b5fd', borderRadius: '4px 4px 0 0' }} className="anim-bar-4"></div>
                          <div style={{ width: '12%', background: 'var(--purple-dim)', borderRadius: '4px 4px 0 0' }} className="anim-bar-5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
            <div className="lp-features-text" style={{ paddingRight: '40px' }}>
              <div className="lp-section-subtitle" style={{ display: 'inline-block', background: 'var(--purple-dim)', padding: '4px 12px', borderRadius: '6px', margin: '0 0 16px 0' }}>About Us</div>
              <h2 className="lp-section-title" style={{ fontSize: '36px' }}>About Planora<br/><span style={{ color: 'var(--purple)' }}>Built for Enterprise Project Excellence</span></h2>
              <p className="lp-section-desc">
                Planora is an organization-wide Project Monitoring &amp; Management System designed for internal teams. Access is managed by the Admin — enabling structured collaboration, transparent progress tracking, and data-driven delivery across all projects.
              </p>
              
              <div className="lp-about-grid">
                <div className="lp-about-item">
                  <div className="lp-about-icon">
                    <Users size={18} />
                  </div>
                  <div className="lp-about-text">
                    <h4>Our Mission</h4>
                    <p>Empower teams with smart tools to manage projects seamlessly.</p>
                  </div>
                </div>
                <div className="lp-about-item">
                  <div className="lp-about-icon">
                    <Zap size={18} />
                  </div>
                  <div className="lp-about-text">
                    <h4>Our Vision</h4>
                    <p>To be the most trusted platform for project management.</p>
                  </div>
                </div>
                <div className="lp-about-item">
                  <div className="lp-about-icon">
                    <CheckCircle size={18} />
                  </div>
                  <div className="lp-about-text">
                    <h4>Our Values</h4>
                    <p>Transparency, collaboration, accountability and improvement.</p>
                  </div>
                </div>
                <div className="lp-about-item">
                  <div className="lp-about-icon">
                    <Shield size={18} />
                  </div>
                  <div className="lp-about-text">
                    <h4>Our Commitment</h4>
                    <p>Building reliable, user-friendly solutions that drive success.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Features Grid */}
      <section className="lp-features-grid-section" id="features">
        <div className="lp-container">
          <div className="lp-features-grid-header">
            <div className="lp-section-subtitle">Powerful Features</div>
            <h2 className="lp-section-title" style={{fontSize: '32px'}}>Everything you need to manage projects effectively</h2>
            <p className="lp-section-desc" style={{marginBottom: 0}}>
              Powerful features designed to streamline your workflow and boost team productivity
            </p>
          </div>
          
          <div className="lp-features-grid">
            <div className="lp-feature-card">
              <div className="lp-feature-card-icon">
                <Folder size={24} />
              </div>
              <h3>Project Management</h3>
              <p>Plan, organize and manage projects from start to finish.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-card-icon">
                <CheckSquare size={24} />
              </div>
              <h3>Task Tracking</h3>
              <p>Create tasks, set deadlines and track progress in real-time.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-card-icon">
                <Users size={24} />
              </div>
              <h3>Resource Allocation</h3>
              <p>Assign the right resources and balance workloads.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-card-icon">
                <Wallet size={24} />
              </div>
              <h3>Budget Management</h3>
              <p>Track budgets, expenses and stay within your limits.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-card-icon">
                <PieChart size={24} />
              </div>
              <h3>Reports & Analytics</h3>
              <p>Get insights with advanced reports and dashboards.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-card-icon">
                <Shield size={24} />
              </div>
              <h3>Role-Based Access</h3>
              <p>Secure role-based access for Admin, Manager and Employees.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Solutions Ribbon Section */}
      <div className="lp-solutions-ribbon">
        <div className="lp-container">
          <div className="lp-solutions-ribbon-inner">
            <div className="lp-ribbon-header">
              <h2 className="lp-ribbon-title">Built for Every Role in Your Organization</h2>
              <p className="lp-ribbon-desc">Purpose-driven modules designed around how your team actually works.</p>
            </div>
            
            <div className="lp-ribbon-items">
              <div className="lp-ribbon-item">
                <div className="lp-ribbon-icon"><MonitorPlay size={24} /></div>
                <div className="lp-ribbon-text">
                  <h3>For Admins</h3>
                  <p>Full system control &amp; user management</p>
                </div>
              </div>
              <div className="lp-ribbon-item">
                <div className="lp-ribbon-icon"><CheckSquare size={24} /></div>
                <div className="lp-ribbon-text">
                  <h3>For Managers</h3>
                  <p>Resource, budget &amp; project oversight</p>
                </div>
              </div>
              <div className="lp-ribbon-item">
                <div className="lp-ribbon-icon"><Users size={24} /></div>
                <div className="lp-ribbon-text">
                  <h3>For Team Members</h3>
                  <p>Task tracking &amp; progress updates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* CTA Section */}
      <div style={{backgroundColor: '#fff', overflow: 'hidden'}}>
        <div className="lp-container">
          <section className="lp-cta-section">
            <h2 className="lp-cta-title">Your organization's projects, fully under control.</h2>
            <p className="lp-cta-desc">Log in to Planora and take command of your projects, resources, budgets, and team — all in one place.</p>
            <div className="lp-cta-actions">
              <Link to="/login" className="lp-btn lp-btn-primary">
                Login to Planora <ArrowRight size={18} />
              </Link>
            </div>
            
            {/* Simple CSS plant graphic placeholder */}
            <svg className="lp-cta-plant" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 150 C 50 100, 30 80, 20 50 C 30 70, 45 80, 50 100 C 55 80, 70 70, 80 50 C 70 80, 50 100, 50 150" fill="#a78bfa" />
              <path d="M50 120 C 30 110, 10 90, 5 70 C 20 85, 35 100, 50 120" fill="#c4b5fd" />
              <path d="M50 120 C 70 110, 90 90, 95 70 C 80 85, 65 100, 50 120" fill="#c4b5fd" />
              <rect x="40" y="135" width="20" height="15" fill="#e5e7eb" rx="2" />
            </svg>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="lp-footer" id="contact">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <Link to="/" className="lp-logo">
                <div className="lp-logo-icon">P</div>
                Planora
              </Link>
              <p>Planora is an internal, organization-wide Project Monitoring &amp; Management System — giving admins, managers, and team members a unified platform to plan, track, and deliver with confidence.</p>
            </div>
            
            <div className="lp-footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            
            <div className="lp-footer-col">
              <h4>Contact Us</h4>
              <div className="lp-contact-list">
                <div className="lp-contact-item">
                  <Mail size={16} /> support@planora.com
                </div>
                <div className="lp-contact-item">
                  <Phone size={16} /> +91 98765 43210
                </div>
                <div className="lp-contact-item" style={{alignItems: 'flex-start'}}>
                  <MapPin size={16} style={{marginTop: '2px'}}/> 
                  <span>Noida, Uttar Pradesh, India</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lp-footer-bottom">
            © 2026 Planora. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
