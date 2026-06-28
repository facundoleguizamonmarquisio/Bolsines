# CU36 - Consultar Ubicación de Bolsines

## Requisitos previos

Antes de comenzar, asegurate de tener instalado en tu máquina:

- **Node.js** (versión 18 o superior) → https://nodejs.org
- **PostgreSQL** (versión 14 o superior) → https://www.postgresql.org/download
- **Git** → https://git-scm.com

Para verificar que los tenés instalados, abrí una terminal y ejecutá:
```bash
node --version
git --version
```

> Para verificar PostgreSQL, abrí **pgAdmin** y fijate que el servidor esté corriendo.

---

## 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd cu36
```

---

## 2. Configurar la base de datos

Abrí **pgAdmin** o la terminal de PostgreSQL y ejecutá:

```sql
CREATE DATABASE cu36;
```

---

## 3. Configurar el Backend

### 3.1 Entrar a la carpeta del backend
```bash
cd backend
```

### 3.2 Instalar dependencias
```bash
npm install
```

### 3.3 Crear el archivo de variables de entorno

Creá un archivo llamado `.env` dentro de la carpeta `backend/` con el siguiente contenido:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=TU_PASSWORD_DE_POSTGRES
DB_DATABASE=cu36
RESEND_API_KEY=TU_API_KEY_DE_RESEND
```

> ⚠️ Reemplazá `TU_PASSWORD_DE_POSTGRES` por la contraseña de tu usuario de PostgreSQL.
> 
> ⚠️ Para el `RESEND_API_KEY`: creá una cuenta gratuita en https://resend.com, generá una API key y pegála acá. Sin esto el envío de correo no va a funcionar.

### 3.4 Cargar los datos de prueba

```bash
npm run seed
```

Deberías ver algo como esto:
✅ Roles creados

✅ Comisiones Medicas creadas

✅ Empleados creados

✅ Sesion creada

✅ Estados creados

✅ Bolsines creados

✅ Cambios de estado creados

✅ Ubicaciones GPS creadas

🎉 Seed completado exitosamente

### 3.5 Levantar el backend

```bash
npm run start:dev
```

El backend queda corriendo en `http://localhost:3000`.
Deberías ver en la terminal: [Nest] LOG [NestApplication] Nest application successfully started
---

## 4. Configurar el Frontend

Abrí una **nueva terminal** (dejá el backend corriendo en la anterior).

### 4.1 Entrar a la carpeta del frontend
```bash
cd ../frontend
```

### 4.2 Instalar dependencias
```bash
npm install
```

### 4.3 Levantar el frontend

```bash
ng serve
```

El frontend queda corriendo en `http://localhost:4200`.

---

## 5. Usar la aplicación

1. Abrí el navegador en **http://localhost:4200**
2. Hacé click en **"Consultar Ubicación de Bolsines"**
3. Se va a mostrar el mapa con los bolsines en tránsito
4. Podés **clickear un marcador** en el mapa o el botón **"Seleccionar"** en la tabla
5. El sistema te va a preguntar si querés enviar un correo al GCM destino
6. Si confirmás, se envía el correo y aparece el mensaje de éxito

---

## 6. Datos de prueba cargados

El seed carga los siguientes datos:

| Dato | Detalle |
|------|---------|
| Usuario logueado | Juan Perez - Encargado de Bolsines |
| CM del usuario | Comisión Médica Buenos Aires (CM01) |
| Bolsín 1 | Nro. 1001 - Precinto P-10011 - Destino: CM Córdoba |
| Bolsín 2 | Nro. 1002 - Precinto P-10022 - Destino: CM Rosario |
| Bolsín 3 | Nro. 1003 - Ya recibido, no aparece en el mapa |

---

## 7. Solución de problemas frecuentes

**El seed falla con error de contraseña:**
> Verificá que `DB_PASSWORD` en el `.env` coincida exactamente con tu contraseña de PostgreSQL.

**El seed falla con "ECONNREFUSED":**
> PostgreSQL no está corriendo. Iniciá el servicio desde pgAdmin o ejecutá `pg_ctl start`.

**El mapa no muestra nada:**
> Verificá que el backend esté corriendo en el puerto 3000 y que no haya errores en esa terminal.

**El correo no se envía:**
> Verificá que `RESEND_API_KEY` esté bien configurada en el `.env`. La cuenta de Resend debe estar verificada.

**Error al correr `ng serve`:**
> Asegurate de tener Angular CLI instalado: `npm install -g @angular/cli`   