import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Settings, ShieldAlert, CheckCircle, Lock, Mail, User, School, BookOpen, Eye, EyeOff } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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

  const canvasContainerRef = useRef(null);

  useEffect(() => {
    if (!canvasContainerRef.current) return;
    
    const container = canvasContainerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#CBD5E1', 0.05);
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight('#C2CAD9', 0.8);
    scene.add(ambientLight);
    
    const keyLight = new THREE.DirectionalLight('#FFFFFF', 1.2);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);
    
    const fillLight = new THREE.DirectionalLight('#9EB4E4', 0.8);
    fillLight.position.set(-5, -2, 2);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight('#3D72C1', 0.6);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);
    
    const group = new THREE.Group();
    scene.add(group);
    
    const matMain = new THREE.MeshStandardMaterial({ color: '#1D49B4', roughness: 0.3, metalness: 0.8 });
    const matAccent = new THREE.MeshStandardMaterial({ color: '#3D72C1', roughness: 0.2, metalness: 0.9 });
    const matReflections = new THREE.MeshStandardMaterial({ color: '#9EB4E4', roughness: 0.1, metalness: 0.95 });
    const matNeutral = new THREE.MeshStandardMaterial({ color: '#C2CAD9', roughness: 0.4, metalness: 0.7 });
    const matShadow = new THREE.MeshStandardMaterial({ color: '#3B4B6F', roughness: 0.6, metalness: 0.5 });
    
    const shaftGeom = new THREE.CylinderGeometry(0.3, 0.3, 5, 32);
    const shaft = new THREE.Mesh(shaftGeom, matNeutral);
    shaft.rotation.x = Math.PI / 2;
    group.add(shaft);
    
    const chuckGeom = new THREE.CylinderGeometry(1.2, 1.2, 1.5, 32);
    const chuck = new THREE.Mesh(chuckGeom, matMain);
    chuck.rotation.x = Math.PI / 2;
    group.add(chuck);
    
    const ringGeom = new THREE.TorusGeometry(1.25, 0.08, 16, 100);
    const ring1 = new THREE.Mesh(ringGeom, matAccent);
    ring1.position.z = 0.5;
    ring1.rotation.x = Math.PI / 2;
    group.add(ring1);
    
    const ring2 = new THREE.Mesh(ringGeom, matAccent);
    ring2.position.z = -0.5;
    ring2.rotation.x = Math.PI / 2;
    group.add(ring2);
    
    const shadowRingGeom = new THREE.TorusGeometry(1.21, 0.05, 16, 100);
    const shadowRing = new THREE.Mesh(shadowRingGeom, matShadow);
    shadowRing.rotation.x = Math.PI / 2;
    group.add(shadowRing);
    
    const gearWheelGeom = new THREE.CylinderGeometry(1.8, 1.8, 0.25, 32);
    const gearWheel = new THREE.Mesh(gearWheelGeom, matReflections);
    gearWheel.position.z = -2;
    gearWheel.rotation.x = Math.PI / 2;
    group.add(gearWheel);
    
    const toothGeom = new THREE.BoxGeometry(0.2, 0.15, 0.25);
    const numTeeth = 20;
    for (let i = 0; i < numTeeth; i++) {
      const angle = (i / numTeeth) * Math.PI * 2;
      const tooth = new THREE.Mesh(toothGeom, matReflections);
      tooth.position.set(Math.cos(angle) * 1.85, Math.sin(angle) * 1.85, -2);
      tooth.rotation.z = angle;
      group.add(tooth);
    }
    
    const collarGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 32);
    const collar = new THREE.Mesh(collarGeom, matNeutral);
    collar.position.z = 1.8;
    collar.rotation.x = Math.PI / 2;
    group.add(collar);
    
    let currentScale = 0.6;
    let targetScale = 1.1;
    let targetX = -1.5;

    const updatePositionAndScale = () => {
      const w = window.innerWidth;
      if (w > 900) {
        targetScale = 1.25;
        targetX = -1.5;
      } else if (w > 600) {
        targetScale = 0.95;
        targetX = -0.6;
      } else {
        targetScale = 0.68;
        targetX = 0;
      }
      group.position.x = targetX;
    };
    updatePositionAndScale();
    group.scale.set(currentScale, currentScale, currentScale);

    let animationFrameId;
    const clock = new THREE.Clock();
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      if (currentScale < targetScale) {
        currentScale += (targetScale - currentScale) * 0.05;
        group.scale.set(currentScale, currentScale, currentScale);
      }
      
      if (!prefersReducedMotion) {
        group.rotation.z += 0.003;
        group.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.15;
        group.rotation.x = (Math.PI / 2) + Math.cos(clock.getElapsedTime() * 0.3) * 0.05;
        group.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.12;
      } else {
        group.rotation.set(Math.PI / 2.3, 0.2, 0.5);
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updatePositionAndScale();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setSuccess('');

    if (isLogin) {
      const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const userMatch = storedUsers.find(
        (u) => (u.studentId === formData.studentId || u.email === formData.studentId) && u.password === formData.password
      );

      if ((formData.studentId === 'student01' && formData.password === 'demo123') || userMatch) {
        setIsSubmitting(true);
        
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
          setIsSubmitting(false);
          setSuccess('✓ Authentication Successful');
          setTimeout(() => {
            onLoginSuccess(loggedUser);
          }, 800);
        }, 1200);
      } else {
        setError('⚠️ Invalid Username or Password');
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

      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        storedUsers.push(newUser);
        localStorage.setItem('registered_users', JSON.stringify(storedUsers));
        setSuccess('✓ Workshop Account Created!');
        setTimeout(() => {
          onLoginSuccess(newUser);
        }, 800);
      }, 1200);
    }
  };

  return (
    <div 
      className="anim-fade-in"
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        background: 'var(--surface-bg)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* 3D mechanical workshop background scene */}
      <div className="login-canvas-container">
        <div ref={canvasContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Subtle readability overlay separating 3D visuals and login content */}
      <div className="login-overlay" />

      {/* Floating Login Card Container */}
      <div className="login-card-container">
        <div 
          className="glass-panel anim-slide-up"
          style={{
            width: '100%',
            maxWidth: isLogin ? '420px' : '520px',
            padding: '36px',
            background: 'rgba(22, 29, 48, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(59, 75, 111, 0.5)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.3px', color: 'var(--text-primary)', marginBottom: '8px' }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.4' }}>
              {isLogin ? 'Sign in to continue your workshop training' : 'Register to operate advanced industrial machinery.'}
            </p>
          </div>

          {/* Demo Alert Box */}
          {isLogin && (
            <div 
              style={{
                background: 'var(--surface-bg)',
                border: '1px solid var(--ambient-grey)',
                borderRadius: '6px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                <strong style={{ color: 'var(--brand-primary)' }}>Demo Account</strong><br/>
                Username: <span style={{ fontFamily: 'var(--mono-font)', color: 'var(--text-primary)', fontWeight: '600' }}>student01</span><br/>
                Password: <span style={{ fontFamily: 'var(--mono-font)', color: 'var(--text-primary)', fontWeight: '600' }}>demo123</span>
              </div>
              <button 
                type="button"
                onClick={handleDemoFill}
                style={{
                  background: 'rgba(29, 73, 180, 0.08)',
                  border: '1px solid var(--brand-primary)',
                  color: 'var(--brand-primary)',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--brand-primary)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(29, 73, 180, 0.08)';
                  e.currentTarget.style.color = 'var(--brand-primary)';
                }}
              >
                Fill Demo
              </button>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div style={{ background: 'rgba(198, 40, 40, 0.08)', border: '1px solid var(--danger)', borderRadius: '4px', padding: '10px 14px', color: 'var(--danger)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={14} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(46, 125, 50, 0.08)', border: '1px solid var(--success)', borderRadius: '4px', padding: '10px 14px', color: 'var(--success)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={14} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isLogin ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Username
                  </label>
                  <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                    <Mail size={14} style={{ color: 'var(--shadow-navy)' }} />
                    <input 
                      type="text" 
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      required
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Password
                  </label>
                  <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                    <Lock size={14} style={{ color: 'var(--shadow-navy)' }} />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--shadow-navy)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                        outline: 'none',
                        transition: 'transform 0.15s ease'
                      }}
                      onFocus={(e) => e.currentTarget.style.color = 'var(--brand-primary)'}
                      onBlur={(e) => e.currentTarget.style.color = 'var(--shadow-navy)'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: 'var(--brand-primary)' }} />
                    Remember Me
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); setError('⚠️ Contact department administrator to reset credentials.'); }} style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: '500' }}>
                    Forgot password?
                  </a>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Student Name
                    </label>
                    <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                      <User size={14} style={{ color: 'var(--shadow-navy)' }} />
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Student ID
                    </label>
                    <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                      <Lock size={14} style={{ color: 'var(--shadow-navy)' }} />
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      College
                    </label>
                    <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                      <School size={14} style={{ color: 'var(--shadow-navy)' }} />
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Department
                    </label>
                    <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                      <BookOpen size={14} style={{ color: 'var(--shadow-navy)' }} />
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                    <Mail size={14} style={{ color: 'var(--shadow-navy)' }} />
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
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Password
                    </label>
                    <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                      <Lock size={14} style={{ color: 'var(--shadow-navy)' }} />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Confirm
                    </label>
                    <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                      <Lock size={14} style={{ color: 'var(--shadow-navy)' }} />
                      <input 
                        type={showPassword ? 'text' : 'password'}
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

            <button 
              type="submit"
              disabled={isSubmitting}
              className="btn-login"
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
              {isSubmitting ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    animation: 'slow-spin 1s linear infinite'
                  }} />
                  <span>Verifying credentials...</span>
                </div>
              ) : success ? (
                <span>✓ Access Granted</span>
              ) : (
                <span>{isLogin ? 'Login to Workshop' : 'Create Account'}</span>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', borderTop: '1px solid var(--ambient-grey)', paddingTop: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {isLogin ? "New to the platform?" : "Already have an account?"}{' '}
              <a 
                href="#toggle" 
                onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 'bold' }}
              >
                {isLogin ? 'Create Account' : 'Sign In'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
