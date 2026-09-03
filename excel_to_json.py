import pandas as pd
import json
import os
import re

# Leer el archivo Excel (asegúrate de que el nombre del archivo sea correcto)
df = pd.read_excel("ListasPreciosPublica (2).xlsx", sheet_name='catalogo')

# Función para limpiar precios y manejar caracteres especiales (*, -, etc.)
def limpiar_precio(valor):
    if pd.isna(valor):
        return 0
    if isinstance(valor, (int, float)):
        return float(valor)
    if isinstance(valor, str):
        # Elimina todo excepto números, punto y coma
        valor_limpio = re.sub(r'[^\d.,-]', '', valor)
        valor_limpio = valor_limpio.replace(',', '.')
        if not valor_limpio or valor_limpio == '-':
            return 0
        try:
            return float(valor_limpio)
        except:
            return 0
    return 0

productos = []
errores = 0

for index, row in df.iterrows():
    try:
        # Datos básicos
        codigo = str(row.get('código', '')).strip() if pd.notna(row.get('código')) else ''
        if not codigo:
            errores += 1
            continue
        
        descripcion = str(row.get('descripción', '')).strip() if pd.notna(row.get('descripción')) else ''
        clave = str(row.get('clave', '')).strip() if pd.notna(row.get('clave')) else ''
        marca = str(row.get('Marca', '')).strip() if pd.notna(row.get('Marca')) else ''
        familia = str(row.get('Familia', '')).strip() if pd.notna(row.get('Familia')) else ''
        desc_familia = str(row.get('Descripción Familia', '')).strip() if pd.notna(row.get('Descripción Familia')) else ''
        ean = str(row.get('ean', '')).strip() if pd.notna(row.get('ean')) else ''
        
        # --- TODOS LOS PRECIOS DESDE EL EXCEL ---
        # Asegúrate de que los nombres de columna coinciden EXACTAMENTE con tu Excel
        precio_publico = limpiar_precio(row.get('precio público con IVA'))
        precio_mayoreo = limpiar_precio(row.get('precio mayoreo con IVA'))
        precio_distribuidor = limpiar_precio(row.get('precio distribuidor con IVA'))
        
        precio_publico_sin_iva = limpiar_precio(row.get('precio público sin IVA'))
        precio_mayoreo_sin_iva = limpiar_precio(row.get('precio mayoreo sin IVA'))
        precio_distribuidor_sin_iva = limpiar_precio(row.get('precio distribuidor sin IVA'))
        precio_minimo = limpiar_precio(row.get('precio mínimo de venta'))
        
        # --- CALCULAR PRECIOS ADICIONALES ---
        precio_dist_30 = round(precio_distribuidor * 1.30, 2) if precio_distribuidor > 0 else 0
        precio_dist_40 = round(precio_distribuidor * 1.40, 2) if precio_distribuidor > 0 else 0

        # Si el producto no tiene precio público, lo omitimos (opcional)
        # if precio_publico <= 0:
        #     errores += 1
        #     continue
        
        producto = {
            "codigo": codigo,
            "clave": clave,
            "descripcion": descripcion,
            "marca": marca,
            "familia": familia,
            "descripcionFamilia": desc_familia,
            "ean": ean,
            
            # Precios (con IVA)
            "precioPublico": precio_publico,
            "precioMayoreo": precio_mayoreo,
            "precioDistribuidor": precio_distribuidor,
            
            # Precios calculados
            "precioDist30": precio_dist_30,
            "precioDist40": precio_dist_40,
            
            # Precios sin IVA
            "precioPublicoSinIVA": precio_publico_sin_iva,
            "precioMayoreoSinIVA": precio_mayoreo_sin_iva,
            "precioDistribuidorSinIVA": precio_distribuidor_sin_iva,
            
            "precioMinimo": precio_minimo
        }
        productos.append(producto)
        
    except Exception as e:
        errores += 1
        # print(f"Error en fila {index}: {e}") # Descomentar para depurar
        continue

# Crear la carpeta public si no existe
os.makedirs('public', exist_ok=True)

# Guardar el archivo JSON
with open('public/productos.json', 'w', encoding='utf-8') as f:
    json.dump(productos, f, ensure_ascii=False, indent=2)

print(f"✅ {len(productos)} productos convertidos a JSON")
print(f"⚠️ {errores} filas omitidas")
print(f"📁 Archivo guardado en: public/productos.json")
