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

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { codigo } = req.query;

  if (!codigo || !codigo.trim()) {
    return res.status(400).json({ error: 'Se requiere un código' });
  }

  const busqueda = codigo.trim().toUpperCase();

  try {
    const productos = cargarProductos();

    let producto = productos.find(p =>
      String(p.codigo).trim().toUpperCase() === busqueda ||
      String(p.clave || '').trim().toUpperCase() === busqueda
    );

    let sugerencias = [];
    if (!producto) {
      sugerencias = productos
        .filter(p =>
          String(p.clave || '').toUpperCase().includes(busqueda) ||
          String(p.descripcion || '').toUpperCase().includes(busqueda)
        )
        .slice(0, 5)
        .map(p => ({ codigo: p.codigo, clave: p.clave, descripcion: p.descripcion }));
    }

    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        sugerencia: sugerencias.length
          ? 'Quisiste decir alguno de estos:'
          : 'Verifica el código o usa la clave del producto',
        sugerencias
      });
    }

    res.status(200).json({
      ...producto,
      // La imagen se sirve a través de nuestro propio proxy (/api/imagen)
      // en vez de apuntar directo a truper.com, para evitar bloqueos.
      imagen: producto.clave ? `/api/imagen?clave=${encodeURIComponent(producto.clave)}` : null
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error interno',
      detalles: error.message
    });
  }
}
