# Pokédex 2026 Full Stack Application

Esta es una aplicación web completa de Pokédex que utiliza React para el frontend y Node.js/Express para el backend, y se conecta a una base de datos MariaDB (MySQL).

## 🚀 Tecnologías

*   **Frontend**: React (Vite), Tailwind CSS v4, React Query, React Router v6, Framer Motion.
*   **Backend**: Node.js, Express.js, MySQL2 (con promesas).
*   **Base de Datos**: MariaDB.
*   **APIs externas**: PokéAPI (para imágenes completas de los Pokémon).

## 🗄️ Base de datos (MariaDB)

La aplicación espera conectarse a una base de datos MariaDB con las siguientes credenciales (definidas en `backend/.env`):
- **Host**: localhost
- **Puerto**: 3306
- **Usuario**: root
- **Contraseña**: admin123
- **Base de datos**: pokedex_2026
- **Tabla principal**: `pokemons`

### Estructura de la tabla `pokemons` (Referencia)
Si necesitas crear la base de datos o tabla, ejecuta esta consulta SQL en tu gestor:
```sql
CREATE DATABASE IF NOT EXISTS pokedex_2026;
USE pokedex_2026;

CREATE TABLE IF NOT EXISTS pokemons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    habilidad VARCHAR(100) NOT NULL,
    altura DECIMAL(5,2),
    peso DECIMAL(5,2),
    fecha_captura DATE NOT NULL
);
```

## 🛠️ Instalación y Uso

1. **Instalar dependencias del Backend**
   ```bash
   cd backend
   npm install
   ```

2. **Ejecutar el Backend**
   ```bash
   npm run dev
   ```
   *El servidor se ejecutará en http://localhost:5000*

3. **Instalar dependencias del Frontend**
   Abre una nueva terminal:
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```

4. **Ejecutar el Frontend**
   ```bash
   npm run dev
   ```
   *El cliente se ejecutará en http://localhost:5173 (o el puerto que asigne Vite).*

### Características funcionales
- **Paginación & Búsqueda en tiempo real**. El listado de Pokémon se puede buscar por texto y filtrar por tipo mientras escribes.
- **CRUD Completo**. Puedes crear un nuevo Pokémon, actualizar los datos de uno existente y eliminarlo. El modal te permitirá ingresar la información.
- **Detalle profundo**. Cada Pokémon tiene una ruta detallada donde se muestra el artwork oficial traído y cacheado de la PokéAPI.
- **Cache de Imágenes e integración**. El backend consulta PokéAPI solo si no ha cargado la imagen antes, usando un caché local e identificando por el nombre exacto del Pokémon.
- **Animaciones fluidas**. La interfaz usa animaciones estéticas en las listas usando la biblioteca Framer Motion y Tailwind CSS.

## 🤝 Autor
Desarrollado según las especificaciones del proyecto.
