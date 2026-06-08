'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const blobs = [
      { x: 0.2, y: 0.3, vx: 0.0003, vy: 0.0002, r: 0.38, color: [20, 184, 166] as [number,number,number] },
      { x: 0.8, y: 0.7, vx: -0.0002, vy: 0.0003, r: 0.42, color: [99, 102, 241] as [number,number,number] },
      { x: 0.5, y: 0.1, vx: 0.0001, vy: 0.0004, r: 0.32, color: [16, 185, 129] as [number,number,number] },
      { x: 0.1, y: 0.85, vx: 0.0004, vy: -0.0003, r: 0.28, color: [139, 92, 246] as [number,number,number] },
      { x: 0.9, y: 0.2, vx: -0.0003, vy: 0.0002, r: 0.33, color: [6, 182, 212] as [number,number,number] },
    ];

    let raf: number;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#080c18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
      ctx.lineWidth = 1;
      const g = 64;
      for (let x = 0; x < canvas.width; x += g) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += g) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      blobs.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < 0 || b.x > 1) b.vx *= -1;
        if (b.y < 0 || b.y > 1) b.vy *= -1;

        const cx = b.x * canvas.width;
        const cy = b.y * canvas.height;
        const radius = b.r * Math.min(canvas.width, canvas.height);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${b.color[0]},${b.color[1]},${b.color[2]},0.18)`);
        grad.addColorStop(0.5, `rgba(${b.color[0]},${b.color[1]},${b.color[2]},0.07)`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      toast({ title: 'Welcome back!', variant: 'success' });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid email or password');
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', fontFamily: 'var(--font-sans)' }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-input {
          width: 100%;
          height: 48px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 0 16px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: all 0.25s;
          box-sizing: border-box;
          backdrop-filter: blur(4px);
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }
        .auth-input:focus {
          border-color: rgba(20,184,166,0.5);
          background: rgba(255,255,255,0.09);
          box-shadow: 0 0 0 3px rgba(20,184,166,0.08);
        }
        .auth-submit {
          width: 100%;
          height: 50px;
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          color: white;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.08em;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .auth-submit:hover {
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(20,184,166,0.35);
        }
        .auth-submit:active { transform: translateY(0); }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
      `}</style>

      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>

        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: 'rgba(8,12,24,0.6)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '44px 40px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          animation: 'fadeUp 0.7s ease both',
        }}>

          {/* Logo */}
          <div style={{ marginBottom: '36px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
              <span style={{
                color: 'white',
                fontWeight: 800,
                fontSize: '20px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}>AGILE</span>
              <span style={{
                color: '#14b8a6',
                fontWeight: 800,
                fontSize: '20px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginLeft: '6px',
              }}>DESK</span>
            </div>
            <p style={{
              color: 'rgba(255,255,255,0.25)',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              margin: 0,
            }}>Project Management</p>
          </div>

          <h1 style={{
            color: 'white',
            fontSize: '24px',
            fontWeight: 700,
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}>Sign in</h1>
          <p style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '13px',
            margin: '0 0 28px',
          }}>Welcome back to your workspace</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}>Email</label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@agiledesk.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}>Password</label>
              <input
                className="auth-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(220,50,50,0.1)',
                border: '1px solid rgba(220,50,50,0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                color: '#ff7070',
                fontSize: '13px',
              }}>{error}</div>
            )}

            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.25)',
            fontSize: '13px',
            marginTop: '24px',
            marginBottom: 0,
          }}>
            No account?{' '}
            <Link href="/auth/register" style={{ color: '#14b8a6', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>

        <p style={{
          color: 'rgba(255,255,255,0.15)',
          fontSize: '11px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginTop: '28px',
          textAlign: 'center',
        }}>
          Plan. Execute. Deliver.
        </p>
      </div>
    </div>
  );
}
