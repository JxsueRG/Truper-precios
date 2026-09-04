import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ferreteria_pantalla_cliente';
const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
    <rect width="400" height="400" fill="#eeeeee"/>
    <text x="50%" y="50%" font-size="20" fill="#999" text-anchor="middle" dy=".3em" font-family="sans-serif">Sin imagen</text>
  </svg>`
);
const fmt = (n) => (typeof n === 'number' ? `$${n.toFixed(2)}` : '—');

export default function PantallaCliente() {
  const [producto, setProducto] = useState(null);
  const [imagenError, setImagenError] = useState(false);

  const cargarDesdeStorage = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setProducto(JSON.parse(data));
        setImagenError(false);
      }
    } catch {}
  };

  useEffect(() => {
    cargarDesdeStorage();

    // Se actualiza cuando la pestaña principal busca un producto nuevo
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) cargarDesdeStorage();
    };
    window.addEventListener('storage', onStorage);

    // Respaldo: revisa cada segundo por si el evento 'storage' no llega
    // (algunos navegadores no lo disparan entre ventana normal <-> ventana emergente)
    const intervalo = setInterval(cargarDesdeStorage, 1000);

    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(intervalo);
    };
  }, []);

  if (!producto) {
    return (
      <div style={estilos.contenedorVacio}>
        <div style={estilos.logoVacio}>🏪</div>
        <p style={estilos.textoVacio}>Esperando búsqueda…</p>
      </div>
    );
  }

  const p = producto.precios || {};

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.imagenWrap}>
        <img
          src={imagenError || !producto.imagen ? FALLBACK_IMG : producto.imagen}
          alt={producto.descripcion}
          onError={() => setImagenError(true)}
          style={estilos.imagen}
        />
      </div>
      <div style={estilos.info}>
        <h1 style={estilos.titulo}>{producto.descripcion}</h1>
        <p style={estilos.clave}>Clave: {producto.clave} &nbsp;·&nbsp; Código: {producto.codigo}</p>
        <div style={estilos.precioGrande}>{fmt(p.menudeoConIva ?? p.publicoConIva)}</div>
        <p style={estilos.precioLabel}>Precio público (IVA incluido)</p>
      </div>
    </div>
  );
}

const estilos = {
  contenedor: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4vw',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    padding: '4vw',
    boxSizing: 'border-box',
  },
  imagenWrap: {
    flex: '0 0 auto',
    background: '#fff',
    borderRadius: '24px',
    padding: '2vw',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
  },
  imagen: {
    width: 'min(40vw, 480px)',
    height: 'min(40vw, 480px)',
    objectFit: 'contain',
    display: 'block',
  },
  info: {
    color: '#fff',
    maxWidth: '45vw',
    textAlign: 'left',
  },
  titulo: {
    fontSize: 'clamp(1.5rem, 3vw, 3rem)',
    fontWeight: 800,
    margin: '0 0 16px 0',
    lineHeight: 1.15,
  },
  clave: {
    fontSize: 'clamp(0.9rem, 1.3vw, 1.3rem)',
    color: '#a0a0c0',
    margin: '0 0 32px 0',
  },
  precioGrande: {
    fontSize: 'clamp(3rem, 7vw, 7rem)',
    fontWeight: 900,
    color: '#2ecc71',
    lineHeight: 1,
  },
  precioLabel: {
    fontSize: 'clamp(0.9rem, 1.2vw, 1.2rem)',
    color: '#a0a0c0',
    marginTop: '10px',
  },
  contenedorVacio: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#a0a0c0',
  },
  logoVacio: {
    fontSize: '6rem',
    marginBottom: '20px',
  },
  textoVacio: {
    fontSize: '1.5rem',
  },
};
