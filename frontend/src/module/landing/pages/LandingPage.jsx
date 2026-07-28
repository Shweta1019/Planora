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
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', width: '100%' }}>
        <div className="lp-container">
          {/* Navbar */}
          <nav className="lp-navbar" style={{ borderBottom: 'none' }}>
            <Link to="/" className="lp-logo">
              <div className="lp-logo-icon">P</div>
              Planora
            </Link>
            <div className="lp-nav-links">
              <a href="#features">Features</a>
              <a href="#modules">Modules</a>
              <a href="#solutions">Solutions</a>
              <a href="#about">About Us</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="lp-nav-actions">
              <Link to="/login" className="lp-btn lp-btn-outline">Login</Link>
              <Link to="/signup" className="lp-btn lp-btn-primary">Get Started</Link>
            </div>
          </nav>
        </div>
      </div>
      
      <div className="lp-container">

        {/* Hero Section */}
        <section className="lp-hero">
          <div className="lp-hero-content">
            <div className="lp-badge">Project Monitoring & Management System</div>
            <h1 className="lp-hero-title">
              Plan Smarter.<br />Track Better.<br /><span>Deliver Faster.</span>
            </h1>
            <p className="lp-hero-subtitle">
              Planora helps teams collaborate seamlessly, track progress in real-time, and deliver projects on time, every time.
            </p>
            <div className="lp-hero-actions">
              <Link to="/signup" className="lp-btn lp-btn-primary">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <a href="#" className="lp-btn lp-btn-outline">
                <Play size={18} /> View Demo
              </a>
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
      
      {/* Features Section 1 */}
      <div style={{backgroundColor: '#fff', borderTop: '1px solid #f8fafc', borderBottom: '1px solid #f8fafc'}}>
        <div className="lp-container">
          <section className="lp-features-list-section">
            <div className="lp-features-image">
               {/* Projects List Mockup */}
               <div className="lp-mockup" style={{height: '350px'}}>
                  <div className="lp-mockup-sidebar">
                    <div style={{color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '20px'}}>P</div>
                    <div className="lp-mockup-sidebar-item"></div>
                    <div className="lp-mockup-sidebar-item" style={{background: 'var(--purple)'}}></div>
                    <div className="lp-mockup-sidebar-item"></div>
                  </div>
                  <div className="lp-mockup-content">
                    <div style={{fontWeight: 600, fontSize: '18px', marginBottom: '16px'}}>Projects</div>
                    <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
                      <div className="lp-mockup-header-search" style={{flex: 1}}></div>
                      <div style={{width: '100px', height: '32px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px'}}></div>
                      <div style={{width: '100px', height: '32px', background: 'var(--purple)', borderRadius: '6px'}}></div>
                    </div>
                    
                    <div style={{flex: 1, background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px'}}>
                        <div style={{width: '20%', height: '8px', background: '#e5e7eb'}}></div>
                        <div style={{width: '15%', height: '8px', background: '#e5e7eb'}}></div>
                        <div style={{width: '10%', height: '8px', background: '#e5e7eb'}}></div>
                        <div style={{width: '20%', height: '8px', background: '#e5e7eb'}}></div>
                        <div style={{width: '10%', height: '8px', background: '#e5e7eb'}}></div>
                      </div>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <div style={{width: '20%', height: '10px', background: '#d1d5db', borderRadius: '2px'}}></div>
                          <div style={{width: '15%', height: '10px', background: '#d1d5db', borderRadius: '2px'}}></div>
                          <div style={{width: '10%', height: '16px', background: '#dbeafe', borderRadius: '10px'}}></div>
                          <div style={{width: '20%', height: '6px', background: '#e5e7eb', borderRadius: '3px'}}>
                            <div style={{width: '70%', height: '100%', background: 'var(--purple)', borderRadius: '3px'}}></div>
                          </div>
                          <div style={{width: '10%', height: '10px', background: '#d1d5db', borderRadius: '2px'}}></div>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
            <div className="lp-features-text">
              <div className="lp-section-subtitle">Centralized Project Management</div>
              <h2 className="lp-section-title">Everything you need in one place</h2>
              <p className="lp-section-desc">
                From planning to tracking, Planora brings everything together to help your team stay organized and productive.
              </p>
              <ul className="lp-check-list">
                <li>
                  <div className="lp-check-icon"><CheckCircle size={16} /></div>
                  Create & manage projects effortlessly
                </li>
                <li>
                  <div className="lp-check-icon"><CheckCircle size={16} /></div>
                  Track tasks and deadlines in real-time
                </li>
                <li>
                  <div className="lp-check-icon"><CheckCircle size={16} /></div>
                  Allocate resources and manage budgets
                </li>
                <li>
                  <div className="lp-check-icon"><CheckCircle size={16} /></div>
                  Generate reports and gain insights
                </li>
              </ul>
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

      {/* Stats Section */}
      <div style={{backgroundColor: '#fff'}}>
        <div className="lp-container">
          <section className="lp-stats-section">
            <div className="lp-stats-grid">
              <div className="lp-stat-item">
                <div className="lp-stat-icon"><UserCheck size={28} /></div>
                <div className="lp-stat-text">
                  <h4>500+</h4>
                  <p>Active Users</p>
                </div>
              </div>
              <div className="lp-stat-item">
                <div className="lp-stat-icon"><Folder size={28} /></div>
                <div className="lp-stat-text">
                  <h4>120+</h4>
                  <p>Projects Managed</p>
                </div>
              </div>
              <div className="lp-stat-item">
                <div className="lp-stat-icon"><PieChart size={28} /></div>
                <div className="lp-stat-text">
                  <h4>98%</h4>
                  <p>On-time Delivery</p>
                </div>
              </div>
              <div className="lp-stat-item">
                <div className="lp-stat-icon"><Zap size={28} /></div>
                <div className="lp-stat-text">
                  <h4>24/7</h4>
                  <p>Support Available</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{backgroundColor: '#fff', overflow: 'hidden'}}>
        <div className="lp-container">
          <section className="lp-cta-section">
            <h2 className="lp-cta-title">Ready to streamline your project management?</h2>
            <p className="lp-cta-desc">Join Planora today and experience the smarter way to manage projects.</p>
            <div className="lp-cta-actions">
              <Link to="/signup" className="lp-btn lp-btn-primary">
                Get Started Free <ArrowRight size={18} />
              </Link>
              <a href="#" className="lp-btn lp-btn-outline">
                <Play size={18} /> View Demo
              </a>
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
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <Link to="/" className="lp-logo">
                <div className="lp-logo-icon">P</div>
                Planora
              </Link>
              <p>Planora is a smart Project Monitoring and Management System designed to help teams plan, track and deliver projects efficiently.</p>
              <div className="lp-social-links">
                <a href="#"><Facebook size={16} /></a>
                <a href="#"><Twitter size={16} /></a>
                <a href="#"><Linkedin size={16} /></a>
                <a href="#"><Github size={16} /></a>
              </div>
            </div>
            
            <div className="lp-footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#">Features</a></li>
                <li><a href="#">Modules</a></li>
                <li><a href="#">Solutions</a></li>
              </ul>
            </div>
            
            <div className="lp-footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
            
            <div className="lp-footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Guides</a></li>
                <li><a href="#">Support</a></li>
                <li><a href="#">Blog</a></li>
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
            © 2024 Planora. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
