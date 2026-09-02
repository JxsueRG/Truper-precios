import { useState, useRef } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [codigo, setCodigo] = useState('');
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [historial, setHistorial] = useState([]);
  const inputRef = useRef(null);

  const buscarProducto = async (e) => {
    e.preventDefault();
    
    if (!codigo.trim()) {
      setError('Por favor ingresa un código');
      return;
    }

    setCargando(true);
    setError('');
    setProducto(null);

    try {
      const response = await fetch(`/api/productos?codigo=${encodeURIComponent(codigo.trim())}`);
      const data = await response.json();

      if (response.ok) {
        setProducto(data);
        // Agregar al historial
        setHistorial(prev => {
          const nuevo = [data, ...prev.filter(p => p.codigo !== data.codigo)];
          return nuevo.slice(0, 10); // Máximo 10 en historial
        });
      } else {
        setError(data.error || 'Producto no encontrado');
      }
    } catch (err) {
      setError('Error al buscar el producto');
    } finally {
      setCargando(false);
    }
  };

  const limpiarBusqueda = () => {
    setCodigo('');
    setProducto(null);
    setError('');
    inputRef.current?.focus();
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(precio);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>🏪 Ferretería</h1>
          <p>Consulta de precios Truper 2026</p>
          <span className={styles.badge}>📦 {historial.length > 0 ? `${historial.length} productos vistos` : 'Busca un producto'}</span>
        </div>
      </header>

      <div className={styles.buscador}>
        <form onSubmit={buscarProducto}>
          <div className={styles.inputGroup}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Ingresa el código del producto (ej: 100048)"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              className={styles.input}
              autoFocus
            />
            {codigo && (
              <button type="button" onClick={limpiarBusqueda} className={styles.clearBtn}>
                ✕
              </button>
            )}
          </div>
          <button type="submit" className={styles.button} disabled={cargando}>
            {cargando ? '🔍 Buscando...' : '🔍 Buscar'}
          </button>
        </form>
        {error && <div className={styles.error}>{error}</div>}
      </div>

      {producto && (
        <div className={styles.resultado}>
          <div className={styles.card}>
            <div className={styles.imagenContainer}>
              <img
                src={`https://via.placeholder.com/300x300/1a1a2e/ffffff?text=${producto.codigo}`}
                alt={producto.descripcion}
                className={styles.imagen}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300/ff6b6b/ffffff?text=Sin+Imagen';
                }}
              />
              <div className={styles.marcaTag}>{producto.marca || 'TRUPER'}</div>
            </div>
            <div className={styles.info}>
              <div className={styles.breadcrumb}>
                <span>{producto.familia || 'Herramientas'}</span>
                <span>›</span>
                <span>{producto.descripcionFamilia || 'Producto'}</span>
              </div>
              <h2>{producto.descripcion}</h2>
              <div className={styles.detalles}>
                <div className={styles.detalleItem}>
                  <span className={styles.label}>Código</span>
                  <span className={styles.value}>{producto.codigo}</span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.label}>Clave</span>
                  <span className={styles.value}>{producto.clave || 'N/A'}</span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.label}>Precio Público</span>
                  <span className={`${styles.value} ${styles.precio}`}>
                    {formatearPrecio(producto.precio)}
                  </span>
                </div>
                {producto.ean && (
                  <div className={styles.detalleItem}>
                    <span className={styles.label}>EAN</span>
                    <span className={styles.value}>{producto.ean}</span>
                  </div>
                )}
              </div>
              <div className={styles.acciones}>
                <button 
                  className={styles.btnCopiar} 
                  onClick={() => {
                    const texto = `📦 ${producto.descripcion}\n📋 Código: ${producto.codigo}\n💰 Precio: ${formatearPrecio(producto.precio)}`;
                    navigator.clipboard.writeText(texto);
                    alert('✅ Datos copiados al portapapeles');
                  }}
                >
                  📋 Copiar datos
                </button>
                <button 
                  className={styles.btnWhatsApp}
                  onClick={() => {
                    const texto = `Hola, consulto precio de:\n${producto.descripcion}\nCódigo: ${producto.codigo}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
                  }}
                >
                  💬 WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {historial.length > 0 && !producto && (
        <div className={styles.historial}>
          <h3>📋 Últimas búsquedas</h3>
          <div className={styles.historialList}>
            {historial.map((item, index) => (
              <div 
                key={index} 
                className={styles.historialItem}
                onClick={() => {
                  setCodigo(item.codigo);
                  setProducto(item);
                }}
              >
                <span className={styles.historialCodigo}>{item.codigo}</span>
                <span className={styles.historialDesc}>{item.descripcion.substring(0, 40)}...</span>
                <span className={styles.historialPrecio}>{formatearPrecio(item.precio)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
