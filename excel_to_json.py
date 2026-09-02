import pandas as pd
import json

# Lee tu archivo Excel
df = pd.read_excel('ListasPreciosPublica (2).xlsx', sheet_name='catalogo')

# Mapeo de columnas según tu estructura
productos = []
for _, row in df.iterrows():
    # Limpiamos valores nulos
    codigo = str(row.get('código', '')).strip() if pd.notna(row.get('código')) else ''
    clave = str(row.get('clave', '')).strip() if pd.notna(row.get('clave')) else ''
    descripcion = str(row.get('descripción', '')).strip() if pd.notna(row.get('descripción')) else ''
    precio = float(row.get('precio público con IVA', 0)) if pd.notna(row.get('precio público con IVA')) else 0
    marca = str(row.get('Marca', '')).strip() if pd.notna(row.get('Marca')) else ''
    familia = str(row.get('Familia', '')).strip() if pd.notna(row.get('Familia')) else ''
    desc_familia = str(row.get('Descripción Familia', '')).strip() if pd.notna(row.get('Descripción Familia')) else ''
    ean = str(row.get('ean', '')).strip() if pd.notna(row.get('ean')) else ''
    
    # Solo agregamos productos con código y precio válido
    if codigo and precio > 0:
        producto = {
            "codigo": codigo,
            "clave": clave,
            "descripcion": descripcion,
            "precio": precio,
            "marca": marca,
            "familia": familia,
            "descripcionFamilia": desc_familia,
            "ean": ean
        }
        productos.append(producto)

# Guarda como JSON
with open('public/productos.json', 'w', encoding='utf-8') as f:
    json.dump(productos, f, ensure_ascii=False, indent=2)

print(f"✅ {len(productos)} productos convertidos a JSON")