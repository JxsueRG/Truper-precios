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

  // --- CÁLCULOS DE PRECIOS ---
  let distribuidorIva = 0;
  let mayoreoIva = 0;
  let menudeoIva = 0;
  let publico = 0;
  let distMas30 = 0;
  let distMas40 = 0;

  if (producto) {
    const iva = 1.16;
    
    // Aquí usamos "precio" porque en tu código original ese era el que sí funcionaba
    const precioDist = producto.precio || producto.distribuidor || 0; 
    
    // Agregué varias opciones comunes, pero si siguen en 0, revisaremos la caja de diagnóstico
    const precioMay = producto.mayoreo || producto.precio_mayoreo || 0;
    const precioMen = producto.menudeo || producto.precio_menudeo || 0;
    const precioPub = producto.publico || producto.precio_publico || 0;

    distribuidorIva = precioDist * iva;
    mayoreoIva = precioMay * iva;
    menudeoIva = precioMen * iva;
    publico = precioPub;

    distMas30 = distribuidorIva * 1.30;
    distMas40 = distribuidorIva * 1.40;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>🏪 Ferretería - Truper 2026</h1>
      
      <form onSubmit={buscarProducto} style={{ margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Código del producto (Ej. 43333)"
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
          
          {/* IMAGEN Y ENLACE AL BANCO DIGITAL */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
            <img 
              src={`https://www.truper.com/catvig/img/d/${producto.clave?.trim()}.jpg`} 
              alt={producto.descripcion} 
              onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Foto+Bloqueada+por+Truper'; }}
              style={{ width: '200px', height: '200px', objectFit: 'contain', marginBottom: '15px' }} 
            />
            
            {/* ESTE ES EL BOTÓN QUE TE MANDA AL BANCO DIGITAL QUE PEDISTE */}
            <a 
              href={`https://www.truper.com/banco-contenido-digital/mx/v/?q=${producto.codigo}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                background: '#ff6b6b',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              📥 Ver/Descargar en Banco Digital Truper
            </a>
          </div>

          <h2 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#333' }}>
            {producto.descripcion}
          </h2>
          
          <div style={{ display: 'flex', gap: '20px', color: '#666', marginBottom: '20px' }}>
            <p style={{ margin: 0 }}><strong>Código:</strong> {producto.codigo}</p>
            <p style={{ margin: 0 }}><strong>Clave:</strong> {producto.clave || 'N/A'}</p>
            <p style={{ margin: 0 }}><strong>Marca:</strong> {producto.marca || 'Hermex'}</p>
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

          {/* CAJA DE DIAGNÓSTICO (¡Muy Importante!) */}
          <details style={{ marginTop: '30px', width: '100%', background: '#fff3cd', padding: '10px', borderRadius: '8px', border: '1px solid #ffeeba' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#856404' }}>
              🛠️ Clic aquí para ver los datos crudos (Diagnóstico)
            </summary>
            <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', color: '#333', marginTop: '10px' }}>
              {JSON.stringify(producto, null, 2)}
            </pre>
          </details>

        </div>
      )}
    </div>
  );
}
