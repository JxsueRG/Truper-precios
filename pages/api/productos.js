import fs from 'fs';
import path from 'path';

// Cache en memoria del catálogo para no releer el archivo en cada request
let productosCache = null;

function cargarProductos() {
  if (productosCache) return productosCache;

  const filePath = path.join(process.cwd(), 'public', 'products.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  productosCache = JSON.parse(fileContent);
  return productosCache;
}

function imagenDe(producto) {
  return producto.clave ? `/api/imagen?clave=${encodeURIComponent(producto.clave)}` : null;
}

const MAX_RESULTADOS = 30;

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { codigo } = req.query;

  if (!codigo || !codigo.trim()) {
    return res.status(400).json({ error: 'Se requiere un código, clave o nombre' });
  }

  const termino = codigo.trim();
  const buscaEn = termino.toUpperCase();

  try {
    const productos = cargarProductos();

    // 1) Coincidencia exacta por código o clave -> muestra el detalle completo
    const exacto = productos.find(p =>
      String(p.codigo).trim().toUpperCase() === buscaEn ||
      String(p.clave || '').trim().toUpperCase() === buscaEn
    );

    if (exacto) {
      return res.status(200).json({
        tipo: 'exacto',
        producto: { ...exacto, imagen: imagenDe(exacto) }
      });
    }

    // 2) Sin coincidencia exacta -> búsqueda por nombre/clave/marca (varias palabras)
    const palabras = buscaEn.split(/\s+/).filter(Boolean);

    const coincide = (p) => {
      const texto = `${p.descripcion || ''} ${p.clave || ''} ${p.marca || ''} ${p.descripcionFamilia || ''}`.toUpperCase();
      return palabras.every(palabra => texto.includes(palabra));
    };

    let encontrados = productos.filter(coincide);

    // Ordena poniendo primero los que empiezan con el término buscado
    encontrados.sort((a, b) => {
      const da = (a.descripcion || '').toUpperCase();
      const db = (b.descripcion || '').toUpperCase();
      const aEmpieza = da.startsWith(buscaEn) ? 0 : 1;
      const bEmpieza = db.startsWith(buscaEn) ? 0 : 1;
      if (aEmpieza !== bEmpieza) return aEmpieza - bEmpieza;
      return da.localeCompare(db);
    });

    const total = encontrados.length;
    encontrados = encontrados.slice(0, MAX_RESULTADOS).map(p => ({
      codigo: p.codigo,
      clave: p.clave,
      descripcion: p.descripcion,
      marca: p.marca,
      precioMenudeo: p.precios?.menudeoConIva ?? null,
      imagen: imagenDe(p)
    }));

    if (encontrados.length === 0) {
      return res.status(404).json({
        error: 'No se encontró ningún producto con ese código, clave o nombre'
      });
    }

    return res.status(200).json({
      tipo: 'lista',
      total,
      mostrando: encontrados.length,
      resultados: encontrados
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error interno',
      detalles: error.message
    });
  }
}
