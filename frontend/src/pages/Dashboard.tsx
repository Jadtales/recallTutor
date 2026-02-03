import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, Clock, BarChart2, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
    const [uploading, setUploading] = useState(false);
    const [stats, setStats] = useState({
        conceptsMastered: 0,
        streak: '0 Days',
        timeSpent: '0h',
        retentionRate: '0%'
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:3000/student/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:3000/knowledge/ingest', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Upload failed');
            }

            const data = await response.json();
            alert(`Ingested ${data.conceptsCount} concepts!`);
            fetchStats(); // Refresh stats after upload
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <header style={{ marginBottom: '2rem' }}>
                <h1>Welcome back, Student</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Ready to boost your memory retention today?
                </p>
            </header>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '2rem' }}>
                <StatCard icon={CheckCircle} label="Concepts Mastered" value={stats.conceptsMastered.toString()} color="var(--success)" />
                <StatCard icon={Zap} label="Current Streak" value={stats.streak} color="#f59e0b" />
                <StatCard icon={Clock} label="Time Spent" value={stats.timeSpent} color="var(--accent-primary)" />
                <StatCard icon={BarChart2} label="Retention Rate" value={stats.retentionRate} color="var(--accent-secondary)" />
            </div>

            <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <section className="glass-panel" style={{ padding: '2rem' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                        <h2>Daily Revision</h2>
                        <span style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: 'var(--success)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.875rem',
                            fontWeight: 600
                        }}>
                            All caught up!
                        </span>
                    </div>

                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '1rem',
                        padding: '2rem',
                        textAlign: 'center',
                        border: '1px dashed var(--border-color)'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'var(--bg-secondary)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem auto'
                        }}>
                            <CheckCircle size={32} color="var(--text-secondary)" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No quizzes due right now</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Great job! Check back later for your scheduled reviews.
                        </p>
                    </div>
                </section>

                <section className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Quick Upload</h2>
                    <div style={{
                        border: '2px dashed var(--border-color)',
                        borderRadius: '1rem',
                        padding: '2rem',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        background: uploading ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                    }}>
                        <input
                            type="file"
                            id="file-upload"
                            style={{ display: 'none' }}
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                        <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <Upload size={40} color={uploading ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                                {uploading ? 'Processing...' : 'Drop PDF or Text'}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                {uploading ? 'Extracting concepts...' : 'Click to browse files'}
                            </p>
                        </label>
                    </div>
                </section>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: any, label: string, value: string, color: string }> = ({ icon: Icon, label, value, color }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Icon size={24} color={color} />
        </div>
        <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{label}</div>
        </div>
    </div>
);

export default Dashboard;
