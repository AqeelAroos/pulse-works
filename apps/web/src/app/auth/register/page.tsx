'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ENGINEER' as 'PM' | 'ENGINEER' });
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const blobs = [
      { x: 0.15, y: 0.25, vx: 0.0003, vy: 0.00025, r: 0.36, color: [20, 184, 166] as [number,number,number] },
      { x: 0.85, y: 0.75, vx: -0.00025, vy: 0.0003, r: 0.4, color: [99, 102, 241] as [number,number,number] },
      { x: 0.55, y: 0.08, vx: 0.00015, vy: 0.00035, r: 0.3, color: [16, 185, 129] as [number,number,number] },
      { x: 0.08, y: 0.9, vx: 0.00035, vy: -0.0003, r: 0.26, color: [139, 92, 246] as [number,number,number] },
      { x: 0.92, y: 0.15, vx: -0.0003, vy: 0.00025, r: 0.31, color: [6, 182, 212] as [number,number,number] },
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
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await register(form.email, form.password, form.name, form.role);
      toast({ title: 'Account created!', variant: 'success' });
      router.push('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error || 'Registration failed');
    }
  }

  const fields: { label: string; key: 'name' | 'email' | 'password'; type: string; placeholder: string }[] = [
    { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
    { label: 'Email', key: 'email', type: 'email', placeholder: 'you@agiledesk.io' },
    { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 6 characters' },
  ];

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', fontFamily: 'var(--font-sans)' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .reg-input { width:100%; height:46px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:0 16px; color:white; font-size:14px; outline:none; transition:all 0.25s; box-sizing:border-box; }
        .reg-input::placeholder { color:rgba(255,255,255,0.2); }
        .reg-input:focus { border-color:rgba(20,184,166,0.5); background:rgba(255,255,255,0.09); box-shadow:0 0 0 3px rgba(20,184,166,0.08); }
      `}</style>

      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{
          width: '100%', maxWidth: '400px',
          background: 'rgba(8,12,24,0.6)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '40px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          animation: 'fadeUp 0.7s ease both',
        }}>

          {/* Logo */}
          <div style={{ marginBottom: '28px', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '18px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>AGILE</span>
              <span style={{ color: '#14b8a6', fontWeight: 800, fontSize: '18px', letterSpacing: '0.12em', textTransform: 'uppercase', marginLeft: '6px' }}>DESK</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>Project Management</p>
          </div>

          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>Create account</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: '0 0 24px' }}>Join your team workspace</p>

          <form onSubmit={handleSubmit}>
            {fields.map(f => (
              <div key={f.key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '7px' }}>
                  {f.label}
                </label>
                <input
                  className="reg-input"
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  required
                  minLength={f.key === 'password' ? 6 : undefined}
                />
              </div>
            ))}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Role
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {(['PM', 'ENGINEER'] as const).map(role => (
                  <button key={role} type="button" onClick={() => setForm(p => ({ ...p, role }))}
                    style={{
                      padding: '11px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                      border: `1px solid ${form.role === role ? 'rgba(20,184,166,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      background: form.role === role ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.03)',
                      color: form.role === role ? '#14b8a6' : 'rgba(255,255,255,0.35)',
                      fontSize: '12px', fontWeight: 600,
                    }}>
                    {role === 'PM' ? '📋 Project Manager' : '⚙️ Engineer'}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', color: '#ff7070', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} style={{
              width: '100%', height: '48px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
              color: 'white', fontSize: '14px', fontWeight: 800, letterSpacing: '0.08em',
              border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase', transition: 'all 0.2s',
              opacity: isLoading ? 0.6 : 1,
            }}>
              {isLoading ? 'Creating...' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '13px', marginTop: '20px', marginBottom: 0 }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#14b8a6', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '24px', textAlign: 'center' }}>
          Plan. Execute. Deliver.
        </p>
      </div>
    </div>
  );
}
