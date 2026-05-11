import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../store/surveyStore';
import api from '../services/api';

const Survey: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const store = useSurveyStore();
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (step < 9) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        await api.post('/survey/', {
          goal: store.goal,
          modality: store.modality,
          gender: store.gender,
          age: parseInt(store.age) || null,
          height: parseFloat(store.height) || null,
          weight: parseFloat(store.weight) || null,
          target_weight: parseFloat(store.targetWeight) || null,
          trains_strength: store.trainsStrength,
          training_days: store.trainingDays,
          diet_type: store.dietType,
          meals_per_day: parseInt(store.mealsPerDay) || null,
          favorite_foods: store.favoriteFoods,
          plan_format: store.planFormat
        });
        navigate('/dashboard');
      } catch (err) {
        console.error(err);
        alert("Error al guardar la encuesta");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigate('/login');
    }
  };

  const progress = ((step + 1) / 10) * 100;

  return (
    <div className="screen active">
      <div className="content-wrapper">
        <div className="top-bar">
          <div className="back" onClick={handleBack}>←</div>
          <div className="progress"><div className="progress-bar" style={{ width: `${progress}%` }}></div></div>
        </div>

        {step === 0 && (
          <>
            <div className="icon-title">🎯</div>
            <h1>¿Cuál es tu objetivo?</h1>
            <p className="subtitle">Ajustaremos tus macros según tu meta principal</p>
            <div className="cards-grid">
              <div className={`card ${store.goal === 'lose' ? 'active' : ''}`} onClick={() => store.setField('goal', 'lose')}>
                <div className="card-icon">🔥</div>
                <div className="card-content"><h3>Perder grasa</h3><p>Déficit calórico</p></div>
              </div>
              <div className={`card ${store.goal === 'gain' ? 'active' : ''}`} onClick={() => store.setField('goal', 'gain')}>
                <div className="card-icon">💪</div>
                <div className="card-content"><h3>Ganar músculo</h3><p>Superávit calórico</p></div>
              </div>
              <div className={`card ${store.goal === 'maintain' ? 'active' : ''}`} onClick={() => store.setField('goal', 'maintain')}>
                <div className="card-icon">⚖️</div>
                <div className="card-content"><h3>Mantener peso</h3><p>Equilibrio</p></div>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="icon-title">🚀</div>
            <h1>¿Cómo deseas conseguirlo?</h1>
            <p className="subtitle">Selecciona la modalidad de la app</p>
            <div className="cards-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className={`card ${store.modality === 'plan' ? 'active' : ''}`} onClick={() => store.setField('modality', 'plan')}>
                <div className="card-icon">📋</div>
                <div className="card-content"><h3>Necesito un plan nutricional</h3><p>Comidas estructuradas paso a paso</p></div>
              </div>
              <div className={`card ${store.modality === 'count' ? 'active' : ''}`} onClick={() => store.setField('modality', 'count')}>
                <div className="card-icon">📸</div>
                <div className="card-content"><h3>Necesito contar mis calorías</h3><p>Usaré la cámara de IA para mis alimentos</p></div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="icon-title">👤</div>
            <h1>¿Cuál es tu sexo?</h1>
            <p className="subtitle">Importante para calcular tu metabolismo basal</p>
            <div className="cards-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className={`card ${store.gender === 'male' ? 'active' : ''}`} onClick={() => store.setField('gender', 'male')}>
                <div className="card-icon">👨🏻</div>
                <div className="card-content"><h3>Hombre</h3></div>
              </div>
              <div className={`card ${store.gender === 'female' ? 'active' : ''}`} onClick={() => store.setField('gender', 'female')}>
                <div className="card-icon">👩🏻</div>
                <div className="card-content"><h3>Mujer</h3></div>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="icon-title">📏</div>
            <h1>Tus datos físicos</h1>
            <p className="subtitle">Completa tu perfil para mayor precisión</p>
            <div className="inputs-grid">
              <div className="input-group">
                <label>Edad</label>
                <input type="number" placeholder="Ej. 25" value={store.age} onChange={e => store.setField('age', e.target.value)} />
              </div>
              <div className="input-group">
                <label>Altura (cm)</label>
                <input type="number" placeholder="Ej. 175" value={store.height} onChange={e => store.setField('height', e.target.value)} />
              </div>
              <div className="input-group">
                <label>Peso actual (kg)</label>
                <input type="number" placeholder="Ej. 70" value={store.weight} onChange={e => store.setField('weight', e.target.value)} />
              </div>
              <div className="input-group">
                <label>Peso objetivo (kg)</label>
                <input type="number" placeholder="Ej. 65" value={store.targetWeight} onChange={e => store.setField('targetWeight', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="icon-title">🏋🏻‍♂️</div>
            <h1>¿Entrenas fuerza?</h1>
            <p className="subtitle">Con pesas, máquinas o tu propio peso corporal</p>
            <div className="cards-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className={`card ${store.trainsStrength === true ? 'active' : ''}`} onClick={() => store.setField('trainsStrength', true)}>
                <div className="card-icon">✅</div>
                <div className="card-content"><h3>Sí</h3></div>
              </div>
              <div className={`card ${store.trainsStrength === false ? 'active' : ''}`} onClick={() => store.setField('trainsStrength', false)}>
                <div className="card-icon">❌</div>
                <div className="card-content"><h3>No</h3></div>
              </div>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <div className="icon-title">📅</div>
            <h1>¿Cuántas veces a la semana?</h1>
            <p className="subtitle">Esto define tu gasto calórico por actividad</p>
            <div className="cards-grid">
              <div className={`card ${store.trainingDays === '1-2' ? 'active' : ''}`} onClick={() => store.setField('trainingDays', '1-2')}>
                <div className="card-icon">🚶🏻</div>
                <div className="card-content"><h3>1 a 2 días</h3><p>Ligero</p></div>
              </div>
              <div className={`card ${store.trainingDays === '3-4' ? 'active' : ''}`} onClick={() => store.setField('trainingDays', '3-4')}>
                <div className="card-icon">🏃🏻</div>
                <div className="card-content"><h3>3 a 4 días</h3><p>Moderado</p></div>
              </div>
              <div className={`card ${store.trainingDays === '5-6' ? 'active' : ''}`} onClick={() => store.setField('trainingDays', '5-6')}>
                <div className="card-icon">🏋🏻‍♂️</div>
                <div className="card-content"><h3>5 a 6 días</h3><p>Intenso</p></div>
              </div>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <div className="icon-title">🥑</div>
            <h1>Elige tu tipo de dieta</h1>
            <p className="subtitle">Personalizaremos tus recomendaciones</p>
            <div className="cards-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className={`card ${store.dietType === 'recommended' ? 'active' : ''}`} onClick={() => store.setField('dietType', 'recommended')}>
                <div className="card-icon">✨</div>
                <div className="card-content"><h3>Recomendada</h3><p>Balanceada y variada</p></div>
              </div>
              <div className={`card ${store.dietType === 'high-protein' ? 'active' : ''}`} onClick={() => store.setField('dietType', 'high-protein')}>
                <div className="card-icon">🥩</div>
                <div className="card-content"><h3>Alta en proteína</h3><p>Para músculo</p></div>
              </div>
              <div className={`card ${store.dietType === 'keto' ? 'active' : ''}`} onClick={() => store.setField('dietType', 'keto')}>
                <div className="card-icon">🧀</div>
                <div className="card-content"><h3>Keto</h3><p>Baja en carbohidratos</p></div>
              </div>
              <div className={`card ${store.dietType === 'vegetarian' ? 'active' : ''}`} onClick={() => store.setField('dietType', 'vegetarian')}>
                <div className="card-icon">🌱</div>
                <div className="card-content"><h3>Vegetariana</h3><p>Basada en plantas</p></div>
              </div>
            </div>
          </>
        )}

        {step === 7 && (
          <>
            <div className="icon-title">🍽️</div>
            <h1>¿Cuántas comidas al día?</h1>
            <p className="subtitle">Ajustaremos tus porciones diarias</p>
            <div className="cards-grid">
              <div className={`card ${store.mealsPerDay === '3' ? 'active' : ''}`} onClick={() => store.setField('mealsPerDay', '3')}>
                <div className="card-icon">🕒</div>
                <div className="card-content"><h3>3 Comidas</h3><p>Desayuno, Comida, Cena</p></div>
              </div>
              <div className={`card ${store.mealsPerDay === '4' ? 'active' : ''}`} onClick={() => store.setField('mealsPerDay', '4')}>
                <div className="card-icon">🕓</div>
                <div className="card-content"><h3>4 Comidas</h3><p>Incluye 1 snack</p></div>
              </div>
              <div className={`card ${store.mealsPerDay === '5' ? 'active' : ''}`} onClick={() => store.setField('mealsPerDay', '5')}>
                <div className="card-icon">🕔</div>
                <div className="card-content"><h3>5 Comidas</h3><p>Incluye 2 snacks</p></div>
              </div>
            </div>
          </>
        )}

        {step === 8 && (
          <>
            <div className="icon-title">🛒</div>
            <h1>Tus alimentos favoritos</h1>
            <p className="subtitle">Selecciona los que te gustaría incluir</p>
            
            <div className="category-title">Proteínas</div>
            <div className="food-grid">
              {['Pollo', 'Huevo', 'Res', 'Pescado', 'Tofu'].map(food => (
                <div key={food} className={`food-item ${store.favoriteFoods.includes(food) ? 'active' : ''}`} onClick={() => store.toggleFood(food)}>
                  <h4>{food}</h4>
                </div>
              ))}
            </div>
            
            <div className="category-title">Carbohidratos</div>
            <div className="food-grid">
              {['Arroz', 'Papa', 'Pasta', 'Avena', 'Pan'].map(food => (
                <div key={food} className={`food-item ${store.favoriteFoods.includes(food) ? 'active' : ''}`} onClick={() => store.toggleFood(food)}>
                  <h4>{food}</h4>
                </div>
              ))}
            </div>

            <div className="category-title">Grasas & Lácteos</div>
            <div className="food-grid">
              {['Aguacate', 'Almendras', 'Leche', 'Queso', 'Yogur'].map(food => (
                <div key={food} className={`food-item ${store.favoriteFoods.includes(food) ? 'active' : ''}`} onClick={() => store.toggleFood(food)}>
                  <h4>{food}</h4>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 9 && (
          <>
            <div className="icon-title">📖</div>
            <h1>¿Cómo prefieres ver tu plan?</h1>
            <p className="subtitle">Podemos darte el paso a paso o solo lo que necesitas</p>
            <div className="cards-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className={`card ${store.planFormat === 'step-by-step' ? 'active' : ''}`} onClick={() => store.setField('planFormat', 'step-by-step')}>
                <div className="card-icon">👨‍🍳</div>
                <div className="card-content"><h3>Receta paso a paso</h3><p>Instrucciones detalladas</p></div>
              </div>
              <div className={`card ${store.planFormat === 'ingredients-only' ? 'active' : ''}`} onClick={() => store.setField('planFormat', 'ingredients-only')}>
                <div className="card-icon">📝</div>
                <div className="card-content"><h3>Solo ingredientes</h3><p>Cantidades exactas</p></div>
              </div>
            </div>
          </>
        )}

        <div className="btn-container" style={{ marginTop: 'auto' }}>
          <button className="btn" onClick={handleNext} disabled={loading}>
            {loading ? 'Guardando...' : (step === 9 ? 'Crear Mi Plan' : 'Continuar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Survey;
