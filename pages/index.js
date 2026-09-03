import { useState } from 'react';

export default function Home() {
  const [codigo, setCodigo] = useState('');
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [imgIndex, setImgIndex] = useState(0); // Controla de dónde saca la imagen

  const buscarProducto = async (e) => {
    e.preventDefault();
    if (!codigo.trim()) {
      setError('Ingresa un código');
      return;
    }

    setCargando(true);
    setError('');
    setProducto(null);
    setImgIndex(0); // Reiniciamos la imagen al buscar uno nuevo

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

  // --- CÁLCULOS INTELIGENTES DE PRECIOS ---
  let distribuidorIva = 0;
  let mayoreoIva = 0;
  let menudeoIva = 0;
  let publico = 0;
  let distMas30 = 0;
  let distMas40 = 0;

  if (producto) {
    const iva = 1.16;
    
    // Función infalible: Busca la palabra en las columnas del Excel sin importar mayúsculas
    const extraerPrecio = (palabra) => {
      const key = Object.keys(producto).find(k => k.toLowerCase().includes(palabra));
      if (key && producto[key]) {
        // Limpia el texto por si el Excel trae "$" o comas (ej. "$ 1,500.00")
        const valorLimpio = producto[key].toString().replace(/[^0-9.]/g, '');
        return parseFloat(valorLimpio) || 0;
      }
      return 0;
    };

    // Extraemos los precios exactos
    const precioDist = extraerPrecio('distribuidor') || extraerPrecio('precio') || 0;
    const precioMay = extraerPrecio('mayoreo');
    const precioMen = extraerPrecio('menudeo');
    const precioPub = extraerPrecio('publico') || extraerPrecio('público');

    // Hacemos las sumas
    distribuidorIva = precioDist * iva;
    mayoreoIva = precioMay * iva;
    menudeoIva = precioMen * iva;
    publico = precioPub; // Normalmente el precio al público ya incluye IVA

    distMas30 = distribuidorIva * 1.30;
    distMas40 = distribuidorIva * 1.40;
  }

  // --- RUTAS DE IMÁGENES DE TRUPER ---
  // 1. La del banco de contenido digital que pediste
  const imgBancoDigital = producto ? `https://www.truper.com/banco-contenido-digital/mx/v/img_banco_digital/1500/${producto.codigo}.jpg` : '';
  // 2. Ruta alternativa del catálogo
  const imgCatalogo = producto ? `https://www.truper.com/catvig/img/d/${producto.clave}.jpg` : '';

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>🏪 Ferretería - Truper 2026</h1>
      
      <form onSubmit={buscarProducto} style={{ margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Código del producto (Ej. 43920)"
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
          
          {/* IMAGEN CON FALLBACK AUTOMÁTICO */}
          <img 
            src={imgIndex === 0 ? imgBancoDigital : imgCatalogo} 
            alt={producto.descripcion || 'Producto'} 
            onError={(e) => { 
              if (imgIndex === 0) {
                setImgIndex(1); // Si falla la del Banco Digital, intenta la del Catálogo
              } else {
                e.target.src = 'https://via.placeholder.com/200?text=Imagen+No+Disponible'; 
              }
            }}
            style={{ width: '250px', height: '250px', objectFit: 'contain', marginBottom: '20px' }} 
          />

          <h2 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#333' }}>
            {producto.descripcion || producto.Descripcion}
          </h2>
          
          <div style={{ display: 'flex', gap: '20px', color: '#666', marginBottom: '20px' }}>
            <p style={{ margin: 0 }}><strong>Código:</strong> {producto.codigo || producto.Codigo}</p>
            <p style={{ margin: 0 }}><strong>Clave:</strong> {producto.clave || producto.Clave || 'N/A'}</p>
            <p style={{ margin: 0 }}><strong>Marca:</strong> {producto.marca || producto.Marca || 'Truper'}</p>
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
