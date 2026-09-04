import { useState, useEffect, useRef } from 'react';

const HISTORIAL_KEY = 'ferreteria_historial';
const MAX_HISTORIAL = 6;
const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="200" height="200" fill="#eeeeee"/>
    <text x="50%" y="50%" font-size="14" fill="#999" text-anchor="middle" dy=".3em" font-family="sans-serif">Sin imagen</text>
  </svg>`
);

const fmt = (n) => (typeof n === 'number' ? `$${n.toFixed(2)}` : '—');
const PANTALLA_KEY = 'ferreteria_pantalla_cliente';
let ventanaCliente = null;

export default function Home() {
  const [codigo, setCodigo] = useState('');
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [imagenError, setImagenError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(HISTORIAL_KEY) || '[]');
      setHistorial(guardado);
    } catch {
      setHistorial([]);
    }
  }, []);

  const guardarEnHistorial = (p) => {
    setHistorial(prev => {
      const sinDuplicado = prev.filter(h => h.codigo !== p.codigo);
      const nuevo = [
        { codigo: p.codigo, descripcion: p.descripcion, precio: p.precios?.publicoConIva ?? p.precio },
        ...sinDuplicado
      ].slice(0, MAX_HISTORIAL);
      try {
        localStorage.setItem(HISTORIAL_KEY, JSON.stringify(nuevo));
      } catch {}
      return nuevo;
    });
  };

  const buscar = async (valor) => {
    const termino = (valor ?? codigo).trim();
    if (!termino) {
      setError('Ingresa un código o clave');
      return;
    }

    setCargando(true);
    setError('');
    setSugerencias([]);
    setProducto(null);
    setImagenError(false);

    try {
      const response = await fetch(`/api/productos?codigo=${encodeURIComponent(termino)}`);
      const data = await response.json();

      if (response.ok) {
        setProducto(data);
        guardarEnHistorial(data);
        try {
          localStorage.setItem(PANTALLA_KEY, JSON.stringify(data));
        } catch {}
      } else {
        setError(data.error || 'Producto no encontrado');
        setSugerencias(data.sugerencias || []);
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const buscarProducto = (e) => {
    e.preventDefault();
    buscar();
  };

  const limpiarInput = () => {
    setCodigo('');
    setProducto(null);
    setError('');
    setSugerencias([]);
    inputRef.current?.focus();
  };

  const copiarInfo = () => {
    if (!producto) return;
    const p = producto.precios || {};
    const texto = [
      producto.descripcion,
      `Código: ${producto.codigo} | Clave: ${producto.clave}`,
      `Distribuidor c/IVA: ${fmt(p.distribuidorConIva)}`,
      `Distribuidor c/IVA +30%: ${fmt(p.distribuidorConIva30)}`,
      `Distribuidor c/IVA +40%: ${fmt(p.distribuidorConIva40)}`,
      `Mayoreo c/IVA: ${fmt(p.mayoreoConIva)}`,
      `Menudeo/Público c/IVA: ${fmt(p.menudeoConIva)}`,
    ].join('\n');
    navigator.clipboard?.writeText(texto).catch(() => {});
  };

  const compartirWhatsApp = () => {
    if (!producto) return;
    const p = producto.precios || {};
    const texto = `¡Hola! Te comparto este producto:\n\n*${producto.descripcion}*\nCódigo: ${producto.codigo} | Clave: ${producto.clave}\nPúblico c/IVA: ${fmt(p.menudeoConIva)}\nMayoreo c/IVA: ${fmt(p.mayoreoConIva)}`;
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const abrirPantallaCliente = async () => {
    const url = `${window.location.origin}/pantalla-cliente`;

    // Método automático: solo funciona en Chrome/Edge y requiere permiso
    // del usuario ("Administración de ventanas"). Si está disponible,
    // busca un segundo monitor y abre la ventana ya puesta ahí, en
    // pantalla completa.
    if (typeof window.getScreenDetails === 'function') {
      try {
        const detalles = await window.getScreenDetails();
        const otraPantalla = detalles.screens.find(
          (s) => s !== detalles.currentScreen
        );

        if (otraPantalla) {
          if (ventanaCliente && !ventanaCliente.closed) {
            ventanaCliente.close();
          }
          ventanaCliente = window.open(
            url,
            'pantalla_cliente',
            `left=${otraPantalla.availLeft},top=${otraPantalla.availTop},width=${otraPantalla.availWidth},height=${otraPantalla.availHeight}`
          );
          // Espera a que cargue y la pone en pantalla completa en ese monitor
          setTimeout(() => {
            try {
              ventanaCliente?.document?.documentElement?.requestFullscreen?.();
            } catch {}
          }, 600);
          return;
        }
      } catch (err) {
        // El usuario negó el permiso o el navegador no lo soporta del todo:
        // cae al método manual de abajo.
      }
    }

    // Método manual (compatible con cualquier navegador): abre una ventana
    // nueva que el usuario arrastra una sola vez al segundo monitor.
    if (!ventanaCliente || ventanaCliente.closed) {
      ventanaCliente = window.open(url, 'pantalla_cliente', 'width=1000,height=650');
      alert('Se abrió la "Pantalla de cliente" en una ventana nueva.\n\nArrástrala a tu segundo monitor y presiona F11 (o el botón de pantalla completa) — solo tienes que hacerlo la primera vez, luego se irá actualizando sola con cada búsqueda.');
    } else {
      ventanaCliente.focus();
    }
  };

  const p = producto?.precios || {};
  const c = producto?.caracteristicas || {};

  return (
    <div className="container">
      <header className="header">
        <div className="headerContent">
          <h1>🏪 Ferretería · Catálogo Truper</h1>
          <p>Consulta precios y productos al instante</p>
          <span className="badge">Catálogo 2026</span>
        </div>
      </header>

      <section className="buscador">
        <form onSubmit={buscarProducto}>
          <div className="inputGroup">
            <input
              ref={inputRef}
              type="text"
              className="input"
              placeholder="Código o clave del producto (ej. 100048 o PET-15X)"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              autoFocus
            />
            {codigo && (
              <button type="button" className="clearBtn" onClick={limpiarInput} aria-label="Limpiar">
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="button" disabled={cargando}>
            {cargando ? 'Buscando…' : '🔍 Buscar'}
          </button>
        </form>

        <button
          type="button"
          className="btnCopiar"
          style={{ marginTop: '12px' }}
          onClick={abrirPantallaCliente}
        >
          🖥️ Abrir pantalla de cliente
        </button>

        {error && (
          <div className="error">
            {error}
            {sugerencias.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sugerencias.map((s) => (
                  <div
                    key={s.codigo}
                    onClick={() => { setCodigo(s.codigo); buscar(s.codigo); }}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {s.codigo} — {s.clave} — {s.descripcion}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {producto && (
        <section className="resultado">
          <div className="card">
            <div className="imagenContainer">
              <span className="marcaTag">{producto.marca || 'TRUPER'}</span>
              <img
                className="imagen"
                src={imagenError || !producto.imagen ? FALLBACK_IMG : producto.imagen}
                alt={producto.descripcion}
                onError={() => setImagenError(true)}
              />
            </div>
            <div className="info">
              <div className="breadcrumb">
                {producto.descripcionFamilia || producto.familia || 'Ferretería'}
                <span>›</span>
                {producto.marca || 'Truper'}
              </div>
              <h2>{producto.descripcion}</h2>

              <div className="detalles">
                <div className="detalleItem">
                  <span className="label">Código</span>
                  <span className="value">{producto.codigo}</span>
                </div>
                <div className="detalleItem">
                  <span className="label">Clave</span>
                  <span className="value">{producto.clave || 'N/A'}</span>
                </div>
              </div>

              <div className="tablaPrecios">
                <div className="precioItem">
                  <span className="label">Distribuidor c/IVA</span>
                  <span className="value">{fmt(p.distribuidorConIva)}</span>
                </div>
                <div className="precioItem">
                  <span className="label">Mayoreo c/IVA</span>
                  <span className="value">{fmt(p.mayoreoConIva)}</span>
                </div>
                <div className="precioItem destacado">
                  <span className="label">Menudeo / Público c/IVA</span>
                  <span className="value">{fmt(p.menudeoConIva)}</span>
                </div>
                <div className="precioItem calculado">
                  <span className="label">Distribuidor c/IVA +30%</span>
                  <span className="value">{fmt(p.distribuidorConIva30)}</span>
                </div>
                <div className="precioItem calculado">
                  <span className="label">Distribuidor c/IVA +40%</span>
                  <span className="value">{fmt(p.distribuidorConIva40)}</span>
                </div>
              </div>

              <div className="detalles" style={{ marginTop: '10px' }}>
                <div className="detalleItem">
                  <span className="label">Unidad</span>
                  <span className="value">{c.unidad || '—'}</span>
                </div>
                <div className="detalleItem">
                  <span className="label">Piezas por caja</span>
                  <span className="value">{c.piezasPorCaja ?? '—'}</span>
                </div>
                <div className="detalleItem">
                  <span className="label">Piezas por master</span>
                  <span className="value">{c.piezasPorMaster ?? '—'}</span>
                </div>
                <div className="detalleItem">
                  <span className="label">Peso</span>
                  <span className="value">{c.pesoKg != null ? `${c.pesoKg} kg` : '—'}</span>
                </div>
                <div className="detalleItem">
                  <span className="label">Volumen</span>
                  <span className="value">{c.volumenCm3 != null ? `${c.volumenCm3} cm³` : '—'}</span>
                </div>
                <div className="detalleItem">
                  <span className="label">Código de barras</span>
                  <span className="value">{producto.ean || '—'}</span>
                </div>
              </div>

              <div className="acciones">
                <button className="btnCopiar" onClick={copiarInfo}>📋 Copiar info</button>
                <button className="btnWhatsApp" onClick={compartirWhatsApp}>💬 Compartir</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {historial.length > 0 && (
        <section className="historial">
          <h3>Búsquedas recientes</h3>
          <div className="historialList">
            {historial.map((h) => (
              <div
                key={h.codigo}
                className="historialItem"
                onClick={() => { setCodigo(h.codigo); buscar(h.codigo); }}
              >
                <span className="historialCodigo">{h.codigo}</span>
                <span className="historialDesc">{h.descripcion}</span>
                <span className="historialPrecio">{fmt(h.precio)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
