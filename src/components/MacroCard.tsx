/**
 * MacroCard — Atom Component
 * Muestra un macronutriente individual con su valor, etiqueta y color.
 */
import React from 'react';

interface Props {
  label: string;
  value: string;
  percentage?: string;
  color: string;
}

const MacroCard: React.FC<Props> = ({ label, value, percentage, color }) => (
  <div style={{
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: '16px 10px',
    textAlign: 'center',
  }}>
    <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{label}</div>
    {percentage && <div style={{ fontSize: 12, color, marginTop: 4 }}>{percentage}</div>}
  </div>
);

export default MacroCard;
