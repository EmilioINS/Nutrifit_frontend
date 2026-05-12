import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface StreakData {
    current_streak: number;
    highest_streak: number;
    restore_chances: number;
}

interface StreakResponse {
    streak: StreakData;
    status: 'active' | 'at_risk' | 'lost_and_reset';
    today_log: any;
}

const StreakCard: React.FC = () => {
    const [data, setData] = useState<StreakResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStreak = async () => {
        try {
            const res = await api.get('/streaks/');
            setData(res.data);
        } catch (err) {
            console.error('Error fetching streak', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStreak();
        // Escuchar evento personalizado por si se registra una comida
        const handleStreakUpdate = () => fetchStreak();
        window.addEventListener('streak-updated', handleStreakUpdate);
        return () => window.removeEventListener('streak-updated', handleStreakUpdate);
    }, []);

    const handleRestore = async () => {
        try {
            await api.post('/streaks/restore');
            fetchStreak();
        } catch (err) {
            console.error('Error restoring streak', err);
            alert('No se pudo restaurar la racha.');
        }
    };

    if (loading) return null;
    if (!data) return null;

    const { streak, status } = data;

    return (
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: 16, padding: 20, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, border: '1px solid #4338ca' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 40 }}>🔥</div>
                <div>
                    <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: '#a5b4fc' }}>Racha Actual</div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{streak.current_streak} <span style={{ fontSize: 16, fontWeight: 400, color: '#c7d2fe' }}>días</span></div>
                    <div style={{ fontSize: 12, color: '#a5b4fc', marginTop: 4 }}>Mejor racha: {streak.highest_streak} días</div>
                </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
                {status === 'at_risk' ? (
                    <div>
                        <div style={{ fontSize: 13, color: '#fca5a5', marginBottom: 8 }}>¡Racha en riesgo!</div>
                        <button 
                            onClick={handleRestore}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                        >
                            Restaurar ({streak.restore_chances} restantes)
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: 4 }}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: i < streak.restore_chances ? '#4ade80' : 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.1)' }} title="Oportunidad de restauración" />
                        ))}
                        <div style={{ fontSize: 11, color: '#a5b4fc', marginLeft: 6 }}>Oportunidades</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StreakCard;
