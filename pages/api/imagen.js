// Proxy de imágenes: descarga la foto del producto directamente del sitio
// de Truper desde el servidor (evita bloqueos de hotlink/CORS que a veces
// ocurren al pedir la imagen directo desde el navegador) y la reenvía con
// cache para que cargue rápido las siguientes veces.

export const config = {
  api: {
    responseLimit: false,
  },
};

// Truper guarda casi todas las fotos como MEDIA/import/imagenes/{CLAVE}.jpg
// Estas son variantes que también existen para algunos productos.
function candidatos(clave) {
  const base = encodeURIComponent(clave);
  return [
    `https://www.truper.com/media/import/imagenes/${base}.jpg`,
    `https://www.truper.com/media/import/imagenes/${base}.png`,
  ];
}

export default async function handler(req, res) {
  const { clave } = req.query;

  if (!clave) {
    return res.status(400).json({ error: 'Falta la clave del producto' });
  }

  for (const url of candidatos(clave)) {
    try {
      const respuesta = await fetch(url, {
        headers: {
          // Algunos servidores bloquean peticiones sin User-Agent/Referer de navegador
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          'Referer': 'https://www.truper.com/',
          'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
      });

      if (respuesta.ok) {
        const contentType = respuesta.headers.get('content-type') || 'image/jpeg';
        const buffer = Buffer.from(await respuesta.arrayBuffer());

        // Descarta respuestas que "200 OK" pero no son imágenes reales (páginas de error disfrazadas)
        if (!contentType.startsWith('image/') || buffer.length < 200) {
          continue;
        }

        res.setHeader('Content-Type', contentType);
        // Cachea 7 días en el navegador/CDN de Vercel: la foto de un producto no cambia seguido
        res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
        return res.status(200).send(buffer);
      }
    } catch (err) {
      // intenta el siguiente candidato
      continue;
    }
  }

  return res.status(404).json({ error: 'Imagen no disponible' });
}
