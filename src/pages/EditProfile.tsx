/**
 * EditProfile — Page Component
 * Permite editar campos individuales del perfil sin repetir toda la encuesta.
 * Sigue principio DRY: reutiliza los mismos estilos y patrones del Survey.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ProfileField {
  key: string;
  label: string;
  icon: string;
  description: string;
}

const EDITABLE_FIELDS: ProfileField[] = [
  { key: 'goal',           label: 'Objetivo',             icon: '🎯', description: 'Perder grasa, ganar músculo o mantener peso' },
  { key: 'modality',       label: 'Modalidad',            icon: '🚀', description: 'Cómo quieres usar la app' },
  { key: 'gender',         label: 'Sexo',                 icon: '👤', description: 'Necesario para calcular tu metabolismo' },
  { key: 'physical_data',  label: 'Datos físicos',        icon: '📏', description: 'Edad, altura, peso actual y objetivo' },
  { key: 'training',       label: 'Entrenamiento',        icon: '🏋️', description: 'Si entrenas y con qué frecuencia' },
  { key: 'diet_type',      label: 'Tipo de dieta',        icon: '🥑', description: 'Balanceada, keto, vegetariana, etc.' },
  { key: 'meals_per_day',  label: 'Comidas al día',       icon: '🍽️', description: 'Cuántas comidas quieres hacer' },
  { key: 'favorite_foods', label: 'Alimentos favoritos',  icon: '🛒', description: 'Los alimentos que te gustaría incluir' },
  { key: 'plan_format',    label: 'Formato del plan',     icon: '📖', description: 'Receta paso a paso o solo ingredientes' },
];

// ── Editors por campo ──────────────────────────────────────────────────────────

interface EditorProps {
  value: any;
  onChange: (val: any) => void;
}

const OptionCard: React.FC<{ icon: string; title: string; subtitle?: string; selected: boolean; onClick: () => void }> =
  ({ icon, title, subtitle, selected, onClick }) => (
    <div
      onClick={onClick}
      style={{
        padding: '16px', borderRadius: 14, cursor: 'pointer',
        border: `1px solid ${selected ? 'rgba(74,222,128,0.6)' : 'rgba(255,255,255,0.1)'}`,
        background: selected ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>{title}</div>
      {subtitle && <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 3 }}>{subtitle}</div>}
    </div>
  );

const GoalEditor: React.FC<EditorProps> = ({ value, onChange }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
    <OptionCard icon="🔥" title="Perder grasa" subtitle="Déficit" selected={value === 'lose'} onClick={() => onChange('lose')} />
    <OptionCard icon="💪" title="Ganar músculo" subtitle="Superávit" selected={value === 'gain'} onClick={() => onChange('gain')} />
    <OptionCard icon="⚖️" title="Mantener" subtitle="Equilibrio" selected={value === 'maintain'} onClick={() => onChange('maintain')} />
  </div>
);

const ModalityEditor: React.FC<EditorProps> = ({ value, onChange }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
    <OptionCard icon="📋" title="Plan nutricional" subtitle="Comidas estructuradas" selected={value === 'plan'} onClick={() => onChange('plan')} />
    <OptionCard icon="📸" title="Contar calorías" subtitle="Escáner IA" selected={value === 'count'} onClick={() => onChange('count')} />
  </div>
);

const GenderEditor: React.FC<EditorProps> = ({ value, onChange }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
    <OptionCard icon="👨🏻" title="Hombre" selected={value === 'male'} onClick={() => onChange('male')} />
    <OptionCard icon="👩🏻" title="Mujer" selected={value === 'female'} onClick={() => onChange('female')} />
  </div>
);

const PhysicalDataEditor: React.FC<EditorProps> = ({ value = {}, onChange }) => {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v });
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
    color: 'white', fontSize: 15, boxSizing: 'border-box',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[
        { key: 'age', label: 'Edad', placeholder: 'Ej. 25' },
        { key: 'height', label: 'Altura (cm)', placeholder: 'Ej. 175' },
        { key: 'weight', label: 'Peso actual (kg)', placeholder: 'Ej. 75' },
        { key: 'target_weight', label: 'Peso objetivo (kg)', placeholder: 'Ej. 70' },
      ].map(f => (
        <div key={f.key}>
          <label style={{ color: '#9ca3af', fontSize: 13, marginBottom: 6, display: 'block' }}>{f.label}</label>
          <input type="number" placeholder={f.placeholder} value={value[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} style={inputStyle} />
        </div>
      ))}
    </div>
  );
};

const TrainingEditor: React.FC<EditorProps> = ({ value = {}, onChange }) => {
  const set = (k: string, v: any) => onChange({ ...value, [k]: v });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 10 }}>¿Entrenas fuerza?</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <OptionCard icon="✅" title="Sí" selected={value.trains_strength === true} onClick={() => set('trains_strength', true)} />
          <OptionCard icon="❌" title="No" selected={value.trains_strength === false} onClick={() => set('trains_strength', false)} />
        </div>
      </div>
      <div>
        <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 10 }}>¿Cuántas veces por semana?</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <OptionCard icon="🚶" title="1-2 días" subtitle="Ligero" selected={value.training_days === '1-2'} onClick={() => set('training_days', '1-2')} />
          <OptionCard icon="🏃" title="3-4 días" subtitle="Moderado" selected={value.training_days === '3-4'} onClick={() => set('training_days', '3-4')} />
          <OptionCard icon="🏋️" title="5-6 días" subtitle="Intenso" selected={value.training_days === '5-6'} onClick={() => set('training_days', '5-6')} />
        </div>
      </div>
    </div>
  );
};

const DietTypeEditor: React.FC<EditorProps> = ({ value, onChange }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
    <OptionCard icon="✨" title="Recomendada" subtitle="Balanceada y variada" selected={value === 'recommended'} onClick={() => onChange('recommended')} />
    <OptionCard icon="🥩" title="Alta proteína" subtitle="Para músculo" selected={value === 'high-protein'} onClick={() => onChange('high-protein')} />
    <OptionCard icon="🧀" title="Keto" subtitle="Baja en carbos" selected={value === 'keto'} onClick={() => onChange('keto')} />
    <OptionCard icon="🌱" title="Vegetariana" subtitle="Basada en plantas" selected={value === 'vegetarian'} onClick={() => onChange('vegetarian')} />
  </div>
);

const MealsEditor: React.FC<EditorProps> = ({ value, onChange }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
    {['3', '4', '5'].map(n => (
      <OptionCard key={n} icon={n === '3' ? '🕒' : n === '4' ? '🕓' : '🕔'} title={`${n} comidas`} subtitle={n === '3' ? 'Clásico' : n === '4' ? '+1 snack' : '+2 snacks'} selected={String(value) === n} onClick={() => onChange(n)} />
    ))}
  </div>
);

const FoodsEditor: React.FC<EditorProps> = ({ value = [], onChange }) => {
  const toggle = (f: string) =>
    onChange(value.includes(f) ? value.filter((x: string) => x !== f) : [...value, f]);

  const groups = [
    { title: 'Proteínas', foods: ['Pollo', 'Huevo', 'Res', 'Pescado', 'Tofu'] },
    { title: 'Carbohidratos', foods: ['Arroz', 'Papa', 'Pasta', 'Avena', 'Pan'] },
    { title: 'Grasas & Lácteos', foods: ['Aguacate', 'Almendras', 'Leche', 'Queso', 'Yogur'] },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {groups.map(g => (
        <div key={g.title}>
          <p style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>{g.title}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {g.foods.map(food => (
              <button
                key={food}
                onClick={() => toggle(food)}
                style={{
                  padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13,
                  border: `1px solid ${value.includes(food) ? 'rgba(74,222,128,0.6)' : 'rgba(255,255,255,0.12)'}`,
                  background: value.includes(food) ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)',
                  color: value.includes(food) ? '#4ade80' : '#d1d5db',
                  transition: 'all 0.15s',
                }}
              >
                {food}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const PlanFormatEditor: React.FC<EditorProps> = ({ value, onChange }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
    <OptionCard icon="👨‍🍳" title="Paso a paso" subtitle="Instrucciones detalladas" selected={value === 'step-by-step'} onClick={() => onChange('step-by-step')} />
    <OptionCard icon="📝" title="Solo ingredientes" subtitle="Cantidades exactas" selected={value === 'ingredients-only'} onClick={() => onChange('ingredients-only')} />
  </div>
);

// ── Field → editor + current value extraction ──────────────────────────────────

function getEditorForField(
  fieldKey: string,
  localValue: any,
  setLocalValue: (v: any) => void
): React.ReactNode {
  const props = { value: localValue, onChange: setLocalValue };
  switch (fieldKey) {
    case 'goal':           return <GoalEditor {...props} />;
    case 'modality':       return <ModalityEditor {...props} />;
    case 'gender':         return <GenderEditor {...props} />;
    case 'physical_data':  return <PhysicalDataEditor {...props} />;
    case 'training':       return <TrainingEditor {...props} />;
    case 'diet_type':      return <DietTypeEditor {...props} />;
    case 'meals_per_day':  return <MealsEditor {...props} />;
    case 'favorite_foods': return <FoodsEditor {...props} />;
    case 'plan_format':    return <PlanFormatEditor {...props} />;
    default: return null;
  }
}

function getInitialValueForField(fieldKey: string, profile: Record<string, any>): any {
  if (fieldKey === 'physical_data') {
    return { age: profile.age, height: profile.height, weight: profile.weight, target_weight: profile.target_weight };
  }
  if (fieldKey === 'training') {
    return { trains_strength: profile.trains_strength, training_days: profile.training_days };
  }
  return profile[fieldKey];
}

function buildPayloadForField(fieldKey: string, value: any): Record<string, any> {
  if (fieldKey === 'physical_data') return { age: Number(value.age), height: Number(value.height), weight: Number(value.weight), target_weight: Number(value.target_weight) };
  if (fieldKey === 'training') return { trains_strength: value.trains_strength, training_days: value.training_days };
  if (fieldKey === 'meals_per_day') return { meals_per_day: Number(value) };
  return { [fieldKey]: value };
}

// ── Main component ─────────────────────────────────────────────────────────────

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Record<string, any>>({});
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/survey/').then(res => setProfile(res.data || {})).catch(() => {});
  }, []);

  const openEditor = (fieldKey: string) => {
    setLocalValue(getInitialValueForField(fieldKey, profile));
    setSelectedField(fieldKey);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!selectedField) return;
    setSaving(true);
    try {
      const payload = buildPayloadForField(selectedField, localValue);
      await api.post('/survey/', payload);
      setProfile(prev => ({ ...prev, ...payload }));
      setSaved(true);
      setTimeout(() => setSelectedField(null), 800);
    } catch (e) {
      alert('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const currentField = EDITABLE_FIELDS.find(f => f.key === selectedField);

  // ── Field editor view ──────────────────────────────────────────────────────

  if (selectedField && currentField) {
    return (
      <div className="screen active">
        <div className="content-wrapper" style={{ maxWidth: 480 }}>
          {/* Back bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <button onClick={() => setSelectedField(null)} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', fontSize: 22 }}>←</button>
            <div>
              <div style={{ color: '#6b7280', fontSize: 12 }}>Editando</div>
              <h2 style={{ margin: 0, fontSize: 20 }}>{currentField.icon} {currentField.label}</h2>
            </div>
          </div>

          {/* Editor */}
          <div style={{ marginBottom: 28 }}>
            {getEditorForField(selectedField, localValue, setLocalValue)}
          </div>

          {/* Save button */}
          <button
            className="btn"
            onClick={handleSave}
            disabled={saving}
            style={{ width: '100%', fontSize: 16, padding: '16px', position: 'relative' }}
          >
            {saving ? 'Guardando…' : saved ? '✅ ¡Guardado!' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    );
  }

  // ── Field selector view ────────────────────────────────────────────────────

  return (
    <div className="screen active">
      <div className="content-wrapper" style={{ maxWidth: 480 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', fontSize: 22 }}>←</button>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Editar Perfil</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Elige qué deseas actualizar</p>
          </div>
        </div>

        {/* Field list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          {EDITABLE_FIELDS.map(field => (
            <button
              key={field.key}
              onClick={() => openEditor(field.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,222,128,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            >
              <span style={{ fontSize: 28, flexShrink: 0 }}>{field.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'white', fontSize: 15 }}>{field.label}</div>
                <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{field.description}</div>
              </div>
              <span style={{ color: '#4ade80', fontSize: 18 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
