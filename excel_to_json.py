import pandas as pd
import json
import os

# Leer el archivo Excel
df = pd.read_excel("ListasPreciosPublica (2).xlsx", sheet_name='catalogo')


def limpiar_precio(valor):
    """Convierte un valor de precio (que puede traer asteriscos u otros
    caracteres) a float. Regresa None si no se puede obtener un número."""
    if pd.isna(valor):
        return None
    texto = str(valor).strip()
    limpio = ''.join(c for c in texto if c.isdigit() or c == '.')
    if not limpio:
        return None
    try:
        return round(float(limpio), 2)
    except ValueError:
        return None


productos = []

for index, row in df.iterrows():
    try:
        codigo = str(row.get('código', '')).strip() if pd.notna(row.get('código')) else ''
        if not codigo:
            continue

        descripcion = str(row.get('descripción', '')).strip() if pd.notna(row.get('descripción')) else ''

        # --- Niveles de precio ---
        distribuidor_con_iva = limpiar_precio(row.get('precio distribuidor con IVA'))
        mayoreo_con_iva = limpiar_precio(row.get('precio mayoreo con IVA'))
        publico_con_iva = limpiar_precio(row.get('precio público con IVA'))

        # Si no hay ningún precio utilizable, se descarta el producto
        if distribuidor_con_iva is None and mayoreo_con_iva is None and publico_con_iva is None:
            continue

        # Precios calculados a partir de Distribuidor con IVA
        distribuidor_con_iva_40 = round(distribuidor_con_iva * 1.40, 2) if distribuidor_con_iva is not None else None
        distribuidor_con_iva_30 = round(distribuidor_con_iva * 1.30, 2) if distribuidor_con_iva is not None else None

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
            "precios": {
                # Nota: Truper no maneja una columna aparte de "menudeo";
                # en la lista pública, menudeo = precio público con IVA.
                "distribuidorConIva": distribuidor_con_iva,
                "mayoreoConIva": mayoreo_con_iva,
                "menudeoConIva": publico_con_iva,
                "publicoConIva": publico_con_iva,
                "distribuidorConIva30": distribuidor_con_iva_30,
                "distribuidorConIva40": distribuidor_con_iva_40,
            },
            # Se mantiene "precio" para no romper compatibilidad con código anterior
            "precio": publico_con_iva if publico_con_iva is not None else distribuidor_con_iva,
        }
        productos.append(producto)

    except Exception as e:
        print(f"Error en fila {index}: {e}")
        continue

os.makedirs('public', exist_ok=True)

with open('public/products.json', 'w', encoding='utf-8') as f:
    json.dump(productos, f, ensure_ascii=False, indent=2)

print(f"✅ {len(productos)} productos convertidos a JSON")
print(f"📁 Archivo guardado en: public/products.json")
