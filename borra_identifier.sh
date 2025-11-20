#!/bin/bash

# === CONFIGURACIÓN ===
# Directorio base donde buscar
DIRECTORIO="/home/natalia/front-end/Moonlight-Oficial"

# Cambiar a 1 si deseas borrar directamente sin confirmación
BORRADO_DIRECTO=1

echo "Buscando archivos con extensión .Identifier en: $DIRECTORIO"
echo

# Modo simulación (dry-run)
if [ "$BORRADO_DIRECTO" -eq 0 ]; then
    echo "Modo simulación activado. No se borrará nada."
    echo "Archivos que serían eliminados:"
    find "$DIRECTORIO" -type f -name "*.Identifier"
    echo
    echo "Si deseas borrar realmente, edita BORRADO_DIRECTO=1 en el script."
else
    echo "Borrando archivos..."
    find "$DIRECTORIO" -type f -name "*.Identifier" -print -delete
    echo "Proceso completado."
fi
