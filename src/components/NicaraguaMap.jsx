import React, { useState } from 'react';
import './LayeredMap.css';
import { DEPARTMENTS_HOTSPOTS } from '../data/mapVectors';

function getMatrix3d(W, H, pts) {
  if (!W || !H) return null;
  const p1 = { x: pts[0].x * W, y: pts[0].y * H };
  const p2 = { x: pts[1].x * W, y: pts[1].y * H };
  const p3 = { x: pts[2].x * W, y: pts[2].y * H };
  const p4 = { x: pts[3].x * W, y: pts[3].y * H };

  const dx1 = p2.x - p4.x;
  const dx2 = p3.x - p4.x;
  const dx3 = p1.x - p2.x + p4.x - p3.x;
  
  const dy1 = p2.y - p4.y;
  const dy2 = p3.y - p4.y;
  const dy3 = p1.y - p2.y + p4.y - p3.y;

  const det = dx1 * dy2 - dx2 * dy1;
  if (det === 0) return null;

  const a13 = (dx3 * dy2 - dx2 * dy3) / det;
  const a23 = (dx1 * dy3 - dx3 * dy1) / det;

  const a11 = p2.x - p1.x + a13 * p2.x;
  const a21 = p3.x - p1.x + a23 * p3.x;
  const a31 = p1.x;

  const a12 = p2.y - p1.y + a13 * p2.y;
  const a22 = p3.y - p1.y + a23 * p3.y;
  const a32 = p1.y;

  return [
    a11/W, a12/W, 0, a13/W,
    a21/H, a22/H, 0, a23/H,
    0,     0,     1, 0,
    a31,   a32,   0, 1
  ].map(n => Number(n).toFixed(6));
}

const CornerBracket = ({ className }) => (
  <svg 
    className={`ui-corner-bracket ${className}`} 
    viewBox="0 0 100 100" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffeba8" />
        <stop offset="20%" stopColor="#f3b735" />
        <stop offset="60%" stopColor="#d5861b" />
        <stop offset="100%" stopColor="#8a4d06" />
      </linearGradient>
      <filter id="dropShadowBracket" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.6"/>
      </filter>
    </defs>

    {/* Main Bracket Shape */}
    <path 
      d="
        M 4,80
        L 4,16
        Q 4,4 16,4
        L 80,4
        Q 96,4 96,20
        Q 96,36 80,36
        L 48,36
        Q 36,36 36,48
        L 36,80
        Q 36,96 20,96
        Q 4,96 4,80
        Z
      "
      fill="url(#goldGrad)"
      stroke="#3d220e"
      strokeWidth="4"
      filter="url(#dropShadowBracket)"
      strokeLinejoin="round"
    />
    
    {/* Inner Highlight (Top & Left) */}
    <path 
      d="
        M 8,80
        L 8,16
        Q 8,8 16,8
        L 80,8
      "
      fill="none"
      stroke="#ffffff"
      strokeOpacity="0.7"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Inner Shadow (Bottom & Right) */}
    <path 
      d="
        M 80,32
        L 48,32
        Q 32,32 32,48
        L 32,80
      "
      fill="none"
      stroke="#5a3100"
      strokeOpacity="0.6"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Screws / Nails */}
    <circle cx="76" cy="20" r="5" fill="#8a4d06" stroke="#3d220e" strokeWidth="2" />
    <circle cx="75" cy="19" r="2" fill="#fff" opacity="0.5" />
    
    <circle cx="20" cy="76" r="5" fill="#8a4d06" stroke="#3d220e" strokeWidth="2" />
    <circle cx="19" cy="75" r="2" fill="#fff" opacity="0.5" />
    
    <circle cx="20" cy="20" r="6" fill="#8a4d06" stroke="#3d220e" strokeWidth="2" />
    <circle cx="19" cy="19" r="2.5" fill="#fff" opacity="0.5" />
  </svg>
);

export default function NicaraguaMap({ selectedDepartment, onSelectDepartment, isSmall, hideBackground = false, dev = false }) {
  const wrapperRef = React.useRef(null);
  const [size, setSize] = React.useState({ w: 1024, h: 1024 });
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [dragging, setDragging] = React.useState(null);

  // Coordenadas relativas de las 4 esquinas. Cópialas aquí una vez ajustadas.
  const [corners, setCorners] = React.useState([
    {"x":0.06,"y":0.04875925699869792},{"x":1.0222222222222221,"y":0.04542592366536458},{"x":0.0022222222222222222,"y":0.969870368109809},{"x":1.07,"y":0.9498703681098091}
  ]);

  React.useEffect(() => {
    if (!wrapperRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (let entry of entries) {
        setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, []);

  const handlePointerDown = (index) => (e) => {
    e.preventDefault();
    setDragging(index);
  };
  
  React.useEffect(() => {
    if (dragging === null) return;
    const onPointerMove = (e) => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setCorners(prev => {
        const next = [...prev];
        next[dragging] = { x, y };
        return next;
      });
    };
    const onPointerUp = () => setDragging(null);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [dragging]);

  const matrix3d = React.useMemo(() => getMatrix3d(size.w, size.h, corners), [size, corners]);
  const transformStyle = matrix3d ? `matrix3d(${matrix3d.join(',')})` : 'none';
  
  if (hideBackground) {
    // Modo solo vectores (Pruebas)
    return (
      <div className="map-container" style={{ background: '#fff', border: '2px solid var(--color-primary)' }}>
         <svg viewBox="0 0 1024 1024" style={{ width: '100%', height: 'auto' }}>
            <g className="departments-hotspots-group">
              {DEPARTMENTS_HOTSPOTS.map((dept) => (
                <path
                  key={dept.id}
                  d={dept.path}
                  fill="rgba(50, 150, 250, 0.5)"
                  stroke="#000"
                  strokeWidth="2"
                />
              ))}
            </g>
         </svg>
      </div>
    );
  }

  return (
    <div 
      className={`layered-map-wrapper ${isSmall ? 'small-map' : 'large-map'}`} 
      ref={wrapperRef}
      style={{ overflow: isEditMode ? 'visible' : 'hidden' }}
    >
      
      {/* CAPA 1: FONDO LIMPIO */}
      <img 
        src="/assets/base_map_clean.png" 
        alt="Nicaragua Adventure Terrain" 
        className="map-layer terrain-layer"
      />

      {/* CAPA 2: VECTORES (Fronteras y Selección) */}
      <svg
        viewBox="0 0 1024 1024"
        className="map-layer svg-layer"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: transformStyle, transformOrigin: '0 0' }}
      >
        {/* Capa de Transformación Dinámica de Perspectiva */}
        <g>
          {/* Fronteras Fijas Visibles (Congruentes con el estilo) */}
          <g className="borders-layer">
            {DEPARTMENTS_HOTSPOTS.map((dept) => (
              <path
                key={`border-${dept.id}`}
                d={dept.path}
                fill="transparent"
                stroke="rgba(80, 50, 20, 0.7)" // Marron estilo mapa antiguo
                //stroke="rgba(150, 100, 200, 1)"
                strokeWidth="4"
                strokeLinejoin="round"
                className="dept-border-line"
              />
            ))}
          </g>

          {/* Capa de Interacción (Hover y Activo) */}
          <g className="interaction-layer">
            {DEPARTMENTS_HOTSPOTS.map((dept) => {
              const isActive = selectedDepartment?.id === dept.id;
              
              return (
                <path
                  key={dept.id}
                  d={dept.path}
                  className={`interactive-path ${isActive ? 'selected' : ''}`}
                  onClick={() => onSelectDepartment(dept)}
                >
                  <title>{dept.name}</title>
                </path>
              );
            })}
          </g>

          {/* Capa de Nombres de Departamentos */}
          <g className="labels-layer" style={{ pointerEvents: 'none' }}>
            {DEPARTMENTS_HOTSPOTS.map((dept) => {
              let lines = [dept.name];
              // Separar los nombres largos que no caben horizontalmente en 2 líneas
              if (dept.id === "riosanjuan") lines = ["Río", "San Juan"];
              else if (dept.id === "nuevasegovia") lines = ["Nueva", "Segovia"];
              else if (dept.id === "raccn") lines = ["Atlántico", "Norte"];
              else if (dept.id === "raccs") lines = ["Atlántico", "Sur"];
              
              return (
                <text 
                  key={`label-${dept.id}`}
                  x={dept.center.x} 
                  y={dept.center.y} 
                  className="dept-label"
                >
                  {lines.length === 1 ? (
                    dept.name
                  ) : (
                    <>
                      <tspan x={dept.center.x} dy="-0.6em">{lines[0]}</tspan>
                      <tspan x={dept.center.x} dy="1.2em">{lines[1]}</tspan>
                    </>
                  )}
                </text>
              );
            })}
          </g>

          {/* Pin Activo */}
          {selectedDepartment && (
            <g className="map-marker-group">
              {DEPARTMENTS_HOTSPOTS.map((dept) => {
                if (dept.id !== selectedDepartment.id) return null;
                return (
                  <g key={`marker-${dept.id}`} className="active-marker">
                    <circle
                      cx={dept.center.x}
                      cy={dept.center.y}
                      r="18"
                      fill="var(--color-accent)"
                      className="marker-glow"
                    />
                    <circle
                      cx={dept.center.x}
                      cy={dept.center.y}
                      r="8"
                      fill="#fff"
                      stroke="var(--color-primary)"
                      strokeWidth="3"
                    />
                  </g>
                );
              })}
            </g>
          )}
        </g>
      </svg>

      {/* CAPA 3: MARCO DE MADERA (Imagen Generada) */}
      <img src="/assets/frame-map.png" className="map-frame-overlay" alt="Map Frame" />

      {/* CAPA 4: TÍTULO "Tlaolli-gua" (Separados para el Blend Mode) */}
      <img src="/assets/map-title-main-square.png" className="ui-title-bg" alt="Title Plaque" />
      <h2 className="ui-title-text">Tlaolli-gua</h2>

      {/* MODO EDICIÓN (Herramienta de ajuste interno) */}
      {dev && (
        <button 
          onClick={() => setIsEditMode(!isEditMode)}
          style={{
            position: 'absolute', bottom: 10, left: 10, zIndex: 100, 
            padding: '5px 10px', background: '#333', color: '#fff', 
            border: 'none', borderRadius: 4, cursor: 'pointer', opacity: 0.6
          }}
        >
          {isEditMode ? 'Cerrar Ajuste' : '⚙️ Ajustar Mapa'}
        </button>
      )}

      {isEditMode && dev && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 110 }}>
          {corners.map((c, i) => (
            <div 
              key={i}
              onPointerDown={handlePointerDown(i)}
              style={{
                position: 'absolute',
                left: `${c.x * 100}%`,
                top: `${c.y * 100}%`,
                width: 24, height: 24,
                marginLeft: -12, marginTop: -12,
                background: 'rgba(255, 0, 0, 0.5)',
                border: '3px solid white',
                borderRadius: '50%',
                cursor: 'grab',
                pointerEvents: 'auto',
                boxShadow: '0 0 10px rgba(0,0,0,0.8)'
              }}
            />
          ))}
          <svg style={{width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible'}}>
            <polygon 
              points={`${corners[0].x*size.w},${corners[0].y*size.h} ${corners[1].x*size.w},${corners[1].y*size.h} ${corners[3].x*size.w},${corners[3].y*size.h} ${corners[2].x*size.w},${corners[2].y*size.h}`}
              fill="rgba(0, 150, 255, 0.1)"
              stroke="rgba(0, 150, 255, 0.5)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
          <div style={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)',
            padding: 15, borderRadius: 8, pointerEvents: 'auto', width: 300, boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
          }}>
            <h4 style={{margin: '0 0 10px 0'}}>Modo Free Transform</h4>
            <p style={{fontSize: 12, margin: '0 0 10px 0'}}>Arrastra los puntos rojos para estirar las esquinas de forma independiente con perspectiva 3D real.</p>
            <div style={{padding: 10, background: '#eee', borderRadius: 4, fontSize: 11}}>
              <strong>Copia este JSON y pégalo en el estado de "corners":</strong><br/>
              <code style={{userSelect: 'all', wordBreak: 'break-all'}}>
                {JSON.stringify(corners)}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
