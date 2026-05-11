import { create } from 'zustand';

interface SurveyState {
  goal: string;
  modality: string;
  gender: string;
  age: string;
  height: string;
  weight: string;
  targetWeight: string;
  trainsStrength: boolean | null;
  trainingDays: string;
  dietType: string;
  mealsPerDay: string;
  favoriteFoods: string[];
  planFormat: string;
  setField: (field: keyof Omit<SurveyState, 'setField' | 'toggleFood'>, value: string | boolean) => void;
  toggleFood: (food: string) => void;
  reset: () => void;
}

export const useSurveyStore = create<SurveyState>((set) => ({
  goal: '',
  modality: '',
  gender: '',
  age: '',
  height: '',
  weight: '',
  targetWeight: '',
  trainsStrength: null,
  trainingDays: '',
  dietType: '',
  mealsPerDay: '',
  favoriteFoods: [],
  planFormat: '',
  setField: (field, value) => set({ [field]: value }),
  toggleFood: (food) => set((state) => ({
    favoriteFoods: state.favoriteFoods.includes(food)
      ? state.favoriteFoods.filter((f) => f !== food)
      : [...state.favoriteFoods, food]
  })),
  reset: () => set({
    goal: '', modality: '', gender: '', age: '', height: '', weight: '', targetWeight: '',
    trainsStrength: null, trainingDays: '', dietType: '', mealsPerDay: '', favoriteFoods: [], planFormat: ''
  })
}));
