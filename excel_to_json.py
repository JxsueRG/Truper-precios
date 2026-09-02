import pandas as pd
import json
import os
import re

# Leer el archivo Excel
df = pd.read_excel("ListasPreciosPublica (2).xlsx", sheet_name='catalogo')

productos = []
errores = 0

def limpiar_precio(valor):
    if pd.isna(valor):
        return 0
    if isinstance(valor, (int, float)):
        return float(valor)
    if isinstance(valor, str):
        valor_limpio = re.sub(r'[^\d.,-]', '', valor)
        valor_limpio = valor_limpio.replace(',', '.')
        if not valor_limpio or valor_limpio == '-':
            return 0
        try:
            return float(valor_limpio)
        except:
            return 0
    return 0

def obtener_precio(row, columna):
    """Obtiene precio de una columna, si es 0 busca en otras"""
    valor = limpiar_precio(row.get(columna))
    return valor

for index, row in df.iterrows():
    try:
        codigo = str(row.get('código', '')).strip() if pd.notna(row.get('código')) else ''
        if not codigo:
            errores += 1
            continue
        
        descripcion = str(row.get('descripción', '')).strip() if pd.notna(row.get('descripción')) else ''
        
        # Obtener TODOS los precios disponibles
        precio_publico = obtener_precio(row, 'precio público con IVA')
        
        # Si el precio público es 0, intentar obtener de otras columnas
        if precio_publico == 0:
            # Intentar con otros precios que puedan tener valor
            precio_publico = obtener_precio(row, 'precio')
            if precio_publico == 0:
                precio_publico = obtener_precio(row, 'precio público sin IVA')
            if precio_publico == 0:
                precio_publico = obtener_precio(row, 'precio mayoreo con IVA')
            if precio_publico == 0:
                precio_publico = obtener_precio(row, 'precio distribuidor con IVA')
        
        # Si después de todo sigue siendo 0, usamos el precio de la columna 'precio'
        if precio_publico == 0:
            precio_publico = limpiar_precio(row.get('precio'))
        
        # Si aún es 0, omitimos el producto
        if precio_publico == 0:
            errores += 1
            continue
        
        # Obtener otros precios
        precio_mayoreo = obtener_precio(row, 'precio mayoreo con IVA')
        precio_distribuidor = obtener_precio(row, 'precio distribuidor con IVA')
        precio_publico_sin_iva = obtener_precio(row, 'precio público sin IVA')
        precio_mayoreo_sin_iva = obtener_precio(row, 'precio mayoreo sin IVA')
        precio_distribuidor_sin_iva = obtener_precio(row, 'precio distribuidor sin IVA')
        precio_minimo = obtener_precio(row, 'precio mínimo de venta')
        
        # Si el precio mayoreo es 0, usar una referencia
        if precio_mayoreo == 0:
            precio_mayoreo = round(precio_publico * 0.85, 2)  # 15% de descuento aprox
        
        if precio_distribuidor == 0:
            precio_distribuidor = round(precio_publico * 0.70, 2)  # 30% de descuento aprox
        
        # Calcular precios adicionales
        precio_dist_30 = round(precio_distribuidor * 1.30, 2) if precio_distribuidor > 0 else 0
        precio_dist_40 = round(precio_distribuidor * 1.40, 2) if precio_distribuidor > 0 else 0
        
        clave = str(row.get('clave', '')).strip() if pd.notna(row.get('clave')) else ''
        marca = str(row.get('Marca', '')).strip() if pd.notna(row.get('Marca')) else ''
        familia = str(row.get('Familia', '')).strip() if pd.notna(row.get('Familia')) else ''
        desc_familia = str(row.get('Descripción Familia', '')).strip() if pd.notna(row.get('Descripción Familia')) else ''
        ean = str(row.get('ean', '')).strip() if pd.notna(row.get('ean')) else ''
        
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

os.makedirs('public', exist_ok=True)

with open('public/productos.json', 'w', encoding='utf-8') as f:
    json.dump(productos, f, ensure_ascii=False, indent=2)

print(f"✅ {len(productos)} productos convertidos a JSON")
print(f"⚠️ {errores} filas omitidas")
