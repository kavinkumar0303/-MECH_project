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
    camera.position.set(0, 0, 7.5);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight('#FFEEDB', 1.8);
    scene.add(ambientLight);
    
    const keyLight = new THREE.DirectionalLight('#FFFFFF', 2.2);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);
    
    const fillLight = new THREE.DirectionalLight('#FFA066', 1.6);
    fillLight.position.set(-5, -2, 2);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight('#FF7824', 1.8);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);
    
    const group = new THREE.Group();
    scene.add(group);
    
    // Materials palette matching Warm Orange / Soft Peach / Cream Theme
    const matMain = new THREE.MeshStandardMaterial({ color: '#FF7824', roughness: 0.25, metalness: 0.85 });
    const matAccent = new THREE.MeshStandardMaterial({ color: '#FF4500', roughness: 0.2, metalness: 0.9 });
    const matReflections = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.15, metalness: 0.95 });
    const matShadow = new THREE.MeshStandardMaterial({ color: '#FFA066', roughness: 0.4, metalness: 0.6 });
    
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
    const bolt = new THREE.Mesh(boltGeom, new THREE.MeshStandardMaterial({ color: '#FFF5ED', roughness: 0.2, metalness: 0.9, emissive: '#FF7824', emissiveIntensity: 0.35 }));
    bolt.position.set(0, 0, 0.22);
    gearHub.add(bolt);
    
    group.add(gearHub);

    // 5. Solid Base Pedestal
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.25, 32), matShadow);
    pedestal.position.y = -2.5;
    group.add(pedestal);

    // Pedestal Glowing Rings
    const ringGeom = new THREE.TorusGeometry(2.4, 0.06, 12, 64);
    const glowingRing = new THREE.Mesh(ringGeom, new THREE.MeshBasicMaterial({ color: '#FF7824' }));
    glowingRing.position.y = -2.35;
    glowingRing.rotation.x = Math.PI / 2;
    group.add(glowingRing);
    
    const glowingRing2 = new THREE.Mesh(ringGeom, new THREE.MeshBasicMaterial({ color: '#FF4500' }));
    glowingRing2.position.y = -2.48;
    glowingRing2.rotation.x = Math.PI / 2;
    group.add(glowingRing2);

    let currentScale = 0.6;
    let targetScale = 1.1;
    let targetX = -1.5;

    const handleResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      if (w < 900) {
        targetX = 0;
        targetScale = 0.75;
      } else {
        targetX = -1.5;
        targetScale = 1.1;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseX = normX * 0.4;
      mouseY = normY * 0.4;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let reqId;
    let clock = new THREE.Clock();
    
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      
      currentScale += (targetScale - currentScale) * 0.05;
      group.scale.set(currentScale, currentScale, currentScale);
      group.position.x += (targetX - group.position.x) * 0.05;

      const idleRotSpeed = isLogin ? 0.4 : 0.8;
      group.rotation.y = elapsedTime * idleRotSpeed + mouseX;
      group.rotation.x = Math.sin(elapsedTime * 0.6) * 0.15 + mouseY;
      group.position.y = Math.sin(elapsedTime * 1.5) * 0.15 - 0.1;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(reqId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isLogin]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      if (!formData.studentId || !formData.password) {
        setError('Please provide student ID / username and password.');
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        const activeUser = {
          studentId: formData.studentId,
          name: formData.studentId === 'student01' ? 'Alex Rivera' : formData.studentId,
          college: 'MIT School of Engineering',
          department: 'Mechanical & Automation Engineering',
          batch: '2023 - 2027',
          role: 'Student Engineer',
          avatarUrl: '',
          xp: 2850,
          level: 4,
          safetyScore: 98,
          accuracy: 96,
          completedLabs: 12,
          totalLabs: 24,
          badges: ['ISO-9001 Safe Operator', 'Precision Turner', 'Welding Safety Certified'],
          history: [
            { machine: 'Lathe', task: 'Facing & Centering Operation', score: '98%', date: 'Yesterday' },
            { machine: 'Welding', task: 'Butt Joint Multi-pass Safety Pass', score: '95%', date: '3 days ago' },
            { machine: 'Milling', task: 'End-Mill Pocket Roughing', score: '100%', date: '5 days ago' }
          ]
        };
        setSuccess('Access granted! Initializing 3D cockpit...');
        setTimeout(() => {
          onLoginSuccess(activeUser);
        }, 800);
      }, 1000);
    } else {
      if (!formData.name || !formData.studentId || !formData.email || !formData.password) {
        setError('Please complete all registration fields.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        const newUser = {
          studentId: formData.studentId,
          name: formData.name,
          college: formData.college || 'Engineering Institute',
          department: formData.department || 'Mechanical Engineering',
          batch: '2024 - 2028',
          role: 'Student Trainee',
          avatarUrl: '',
          xp: 100,
          level: 1,
          safetyScore: 100,
          accuracy: 100,
          completedLabs: 0,
          totalLabs: 24,
          badges: ['Workshop Inductee'],
          history: []
        };
        setSuccess('Account provisioned successfully! Loading cockpit...');
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
        background: 'radial-gradient(ellipse at center top, #FFF8F3 0%, #FFF1E6 100%)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* 1. 3D Mechanical Workshop scene container */}
      <div className="login-canvas-container">
        <div ref={canvasContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* 2. Visual readability overlay */}
      <div className="login-overlay" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(255, 248, 243, 0.4) 0%, rgba(255, 248, 243, 0.9) 100%)' }} />

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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(255, 120, 36, 0.12)', border: '1px solid rgba(255, 120, 36, 0.3)', marginBottom: '16px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF7824', boxShadow: '0 0 10px #FF7824' }}></span>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#E65100', letterSpacing: '1.5px', textTransform: 'uppercase' }}>NEXT-GEN MECHANICAL VIRTUAL LAB</span>
        </div>
        <h1 style={{ 
          fontSize: '52px', 
          fontWeight: '900', 
          background: 'linear-gradient(135deg, #1C1917 0%, #E65100 50%, #FF7824 100%)',
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
          color: '#E65100', 
          margin: '6px 0 0 0', 
          letterSpacing: '1px',
          textTransform: 'uppercase',
          lineHeight: '1.1',
          textShadow: '0 0 20px rgba(255, 120, 36, 0.3)'
        }}>
          Virtual Workshop
        </h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#1C1917', letterSpacing: '2px', opacity: 0.9 }}>LEARN</span>
          <span style={{ color: '#FF7824', fontSize: '12px' }}>•</span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#1C1917', letterSpacing: '2px', opacity: 0.9 }}>SIMULATE</span>
          <span style={{ color: '#FF4500', fontSize: '12px' }}>•</span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#1C1917', letterSpacing: '2px', opacity: 0.9 }}>MASTER</span>
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
          <div style={{ width: '4px', height: '14px', background: '#FF7824', borderRadius: '2px' }} />
          <div style={{ width: '4px', height: '14px', background: '#FFA066', borderRadius: '2px' }} />
          <div style={{ width: '4px', height: '14px', background: '#FF4500', borderRadius: '2px' }} />
        </div>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#574A40', letterSpacing: '0.5px' }}>
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
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 120, 36, 0.25)',
            boxShadow: '0 25px 60px rgba(234, 88, 12, 0.12), 0 0 35px rgba(255, 120, 36, 0.08)',
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
              background: 'rgba(255, 120, 36, 0.12)',
              border: '1px solid #FF7824',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(255, 120, 36, 0.25)'
            }}>
              <Settings className="anim-slow-spin" size={28} style={{ color: '#E65100' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: '900', color: '#1C1917', letterSpacing: '1px', textTransform: 'uppercase' }}>STUDENT PORTAL</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#E65100', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '2px' }}>Virtual Mechanical Lab</span>
            </div>
            <p style={{ color: '#574A40', fontSize: '13px', textAlign: 'center', margin: 0 }}>
              Sign in to continue your workshop training
            </p>
          </div>

          {/* Demo Alert Credentials Box */}
          {isLogin && (
            <div 
              style={{
                background: '#FFF8F3',
                border: '1px solid rgba(255, 120, 36, 0.25)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '12px', color: '#574A40', lineHeight: '1.4' }}>
                <strong style={{ color: '#E65100' }}>Demo Student Access</strong><br/>
                User: <span style={{ fontFamily: 'var(--mono-font)', color: '#1C1917', fontWeight: '700' }}>student01</span> | 
                Pass: <span style={{ fontFamily: 'var(--mono-font)', color: '#1C1917', fontWeight: '700' }}>demo123</span>
              </div>
              <button 
                type="button"
                onClick={handleDemoFill}
                style={{
                  background: 'linear-gradient(135deg, #FF7824 0%, #FF4500 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 0 10px rgba(255, 120, 36, 0.25)'
                }}
              >
                Auto Fill
              </button>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #EF4444', borderRadius: '10px', padding: '10px 14px', color: '#DC2626', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={14} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(255, 120, 36, 0.12)', border: '1px solid #FF7824', borderRadius: '10px', padding: '10px 14px', color: '#E65100', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={14} />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isLogin ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#574A40', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Username or Student ID
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#FFFDFB', border: '1px solid rgba(255, 120, 36, 0.2)', borderRadius: '12px', padding: '12px 14px', gap: '10px' }}>
                    <User size={16} style={{ color: '#FF7824' }} />
                    <input 
                      type="text" 
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="Enter student01"
                      required
                      style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#574A40', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Password
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#FFFDFB', border: '1px solid rgba(255, 120, 36, 0.2)', borderRadius: '12px', padding: '12px 14px', gap: '10px' }}>
                    <Lock size={16} style={{ color: '#FF7824' }} />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: '13px', width: '100%', outline: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8C7A70',
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
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#574A40' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#FF7824' }} />
                    Remember Me
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); setError('⚠️ Contact department administrator to reset credentials.'); }} style={{ color: '#E65100', textDecoration: 'none', fontWeight: '600' }}>
                    Forgot password?
                  </a>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#574A40', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Student Name
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#FFFDFB', border: '1px solid rgba(255, 120, 36, 0.2)', borderRadius: '10px', padding: '10px 12px', gap: '8px' }}>
                      <User size={14} style={{ color: '#FF7824' }} />
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: '12px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#574A40', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Student ID
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#FFFDFB', border: '1px solid rgba(255, 120, 36, 0.2)', borderRadius: '10px', padding: '10px 12px', gap: '8px' }}>
                      <Lock size={14} style={{ color: '#FF7824' }} />
                      <input 
                        type="text" 
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        placeholder="STU1029"
                        style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: '12px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#574A40', marginBottom: '6px', textTransform: 'uppercase' }}>
                      College
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#FFFDFB', border: '1px solid rgba(255, 120, 36, 0.2)', borderRadius: '10px', padding: '10px 12px', gap: '8px' }}>
                      <School size={14} style={{ color: '#FF7824' }} />
                      <input 
                        type="text" 
                        name="college"
                        value={formData.college}
                        onChange={handleChange}
                        placeholder="University"
                        style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: '12px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#574A40', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Department
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#FFFDFB', border: '1px solid rgba(255, 120, 36, 0.2)', borderRadius: '10px', padding: '10px 12px', gap: '8px' }}>
                      <BookOpen size={14} style={{ color: '#FF7824' }} />
                      <input 
                        type="text" 
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Mechanical"
                        style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: '12px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#574A40', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Email Address
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#FFFDFB', border: '1px solid rgba(255, 120, 36, 0.2)', borderRadius: '10px', padding: '10px 12px', gap: '8px' }}>
                    <Mail size={14} style={{ color: '#FF7824' }} />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@college.edu"
                      style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: '12px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#574A40', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Password
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#FFFDFB', border: '1px solid rgba(255, 120, 36, 0.2)', borderRadius: '10px', padding: '10px 12px', gap: '8px' }}>
                      <Lock size={14} style={{ color: '#FF7824' }} />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: '12px', width: '100%', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#574A40', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Confirm
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#FFFDFB', border: '1px solid rgba(255, 120, 36, 0.2)', borderRadius: '10px', padding: '10px 12px', gap: '8px' }}>
                      <Lock size={14} style={{ color: '#FF7824' }} />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        style={{ background: 'none', border: 'none', color: '#1C1917', fontSize: '12px', width: '100%', outline: 'none' }}
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

          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255, 120, 36, 0.15)', paddingTop: '16px' }}>
            <p style={{ fontSize: '13px', color: '#574A40', margin: 0 }}>
              {isLogin ? "New to the platform?" : "Already have an account?"}{' '}
              <a 
                href="#toggle" 
                onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                style={{ color: '#E65100', textDecoration: 'none', fontWeight: '700' }}
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
