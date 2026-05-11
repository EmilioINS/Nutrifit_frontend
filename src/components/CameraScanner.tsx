/**
 * CameraScanner — Organism Component
 * Responsabilidad: capturar imagen (cámara o archivo) y enviarla al backend.
 * Separación clara: UI ↔ lógica de cámara ↔ llamada API.
 */
import React, { useRef, useState, useEffect } from 'react';
import api from '../services/api';
import type { ScanResult } from '../hooks/useScanHistory';

interface Props {
  onClose: () => void;
  onResult: (res: ScanResult) => void;
}

type Mode = 'camera' | 'upload';

const CameraScanner: React.FC<Props> = ({ onClose, onResult }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<Mode>('camera');
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null); // for upload mode

  /* ── Camera lifecycle ───────────────────────────── */

  useEffect(() => {
    if (mode !== 'camera') return;

    let cancelled = false;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        if (!cancelled) setCameraError('No se pudo acceder a la cámara. Verifica los permisos o usa la opción de subir imagen.');
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      setCameraReady(false);
    };
  }, [mode]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  /* ── Image capture ───────────────────────────────── */

  const captureFromCamera = (): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const handleCameraCapture = async () => {
    const base64 = captureFromCamera();
    if (!base64) { alert('La cámara todavía no está lista.'); return; }
    stopCamera();
    await sendImage(base64);
  };

  /* ── File upload ─────────────────────────────────── */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadScan = async () => {
    if (!preview) { alert('Selecciona una imagen primero.'); return; }
    await sendImage(preview);
  };

  /* ── Shared send logic ───────────────────────────── */

  const sendImage = async (base64Image: string) => {
    setLoading(true);
    try {
      const res = await api.post('/scan-food/', { image_base64: base64Image });
      onResult(res.data);
    } catch (err) {
      console.error('Scan error:', err);
      alert('Error analizando la imagen. Intenta de nuevo.');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleClose = () => { stopCamera(); onClose(); };

  /* ── Render: Loading ─────────────────────────────── */

  if (loading) {
    return (
      <div style={S.root}>
        <div style={S.centered}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🧠</div>
          <h2 style={{ color: '#4ade80', margin: 0 }}>Analizando alimentos…</h2>
          <p style={{ color: '#9ca3af', marginTop: 8, fontSize: 14 }}>Groq LLaMA 4 Scout Vision está trabajando</p>
          <div style={S.spinner} />
        </div>
      </div>
    );
  }

  /* ── Render: Upload mode ─────────────────────────── */

  if (mode === 'upload') {
    return (
      <div style={S.root}>
        {/* Header */}
        <div style={S.header}>
          <button onClick={handleClose} style={S.closeBtn}>✕</button>
          <h3 style={{ color: 'white', margin: 0, fontSize: 16 }}>Subir Imagen</h3>
          <button onClick={() => { setPreview(null); setMode('camera'); }} style={S.modeBtn}>📷 Cámara</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed rgba(74,222,128,0.4)',
              borderRadius: 16,
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: preview ? 'transparent' : 'rgba(74,222,128,0.04)',
              transition: 'background 0.2s',
            }}
          >
            {preview ? (
              <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 12, objectFit: 'contain' }} />
            ) : (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🖼️</div>
                <p style={{ color: '#9ca3af', margin: 0 }}>Toca para seleccionar una imagen</p>
                <p style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>JPG, PNG o WEBP</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {preview && (
            <>
              <button className="btn" onClick={handleUploadScan} style={{ width: '100%' }}>
                🔍 Analizar Imagen
              </button>
              <button
                onClick={() => setPreview(null)}
                style={{ width: '100%', padding: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#9ca3af', cursor: 'pointer', fontSize: 14 }}
              >
                Elegir otra imagen
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── Render: Camera error ────────────────────────── */

  if (cameraError) {
    return (
      <div style={S.root}>
        <div style={S.centered}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📷</div>
          <p style={{ color: '#f87171', fontSize: 15, maxWidth: 300, textAlign: 'center', lineHeight: 1.5 }}>{cameraError}</p>
          <button className="btn" style={{ marginTop: 20, width: '100%' }} onClick={() => setMode('upload')}>
            🖼️ Subir imagen en su lugar
          </button>
          <button onClick={handleClose} style={{ marginTop: 10, background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14 }}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  /* ── Render: Camera view ─────────────────────────── */

  return (
    <div style={S.root}>
      {/* Video fills background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onCanPlay={() => setCameraReady(true)}
        style={S.video}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* UI overlay */}
      <div style={S.uiLayer}>
        {/* Header */}
        <div style={S.header}>
          <button onClick={handleClose} style={S.closeBtn}>✕</button>
          <h3 style={{ color: 'white', margin: 0, fontSize: 16 }}>Escáner de Comida</h3>
          <button onClick={() => setMode('upload')} style={S.modeBtn}>🖼️ Subir</button>
        </div>

        {/* Guide box */}
        <div style={S.guideWrap}>
          <div style={S.guideBox} />
          <p style={S.guideText}>Encuadra tu comida y presiona el botón</p>
        </div>

        {/* Capture button */}
        <div style={S.captureBar}>
          <button
            id="capture-btn"
            onClick={handleCameraCapture}
            disabled={!cameraReady}
            aria-label="Capturar foto"
            style={{
              width: 76, height: 76, borderRadius: '50%',
              backgroundColor: cameraReady ? '#4ade80' : '#374151',
              border: '5px solid white',
              cursor: cameraReady ? 'pointer' : 'not-allowed',
              boxShadow: cameraReady ? '0 0 28px rgba(74,222,128,0.6)' : 'none',
              transition: 'all 0.3s',
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ─── Styles ─── */
const S: Record<string, React.CSSProperties> = {
  root: {
    position: 'fixed', inset: 0, backgroundColor: '#000',
    zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  video: {
    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
  },
  uiLayer: {
    position: 'absolute', inset: 0, display: 'flex',
    flexDirection: 'column', pointerEvents: 'none',
  },
  header: {
    pointerEvents: 'all', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '14px 16px',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
  },
  closeBtn: {
    background: 'none', border: 'none', color: 'white',
    fontSize: 24, cursor: 'pointer', lineHeight: 1, padding: '4px 8px',
  },
  modeBtn: {
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
    color: 'white', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 12,
  },
  guideWrap: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  guideBox: {
    width: 240, height: 240,
    border: '2px solid rgba(74,222,128,0.8)',
    borderRadius: 16,
    boxShadow: '0 0 0 2000px rgba(0,0,0,0.35)',
  },
  guideText: {
    color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 16, textAlign: 'center',
  },
  captureBar: {
    pointerEvents: 'all', display: 'flex', justifyContent: 'center',
    alignItems: 'center', padding: '28px 0 36px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
  },
  centered: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: 30,
  },
  spinner: {
    width: 36, height: 36, marginTop: 24,
    border: '3px solid rgba(74,222,128,0.2)',
    borderTop: '3px solid #4ade80',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

export default CameraScanner;
