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
        # Eliminar caracteres no numéricos excepto punto y coma
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
        
        # Obtener SOLO los precios con IVA
        precio_publico = limpiar_precio(row.get('precio público con IVA'))
        precio_mayoreo = limpiar_precio(row.get('precio mayoreo con IVA'))
        precio_distribuidor = limpiar_precio(row.get('precio distribuidor con IVA'))
        
        # Si no hay precio público, omitir (o puedes usar distribuidor como base)
        if precio_publico == 0 and precio_distribuidor == 0:
            errores += 1
            continue
        
        # Calcular precios adicionales solo si hay distribuidor
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
            # Solo precios con IVA
            "precioPublico": precio_publico,
            "precioMayoreo": precio_mayoreo,
            "precioDistribuidor": precio_distribuidor,
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
