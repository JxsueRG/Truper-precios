import pandas as pd
import json
import os

# Leer el archivo Excel
df = pd.read_excel("ListasPreciosPublica (2).xlsx", sheet_name='catalogo')

# Lista para almacenar productos
productos = []

# Iterar sobre cada fila
for index, row in df.iterrows():
    try:
        # Obtener código
        codigo = str(row.get('código', '')).strip() if pd.notna(row.get('código')) else ''
        if not codigo:
            continue
        
        # Obtener descripción
        descripcion = str(row.get('descripción', '')).strip() if pd.notna(row.get('descripción')) else ''
        
        # OBTENER PRECIO - MANEJO DE ASTERISCOS
        precio_valor = row.get('precio público con IVA')
        
        # Si es None o vacío, saltar
        if pd.isna(precio_valor):
            continue
        
        # Convertir a string y limpiar
        precio_str = str(precio_valor).strip()
        
        # Eliminar asteriscos y caracteres no numéricos (excepto punto)
        precio_limpio = ''
        for c in precio_str:
            if c.isdigit() or c == '.':
                precio_limpio += c
        
        # Si no quedó nada, saltar
        if not precio_limpio:
            continue
        
        # Convertir a float
        precio = float(precio_limpio)
        
        # Saltar si precio es 0
        if precio <= 0:
            continue
        
        # Obtener otros campos
        clave = str(row.get('clave', '')).strip() if pd.notna(row.get('clave')) else ''
        marca = str(row.get('Marca', '')).strip() if pd.notna(row.get('Marca')) else ''
        familia = str(row.get('Familia', '')).strip() if pd.notna(row.get('Familia')) else ''
        desc_familia = str(row.get('Descripción Familia', '')).strip() if pd.notna(row.get('Descripción Familia')) else ''
        ean = str(row.get('ean', '')).strip() if pd.notna(row.get('ean')) else ''
        
        # Crear producto
        producto = {
            "codigo": codigo,
            "clave": clave,
            "descripcion": descripcion,
            "precio": round(precio, 2),
            "marca": marca,
            "familia": familia,
            "descripcionFamilia": desc_familia,
            "ean": ean
        }
        productos.append(producto)
        
    except Exception as e:
        # Si hay error, mostrarlo y continuar
        print(f"Error en fila {index}: {e}")
        continue

# Asegurar que la carpeta public existe
os.makedirs('public', exist_ok=True)

# Guardar como JSON
with open('public/productos.json', 'w', encoding='utf-8') as f:
    json.dump(productos, f, ensure_ascii=False, indent=2)

print(f"✅ {len(productos)} productos convertidos a JSON")
print(f"📁 Archivo guardado en: public/productos.json")