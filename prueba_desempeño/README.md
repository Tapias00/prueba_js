# Gestión de Eventos

Este proyecto es una aplicación web para la gestión de eventos, con roles de administrador y visitante. Permite crear, editar, listar y registrarse en eventos.

## Requisitos previos

- Node.js (v14 o superior)
- npm (v6 o superior)

## Instalación y ejecución

1. **Clona el repositorio**

   ```bash
   git clone <https://github.com/Tapias00/prueba_js.git>
   ```

2. **Instala las dependencias**

   ```bash
   npm install
   ```

3. **Instala json-server de forma global (si no lo tienes):**

   ```bash
   npm install -g json-server
   ```

4. **Inicia el servidor de la base de datos simulada**

   ```bash
   json-server --watch db.json --port 3000
   ```
   Esto levantará una API REST en `http://localhost:3000` usando el archivo `db.json`.

5. **Abre la aplicación en tu navegador**

   Simplemente abre el archivo `index.html` en tu navegador preferido (doble clic o botón derecho → abrir con navegador).

   > **Nota:** Si tienes problemas con CORS, puedes usar una extensión de navegador para permitir CORS o servir el frontend con una extensión como Live Server en VSCode.

## Uso de la aplicación

- **Registro e inicio de sesión:**
  - Los usuarios pueden registrarse como visitantes.
  - El usuario administrador ya está creado en la base de datos (`admin@eventos.com`, contraseña: `admin123`).

- **Administrador:**
  - Puede crear y editar eventos.
  - Ve un menú lateral con opciones de administración.

- **Visitante:**
  - Puede ver la lista de eventos y registrarse en ellos.
  - Puede ver sus registros.

## Estructura de archivos

- `index.html`: Página principal de la aplicación.
- `styles.css`: Estilos personalizados y layout.
- `main.js`: Lógica de la aplicación.
- `db.json`: Base de datos simulada para usuarios, eventos y registros.
- `package.json`: Dependencias del proyecto.

## Notas adicionales

- Puedes modificar `db.json` para agregar más usuarios o eventos de prueba.
- El proyecto utiliza [Bootstrap 5](https://getbootstrap.com/).
- Si deseas reiniciar la base de datos, simplemente detén y vuelve a iniciar `json-server`.

---

¡Listo! Ahora puedes gestionar eventos fácilmente desde tu navegador.
