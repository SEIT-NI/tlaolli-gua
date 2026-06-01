import React from 'react';
import { DEPARTMENTS_HOTSPOTS } from '../data/mapVectors';

export default function VectorMapTest() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
      <div style={{ width: '800px', height: '800px', border: '2px solid #333', backgroundColor: '#fff', position: 'relative' }}>
        <h2 style={{ position: 'absolute', top: '10px', left: '10px', color: '#333' }}>/vectorial-map - Vectores Crudos</h2>
        <svg viewBox="0 0 1000 1000" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
          {DEPARTMENTS_HOTSPOTS.map(dept => (
            <path
              key={dept.id}
              d={dept.path}
              fill="rgba(0, 150, 255, 0.4)"
              stroke="#000"
              strokeWidth="2"
            >
              <title>{dept.name}</title>
            </path>
          ))}
          {/* Also render centers */}
          {DEPARTMENTS_HOTSPOTS.map(dept => (
             <circle
               key={`center-${dept.id}`}
               cx={dept.center.x}
               cy={dept.center.y}
               r="6"
               fill="red"
             />
          ))}
        </svg>
      </div>
    </div>
  );
}
