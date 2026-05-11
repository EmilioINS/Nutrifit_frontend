/**
 * useDietPlan — Custom Hook
 * Responsabilidad: gestionar la generación y carga de planes de dieta.
 * Sigue SRP: solo maneja estado y comunicación con la API de dietas.
 */
import { useState, useCallback } from 'react';
import api from '../services/api';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Meal {
  meal_type: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DayPlan {
  day: string;
  meals: Meal[];
  daily_totals: { calories: number; protein: number; carbs: number; fat: number };
}

export interface WeeklyPlan {
  plan_name: string;
  description: string;
  days: DayPlan[];
}

export interface DietPlanResult {
  plans: WeeklyPlan[];
  macros: { kcal: number; protein: number; carbs: number; fat: number };
  error?: string;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useDietPlan() {
  const [dietData, setDietData] = useState<DietPlanResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  const generatePlans = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await api.post('/diet/generate');
      setDietData(res.data);
    } catch (err) {
      console.error('[useDietPlan] generate error', err);
    } finally {
      setGenerating(false);
    }
  }, []);

  const loadSavedPlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/diet/');
      if (res.data?.plans?.length > 0) {
        setDietData(res.data);
      }
    } catch (err) {
      console.error('[useDietPlan] load error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { dietData, generating, loading, generatePlans, loadSavedPlan };
}
