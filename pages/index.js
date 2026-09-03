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

  // --- CÁLCULOS DE PRECIOS E IMAGEN ---
  let distribuidorIva = 0;
  let mayoreoIva = 0;
  let menudeoIva = 0;
  let publico = 0;
  let distMas30 = 0;
  let distMas40 = 0;
  let imagenUrl = '';

  if (producto) {
    const iva = 1.16;
    
    // IMPORTANTE: Asegúrate de que tu JSON/API devuelva estos nombres
    // Si tu Excel dice "precio", usamos ese como distribuidor base
    const precioDist = producto.distribuidor || producto.precio || 0; 
    const precioMay = producto.mayoreo || 0;
    const precioMen = producto.menudeo || 0;
    
    distribuidorIva = precioDist * iva;
    mayoreoIva = precioMay * iva;
    menudeoIva = precioMen * iva;
    publico = producto.publico || 0; // El público normalmente ya trae IVA en Truper

    distMas30 = distribuidorIva * 1.30;
    distMas40 = distribuidorIva * 1.40;

    // Buscamos la imagen en Truper usando la CLAVE
    imagenUrl = `https://www.truper.com/catvig/img/d/${producto.clave}.jpg`;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>🏪 Ferretería - Truper 2026</h1>
      
      <form onSubmit={buscarProducto} style={{ margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
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
            width: '60%',
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
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          disabled={cargando}
        >
          {cargando ? 'Buscando...' : '🔍 Buscar'}
        </button>
      </form>

      {error && <div style={{ color: 'red', padding: '10px', background: '#fee', textAlign: 'center', borderRadius: '8px' }}>{error}</div>}

      {producto && (
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* IMAGEN DEL PRODUCTO */}
          <img 
            src={imagenUrl} 
            alt={producto.descripcion} 
            onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Sin+Foto'; }}
            style={{ width: '200px', height: '200px', objectFit: 'contain', marginBottom: '20px' }} 
          />

          <h2 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#333' }}>{producto.descripcion}</h2>
          
          <div style={{ display: 'flex', gap: '20px', color: '#666', marginBottom: '20px' }}>
            <p style={{ margin: 0 }}><strong>Código:</strong> {producto.codigo}</p>
            <p style={{ margin: 0 }}><strong>Clave:</strong> {producto.clave || 'N/A'}</p>
            <p style={{ margin: 0 }}><strong>Marca:</strong> {producto.marca || 'TRUPER'}</p>
          </div>

          {/* LISTA DE PRECIOS */}
          <div style={{ width: '100%', padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
            <h3 style={{ marginTop: 0, textAlign: 'center', color: '#2c3e50', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>Lista de Precios</h3>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '18px', lineHeight: '2' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Distribuidor con IVA:</span> <strong>${distribuidorIva.toFixed(2)}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Mayoreo con IVA:</span> <strong>${mayoreoIva.toFixed(2)}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Menudeo con IVA:</span> <strong>${menudeoIva.toFixed(2)}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Público:</span> <strong>${publico.toFixed(2)}</strong>
              </li>
              
              <hr style={{ margin: '15px 0', border: 'none', borderTop: '2px dashed #ccc' }} />
              
              <li style={{ display: 'flex', justifyContent: 'space-between', color: '#2980b9' }}>
                <span>Distribuidor c/IVA <strong>+ 30%</strong>:</span> <strong>${distMas30.toFixed(2)}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', color: '#27ae60', fontSize: '20px' }}>
                <span>Distribuidor c/IVA <strong>+ 40%</strong>:</span> <strong>${distMas40.toFixed(2)}</strong>
              </li>
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}
