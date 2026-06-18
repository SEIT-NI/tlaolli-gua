
import { useState, useEffect } from 'react';
import NicaraguaMap from './components/NicaraguaMap';
import MapDecorations from './components/MapDecorations';

export default function App() {
  const [gastronomyData, setGastronomyData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');

  // Manage theme at document level
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Dynamic fetch of configurable JSON datasource
  useEffect(() => {
    fetch('/data/nicaragua_gastronomy.json')
      .then((res) => res.json())
      .then((data) => {
        setGastronomyData(data.departments || []);
        // Initially, do NOT select a default department so the user sees the large centered map first!
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading gastronomy data:", err);
        setLoading(false);
      });
  }, []);

  // Handle department selection from SVG Map
  const handleSelectDepartment = (deptInfo) => {
    const fullDeptData = gastronomyData.find((d) => d.id === deptInfo.id);
    if (fullDeptData) {
      setSelectedDepartment({ ...fullDeptData, path: deptInfo.path, center: deptInfo.center });
      setSelectedFood(null);
      setActiveTab('description');
    }
  };

  // Find active department details
  const activeDept = selectedDepartment 
    ? { ...gastronomyData.find(d => d.id === selectedDepartment.id), ...selectedDepartment }
    : null;

  // Check URL params for decorations
  const searchParams = new URLSearchParams(window.location.search);
  const showDecorations = searchParams.has('with-deco');


  return (
    <div className="app-container">
      {/* Elementos decorativos del mar (islas, olas, aves) */}
      {showDecorations && !selectedDepartment && (
        <MapDecorations enableBirds={true} numBirds={3} birdSpeed={0.8} birdSize={20} />
      )}
      
      {/* Theme Toggle Button */}
      <button 
        className="theme-toggle glass-panel" 
        onClick={toggleTheme}
        title="Cambiar tema"
      >
        {theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}
      </button>

      {/* Dynamic Header */}
      {loading ? (
        <div className="empty-placeholder glass-panel">
          <div className="placeholder-icon">🍲</div>
          <h2>Preparando el Comal...</h2>
          <p>Cargando sabores tradicionales nicaragüenses...</p>
        </div>
      ) : (
        <>
          {/* MAP IS ALWAYS RENDERED. We apply the background class directly to large-map-wrapper */}
          <div className="initial-layout" style={{ position: selectedDepartment ? 'fixed' : 'relative', zIndex: selectedDepartment ? -1 : 1 }}>
            <div className={`large-map-wrapper ${selectedDepartment ? 'map-background-blur' : ''}`}>
              <NicaraguaMap
                selectedDepartment={selectedDepartment}
                onSelectDepartment={handleSelectDepartment}
                isSmall={false}
                dev={false}
              />
            </div>
          </div>

          {selectedDepartment && (
            /* ==================== SELECTED STATE: Interactive 2-Column Layout ==================== */
            <main className="bento-grid active-layout">
          
          {/* COLUMN 1: Historic Landmark Details */}
          <section className="left-panel">
            {activeDept && (
              <>
                <h2 className="department-title text-gradient">{activeDept.name}</h2>
                {activeDept.landmark && (
                  <div className="landmark-card">
                    <div 
                      className="department-miniature"
                      style={{ animation: 'fly-from-map 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
                    >
                      <svg 
                        width="100%" 
                        height="100%"
                        ref={(svg) => {
                          if (svg) {
                            // Calculate perfect viewBox dynamically
                            const path = svg.querySelector('path');
                            if (path) {
                              const bbox = path.getBBox();
                              if (bbox.width > 0 && bbox.height > 0) {
                                // Add ~10% padding so it takes roughly 90% of the box
                                const padX = bbox.width * 0.15;
                                const padY = bbox.height * 0.15;
                                // Use the maximum dimension to keep the aspect ratio square and centered
                                const size = Math.max(bbox.width + padX * 2, bbox.height + padY * 2);
                                const cx = bbox.x + bbox.width / 2;
                                const cy = bbox.y + bbox.height / 2;
                                svg.setAttribute('viewBox', `${cx - size/2} ${cy - size/2} ${size} ${size}`);
                              }
                            }
                          }
                        }}
                      >
                        <path
                          d={activeDept.path}
                          fill="rgba(255, 179, 0, 0.4)"
                          stroke="var(--color-primary)"
                          strokeWidth="3"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="landmark-image-wrapper">
                      <img 
                        src={activeDept.landmark.img} 
                        alt={activeDept.landmark.name} 
                        className="landmark-img"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/assets/landmarks/placeholder.png'; }}
                      />
                    </div>
                    <div className="landmark-content">
                      <span className="landmark-tag">Sitio Emblemático</span>
                      <h4 className="landmark-title">{activeDept.landmark.name}</h4>
                      <p className="landmark-desc">{activeDept.landmark.description}</p>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Standard Quick Return Button */}
            <button 
              className="back-button map-reset-btn"
              onClick={() => {
                setSelectedDepartment(null);
                setSelectedFood(null);
              }}
            >
              ← Regresar al mapa
            </button>
          </section>

          {/* COLUMN 2: Typical Foods List or Dish Details */}
          <section className="right-panel">
            {selectedFood ? (
              /* Selected Food Detailed View */
              <div className="dish-detail-view">
                <div className="dish-detail-header">
                  <button 
                    className="dish-detail-back"
                    onClick={() => setSelectedFood(null)}
                    title="Para regresar a la lista de platillos"
                  >
                    &lt;
                  </button>
                  <h3 className="dish-detail-title text-gradient">{selectedFood.name}</h3>
                </div>

                <img 
                  src={selectedFood.img} 
                  alt={selectedFood.name} 
                  className="dish-main-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/assets/foods/placeholder.png'; }}
                />

                {/* Custom Tabs Navigation */}
                <nav className="dish-tabs">
                  <button 
                    className={`dish-tab ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => setActiveTab('description')}
                  >
                    Descripción
                  </button>
                  <button 
                    className={`dish-tab ${activeTab === 'ingredients' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ingredients')}
                  >
                    Receta
                  </button>
                  <button 
                    className={`dish-tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                  >
                    Historia
                  </button>
                </nav>

                {/* Active Tab Contents */}
                <div className="dish-tab-content">
                  {activeTab === 'description' && (
                    <p className="desc-text">{selectedFood.description}</p>
                  )}

                  {activeTab === 'ingredients' && (
                    <>
                      <ul className="ingredients-list">
                        {selectedFood.ingredients.map((ing, idx) => (
                          <li key={idx} className="ingredient-item">
                            <span className="ing-name">{ing.name}</span>
                            <span className="ing-qty">{ing.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      <h4 style={{marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--color-primary)'}}>Preparación</h4>
                      <div className="preparation-steps">
                        {selectedFood.preparation.split('\n').map((step, idx) => (
                          <p key={idx} className="prep-step">{step}</p>
                        ))}
                      </div>
                    </>
                  )}

                  {activeTab === 'history' && (
                    <p className="desc-text">{selectedFood.history}</p>
                  )}
                </div>
              </div>
            ) : (
              /* Typical Foods List */
              <div className="glass-panel">
                <h3 className="food-list-title">Gastronomía de {activeDept.name}</h3>
                <div className="food-list">
                  {activeDept.foods && activeDept.foods.length > 0 ? (
                    activeDept.foods.map((food, index) => (
                      <div 
                        key={index} 
                        className="food-card slide-up-stagger"
                        style={{ animationDelay: `${index * 0.15}s` }}
                        onClick={() => setSelectedFood(food)}
                      >
                        <img 
                          src={food.img} 
                          alt={food.name} 
                          className="food-card-img"
                          onError={(e) => { e.target.onerror = null; e.target.src = '/assets/foods/placeholder.png'; }}
                        />
                        <div className="food-card-info">
                          <h4 className="food-card-name">{food.name}</h4>
                          <p className="food-card-desc">{food.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{color: 'var(--text-muted)'}}>
                      No se encontraron platos registrados.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

            </main>
          )}
        </>
      )}
    </div>
  );
}
