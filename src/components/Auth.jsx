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
    
    const ambientLight = new THREE.AmbientLight('#240A50', 1.2);
    scene.add(ambientLight);
    
    const keyLight = new THREE.DirectionalLight('#FFFFFF', 2.0);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);
    
    const fillLight = new THREE.DirectionalLight('#FF5376', 1.2);
    fillLight.position.set(-5, -2, 2);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight('#00F5D4', 1.5);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);
    
    const group = new THREE.Group();
    scene.add(group);
    
    // Materials palette matching SpaceDrive magenta, purple, cyan, and chrome
    const matMain = new THREE.MeshStandardMaterial({ color: '#FF5376', roughness: 0.25, metalness: 0.85 });
    const matAccent = new THREE.MeshStandardMaterial({ color: '#7928CA', roughness: 0.2, metalness: 0.9 });
    const matReflections = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.15, metalness: 0.95 });
    const matShadow = new THREE.MeshStandardMaterial({ color: '#160636', roughness: 0.5, metalness: 0.5 });
    
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
    const bolt = new THREE.Mesh(boltGeom, new THREE.MeshStandardMaterial({ color: '#00F5D4', roughness: 0.2, metalness: 0.9, emissive: '#00F5D4', emissiveIntensity: 0.3 }));
    bolt.position.set(0, 0, 0.22); // Slightly forward from gear hub
    gearHub.add(bolt);
    
    group.add(gearHub);

    // 5. Solid Base Pedestal
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.25, 32), matShadow);
    pedestal.position.y = -2.5;
    group.add(pedestal);

    // Pedestal Glowing Neon Rings
    const ringGeom = new THREE.TorusGeometry(2.4, 0.06, 12, 64);
    const glowingRing = new THREE.Mesh(ringGeom, new THREE.MeshBasicMaterial({ color: '#FF5376' }));
    glowingRing.position.y = -2.35;
    glowingRing.rotation.x = Math.PI / 2;
    group.add(glowingRing);
    
    const glowingRing2 = new THREE.Mesh(ringGeom, new THREE.MeshBasicMaterial({ color: '#00F5D4' }));
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
        background: 'radial-gradient(ellipse at center top, #160636 0%, #0D0221 100%)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* 1. 3D Mechanical Workshop scene container */}
      <div className="login-canvas-container">
        <div ref={canvasContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* 2. Visual readability overlay */}
      <div className="login-overlay" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(13, 2, 33, 0.4) 0%, rgba(13, 2, 33, 0.85) 100%)' }} />

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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(255, 83, 118, 0.12)', border: '1px solid rgba(255, 83, 118, 0.3)', marginBottom: '16px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00F5D4', boxShadow: '0 0 10px #00F5D4' }}></span>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#00F5D4', letterSpacing: '1.5px', textTransform: 'uppercase' }}>NEXT-GEN MECHANICAL VIRTUAL LAB</span>
        </div>
        <h1 style={{ 
          fontSize: '52px', 
          fontWeight: '900', 
          background: 'linear-gradient(135deg, #FFFFFF 0%, #E040FB 50%, #FF5376 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0, 
          letterSpacing: '-0.5px',
          textTransform: 'uppercase',
          lineHeight: '1.05'
        }}>
          Mechanical
        </h1>
        <h2 style={{ 
          fontSize: '32px', 
          fontWeight: '800', 
          color: '#00F5D4', 
          margin: '6px 0 0 0', 
          letterSpacing: '1px',
          textTransform: 'uppercase',
          lineHeight: '1.1',
          textShadow: '0 0 20px rgba(0, 245, 212, 0.3)'
        }}>
          Virtual Workshop
        </h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '2px', opacity: 0.9 }}>LEARN</span>
          <span style={{ color: '#FF5376', fontSize: '12px' }}>•</span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '2px', opacity: 0.9 }}>SIMULATE</span>
          <span style={{ color: '#00F5D4', fontSize: '12px' }}>•</span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '2px', opacity: 0.9 }}>MASTER</span>
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
          gap: '12px',
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', gap: '4px' }}>
          <div style={{ width: '4px', height: '14px', background: 'var(--brand-primary)', borderRadius: '2px' }} />
          <div style={{ width: '4px', height: '14px', background: 'var(--brand-secondary)', borderRadius: '2px' }} />
          <div style={{ width: '4px', height: '14px', background: 'var(--accent-cyan)', borderRadius: '2px' }} />
        </div>
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.5px' }}>
          Skill Builds Machines. Knowledge Builds Futures.
        </span>
      </div>

      {/* 5. Floating Login Card Container */}
      <div className="login-card-container">
        <div 
          className="anim-slide-up"
          style={{
            width: '100%',
            maxWidth: isLogin ? '420px' : '520px',
            padding: '38px',
            background: 'rgba(22, 6, 54, 0.85)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(224, 64, 251, 0.25)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(224, 64, 251, 0.15)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative'
          }}
        >
          {/* Brand Header Inside Card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '54px', 
              height: '54px', 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(255, 83, 118, 0.2) 0%, rgba(121, 40, 202, 0.3) 100%)',
              border: '1px solid rgba(255, 83, 118, 0.4)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(255, 83, 118, 0.3)'
            }}>
              <Settings className="anim-slow-spin" size={28} style={{ color: '#FF5376' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '1px', textTransform: 'uppercase' }}>STUDENT PORTAL</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#00F5D4', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '2px' }}>Virtual Mechanical Lab</span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', textAlign: 'center', margin: 0 }}>
              Sign in to continue your workshop training
            </p>
          </div>

          {/* Demo Alert Credentials Box */}
          {isLogin && (
            <div 
              style={{
                background: 'rgba(32, 12, 74, 0.7)',
                border: '1px solid rgba(224, 64, 251, 0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.4' }}>
                <strong style={{ color: '#00F5D4' }}>Demo Student Access</strong><br/>
                User: <span style={{ fontFamily: 'var(--mono-font)', color: '#FFFFFF', fontWeight: '700' }}>student01</span> | 
                Pass: <span style={{ fontFamily: 'var(--mono-font)', color: '#FFFFFF', fontWeight: '700' }}>demo123</span>
              </div>
              <button 
                type="button"
                onClick={handleDemoFill}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 83, 118, 0.2) 0%, rgba(121, 40, 202, 0.3) 100%)',
                  border: '1px solid #FF5376',
                  color: '#FFFFFF',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 0 10px rgba(255, 83, 118, 0.25)'
                }}
              >
                Auto Fill
              </button>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '10px', padding: '10px 14px', color: '#FCA5A5', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={14} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(0, 245, 212, 0.15)', border: '1px solid #00F5D4', borderRadius: '10px', padding: '10px 14px', color: '#00F5D4', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={14} />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isLogin ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Username or Student ID
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(32, 12, 74, 0.65)', border: '1px solid rgba(224, 64, 251, 0.25)', borderRadius: '12px', padding: '12px 14px', gap: '10px' }}>
                    <User size={16} style={{ color: '#E040FB' }} />
                    <input 
                      type="text" 
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="Enter student01"
                      required
                      style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Password
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(32, 12, 74, 0.65)', border: '1px solid rgba(224, 64, 251, 0.25)', borderRadius: '12px', padding: '12px 14px', gap: '10px' }}>
                    <Lock size={16} style={{ color: '#E040FB' }} />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
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
                        color: 'rgba(255, 255, 255, 0.5)',
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
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.7)' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#FF5376' }} />
                    Remember Me
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); setError('⚠️ Contact department administrator to reset credentials.'); }} style={{ color: '#00F5D4', textDecoration: 'none', fontWeight: '600' }}>
                    Forgot password?
                  </a>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Student Name
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(32, 12, 74, 0.65)', border: '1px solid rgba(224, 64, 251, 0.25)', borderRadius: '10px', padding: '10px 12px', gap: '8px' }}>
                      <User size={14} style={{ color: '#E040FB' }} />
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '12px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Student ID
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(32, 12, 74, 0.65)', border: '1px solid rgba(224, 64, 251, 0.25)', borderRadius: '10px', padding: '10px 12px', gap: '8px' }}>
                      <Lock size={14} style={{ color: '#E040FB' }} />
                      <input 
                        type="text" 
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        placeholder="STU1029"
                        style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '12px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      College
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(32, 12, 74, 0.65)', border: '1px solid rgba(224, 64, 251, 0.25)', borderRadius: '10px', padding: '10px 12px', gap: '8px' }}>
                      <School size={14} style={{ color: '#E040FB' }} />
                      <input 
                        type="text" 
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        placeholder="University"
                        style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '12px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Department
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(32, 12, 74, 0.65)', border: '1px solid rgba(224, 64, 251, 0.25)', borderRadius: '10px', padding: '10px 12px', gap: '8px' }}>
                      <BookOpen size={14} style={{ color: '#E040FB' }} />
                      <input 
                        type="text" 
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Mechanical"
                        style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '12px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Email Address
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(32, 12, 74, 0.65)', border: '1px solid rgba(224, 64, 251, 0.25)', borderRadius: '10px', padding: '10px 12px', gap: '8px' }}>
                    <Mail size={14} style={{ color: '#E040FB' }} />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@college.edu"
                      style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '12px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Password
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(32, 12, 74, 0.65)', border: '1px solid rgba(224, 64, 251, 0.25)', borderRadius: '10px', padding: '10px 12px', gap: '8px' }}>
                      <Lock size={14} style={{ color: '#E040FB' }} />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '12px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Confirm
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(32, 12, 74, 0.65)', border: '1px solid rgba(224, 64, 251, 0.25)', borderRadius: '10px', padding: '10px 12px', gap: '8px' }}>
                      <Lock size={14} style={{ color: '#E040FB' }} />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '12px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className="space-btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '28px',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px',
                letterSpacing: '0.5px'
              }}
            >
              {isSubmitting ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    animation: 'slow-spin 1s linear infinite'
                  }} />
                  <span>AUTHENTICATING...</span>
                </div>
              ) : success ? (
                <span>✓ ACCESS GRANTED</span>
              ) : (
                <>
                  <span>{isLogin ? 'ENTER WORKSHOP' : 'CREATE ACCOUNT'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(224, 64, 251, 0.2)', paddingTop: '16px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
              {isLogin ? "New to the platform?" : "Already have an account?"}{' '}
              <a 
                href="#toggle" 
                onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                style={{ color: '#00F5D4', textDecoration: 'none', fontWeight: '700' }}
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
