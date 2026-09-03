import { useState } from 'react';

export default function Home() {
  const [codigo, setCodigo] = useState('');
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Función para calcular todos los precios
  const calcularPrecios = (precioBase) => {
    const iva = 0.16;
    const distribuidor = precioBase * (1 + iva);

    return {
      distribuidor: distribuidor,
      mayoreo: distribuidor * 1.30,
      menudeo: distribuidor * 1.40,
      publico: distribuidor * 1.50,
      mas40: distribuidor * 1.40,
      mas30: distribuidor * 1.30,
    };
  };

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
        // Agregar los precios calculados al producto
        const precios = calcularPrecios(data.precio);
        setProducto({ ...data, precios });
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
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#2c3e50' }}>🏪 Ferretería - Truper 2026</h1>

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
            marginRight: '10px',
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
            cursor: 'pointer',
          }}
          disabled={cargando}
        >
          {cargando ? 'Buscando...' : '🔍 Buscar'}
        </button>
      </form>

      {error && <div style={{ color: 'red', padding: '10px', background: '#fee', borderRadius: '6px' }}>{error}</div>}

      {producto && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          {/* Imagen del producto (placeholder) */}
          <div style={{ flex: '0 0 200px' }}>
            <img
              src={`https://via.placeholder.com/200x200?text=${producto.codigo}`}
              alt={producto.descripcion}
              style={{ width: '100%', borderRadius: '8px', background: '#f0f0f0' }}
            />
          </div>

          {/* Datos del producto */}
          <div style={{ flex: '1' }}>
            <h2 style={{ marginTop: 0 }}>{producto.descripcion}</h2>
            <p><strong>Código:</strong> {producto.codigo}</p>
            <p><strong>Clave:</strong> {producto.clave || 'N/A'}</p>
            <p><strong>Marca:</strong> {producto.marca || 'TRUPER'}</p>
            <p><strong>Familia:</strong> {producto.familia || 'N/A'}</p>

            <h3 style={{ marginTop: '20px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
              Precios (con IVA)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
              <span><strong>Distribuidor:</strong></span>
              <span>${producto.precios.distribuidor.toFixed(2)}</span>

              <span><strong>Mayoreo (+30%):</strong></span>
              <span>${producto.precios.mayoreo.toFixed(2)}</span>

              <span><strong>Menudeo (+40%):</strong></span>
              <span>${producto.precios.menudeo.toFixed(2)}</span>

              <span><strong>Público (+50%):</strong></span>
              <span>${producto.precios.publico.toFixed(2)}</span>

              <span><strong>Distribuidor +40%:</strong></span>
              <span>${producto.precios.mas40.toFixed(2)}</span>

              <span><strong>Distribuidor +30%:</strong></span>
              <span>${producto.precios.mas30.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
