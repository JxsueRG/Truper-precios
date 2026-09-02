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

    const producto = productos.find(p => 
      p.codigo === codigo.trim() || 
      p.clave?.toUpperCase() === codigo.trim().toUpperCase()
    );

    if (!producto) {
      return res.status(404).json({ 
        error: 'Producto no encontrado',
        sugerencia: 'Verifica el código o usa la clave'
      });
    }

    res.status(200).json(producto);

  } catch (error) {
    res.status(500).json({ 
      error: 'Error interno',
      detalles: error.message 
    });
  }
}
