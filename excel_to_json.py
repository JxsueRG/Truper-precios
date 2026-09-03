import pandas as pd
import json
import os
import re

# Leer el archivo Excel
df = pd.read_excel("ListasPreciosPublica (2).xlsx", sheet_name='catalogo')

# Lista para almacenar productos
productos = []
errores = 0

def limpiar_precio(valor):
    """Convierte cualquier valor a número flotante, manejando asteriscos y caracteres especiales"""
    if pd.isna(valor):
        return 0
    if isinstance(valor, (int, float)):
        return float(valor)
    if isinstance(valor, str):
        # Eliminar asteriscos, espacios y otros caracteres no numéricos
        valor_limpio = re.sub(r'[^\d.,-]', '', valor)
        valor_limpio = valor_limpio.replace(',', '.')
        if not valor_limpio or valor_limpio == '-':
            return 0
        try:
            return float(valor_limpio)
        except:
            return 0
    return 0

for index, row in df.iterrows():
    try:
        codigo = str(row.get('código', '')).strip() if pd.notna(row.get('código')) else ''
        if not codigo:
            errores += 1
            continue
        
        descripcion = str(row.get('descripción', '')).strip() if pd.notna(row.get('descripción')) else ''
        
        # Obtener TODOS los precios
        precio_publico = limpiar_precio(row.get('precio público con IVA'))
        precio_mayoreo = limpiar_precio(row.get('precio mayoreo con IVA'))
        precio_distribuidor = limpiar_precio(row.get('precio distribuidor con IVA'))
        precio_publico_sin_iva = limpiar_precio(row.get('precio público sin IVA'))
        precio_mayoreo_sin_iva = limpiar_precio(row.get('precio mayoreo sin IVA'))
        precio_distribuidor_sin_iva = limpiar_precio(row.get('precio distribuidor sin IVA'))
        precio_minimo = limpiar_precio(row.get('precio mínimo de venta'))
        
        # Calcular precios adicionales
        precio_dist_30 = round(precio_distribuidor * 1.30, 2) if precio_distribuidor > 0 else 0
        precio_dist_40 = round(precio_distribuidor * 1.40, 2) if precio_distribuidor > 0 else 0
        
        # Si no tiene precio público, omitir (o puedes cambiarlo a distribuidor)
        if precio_publico <= 0 and precio_distribuidor <= 0:
            errores += 1
            continue
        
        clave = str(row.get('clave', '')).strip() if pd.notna(row.get('clave')) else ''
        marca = str(row.get('Marca', '')).strip() if pd.notna(row.get('Marca')) else ''
        familia = str(row.get('Familia', '')).strip() if pd.notna(row.get('Familia')) else ''
        desc_familia = str(row.get('Descripción Familia', '')).strip() if pd.notna(row.get('Descripción Familia')) else ''
        ean = str(row.get('ean', '')).strip() if pd.notna(row.get('ean')) else ''
        
        # Si no tiene precio público pero tiene distribuidor, usar distribuidor como público
        if precio_publico <= 0 and precio_distribuidor > 0:
            precio_publico = precio_distribuidor
        
        producto = {
            "codigo": codigo,
            "clave": clave,
            "descripcion": descripcion,
            "marca": marca,
            "familia": familia,
            "descripcionFamilia": desc_familia,
            "ean": ean,
            # Precios
            "precioPublico": precio_publico,
            "precioMayoreo": precio_mayoreo,
            "precioDistribuidor": precio_distribuidor,
            "precioPublicoSinIVA": precio_publico_sin_iva,
            "precioMayoreoSinIVA": precio_mayoreo_sin_iva,
            "precioDistribuidorSinIVA": precio_distribuidor_sin_iva,
            "precioMinimo": precio_minimo,
            "precioDist30": precio_dist_30,
            "precioDist40": precio_dist_40
        }
        productos.append(producto)
        
    except Exception as e:
        errores += 1
        continue

# Asegurar que la carpeta public existe
os.makedirs('public', exist_ok=True)

# Guardar como JSON
with open('public/productos.json', 'w', encoding='utf-8') as f:
    json.dump(productos, f, ensure_ascii=False, indent=2)

print(f"✅ {len(productos)} productos convertidos a JSON")
print(f"⚠️ {errores} filas omitidas")
print(f"📁 Archivo guardado en: public/productos.json")
