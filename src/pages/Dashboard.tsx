/**
 * Dashboard — Page Component (Template layer)
 * Responsabilidad: orquestar las tabs y pasar estado/callbacks a las vistas.
 * Sigue Container/Presentational Pattern:
 *   - Dashboard maneja el estado y la lógica
 *   - HomeTab, HistoryTab, ProfileTab son presentacionales
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraScanner from '../components/CameraScanner';
import MacroCard from '../components/MacroCard';
import ScanResultCard from '../components/ScanResultCard';
import DietPlanCard from '../components/DietPlanCard';
import { useAuth } from '../hooks/useAuth';
import { useScanHistory } from '../hooks/useScanHistory';
import { useDietPlan } from '../hooks/useDietPlan';
import type { ScanResult } from '../hooks/useScanHistory';
import api from '../services/api';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Profile {
  goal?: string; gender?: string; age?: number;
  height?: number; weight?: number; target_weight?: number;
  trains_strength?: boolean; training_days?: string;
  diet_type?: string; meals_per_day?: number; favorite_foods?: string[];
}

interface MacroTargets { kcal: number; protein: number; carbs: number; fat: number }

type Tab = 'home' | 'history' | 'diet' | 'profile';

// ── Harris-Benedict calculation ─────────────────────────────────────────────────

const calcMacros = (p: Profile): MacroTargets => {
  const age = p.age ?? 25; const height = p.height ?? 170;
  const weight = p.weight ?? 70; const goal = p.goal ?? 'maintain';

  const bmr = p.gender === 'female'
    ? 447.6 + 9.2 * weight + 3.1 * height - 4.3 * age
    : 88.36 + 13.4 * weight + 4.8 * height - 5.7 * age;

  const af: Record<string, number> = { '1-2': 1.375, '3-4': 1.55, '5-6': 1.725 };
  let tdee = bmr * (p.trains_strength ? (af[p.training_days ?? ''] ?? 1.375) : 1.2);

  if (goal === 'lose') tdee -= 400;
  else if (goal === 'gain') tdee += 300;

  const kcal = Math.round(tdee);
  const protein = Math.round(weight * 2);
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.round((kcal - protein * 4 - fat * 9) / 4);
  return { kcal, protein, carbs, fat };
};

// ── Label maps ─────────────────────────────────────────────────────────────────

const GOAL_MAP: Record<string, string> = { lose: 'Perder grasa 🔥', gain: 'Ganar músculo 💪', maintain: 'Mantener peso ⚖️' };
const DIET_MAP: Record<string, string> = { recommended: 'Balanceada ✨', 'high-protein': 'Alta proteína 🥩', keto: 'Keto 🧀', vegetarian: 'Vegetariana 🌱' };

// ══════════════════════════════════════════════════════════════════════════════

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { history, loading: histLoading, fetchHistory } = useScanHistory();
  const { dietData, generating, loading: dietLoading, generatePlans, loadSavedPlan } = useDietPlan();

  const [tab, setTab] = useState<Tab>('home');
  const [showScanner, setShowScanner] = useState(false);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [profile, setProfile] = useState<Profile>({});
  const [macros, setMacros] = useState<MacroTargets>({ kcal: 2000, protein: 150, carbs: 200, fat: 70 });

  useEffect(() => {
    api.get('/survey/').then(res => {
      if (res.data && Object.keys(res.data).length > 0) {
        setProfile(res.data);
        setMacros(calcMacros(res.data));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => { if (tab === 'history') fetchHistory(); }, [tab, fetchHistory]);
  useEffect(() => { if (tab === 'diet') loadSavedPlan(); }, [tab, loadSavedPlan]);

  const handleScanResult = useCallback((res: ScanResult) => {
    setLastScan(res);
    setShowScanner(false);
  }, []);

  // ── TAB: Home ───────────────────────────────────────────────────────────────

  const HomeTab = () => (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(74,222,128,0.15) 0%, rgba(0,0,0,0) 70%)', padding: '28px 20px 16px' }}>
        <p style={{ color: '#6b7280', margin: '0 0 4px', fontSize: 13 }}>Tu Plan Personalizado</p>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Dashboard Nutricional</h1>
      </div>

      <div style={{ padding: '0 20px 100px' }}>
        {/* Calories hero */}
        <div style={{ textAlign: 'center', margin: '16px 0 20px', padding: '24px', background: 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(16,185,129,0.06))', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 20 }}>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Objetivo Calórico Diario</div>
          <div style={{ fontSize: 56, fontWeight: 900, color: '#4ade80', lineHeight: 1 }}>{macros.kcal}</div>
          <div style={{ color: '#9ca3af', fontSize: 16, marginTop: 4 }}>kcal / día</div>
        </div>

        {/* Macro grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          <MacroCard label="Proteína" value={`${macros.protein}g`} percentage={`${Math.round(macros.protein * 4 / macros.kcal * 100)}%`} color="#f97316" />
          <MacroCard label="Carbos" value={`${macros.carbs}g`} percentage={`${Math.round(macros.carbs * 4 / macros.kcal * 100)}%`} color="#3b82f6" />
          <MacroCard label="Grasas" value={`${macros.fat}g`} percentage={`${Math.round(macros.fat * 9 / macros.kcal * 100)}%`} color="#a855f7" />
        </div>

        {/* Scan CTA */}
        <button
          id="open-scanner-btn"
          className="btn"
          onClick={() => setShowScanner(true)}
          style={{ width: '100%', fontSize: 16, padding: '16px' }}
        >
          📸 Escanear Comida con IA
        </button>

        {/* Last scan result */}
        {lastScan && (
          <div style={{ marginTop: 20 }}>
            <p style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Último Escaneo</p>
            <ScanResultCard result={lastScan} />
          </div>
        )}
      </div>
    </div>
  );

  // ── TAB: History ────────────────────────────────────────────────────────────

  const HistoryTab = () => (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Historial</h2>
        <button
          onClick={fetchHistory}
          style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}
        >
          ↻ Actualizar
        </button>
      </div>

      {histLoading ? (
        <div style={{ textAlign: 'center', marginTop: 60, color: '#6b7280' }}>Cargando historial…</div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
          <p style={{ color: '#6b7280' }}>No hay escaneos todavía.</p>
          <button className="btn" style={{ marginTop: 16 }} onClick={() => { setTab('home'); setShowScanner(true); }}>
            Escanear mi primera comida
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map(record => (
            <div key={record.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
              {/* Date header */}
              <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{record.food_name}</span>
                <span style={{ fontSize: 11, color: '#6b7280' }}>
                  {new Date(record.scanned_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {/* Macro row */}
              <div style={{ padding: '10px 14px', display: 'flex', gap: 16, fontSize: 13, color: '#9ca3af' }}>
                <span style={{ color: '#f97316' }}>🔥 {record.calories} kcal</span>
                <span>P {record.protein}g</span>
                <span>C {record.carbs}g</span>
                <span>G {record.fat}g</span>
              </div>
              {/* Multi-food detail */}
              {record.items_json && record.items_json.length > 1 && (
                <div style={{ padding: '0 14px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {record.items_json.map((item, i) => (
                    <span key={i} style={{ fontSize: 11, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', borderRadius: 20, padding: '3px 8px' }}>
                      {item.food_name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── TAB: Diet Plans ────────────────────────────────────────────────────────

  const DietsTab = () => (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>Mis Planes de Dieta</h2>
        <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Generados con IA basándose en tu perfil</p>
      </div>

      {/* Generate button */}
      <button
        id="generate-diet-btn"
        className="btn"
        onClick={generatePlans}
        disabled={generating}
        style={{ width: '100%', marginBottom: 20, fontSize: 15, padding: '16px', position: 'relative', opacity: generating ? 0.8 : 1 }}
      >
        {generating ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Generando planes… puede tardar 15-30 seg
          </span>
        ) : dietData?.plans?.length ? '🔄 Regenerar planes de dieta' : '✨ Generar mis planes de dieta'}
      </button>

      {/* Macros summary bar (if available) */}
      {dietData?.macros && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'kcal/día', val: dietData.macros.kcal, color: '#f97316' },
            { label: 'Proteína', val: `${dietData.macros.protein}g`, color: '#4ade80' },
            { label: 'Carbos',   val: `${dietData.macros.carbs}g`,   color: '#3b82f6' },
            { label: 'Grasas',   val: `${dietData.macros.fat}g`,     color: '#a855f7' },
          ].map(m => (
            <div key={m.label} style={{ textAlign: 'center', padding: '10px 6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: m.color }}>{m.val}</div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Loading state */}
      {dietLoading && !dietData && (
        <div style={{ textAlign: 'center', color: '#6b7280', marginTop: 40 }}>Cargando plan guardado…</div>
      )}

      {/* Empty state */}
      {!generating && !dietLoading && !dietData?.plans?.length && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🥗</div>
          <p style={{ color: '#6b7280', lineHeight: 1.6 }}>Presiona el botón para que la IA genere<br />dos planes de dieta personalizados para ti.</p>
        </div>
      )}

      {/* Diet plan cards */}
      {dietData?.plans?.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {dietData.plans.map((plan, idx) => (
            <DietPlanCard key={idx} plan={plan} planIndex={idx} />
          ))}
        </div>
      ) : null}
    </div>
  );

  // ── TAB: Profile ────────────────────────────────────────────────────────────

  const ProfileTab = () => {
    const rows = [
      ['Objetivo', GOAL_MAP[profile.goal ?? ''] ?? '—'],
      ['Tipo de dieta', DIET_MAP[profile.diet_type ?? ''] ?? '—'],
      ['Género', profile.gender === 'male' ? 'Hombre' : profile.gender === 'female' ? 'Mujer' : '—'],
      ['Edad', profile.age ? `${profile.age} años` : '—'],
      ['Altura', profile.height ? `${profile.height} cm` : '—'],
      ['Peso actual', profile.weight ? `${profile.weight} kg` : '—'],
      ['Peso objetivo', profile.target_weight ? `${profile.target_weight} kg` : '—'],
      ['Entrena fuerza', profile.trains_strength === true ? 'Sí ✅' : profile.trains_strength === false ? 'No ❌' : '—'],
      ['Días de entreno', profile.training_days ?? '—'],
      ['Comidas al día', profile.meals_per_day ? `${profile.meals_per_day}` : '—'],
      ['Alimentos favoritos', profile.favorite_foods?.join(', ') ?? '—'],
    ] as [string, string][];

    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 60, marginBottom: 8 }}>👤</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Mi Perfil</h2>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Datos de tu encuesta inicial</p>
        </div>

        {/* Profile card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, overflow: 'hidden', marginBottom: 16 }}>
          {rows.map(([label, value], i) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <span style={{ color: '#9ca3af', fontSize: 14 }}>{label}</span>
              <span style={{ color: 'white', fontSize: 14, fontWeight: 500, textAlign: 'right', maxWidth: '58%' }}>{value}</span>
            </div>
          ))}
        </div>

        <button id="edit-profile-btn" className="btn" style={{ width: '100%', marginBottom: 12 }} onClick={() => navigate('/edit-profile')}>
          ✏️ Actualizar perfil
        </button>

        <button
          id="logout-btn"
          onClick={logout}
          style={{ width: '100%', padding: '14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, color: '#f87171', cursor: 'pointer', fontSize: 15, fontWeight: 600 }}
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    );
  };

  // ── Navigation ──────────────────────────────────────────────────────────────

  const NAV: { id: Tab; icon: string; label: string }[] = [
    { id: 'home',    icon: '🏠', label: 'Inicio' },
    { id: 'history', icon: '📋', label: 'Historial' },
    { id: 'diet',    icon: '🥗', label: 'Dietas' },
    { id: 'profile', icon: '👤', label: 'Perfil' },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {showScanner && (
        <CameraScanner onClose={() => setShowScanner(false)} onResult={handleScanResult} />
      )}

      <div className="screen active" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {tab === 'home'    && <HomeTab />}
          {tab === 'history' && <HistoryTab />}
          {tab === 'diet'    && <DietsTab />}
          {tab === 'profile' && <ProfileTab />}
        </div>

        {/* Bottom Navigation */}
        <nav
          role="navigation"
          aria-label="Navegación principal"
          style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(5,5,5,0.97)', backdropFilter: 'blur(12px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {NAV.map(item => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              aria-label={item.label}
              aria-current={tab === item.id ? 'page' : undefined}
              onClick={() => setTab(item.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 3, padding: '10px 0 8px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: tab === item.id ? '#4ade80' : '#6b7280',
                fontSize: 11, fontWeight: tab === item.id ? 600 : 400,
                transition: 'color 0.2s',
                borderTop: tab === item.id ? '2px solid #4ade80' : '2px solid transparent',
              }}
            >
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Dashboard;
