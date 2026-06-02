import React, { useMemo, useEffect, useRef } from 'react';
import './MapDecorations.css';

const DECORATION_TYPES = {
  WAVE: { count: 5, prefix: 'wave_' },
  ISLAND: { count: 10, prefix: 'island_' },
};

// Genera una posición en los bordes para no tapar el mapa central
const generateEdgePosition = () => {
  const edge = Math.floor(Math.random() * 4);
  let top, left;
  if (edge === 0) { // Top
    top = `${Math.random() * 15}%`;
    left = `${Math.random() * 100}%`;
  } else if (edge === 1) { // Right
    top = `${Math.random() * 100}%`;
    left = `${85 + Math.random() * 15}%`;
  } else if (edge === 2) { // Bottom
    top = `${85 + Math.random() * 15}%`;
    left = `${Math.random() * 100}%`;
  } else { // Left
    top = `${Math.random() * 100}%`;
    left = `${Math.random() * 15}%`;
  }
  return {
    top,
    left,
    animationDelay: `${Math.random() * 5}s`,
    scale: 0.5 + Math.random() * 0.7,
  };
};

const InteractiveBirds = ({ numBirds = 2, birdSpeed = 1.5, birdSize = 80 }) => {
  const birdsRef = useRef([]);
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  
  useEffect(() => {
    // Inicializar estado de las aves (Guardabarrancos)
    birdsRef.current = Array.from({ length: numBirds }).map((_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: birdSpeed + Math.random() * birdSpeed,
      flipX: Math.random() > 0.5,
      element: document.getElementById(`interactive-bird-${i}`)
    }));

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    let animationFrameId;
    let lastTime = 0;

    const animate = (time) => {
      animationFrameId = requestAnimationFrame(animate);

      // Limitar a ~30 FPS (33ms) para no ahogar el CPU en monitores de alta frecuencia (ej. 144Hz)
      if (time - lastTime < 33) return;
      lastTime = time;

      birdsRef.current.forEach(bird => {
        if (!bird.element) {
          bird.element = document.getElementById(`interactive-bird-${bird.id}`);
          if (!bird.element) return;
        }

        const targetX = mousePos.current.x;
        const targetY = mousePos.current.y;
        
        const dx = targetX - bird.x;
        const dy = targetY - bird.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Si llega muy cerca del mouse (o touch), desaparece y reaparece en un borde aleatorio
        if (dist < 30) {
          const edge = Math.floor(Math.random() * 4);
          if (edge === 0) { bird.x = Math.random() * window.innerWidth; bird.y = -50; }
          else if (edge === 1) { bird.x = window.innerWidth + 50; bird.y = Math.random() * window.innerHeight; }
          else if (edge === 2) { bird.x = Math.random() * window.innerWidth; bird.y = window.innerHeight + 50; }
          else { bird.x = -50; bird.y = Math.random() * window.innerHeight; }
          return;
        }

        const dirX = dx / dist;
        const dirY = dy / dist;
        
        bird.x += dirX * bird.speed;
        bird.y += dirY * bird.speed;
        
        // Si va hacia la izquierda, la imagen original (que asumo ve a la derecha) se debe voltear (flipX = true)
        bird.flipX = dirX < 0; 
        
        // Escala se reduce a medida que se acerca al puntero (de 1.0 a 0.2)
        const maxDist = 800;
        let scale = Math.min(dist / maxDist, 1) * 0.8 + 0.2; 

        // translate3d fuerza aceleración por hardware estricta, y toFixed() evita que el parser de CSS procese decimales largos
        bird.element.style.transform = `translate3d(${bird.x.toFixed(1)}px, ${bird.y.toFixed(1)}px, 0) scale(${bird.flipX ? -scale.toFixed(2) : scale.toFixed(2)}, ${scale.toFixed(2)})`;
      });
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [numBirds, birdSpeed]);

  return (
    <>
      {Array.from({ length: numBirds }).map((_, i) => (
        <img
          key={`interactive-bird-${i}`}
          id={`interactive-bird-${i}`}
          src="/assets/decorations/birds_4_transparent.png"
          className="decoration-item"
          alt="Guardabarranco"
          style={{ width: `${birdSize}px`, top: 0, left: 0, opacity: 0.9, zIndex: 10, willChange: 'transform' }} 
        />
      ))}
    </>
  );
};

const MapDecorations = ({ enableBirds = true, numBirds = 10, birdSpeed = 1.5, birdSize = 80 }) => {
  const decorations = useMemo(() => {
    const items = [];
    
    // Generar islas en los bordes
    for (let i = 0; i < 8; i++) {
      const islandId = Math.floor(Math.random() * DECORATION_TYPES.ISLAND.count) + 1;
      items.push({
        id: `island-${i}`,
        type: 'island',
        animClass: 'island-anim',
        src: `/assets/decorations/${DECORATION_TYPES.ISLAND.prefix}${islandId}_transparent.png`,
        style: generateEdgePosition()
      });
    }

    // Generar olas en los bordes
    for (let i = 0; i < 10; i++) {
      const waveId = Math.floor(Math.random() * DECORATION_TYPES.WAVE.count) + 1;
      items.push({
        id: `wave-${i}`,
        type: 'wave',
        animClass: 'wave-anim',
        src: `/assets/decorations/${DECORATION_TYPES.WAVE.prefix}${waveId}_transparent.png`,
        style: generateEdgePosition()
      });
    }

    return items;
  }, []);

  return (
    <div className="map-decorations-container">
      {decorations.map((item) => (
        <img
          key={item.id}
          src={item.src}
          alt={`decoration ${item.type}`}
          className={`decoration-item ${item.animClass}`}
          style={{
            top: item.style.top,
            left: item.style.left,
            animationDelay: item.style.animationDelay,
            transform: `scale(${item.style.scale})`,
            '--item-scale': item.style.scale
          }}
        />
      ))}
      
      {/* Sistema de partículas interactivas de aves. Puedes parametrizar la cantidad aquí */}
      {enableBirds && <InteractiveBirds numBirds={numBirds} birdSpeed={birdSpeed} birdSize={birdSize} />}
    </div>
  );
};

export default MapDecorations;
