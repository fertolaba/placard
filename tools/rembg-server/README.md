# Servidor local de recorte de fondo

Quita el fondo de las fotos de prendas mientras desarrollás la app con Expo Go.

> **Solo para desarrollo.** Este servidor no tiene autenticación y cualquiera en tu red puede usarlo. No lo expongas a internet: no abras el puerto en el router ni lo publiques con un túnel.

## Instalar

Abrí PowerShell en la raíz del proyecto y corré:

```powershell
cd tools\rembg-server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Si PowerShell bloquea `Activate.ps1`, corré esto y volvé a activar el entorno:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```

## Encender

```powershell
python server.py
```

La primera vez descarga el modelo (214 MB el predeterminado), así que puede tardar varios minutos. Está listo cuando aparece `Modelo cargado: ...` y después `Running on http://...:7000`.

## Comparar modelos con una foto tuya

Con el entorno virtual activado, dentro de `tools\rembg-server`:

```powershell
python comparar.py C:\ruta\a\foto.jpg
```

No hace falta tener el servidor encendido. El script prueba `isnet-general-use`, `birefnet-general-lite` y `birefnet-general`, cada uno con y sin alpha matting y siempre con la limpieza de bordes. `birefnet-general-lite` sin matting se prueba además con y sin quitar huecos; ignora `REMBG_REMOVE_HOLES`, porque prueba las dos opciones. Muestra el tiempo de cada combinación y el del paso de quitar huecos en la consola, y guarda esto en `comparacion/`, que no se sube a Git:

- `modelo__matting-no__huecos-no.png` (y las demás combinaciones): el recorte transparente.
- `modelo__matting-no__huecos-no__sobre-gris.png` (y las demás combinaciones): el mismo recorte sobre `#1a1a1a`, donde se nota el halo.
- `hoja.png`: todos los resultados en cuadrícula, con su nombre y tiempo total. La primera fila muestra `birefnet-general-lite` sin y con quitar huecos.

Probá con fotos difíciles, como un jean con las piernas separadas o una prenda de un color parecido al fondo.

### Modelos

Cada modelo se descarga la primera vez que se usa y queda guardado en `%USERPROFILE%\.u2net`. Si corrés la comparación completa, se descargan los tres que prueba, unos 1,3 GB.

| Modelo | Descarga |
| --- | --- |
| `isnet-general-use` | 170 MB |
| `birefnet-general-lite` (predeterminado) | 214 MB |
| `birefnet-general` | 928 MB |
| `u2net` | 168 MB |

La app corta la espera a los 60 s. Si en la comparación una combinación se acerca a ese tiempo, no te va a servir en el iPhone, aunque se vea mejor.

### Cambiar la configuración

Las variables valen para la ventana de PowerShell donde las definas. Por ejemplo:

```powershell
$env:REMBG_MODEL="isnet-general-use"; python server.py
```

| Variable | Valor | Qué hace |
| --- | --- | --- |
| `REMBG_MODEL` | nombre del modelo | Elige el modelo. Por defecto, `birefnet-general-lite`. |
| `REMBG_ALPHA_MATTING` | `1` | Activa el alpha matting. Por defecto está apagado. |
| `REMBG_REMOVE_HOLES` | `0` | Apaga el paso de quitar huecos de fondo. Por defecto está activado. |
| `REMBG_EDGE_CLEANUP` | `0` | Apaga la limpieza de bordes. Por defecto está activada. |

Si el nombre no existe, el servidor no arranca y muestra la lista de modelos válidos. Si elegiste un modelo a mano y no se puede cargar, el servidor también se detiene en lugar de usar otro. Para volver a los valores por defecto, cerrá esa ventana o corré `Remove-Item Env:REMBG_MODEL`.

Los valores del alpha matting, de quitar huecos y de la limpieza de bordes son constantes al principio de `server.py`.

### Quitar huecos de fondo

Borra el fondo que el modelo tomó como prenda, como el espacio entre las piernas de un jean. Toma el color del fondo de una franja de la foto alrededor de la prenda, busca regiones grandes de ese color dentro de la prenda y borra solo las que GrabCut también considera fondo. Se saltea si la prenda es de un color parecido al fondo. Cada recorte muestra en la consola cuánto tardó este paso y qué decidió.

## Ver la IP de tu PC

```powershell
ipconfig
```

Buscá la **Dirección IPv4** del adaptador Wi-Fi o Ethernet que estés usando, por ejemplo `192.168.1.20`.

## Permitir el puerto 7000 en el Firewall de Windows

1. Revisá que tu red figure como privada:

   ```powershell
   Get-NetConnectionProfile
   ```

   `NetworkCategory` tiene que decir `Private`. Si dice `Public`, cambiala en Configuración → Red e Internet → Propiedades de la red.

2. Abrí PowerShell **como administrador** y corré:

   ```powershell
   New-NetFirewallRule -DisplayName "rembg dev (puerto 7000)" -Direction Inbound -Protocol TCP -LocalPort 7000 -Action Allow -Profile Private
   ```

Para sacar la regla cuando ya no la necesites:

```powershell
Remove-NetFirewallRule -DisplayName "rembg dev (puerto 7000)"
```

## Probar desde el iPhone

Con el iPhone en la misma red Wi-Fi que la PC, abrí en Safari `http://IP:7000/health`, cambiando `IP` por la de tu PC. Tiene que mostrar `ok`.

## Conectar la app

1. Agregá esto a `.env.local`, en la raíz del proyecto, con la IP de tu PC:

   ```
   EXPO_PUBLIC_BG_REMOVER_URL=http://192.168.1.20:7000
   ```

2. Reiniciá Expo para que tome la variable.
3. Si iOS pregunta si Expo Go puede acceder a la red local, aceptá. Si lo rechazaste, activalo en Ajustes → Expo Go → Red local.

Si la variable está vacía o el servidor está apagado, la app funciona como siempre, sin recorte y sin mostrar errores.
