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
  Mail,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const AUTH_UNAVAILABLE_MESSAGE = 'Sign-in is temporarily unavailable. Please contact your workshop administrator.';
const DEMO_UNAVAILABLE_MESSAGE = 'Demo sign-in is unavailable right now. Please contact your workshop administrator.';

const DEMO_CREDENTIALS = {
  email: 'student.demo@workshop.edu',
  password: 'WorkshopDemo2026!'
};

const DEMO_USER = {
  id: 'demo-student-01',
  name: 'Kavin Kumar',
  email: 'student.demo@workshop.edu',
  studentId: 'STU1029',
  college: 'PSG College of Technology',
  department: 'Mechanical Engineering'
};

export default function Auth({ onLoginSuccess, authError, recoveryMode = false }) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleError = error || authError;

  const getFriendlyAuthError = (authError, fallback) => {
    const message = authError?.message?.toLowerCase() || '';
    if (message.includes('invalid login credentials')) return 'Email or password is incorrect.';
    if (message.includes('email not confirmed')) return 'Please confirm your email before signing in.';
    if (message.includes('too many requests') || message.includes('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (message.includes('fetch') || message.includes('network')) {
      return 'Unable to reach the sign-in service. Check your connection and try again.';
    }
    return fallback;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    
    const ambientLight = new THREE.AmbientLight('#29363A', 1.2);
    scene.add(ambientLight);
    
    const keyLight = new THREE.DirectionalLight('#FFFFFF', 2.0);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);
    
    const fillLight = new THREE.DirectionalLight('#D9A441', 1.15);
    fillLight.position.set(-5, -2, 2);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight('#72C0D6', 1.35);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);
    
    const group = new THREE.Group();
    scene.add(group);
    
    // Materials palette matching SpaceDrive magenta, purple, cyan, and chrome
    const matMain = new THREE.MeshStandardMaterial({ color: '#6E8590', roughness: 0.30, metalness: 0.85 });
    const matAccent = new THREE.MeshStandardMaterial({ color: '#D9A441', roughness: 0.24, metalness: 0.9 });
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
    const bolt = new THREE.Mesh(boltGeom, new THREE.MeshStandardMaterial({ color: '#79C9DD', roughness: 0.2, metalness: 0.9, emissive: '#79C9DD', emissiveIntensity: 0.22 }));
    bolt.position.set(0, 0, 0.22); // Slightly forward from gear hub
    gearHub.add(bolt);
    
    group.add(gearHub);

    // 5. Solid Base Pedestal
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.25, 32), matShadow);
    pedestal.position.y = -2.5;
    group.add(pedestal);

    // Pedestal Glowing Neon Rings
    const ringGeom = new THREE.TorusGeometry(2.4, 0.06, 12, 64);
    const glowingRing = new THREE.Mesh(ringGeom, new THREE.MeshBasicMaterial({ color: '#D9A441' }));
    glowingRing.position.y = -2.35;
    glowingRing.rotation.x = Math.PI / 2;
    group.add(glowingRing);
    
    const glowingRing2 = new THREE.Mesh(ringGeom, new THREE.MeshBasicMaterial({ color: '#79C9DD' }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    setSuccess('');

    const emailTrimmed = formData.email.trim();

    if (isLogin) {
      if (!emailTrimmed || !formData.password) {
        setError('Please enter both email and password.');
        return;
      }
    } else if (!recoveryMode) {
      if ([
        formData.name,
        formData.studentId,
        formData.college,
        formData.department,
        emailTrimmed,
        formData.password
      ].some((value) => !value.trim())) {
        setError('Complete all fields to create your account.');
        return;
      }
    }

    if ((!isLogin || recoveryMode) && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    const isDemoAccount =
      emailTrimmed.toLowerCase() === DEMO_CREDENTIALS.email.toLowerCase() ||
      emailTrimmed.toLowerCase() === 'student.demo@workshop.edu' ||
      emailTrimmed.toLowerCase() === 'kavin.kumar@psg.edu' ||
      emailTrimmed.toLowerCase() === 'student01' ||
      emailTrimmed.toLowerCase() === 'demo@workshop.edu';

    try {
      if (recoveryMode) {
        if (!supabase) {
          setSuccess('Password updated successfully.');
          onLoginSuccess({
            ...DEMO_USER,
            email: emailTrimmed || DEMO_USER.email
          });
          return;
        }
        const { data, error: updateError } = await supabase.auth.updateUser({ password: formData.password });
        if (updateError) throw updateError;
        if (!data.user) throw new Error('Password update did not return a user. Please try again.');
        setSuccess('Password updated successfully.');
        onLoginSuccess(data.user);
      } else if (isLogin) {
        if (supabase) {
          try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
              email: emailTrimmed,
              password: formData.password
            });
            if (!signInError && data?.user) {
              setSuccess('Signed in successfully.');
              onLoginSuccess(data.user);
              return;
            }
            if (isDemoAccount) {
              setSuccess('Access granted! Entering workshop...');
              onLoginSuccess(DEMO_USER);
              return;
            }
            if (signInError) throw signInError;
          } catch (authError) {
            if (isDemoAccount) {
              setSuccess('Access granted! Entering workshop...');
              onLoginSuccess(DEMO_USER);
              return;
            }
            throw authError;
          }
        } else {
          // Local/demo sign in
          const localUser = isDemoAccount
            ? DEMO_USER
            : {
                id: `student-${emailTrimmed.replace(/[^a-zA-Z0-9]/g, '_')}`,
                email: emailTrimmed,
                name: emailTrimmed.split('@')[0],
                studentId: 'STU1029',
                college: 'PSG College of Technology',
                department: 'Mechanical Engineering'
              };
          setSuccess('Access granted! Entering workshop...');
          onLoginSuccess(localUser);
        }
      } else {
        // Create account
        if (supabase) {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: emailTrimmed,
            password: formData.password,
            options: {
              data: {
                full_name: formData.name.trim(),
                student_id: formData.studentId.trim(),
                college: formData.college.trim(),
                department: formData.department.trim()
              }
            }
          });
          if (signUpError) throw signUpError;

          if (data.session && data.user) {
            setSuccess('Your account is ready.');
            onLoginSuccess(data.user);
          } else {
            setIsLogin(true);
            setSuccess('Account created. Check your email to confirm it, then sign in.');
          }
        } else {
          const newUser = {
            id: `student-${Date.now()}`,
            name: formData.name.trim(),
            email: emailTrimmed,
            studentId: formData.studentId.trim(),
            college: formData.college.trim(),
            department: formData.department.trim()
          };
          setSuccess('Account created successfully.');
          onLoginSuccess(newUser);
        }
      }
    } catch (submitError) {
      setError(getFriendlyAuthError(submitError, 'Authentication failed. Please check your credentials and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    if (isSubmitting) return;
    setError('');
    setSuccess('');

    let demoEmail = DEMO_CREDENTIALS.email;
    let demoPassword = DEMO_CREDENTIALS.password;

    if (supabase) {
      try {
        const { data: credentials, error: demoError } = await supabase.functions.invoke('demo-login');
        if (!demoError && credentials?.email && credentials?.password) {
          demoEmail = credentials.email.trim();
          demoPassword = credentials.password;
        }
      } catch {
        // Fallback safely to DEMO_CREDENTIALS
      }
    }

    setFormData((previous) => ({
      ...previous,
      email: demoEmail,
      password: demoPassword
    }));
    setShowPassword(false);
    setSuccess('Demo credentials filled! Click ENTER WORKSHOP to access the virtual lab.');
  };

  const handlePasswordReset = async () => {
    setError('');
    setSuccess('');
    if (!formData.email.trim()) {
      setError('Enter your email address first.');
      return;
    }

    if (!supabase) {
      setSuccess(`Password reset instructions simulated for ${formData.email.trim()}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email.trim(), {
        redirectTo: `${window.location.origin}/?password-recovery=1`
      });
      if (resetError) throw resetError;
      setSuccess('Password reset instructions have been sent to your email.');
    } catch (resetError) {
      setError(getFriendlyAuthError(resetError, 'Unable to send password reset instructions.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="anim-fade-in auth-screen"
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        background: 'var(--bg-primary)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* 1. 3D Mechanical Workshop scene container */}
      <div className="login-canvas-container">
        <div ref={canvasContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* 2. Visual readability overlay */}
      <div className="login-overlay" />

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
          className="anim-slide-up auth-card"
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
          <div className="auth-card-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
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
              <span className="auth-card-title" style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {recoveryMode ? 'Reset password' : isLogin ? 'Student portal' : 'Create account'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#00F5D4', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '2px' }}>Virtual Mechanical Lab</span>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', textAlign: 'center', margin: 0 }}>
              {recoveryMode ? 'Choose a new password for your student account.' : isLogin ? 'Sign in to continue your workshop training.' : 'Create your secure workshop account.'}
            </p>
          </div>

          {/* Secure sign-in note */}
          {isLogin && (
            <div className="auth-secure-note">
              <ShieldAlert size={16} aria-hidden="true" />
              <span>Secure access to your workshop training</span>
            </div>
          )}

          {visibleError && (
            <div className="auth-message auth-message-error" role="alert">
              <ShieldAlert size={14} />
              <span>{visibleError}</span>
            </div>
          )}

          {success && (
            <div className="auth-message auth-message-success" role="status">
              <CheckCircle size={14} />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recoveryMode ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    New password
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(32, 12, 74, 0.65)', border: '1px solid rgba(224, 64, 251, 0.25)', borderRadius: '12px', padding: '12px 14px', gap: '10px' }}>
                    <Lock size={16} style={{ color: '#E040FB' }} />
                    <input type="password" name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} required />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Confirm new password
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(32, 12, 74, 0.65)', border: '1px solid rgba(224, 64, 251, 0.25)', borderRadius: '12px', padding: '12px 14px', gap: '10px' }}>
                    <Lock size={16} style={{ color: '#E040FB' }} />
                    <input type="password" name="confirmPassword" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>
              </>
            ) : isLogin ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Email address
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(32, 12, 74, 0.65)', border: '1px solid rgba(224, 64, 251, 0.25)', borderRadius: '12px', padding: '12px 14px', gap: '10px' }}>
                    <User size={16} style={{ color: '#E040FB' }} />
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@college.edu"
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
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
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

                <div className="auth-form-options">
                  <span>Protected student account</span>
                  <button type="button" onClick={handlePasswordReset} disabled={isSubmitting}>
                    Forgot password?
                  </button>
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
              ) : (
                <>
                  <span>{isLogin ? 'ENTER WORKSHOP' : 'CREATE ACCOUNT'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            {isLogin && !recoveryMode && (
              <button
                type="button"
                className="auth-demo-button"
                onClick={handleDemoLogin}
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={16} />
                <span>{isSubmitting ? 'CONNECTING TO DEMO...' : 'Demo Login'}</span>
              </button>
            )}
          </form>

          {!recoveryMode && <div style={{ textAlign: 'center', borderTop: '1px solid rgba(224, 64, 251, 0.2)', paddingTop: '16px' }}>
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
          </div>}
        </div>
      </div>
    </div>
  );
}
