# Ambassador Growth Tracker

Tracker de puntos del programa de embajadores de Rootstock. React + Vite, con datos en Redis (Upstash) y capturas en Vercel Blob, todo dentro de tu proyecto de Vercel.

## Subirlo a Vercel (una sola vez)

1. **GitHub.** Crea un repositorio nuevo y sube esta carpeta tal cual (sin `node_modules`).
2. **Vercel → Add New → Project.** Importa el repositorio. Vercel detecta Vite solo; no cambies nada y presiona Deploy. La primera vez la app abre pero todavía no puede entrar: faltan los pasos 3 y 4.
3. **Storage.** En el proyecto, pestaña *Storage*:
   - *Create Database* → **Upstash for Redis** (plan Free) → conéctalo al proyecto.
   - *Create Database* → **Blob** → conéctalo al proyecto.
   Las variables de ambos se agregan solas.
4. **Redeploy.** En *Deployments → ⋯ → Redeploy* para que tome las bases de datos.
5. **Abre tu dominio `.vercel.app`.** La primera vez te pide **crear tu contraseña**. Desde ahí entras con ella en la PC y el celular. No hay variables que pegar.

### Si olvidas la contraseña
En Vercel → *Storage* → tu base Redis → *Data Browser*, borra la clave `agt:auth`. La próxima vez que abras la app te deja crear una nueva. Tus datos no se tocan.

## Pasar tus datos de la versión de Gemini

En la app vieja usa **Guardar Copia (.json)**. En la nueva, botón de subir (flecha hacia arriba) en la barra superior y elige ese archivo. Las capturas en base64 se suben solas a Blob y se reemplazan por su enlace.

## Qué cambió frente a la versión anterior

- Contraseña que creas tú en el primer uso (guardada cifrada) y sesión firmada de 90 días; la clave de sesión se genera sola. Ya no hay clave de sincronización adivinable.
- Cada tarea e idea se guarda por separado, así que editar en dos dispositivos ya no se pisa. La app vuelve a leer cada 30 s y al regresar a la pestaña. Si se cae la conexión, los cambios se guardan cuando vuelve.
- Capturas en Vercel Blob en lugar de base64 dentro del documento.
- La parrilla generada ahora incluye 08, 10, 12 y 14 y suma exactamente lo mismo que el Planificador.
- Generar parrilla solo reemplaza el mes seleccionado; el historial de otros meses se conserva.
- Semanas correctas en meses de 6 filas.
- Se quitó el parche fijo de "Computación Cuántica / 1 de octubre".
- El escaneo de links de X pasa por `/api/oembed`, sin error de CORS.

## Desarrollo local

```
npm install
npm run build:demo   # versión de vista previa con datos de ejemplo (dist-demo/)
npx vercel dev       # app completa con /api (requiere vercel link y las variables)
```

## Estructura

- `api/` funciones de Vercel: setup, login, logout, session, data, tasks, ideas, settings, import, upload, oembed.
- `src/lib/` reglas de puntos, generador de parrilla, almacenamiento y exportaciones.
- `src/tabs/` una pestaña por archivo. `src/components/` modales, tarjeta y piezas compartidas.
