import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit } from 'lucide-react';
import '../index.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: BrainCircuit, label: 'Practice', path: '/practice' },
    ];

    return (
        <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'sticky',
                top: '0',
                height: '100vh',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-color)',
            }}>
                <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'var(--accent-gradient)',
                        borderRadius: '8px'
                    }} />
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
                        RecallTutor
                    </span>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    textDecoration: 'none',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    background: isActive ? 'var(--accent-primary)' : 'transparent',
                                    transition: 'all 0.2s',
                                    fontWeight: 500
                                }}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto' }}>
                <div className="container animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
