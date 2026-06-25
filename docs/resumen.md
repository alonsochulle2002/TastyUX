# TastyUX - Resumen del Proyecto

## Arquitectura

El proyecto utiliza una arquitectura **Cliente-Servidor**, dividida claramente en dos partes principales que se comunican entre sí (generalmente a través de una API REST):

* **Frontend (Cliente):** Interfaz de usuario con la que interactúa el cliente final.
* **Backend (Servidor):** Lógica de negocio, conexión a base de datos y provisión de datos/servicios al cliente.

## Exposición Local (Localtunnel)

Para exponer el puerto del frontend, puedes utilizar el siguiente comando:

```bash
npx localtunnel --port 5173
```

## Tecnologías y Librerías

### Backend (Servidor)
* **Framework:** NestJS
* **Base de Datos:** MongoDB (NoSQL) mediante el ODM Mongoose.
* **Gestor de Paquetes:** pnpm
* **Manejo de Archivos:**
  * **Multer (integrado en NestJS):** Intercepta peticiones HTTP (`multipart/form-data`) para recibir archivos físicos subidos por el usuario.
  * **ExcelJS:** Librería encargada de abrir, leer y extraer datos de filas y celdas de documentos de Excel.

### Frontend (Cliente)
* **Librería principal:** React
* **Lenguaje:** TypeScript
* **Estilos:** Tailwind CSS
* **Peticiones HTTP:** (Herramienta de peticiones configurada)

### Gestión de Base de Datos:
El proyecto utiliza **MongoDB** como base de datos NoSQL, gestionada a través de **Mongoose** (ODM).
- Los esquemas (schemas) y modelos de datos se definen utilizando los decoradores proporcionados por `@nestjs/mongoose`.
- Y es manejado con MongoDB Compass.


## Compilar Proyecto
Backend: pnpm run start:dev
Frontend: pnpm run dev