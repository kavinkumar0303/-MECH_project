import React, { useState } from 'react';
import { Settings, ShieldAlert, CheckCircle, Lock, Mail, User, School, BookOpen } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    studentId: '',
    email: '',
    password: '',
    name: '',
    college: '',
    department: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleDemoFill = () => {
    setFormData({
      ...formData,
      studentId: 'student01',
      password: 'demo123'
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const userMatch = storedUsers.find(
        (u) => (u.studentId === formData.studentId || u.email === formData.studentId) && u.password === formData.password
      );

      if ((formData.studentId === 'student01' && formData.password === 'demo123') || userMatch) {
        setSuccess('✓ Authentication Successful');
        
        const loggedUser = userMatch || {
          name: 'Alex Mercer',
          studentId: 'student01',
          college: 'Massachusetts Institute of Technology',
          department: 'Mechanical Engineering',
          email: 'alex.mercer@mit.edu',
          xp: 1240,
          level: 'Workshop Apprentice',
          safetyScore: 94,
          accuracy: 88,
          completedMissions: 12,
          machinesExplored: 4,
          completedMissionsList: ['lathe_01', 'welding_01', 'milling_01'],
          badges: ['Lathe Beginner', 'Safety First', 'Milling Master']
        };

        setTimeout(() => {
          onLoginSuccess(loggedUser);
        }, 1000);
      } else {
        setError('⚠️ Invalid Student ID or Password');
      }
    } else {
      if (!formData.name || !formData.studentId || !formData.college || !formData.department || !formData.email || !formData.password) {
        setError('⚠️ Please fill out all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('⚠️ Passwords do not match');
        return;
      }

      const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      if (storedUsers.some((u) => u.studentId === formData.studentId || u.email === formData.email)) {
        setError('⚠️ Account with this Student ID or Email already exists');
        return;
      }

      const newUser = {
        name: formData.name,
        studentId: formData.studentId,
        college: formData.college,
        department: formData.department,
        email: formData.email,
        password: formData.password,
        xp: 0,
        level: 'Novice Engineer',
        safetyScore: 100,
        accuracy: 100,
        completedMissions: 0,
        machinesExplored: 0,
        completedMissionsList: [],
        badges: []
      };

      storedUsers.push(newUser);
      localStorage.setItem('registered_users', JSON.stringify(storedUsers));

      setSuccess('✓ Workshop Account Created! Redirecting to dashboard...');
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 1500);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-primary)'
      }}
    >
      {/* Rotating gear colored in Deep Amber */}
      <div 
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          opacity: 0.08,
          color: 'var(--cool-grey-blue)',
          top: '-100px',
          right: '-100px',
          pointerEvents: 'none'
        }}
        className="animate-spin-slow"
      >
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="50" cy="50" r="30" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="20" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line 
              key={deg}
              x1="50" 
              y1="20" 
              x2="50" 
              y2="10" 
              transform={`rotate(${deg} 50 50)`} 
            />
          ))}
        </svg>
      </div>

      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: isLogin ? '440px' : '560px',
          position: 'relative',
          zIndex: 10,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)'
        }}
      >
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: '16px' }}>
            <Settings size={32} className="animate-spin-slow" style={{ color: 'var(--primary-blue)' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
            VIRTUAL MECHANICAL WORKSHOP
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
            {isLogin ? 'Enter the Workshop. Build Your Skills.' : 'Register and operate advanced industrial machinery.'}
          </p>
        </div>

        {/* Demo Alert Box */}
        {isLogin && (
          <div 
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--primary-blue)' }}>Demo Account</strong><br/>
              ID: <span style={{ fontFamily: 'var(--mono-font)', color: 'var(--text-primary)' }}>student01</span> | Pass: <span style={{ fontFamily: 'var(--mono-font)', color: 'var(--text-primary)' }}>demo123</span>
            </div>
            <button 
              type="button"
              onClick={handleDemoFill}
              style={{
                background: 'rgba(29, 73, 180, 0.08)',
                border: '1px solid var(--primary-blue)',
                color: 'var(--primary-blue)',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary-blue)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(29, 73, 180, 0.08)';
                e.currentTarget.style.color = 'var(--primary-blue)';
              }}
            >
              Fill Demo
            </button>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div style={{ background: 'rgba(198, 40, 40, 0.08)', border: '1px solid var(--danger)', borderRadius: '4px', padding: '10px 14px', color: 'var(--danger)', fontSize: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={14} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(46, 125, 50, 0.08)', border: '1px solid var(--success)', borderRadius: '4px', padding: '10px 14px', color: 'var(--success)', fontSize: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={14} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLogin ? (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'var(--mono-font)' }}>
                  Student ID or Email
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                  <Mail size={14} style={{ color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="Enter ID or email"
                    required
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'var(--mono-font)' }}>
                  Password
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                  <Lock size={14} style={{ color: 'var(--text-secondary)' }} />
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-blue)' }} />
                  Remember Me
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); setError('⚠️ Contact department administrator to reset credentials.'); }} style={{ color: 'var(--primary-blue)', textDecoration: 'none' }}>
                  Forgot Password?
                </a>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Student Name
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', gap: '8px' }}>
                    <User size={14} style={{ color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Student ID
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', gap: '8px' }}>
                    <Lock size={14} style={{ color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="STU1029"
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    College
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', gap: '8px' }}>
                    <School size={14} style={{ color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="University"
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Department
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', gap: '8px' }}>
                    <BookOpen size={14} style={{ color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Mech Eng"
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', gap: '8px' }}>
                  <Mail size={14} style={{ color: 'var(--text-secondary)' }} />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@college.edu"
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Password
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', gap: '8px' }}>
                    <Lock size={14} style={{ color: 'var(--text-secondary)' }} />
                    <input 
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Confirm
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', gap: '8px' }}>
                    <Lock size={14} style={{ color: 'var(--text-secondary)' }} />
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* safety orange button with dark text for contrast */}
          <button 
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '10px'
            }}
          >
            {isLogin ? 'Login to Workshop' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {isLogin ? "New to the platform?" : "Already have an account?"}{' '}
            <a 
              href="#toggle" 
              onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setError(''); setSuccess(''); }}
              style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: 'bold' }}
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
