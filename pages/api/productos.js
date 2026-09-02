import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { codigo } = req.query;

  if (!codigo) {
    return res.status(400).json({ error: 'Se requiere un código' });
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'productos.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const productos = JSON.parse(fileContent);

    // Búsqueda flexible: exacta, con ceros a la izquierda, o que contenga
    const codigoBuscado = codigo.trim();
    let producto = productos.find(p => p.codigo === codigoBuscado);
    
    if (!producto) {
      // Intentar con ceros a la izquierda (códigos de 6 dígitos)
      const padded = codigoBuscado.padStart(6, '0');
      producto = productos.find(p => p.codigo === padded);
    }
    
    if (!producto) {
      // Búsqueda parcial (útil para claves)
      const matches = productos.filter(p => 
        p.codigo.includes(codigoBuscado) || 
        p.clave?.toUpperCase().includes(codigoBuscado.toUpperCase())
      );
      
      if (matches.length === 1) {
        producto = matches[0];
      } else if (matches.length > 1) {
        return res.status(200).json({ 
          multiple: true, 
          productos: matches.slice(0, 10),
          message: `Se encontraron ${matches.length} productos` 
        });
      }
    }

    if (!producto) {
      return res.status(404).json({ 
        error: 'Producto no encontrado',
        sugerencia: 'Verifica el código o prueba con la clave del producto'
      });
    }

    // Agregar URL para búsqueda de imagen
    const imagenGoogle = `https://www.google.com/search?q=${encodeURIComponent(producto.descripcion + ' ' + (producto.marca || 'Truper'))}&tbm=isch`;

    res.status(200).json({
      ...producto,
      imagenGoogle
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: error.message 
    });
  }
}
