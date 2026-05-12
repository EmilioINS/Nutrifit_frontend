/**
 * DietPlanCard — Organism Component (Atomic Design)
 * Responsabilidad: renderizar un plan de dieta semanal completo.
 * Presentational — no contiene lógica de negocio ni llamadas API.
 */
import React, { useState } from 'react';
import type { WeeklyPlan, DayPlan, Meal } from '../hooks/useDietPlan';

// ── Atoms ──────────────────────────────────────────────────────────────────────

const MacroBadge: React.FC<{ label: string; value: number; unit: string; color: string }> = ({ label, value, unit, color }) => (
  <div style={{ textAlign: 'center', flex: 1 }}>
    <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}<span style={{ fontSize: 11, color }}>{unit}</span></div>
    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 1 }}>{label}</div>
  </div>
);

// ── Molecules ──────────────────────────────────────────────────────────────────

const MealCard: React.FC<{ meal: Meal; planFormat: string; totalMeals: number; onScanMeal?: (meal: Meal, totalMeals: number) => void }> = ({ meal, totalMeals, onScanMeal }) => {
  const [open, setOpen] = useState(false);
  const mealTypeColors: Record<string, string> = {
    'Desayuno': '#f97316', 'Comida': '#3b82f6', 'Cena': '#8b5cf6',
    'Snack': '#10b981', 'Snack 1': '#10b981', 'Snack 2': '#14b8a6',
  };
  const color = mealTypeColors[meal.meal_type] ?? '#9ca3af';

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}20`, padding: '3px 8px', borderRadius: 20, flexShrink: 0 }}>
          {meal.meal_type}
        </span>
        <span style={{ flex: 1, fontWeight: 600, color: 'white', fontSize: 14 }}>{meal.name}</span>
        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#6b7280', flexShrink: 0 }}>
          <span>🔥{meal.calories}</span>
          <span>P{meal.protein}g</span>
        </div>
        <span style={{ color: '#4ade80', fontSize: 14 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Action Row */}
          {onScanMeal && (
            <div style={{ padding: '8px 0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 12 }}>
                <button 
                  onClick={() => onScanMeal(meal, totalMeals)}
                  style={{ background: 'linear-gradient(135deg, #4ade80, #10b981)', color: '#064e3b', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  📸 Registrar esta comida
                </button>
            </div>
          )}

          {/* Full macros */}
          <div style={{ display: 'flex', gap: 0, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 12 }}>
            <MacroBadge label="kcal"  value={meal.calories} unit=""  color="#f97316" />
            <MacroBadge label="Prot"  value={meal.protein}  unit="g" color="#4ade80" />
            <MacroBadge label="Carbs" value={meal.carbs}    unit="g" color="#3b82f6" />
            <MacroBadge label="Grasas"value={meal.fat}      unit="g" color="#a855f7" />
          </div>

          {/* Ingredients */}
          <p style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Ingredientes</p>
          <ul style={{ margin: '0 0 12px', paddingLeft: 16 }}>
            {(meal.ingredients || []).map((ing, i) => (
              <li key={i} style={{ color: '#d1d5db', fontSize: 13, marginBottom: 3 }}>{ing}</li>
            ))}
          </ul>

          {/* Instructions */}
          {meal.instructions && meal.instructions.length > 0 && (
            <>
              <p style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>Preparación</p>
              <ol style={{ margin: 0, paddingLeft: 16 }}>
                {meal.instructions.map((step, i) => (
                  <li key={i} style={{ color: '#d1d5db', fontSize: 13, marginBottom: 4 }}>{step}</li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const DayCard: React.FC<{ dayPlan: DayPlan; planFormat: string; onScanMeal?: (meal: Meal, totalMeals: number) => void }> = ({ dayPlan, planFormat, onScanMeal }) => {
  const [open, setOpen] = useState(false);
  const t = dayPlan.daily_totals;
  const totalMeals = dayPlan.meals?.length || 0;

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '12px 16px', background: open ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.2s' }}
      >
        <span style={{ fontWeight: 700, color: open ? '#4ade80' : 'white', fontSize: 15, width: 80, flexShrink: 0 }}>{dayPlan.day}</span>
        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#9ca3af', flex: 1 }}>
          <span>🔥 {t?.calories ?? '—'} kcal</span>
          <span>P {t?.protein ?? '—'}g</span>
          <span>C {t?.carbs ?? '—'}g</span>
          <span>G {t?.fat ?? '—'}g</span>
        </div>
        <span style={{ color: '#4ade80', fontSize: 16 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ padding: '8px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {(dayPlan.meals || []).map((meal, i) => (
            <MealCard key={i} meal={meal} planFormat={planFormat} totalMeals={totalMeals} onScanMeal={onScanMeal} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Organism ───────────────────────────────────────────────────────────────────

interface Props {
  plan: WeeklyPlan;
  planIndex: number;
  planFormat?: string;
  onScanMeal?: (meal: Meal, totalMeals: number) => void;
}

const DietPlanCard: React.FC<Props> = ({ plan, planIndex, planFormat = 'step-by-step', onScanMeal }) => {
  const [expanded, setExpanded] = useState(planIndex === 0); // First plan open by default
  const colors = ['#4ade80', '#3b82f6'];
  const color = colors[planIndex] ?? '#9ca3af';

  return (
    <div style={{ border: `1px solid ${color}30`, borderRadius: 18, overflow: 'hidden', background: `${color}06` }}>
      {/* Plan header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ width: '100%', padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Plan {planIndex + 1}</div>
            <div style={{ fontWeight: 800, color: 'white', fontSize: 17 }}>{plan.plan_name}</div>
            {plan.description && (
              <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>{plan.description}</div>
            )}
          </div>
          <span style={{ color, fontSize: 20, flexShrink: 0, marginLeft: 12 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Days */}
      {expanded && (
        <div style={{ padding: '0 14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(plan.days || []).map((day, i) => (
            <DayCard key={i} dayPlan={day} planFormat={planFormat} onScanMeal={onScanMeal} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DietPlanCard;
