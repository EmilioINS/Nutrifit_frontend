/**
 * useScanHistory — Custom Hook
 * Responsabilidad: gestionar el estado y fetching del historial de escaneos.
 */
import { useState, useCallback } from 'react';
import api from '../services/api';

export interface ScanRecord {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion_size: string;
  confidence: string;
  items_json?: FoodItem[];
  scanned_at: string;
}

export interface FoodItem {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion_size: string;
}

export interface ScanResult {
  items: FoodItem[];
  total: { calories: number; protein: number; carbs: number; fat: number };
  confidence: string;
}

export function useScanHistory() {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/scan-food/history');
      setHistory(res.data);
    } catch (e) {
      console.error('[useScanHistory] fetch error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    if (!window.confirm('¿Estás seguro de que deseas borrar todo el historial de escaneos? Esta acción no se puede deshacer.')) return;
    
    setLoading(true);
    try {
      await api.delete('/scan-food/history');
      setHistory([]);
    } catch (e) {
      console.error('[useScanHistory] clear error', e);
      alert('Hubo un problema al borrar el historial.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { history, loading, fetchHistory, clearHistory };
}
