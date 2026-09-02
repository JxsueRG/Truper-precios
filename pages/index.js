import { useState } from 'react';

export default function Home() {
  const [codigo, setCodigo] = useState('');
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const buscarProducto = async (e) => {
    e.preventDefault();
    if (!codigo.trim()) {
      setError('Ingresa un código');
      return;
    }

    setCargando(true);
    setError('');
    setProducto(null);

    try {
      const response = await fetch(`/api/productos?codigo=${codigo.trim()}`);
      const data = await response.json();

      if (response.ok) {
        setProducto(data);
      } else {
        setError(data.error || 'Producto no encontrado');
      }
    } catch (err) {
      setError('Error al buscar');
    } finally {
      setCargando(false);
    }
  };

  const formatearPrecio = (precio) => {
    if (!precio || precio === 0) return 'N/D';
    return '$' + precio.toFixed(2);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '30px',
          borderRadius: '16px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ color: 'white', fontSize: '2.5rem' }}>🏪 Ferretería</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>Consulta de precios Truper 2026</p>
        </div>

        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <form onSubmit={buscarProducto} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Código del producto (ej: 100048)"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              style={{
                flex: 1,
                padding: '14px 18px',
                fontSize: '16px',
                border: '2px solid #e8e8e8',
                borderRadius: '10px',
                minWidth: '200px'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '14px 35px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              disabled={cargando}
            >
              {cargando ? 'Buscando...' : '🔍 Buscar'}
            </button>
          </form>

          {error && (
            <div style={{
              marginTop: '12px',
              padding: '12px 18px',
              background: '#fff5f5',
              color: '#c0392b',
              borderRadius: '10px',
              borderLeft: '4px solid #c0392b'
            }}>
              {error}
            </div>
          )}

          {producto && (
            <div style={{ marginTop: '20px' }}>
              {/* Imagen */}
              <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '12px'
              }}>
                <img
                  src={`https://via.placeholder.com/200x200/1a1a2e/ffffff?text=${producto.codigo}`}
                  alt={producto.descripcion}
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x200/ff6b6b/ffffff?text=Sin+Imagen';
                  }}
                />
                <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                  🔍 Busca en Google: 
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(producto.descripcion + ' Truper')}&tbm=isch`} 
                     target="_blank" rel="noopener noreferrer"
                     style={{ color: '#667eea', marginLeft: '5px' }}>
                    Ver imagen en Google
                  </a>
                </p>
              </div>

              {/* Información del producto */}
              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px' }}>
                <h2 style={{ marginTop: 0 }}>{producto.descripcion}</h2>
                <p><strong>Código:</strong> {producto.codigo}</p>
                <p><strong>Clave:</strong> {producto.clave || 'N/A'}</p>
                <p><strong>Marca:</strong> {producto.marca || 'TRUPER'}</p>
                <p><strong>Familia:</strong> {producto.familia || 'N/A'}</p>
                {producto.ean && <p><strong>EAN:</strong> {producto.ean}</p>}

                <hr style={{ margin: '15px 0' }} />

                <h3>💰 Precios</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div><strong>Público (IVA incluido):</strong></div>
                  <div style={{ color: '#27ae60', fontWeight: 'bold' }}>{formatearPrecio(producto.precioPublico)}</div>

                  <div><strong>Mayoreo (IVA incluido):</strong></div>
                  <div>{formatearPrecio(producto.precioMayoreo)}</div>

                  <div><strong>Distribuidor (IVA incluido):</strong></div>
                  <div>{formatearPrecio(producto.precioDistribuidor)}</div>

                  <div><strong>Distribuidor +30%:</strong></div>
                  <div style={{ color: '#e67e22' }}>{formatearPrecio(producto.precioDist30)}</div>

                  <div><strong>Distribuidor +40%:</strong></div>
                  <div style={{ color: '#e74c3c' }}>{formatearPrecio(producto.precioDist40)}</div>

                  <div><strong>Público (sin IVA):</strong></div>
                  <div>{formatearPrecio(producto.precioPublicoSinIVA)}</div>

                  <div><strong>Mayoreo (sin IVA):</strong></div>
                  <div>{formatearPrecio(producto.precioMayoreoSinIVA)}</div>

                  <div><strong>Distribuidor (sin IVA):</strong></div>
                  <div>{formatearPrecio(producto.precioDistribuidorSinIVA)}</div>

                  <div><strong>Precio mínimo:</strong></div>
                  <div>{formatearPrecio(producto.precioMinimo)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
