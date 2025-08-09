-- Configuración inicial de la base de datos Larrosa Camiones

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar timezone
SET timezone = 'America/Argentina/Cordoba';

-- Mensaje de confirmación
SELECT 'Base de datos Larrosa Camiones inicializada correctamente' as status;