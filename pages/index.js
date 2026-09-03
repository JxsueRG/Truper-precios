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

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🏪 Ferretería - Truper 2026</h1>
      
      <form onSubmit={buscarProducto} style={{ margin: '20px 0' }}>
        <input
          type="text"
          placeholder="Código del producto"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          style={{
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            width: '70%',
            marginRight: '10px'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 30px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
          disabled={cargando}
        >
          {cargando ? 'Buscando...' : '🔍 Buscar'}
        </button>
      </form>

      {error && <div style={{ color: 'red', padding: '10px', background: '#fee' }}>{error}</div>}

      {producto && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h2>{producto.descripcion}</h2>
          <p><strong>Código:</strong> {producto.codigo}</p>
          <p><strong>Clave:</strong> {producto.clave || 'N/A'}</p>
          <p style={{ fontSize: '24px', color: '#27ae60' }}>
            <strong>Precio:</strong> ${producto.precio?.toFixed(2) || '0.00'}
          </p>
          <p><strong>Marca:</strong> {producto.marca || 'TRUPER'}</p>
          <p><strong>Familia:</strong> {producto.familia || 'N/A'}</p>
        </div>
      )}
    </div>
  );
}
