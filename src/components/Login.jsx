import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import logo from '../assets/logo.jpg';

const Login = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const canvasRef = React.useRef(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                this.color = `rgba(59, 130, 246, ${Math.random() * 0.5})`;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < 100; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections
            particles.forEach((p1, i) => {
                particles.slice(i + 1).forEach(p2 => {
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 - distance / 1000})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                });
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        initParticles();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
    // Credential Mapping for Localhost
    const CREDENTIALS = {
        'stgnxasp115tw01': { role: 'admin', name: 'Admin', allowedLocations: [] },
        'view63lavanti': { role: 'client', name: 'View 63', allowedLocations: ['loc_699097'] },
        '127living': { role: 'client', name: '127 Living', allowedLocations: ['loc_c756f5'] },
        'academia59': { role: 'client', name: 'Academia 59', allowedLocations: ['loc_a915ab'] },
        'urban': { role: 'client', name: 'Urban', allowedLocations: ['loc_ed692c'] },
        'frontera': { role: 'client', name: 'Frontera', allowedLocations: ['loc_eb8d83'] },
        'eka': { role: 'client', name: 'EKA', allowedLocations: ['loc_d42750'] }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = CREDENTIALS[password];

        if (user) {
            onLogin(user);
        } else {
            setError('Contraseña incorrecta');
            setPassword('');
        }
    };

    return (
        <div className="login-container">
            <canvas ref={canvasRef} className="particles-canvas" />
            <div className="login-card">
                <div className="login-header">
                    <div className="icon-bg" style={{ padding: 0, overflow: 'hidden', background: 'transparent', boxShadow: 'none' }}>
                        <img src={logo} alt="Speed Queen Logo" style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <h1>360</h1>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            autoFocus
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" className="login-btn">
                        Entrar
                    </button>
                </form>
            </div>
            <div style={{ position: 'absolute', bottom: '1rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', zIndex: 10 }}>
                v1.0.5
            </div>
        </div>
    );
};

export default Login;
