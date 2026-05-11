/**
 * ScanResultCard — Molecule Component
 * Muestra el resultado de un escaneo IA con desglose por alimento y totales.
 * Soporta tanto el formato multi-alimento (items + total) como el legacy.
 */
import React, { useState } from 'react';
import type { ScanResult } from '../hooks/useScanHistory';

interface Props {
  result: ScanResult;
}

const MacroChip: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '8px 12px', background: `${color}18`,
    border: `1px solid ${color}40`, borderRadius: 10,
  }}>
    <span style={{ fontSize: 16, fontWeight: 700, color }}>{value}</span>
    <span style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{label}</span>
  </div>
);

const ScanResultCard: React.FC<Props> = ({ result }) => {
  const [expanded, setExpanded] = useState(false);
  const { items, total, confidence } = result;
  const isMulti = items.length > 1;

  return (
    <div style={{
      background: 'rgba(74,222,128,0.06)',
      border: '1px solid rgba(74,222,128,0.25)',
      borderRadius: 18,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 14 }}>
            {isMulti ? `🍽️ ${items.length} alimentos detectados` : `🍽️ ${items[0]?.food_name}`}
          </span>
          <span style={{ fontSize: 11, color: '#6b7280' }}>IA: {confidence}</span>
        </div>
        {isMulti && (
          <div style={{ marginTop: 4, fontSize: 12, color: '#9ca3af' }}>
            {items.map(i => i.food_name).join(' · ')}
          </div>
        )}
      </div>

      {/* Totals */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
          {isMulti ? 'TOTAL COMBINADO' : 'MACROS'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <MacroChip label="kcal" value={total.calories} color="#f97316" />
          <MacroChip label="Prot" value={total.protein} color="#4ade80" />
          <MacroChip label="Carbs" value={total.carbs} color="#3b82f6" />
          <MacroChip label="Grasas" value={total.fat} color="#a855f7" />
        </div>
      </div>

      {/* Per-item breakdown (multi only) */}
      {isMulti && (
        <div style={{ padding: '0 16px 14px' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
              color: '#9ca3af', cursor: 'pointer', fontSize: 12,
            }}
          >
            {expanded ? '▲ Ocultar desglose' : '▼ Ver desglose por alimento'}
          </button>

          {expanded && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10, padding: '10px 12px',
                }}>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                    {item.food_name}
                    <span style={{ color: '#6b7280', fontWeight: 400, fontSize: 11, marginLeft: 6 }}>
                      {item.portion_size}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#9ca3af' }}>
                    <span>🔥 {item.calories} kcal</span>
                    <span>P {item.protein}g</span>
                    <span>C {item.carbs}g</span>
                    <span>G {item.fat}g</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanResultCard;
