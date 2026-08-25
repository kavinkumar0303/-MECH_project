import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  Settings, 
  ShieldAlert, 
  CheckCircle, 
  Lock, 
  User, 
  School, 
  BookOpen, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Zap,
  Mail
} from 'lucide-react';

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
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight('#C2CAD9', 0.85);
    scene.add(ambientLight);
    
    const keyLight = new THREE.DirectionalLight('#FFFFFF', 1.5);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);
    
    const fillLight = new THREE.DirectionalLight('#9EB4E4', 0.9);
    fillLight.position.set(-5, -2, 2);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight('#3D72C1', 0.85);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);
    
    const group = new THREE.Group();
    scene.add(group);
    
    // Materials palette matching brand colors
    const matMain = new THREE.MeshStandardMaterial({ color: '#1C3A7A', roughness: 0.35, metalness: 0.8 });
    const matAccent = new THREE.MeshStandardMaterial({ color: '#3D72C1', roughness: 0.25, metalness: 0.9 });
    const matReflections = new THREE.MeshStandardMaterial({ color: '#9EB4E4', roughness: 0.2, metalness: 0.95 });
    const matShadow = new THREE.MeshStandardMaterial({ color: '#3B4B6F', roughness: 0.45, metalness: 0.65 });
    
    // Constructing the logo components:
    
    // 1. Double-ended Wrench 1 (45 degrees)
    const wrench1 = new THREE.Group();
    const handle1 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 3.3, 0.18), matReflections);
    wrench1.add(handle1);
    
    // C-shaped jaw top
    const jaw1Top = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.11, 12, 32, Math.PI * 1.5), matReflections);
    jaw1Top.position.y = 1.65;
    jaw1Top.rotation.z = -Math.PI * 0.75;
    wrench1.add(jaw1Top);
    
    // C-shaped jaw bottom
    const jaw1Bottom = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.11, 12, 32, Math.PI * 1.5), matReflections);
    jaw1Bottom.position.y = -1.65;
    jaw1Bottom.rotation.z = Math.PI * 0.25;
    wrench1.add(jaw1Bottom);
    
    wrench1.rotation.z = Math.PI / 4;
    group.add(wrench1);

    // 2. Double-ended Wrench 2 (-45 degrees)
    const wrench2 = new THREE.Group();
    const handle2 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 3.3, 0.18), matReflections);
    wrench2.add(handle2);
    
    // C-shaped jaw top
    const jaw2Top = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.11, 12, 32, Math.PI * 1.5), matReflections);
    jaw2Top.position.y = 1.65;
    jaw2Top.rotation.z = -Math.PI * 0.75;
    wrench2.add(jaw2Top);
    
    // C-shaped jaw bottom
    const jaw2Bottom = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.11, 12, 32, Math.PI * 1.5), matReflections);
    jaw2Bottom.position.y = -1.65;
    jaw2Bottom.rotation.z = Math.PI * 0.25;
    wrench2.add(jaw2Bottom);
    
    wrench2.rotation.z = -Math.PI / 4;
    group.add(wrench2);

    // 3. Central Gear Hub
    const gearHub = new THREE.Group();
    const hubCyl = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.4, 32), matMain);
    hubCyl.rotation.x = Math.PI / 2;
    gearHub.add(hubCyl);
    
    // Outer gear circular ring highlight
    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.08, 12, 64), matAccent);
    outerRing.position.z = 0.2;
    gearHub.add(outerRing);

    // 12 Outer Gear Teeth
    const toothGeom = new THREE.BoxGeometry(0.25, 0.35, 0.4);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const tooth = new THREE.Mesh(toothGeom, matReflections);
      tooth.position.set(Math.cos(angle) * 1.35, Math.sin(angle) * 1.35, 0);
      tooth.rotation.z = angle;
      gearHub.add(tooth);
    }
    
    // 4. Center Extruded Lightning Bolt
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.65);
    shape.lineTo(0.3, 0.05);
    shape.lineTo(0.08, 0.05);
    shape.lineTo(0.25, -0.65);
    shape.lineTo(-0.25, -0.05);
    shape.lineTo(-0.05, -0.05);
    shape.closePath();
    
    const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.015, bevelThickness: 0.015 };
    const boltGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const bolt = new THREE.Mesh(boltGeom, matReflections);
    bolt.position.set(0, 0, 0.22); // Slightly forward from gear hub
    gearHub.add(bolt);
    
    group.add(gearHub);

    // 5. Solid Base Pedestal
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.25, 32), matShadow);
    pedestal.position.y = -2.5;
    group.add(pedestal);

    // Pedestal Glowing Blue Ring
    const ringGeom = new THREE.TorusGeometry(2.4, 0.06, 12, 64);
    const glowingRing = new THREE.Mesh(ringGeom, new THREE.MeshBasicMaterial({ color: '#1D49B4' }));
    glowingRing.position.y = -2.35;
    glowingRing.rotation.x = Math.PI / 2;
    group.add(glowingRing);
    
    const glowingRing2 = new THREE.Mesh(ringGeom, new THREE.MeshBasicMaterial({ color: '#3D72C1' }));
    glowingRing2.position.y = -2.48;
    glowingRing2.rotation.x = Math.PI / 2;
    group.add(glowingRing2);

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
        // Slow continuous rotation + subtle float
        group.rotation.z = Math.sin(clock.getElapsedTime() * 0.15) * 0.1;
        group.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.15;
        group.rotation.x = (Math.PI / 8) + Math.cos(clock.getElapsedTime() * 0.3) * 0.05;
        group.position.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.15;
      } else {
        group.rotation.set(Math.PI / 8, 0.2, 0);
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
          name: 'Kavin Kumar',
          studentId: 'student01',
          college: 'PSG College of Technology',
          department: 'Mechanical Engineering',
          email: 'kavin.kumar@psg.edu',
          xp: 1240,
          level: 'Workshop Expert',
          safetyScore: 98,
          accuracy: 98,
          completedMissions: 24,
          machinesExplored: 7,
          completedMissionsList: ['lathe_01', 'welding_01', 'milling_01'],
          badges: ['Lathe Beginner', 'Safety First', 'Milling Master', 'Workshop Expert']
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
        setError('⚠️ Account with this ID or Email already exists');
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
        level: 'Apprentice',
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
        background: 'radial-gradient(circle at center, #0A142A 0%, #050B1B 100%)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* 1. 3D Mechanical Workshop scene container */}
      <div className="login-canvas-container">
        <div ref={canvasContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* 2. Visual readability overlay */}
      <div className="login-overlay" style={{ background: 'linear-gradient(to right, rgba(11, 23, 51, 0.15) 0%, rgba(11, 23, 51, 0.8) 100%)' }} />

      {/* 3. Left Branding Overlay Text */}
      <div 
        className="hide-mobile"
        style={{
          position: 'absolute',
          left: '8%',
          bottom: '12%',
          zIndex: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          pointerEvents: 'none'
        }}
      >
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '900', 
          color: '#FFFFFF', 
          margin: 0, 
          letterSpacing: '1px',
          textTransform: 'uppercase',
          textShadow: '0 4px 15px rgba(255,255,255,0.15), 0 0 35px rgba(29, 73, 180, 0.35)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          Mechanical
        </h1>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '800', 
          color: 'var(--brand-secondary)', 
          margin: '4px 0 0 0', 
          letterSpacing: '1px',
          textTransform: 'uppercase',
          lineHeight: '1.1'
        }}>
          Virtual Workshop
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '2.5px', opacity: 0.8 }}>LEARN</span>
          <span style={{ color: 'var(--brand-secondary)', fontSize: '10px' }}>•</span>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '2.5px', opacity: 0.8 }}>SIMULATE</span>
          <span style={{ color: 'var(--brand-secondary)', fontSize: '10px' }}>•</span>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '2.5px', opacity: 0.8 }}>MASTER</span>
        </div>
      </div>

      {/* 4. Bottom Left Footer Quote */}
      <div 
        className="hide-mobile"
        style={{
          position: 'absolute',
          left: '8%',
          bottom: '4%',
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', gap: '3px' }}>
          <div style={{ width: '4px', height: '14px', background: 'var(--brand-primary)', transform: 'skewX(-15deg)' }} />
          <div style={{ width: '4px', height: '14px', background: 'var(--brand-secondary)', transform: 'skewX(-15deg)' }} />
          <div style={{ width: '4px', height: '14px', background: 'var(--accent-light)', transform: 'skewX(-15deg)' }} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
          Skill Builds Machines. Knowledge Builds Futures.
        </span>
      </div>

      {/* 5. Floating Login Card Container */}
      <div className="login-card-container">
        <div 
          className="glass-panel anim-slide-up"
          style={{
            width: '100%',
            maxWidth: isLogin ? '400px' : '500px',
            padding: '36px',
            background: 'rgba(11, 23, 51, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(61, 114, 193, 0.35)',
            boxShadow: '0 0 20px rgba(29, 73, 180, 0.2), 0 15px 35px rgba(0, 0, 0, 0.4)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative'
          }}
        >
          {/* Brand Header Inside Card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings className="anim-slow-spin" size={34} style={{ color: 'var(--brand-secondary)', animation: 'slow-spin 12s linear infinite' }} />
              <Zap size={13} style={{ position: 'absolute', color: '#FFFFFF', fill: 'var(--brand-secondary)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '1px', textTransform: 'uppercase' }}>Mechanical</span>
              <span style={{ fontSize: '8px', fontWeight: '700', color: 'var(--brand-secondary)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '-2px' }}>Virtual Workshop</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center', marginTop: '6px' }}>
              Sign in to continue your workshop training
            </p>
          </div>

          {/* Demo Alert Credentials Box */}
          {isLogin && (
            <div 
              style={{
                background: 'rgba(11, 23, 51, 0.45)',
                border: '1px solid rgba(61, 114, 193, 0.25)',
                borderRadius: '6px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <strong style={{ color: 'var(--brand-secondary)' }}>Demo Account</strong><br/>
                User: <span style={{ fontFamily: 'var(--mono-font)', color: '#FFFFFF' }}>student01</span><br/>
                Pass: <span style={{ fontFamily: 'var(--mono-font)', color: '#FFFFFF' }}>demo123</span>
              </div>
              <button 
                type="button"
                onClick={handleDemoFill}
                style={{
                  background: 'rgba(29, 73, 180, 0.15)',
                  border: '1px solid var(--brand-primary)',
                  color: '#FFFFFF',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Auto Fill
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

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isLogin ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Username
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(11, 23, 51, 0.65)', border: '1px solid rgba(61, 114, 193, 0.25)', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                    <User size={14} style={{ color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      required
                      style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Password
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(11, 23, 51, 0.65)', border: '1px solid rgba(61, 114, 193, 0.25)', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                    <Lock size={14} style={{ color: 'var(--text-secondary)' }} />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                        outline: 'none'
                      }}
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
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); setError('⚠️ Contact department administrator to reset credentials.'); }} style={{ color: 'var(--brand-secondary)', textDecoration: 'none', fontWeight: '500' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(11, 23, 51, 0.65)', border: '1px solid rgba(61, 114, 193, 0.25)', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                      <User size={14} style={{ color: 'var(--text-secondary)' }} />
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '13px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Student ID
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(11, 23, 51, 0.65)', border: '1px solid rgba(61, 114, 193, 0.25)', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                      <Lock size={14} style={{ color: 'var(--text-secondary)' }} />
                      <input 
                        type="text" 
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        placeholder="STU1029"
                        style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '13px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      College
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(11, 23, 51, 0.65)', border: '1px solid rgba(61, 114, 193, 0.25)', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                      <School size={14} style={{ color: 'var(--text-secondary)' }} />
                      <input 
                        type="text" 
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        placeholder="University"
                        style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '13px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Department
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(11, 23, 51, 0.65)', border: '1px solid rgba(61, 114, 193, 0.25)', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                      <BookOpen size={14} style={{ color: 'var(--text-secondary)' }} />
                      <input 
                        type="text" 
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Mech Eng"
                        style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '13px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(11, 23, 51, 0.65)', border: '1px solid rgba(61, 114, 193, 0.25)', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                    <Mail size={14} style={{ color: 'var(--text-secondary)' }} />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@college.edu"
                      style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Password
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(11, 23, 51, 0.65)', border: '1px solid rgba(61, 114, 193, 0.25)', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                      <Lock size={14} style={{ color: 'var(--text-secondary)' }} />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '13px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Confirm
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(11, 23, 51, 0.65)', border: '1px solid rgba(61, 114, 193, 0.25)', borderRadius: '4px', padding: '10px 12px', gap: '10px' }}>
                      <Lock size={14} style={{ color: 'var(--text-secondary)' }} />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '13px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: 'none',
                background: 'linear-gradient(90deg, #1D49B4 0%, #3D72C1 100%)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px',
                boxShadow: '0 4px 12px rgba(29, 73, 180, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 16px rgba(61, 114, 193, 0.55)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 73, 180, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
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
                <>
                  <span>{isLogin ? 'Login to Workshop' : 'Create Account'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(194, 202, 217, 0.15)', paddingTop: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {isLogin ? "New to the platform?" : "Already have an account?"}{' '}
              <a 
                href="#toggle" 
                onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                style={{ color: 'var(--brand-secondary)', textDecoration: 'none', fontWeight: 'bold' }}
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
