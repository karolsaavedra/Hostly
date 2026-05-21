# Documentación de cambios — Hostly

> Versión actualizada · Mayo 2025  
> Proyecto: Sistema de gestión hotelera React + Firebase

---

## 1. Resumen general

Hostly pasó de ser una aplicación orientada principalmente a la recepción del hotel a una **plataforma de gestión hotelera con roles diferenciados**. Cada usuario ahora accede únicamente a las funcionalidades que corresponden a su cargo, y las estadísticas que ve se calculan en tiempo real desde la base de datos Firebase Firestore.

### Roles implementados

| Rol | Descripción |
|-----|-------------|
| **Administrador** | Acceso total al sistema. Gestión operativa y financiera. |
| **Recepcionista** | Operación diaria: reservas, check-in/out, habitaciones, clientes. |
| **Contador** | Módulo financiero: ingresos, egresos, reportes, comprobantes, auditoría. |
| **Vigilante** | Control de seguridad: entradas, salidas, alertas, huéspedes activos. |
| **Servicio** | Limpieza y habitaciones: estado, pendientes, mantenimiento. |

---

## 2. Objetivo de los cambios

Los cambios realizados buscan:

- Mejorar el **control por roles** para que cada empleado solo vea lo que le corresponde.
- Mostrar **estadísticas reales** desde Firestore en lugar de datos inventados.
- **Eliminar valores falsos** como `$15.6M` que aparecían en reportes.
- Mejorar el **módulo financiero** para administradores y contadores.
- Agregar un **historial de estancias** con exportación a CSV.
- Implementar un sistema de **auditoría** que registra cada edición.
- Dar al contador herramientas de **informes contables internos**.
- Mejorar la **experiencia de usuario** con formularios más claros.

---

## 3. Cambios por rol

### Administrador

El administrador tiene acceso completo al sistema. Puede ver y gestionar:

- **Inicio** — Panel con ocupación, ingresos del día/mes, balance, reservas activas.
- **Habitaciones** — Estado y mapa de todas las habitaciones.
- **Reservas** — Crear, editar, cancelar reservas con confirmación.
- **Check-in / Check-out** — Registro con historial y pago.
- **Clientes** — Base de datos de huéspedes.
- **Historial de estancias** — Registro de todas las estadías completadas + exportación CSV.
- **Ingresos** — Registro y edición de pagos recibidos.
- **Egresos** — Registro y edición de gastos del hotel.
- **Pagos a empleados** — Nómina y pagos registrados.
- **Reportes** — Financiero, ocupación, reservas, con filtros de fecha.
- **Informes contables** — Comprobantes internos (ingreso, egreso, pago empleado).
- **Auditoría** — Historial completo de todas las ediciones.
- **Usuarios / Empleados** — Crear y gestionar cuentas del sistema.

### Recepcionista

El recepcionista se enfoca en la operación diaria:

- **Inicio** — Panel operativo: disponibilidad, próximos check-ins, alertas del día.
- **Reservas** — Gestión completa de reservas con cálculo de noches y total.
- **Check-in** — Listado de confirmadas/pendientes con botón de acción rápida.
- **Check-out** — Modal de cobro con registro automático de ingreso e historial.
- **Habitaciones** — Mapa interactivo y cambio de estado manual.
- **Clientes** — Registro y consulta de huéspedes.
- **Historial** — Consulta de estancias anteriores.

**No puede ver:** ingresos/egresos financieros profundos, pagos a empleados, auditoría ni gestión de usuarios.

### Contador

El contador tiene acceso al módulo financiero completo:

- **Inicio** — Panel financiero: ingresos del día/mes, egresos, balance, métodos de pago.
- **Ingresos** — Registro, edición y exportación CSV.
- **Egresos** — Registro por categoría, edición y exportación CSV.
- **Pagos a empleados** — Nómina, edición y exportación CSV.
- **Reportes** — Financiero, ocupación, reservas, con filtros por fecha y tipo. Exportación CSV de balance, ingresos, egresos y pagos.
- **Informes contables** — Comprobantes internos con consecutivo automático (HST-ING/EGR/PAG-YYYYMM-0001). Anulación con motivo y trazabilidad.
- **Auditoría financiera** — Historial de cambios en registros financieros.

**No puede ver:** check-in/out operativo, habitaciones, clientes, ni gestión de usuarios.

### Vigilante

El vigilante tiene una interfaz enfocada en seguridad:

- **Inicio** — Conteo de huéspedes activos, entradas/salidas del día, alertas.
- **Control de Acceso** — Registro de entradas, salidas, visitas e intentos. Marcado de alertas.

**No puede ver:** nada de finanzas, reservas, habitaciones ni gestión.

### Servicio (Housekeeping)

El personal de limpieza ve únicamente lo relacionado con habitaciones:

- **Inicio** — Habitaciones pendientes de limpieza, disponibles y ocupadas.
- **Limpieza y habitaciones** — Lista detallada de habitaciones en limpieza con botón "Lista ✓" para liberarlas.

**No puede ver:** ningún módulo financiero ni operativo.

---

## 4. Dashboard / Inicio

El panel de inicio ahora **cambia completamente según el rol** del usuario:

| Rol | Qué ve en Inicio |
|-----|-----------------|
| Admin | Ocupación, ingresos, balance, últimos pagos, reservas recientes |
| Recepcionista | Check-outs pendientes, próximos check-ins, mapa rápido |
| Contador | Ingresos del día/mes, egresos, balance, métodos de pago |
| Vigilante | Huéspedes activos, entradas/salidas del día, alertas |
| Servicio | Habitaciones por limpiar, disponibles, ocupadas |

Todos los datos se obtienen en **tiempo real** desde Firebase Firestore usando `onSnapshot`.

---

## 5. Reportes reales

Se eliminaron todos los datos falsos del módulo de reportes. Los valores ahora se calculan desde las colecciones de Firestore:

```
Ocupación actual    = habitaciones.ocupadas / habitaciones.total × 100
Ingresos del mes    = suma de ingresos donde fecha ∈ mes actual
Egresos del mes     = suma de egresos + pagos_empleados del mes actual
Balance             = ingresos mes - egresos mes
Reservas completadas = reservas con estado "checkout"
Promedio noches     = promedio de historial_estancias.noches
```

Los reportes también tienen **filtros por rango de fechas** y por tipo (financiero, ocupación, reservas, empleados, egresos).

---

## 6. Finanzas

### Módulo de Ingresos
- Registro de pagos con descripción, habitación, monto y método.
- **Edición** de cualquier registro con modal y validación.
- Cada edición queda registrada en Auditoría.
- Totales del día, del mes y acumulado.
- Exportación CSV funcional con BOM UTF-8 (compatible con Excel Colombia).

### Módulo de Egresos
- Registro de gastos por categoría (servicios públicos, mantenimiento, etc.).
- **Edición** de registros con trazabilidad.
- Totales del día, del mes y acumulado.
- Exportación CSV.

### Módulo de Pagos a Empleados
- Registro de salarios, quincenas, bonos y liquidaciones.
- **Edición** con auditoría automática.
- Conteo de empleados pagados en el mes.
- Exportación CSV.

### Balance
- Balance = Ingresos del período − (Egresos + Pagos empleados).
- Se muestra en verde si es positivo, en rojo si es negativo.

---

## 7. Auditoría

Cada vez que se **edita** un ingreso, egreso, pago a empleado o comprobante, el sistema guarda automáticamente un registro en la colección `auditoria` con:

| Campo | Descripción |
|-------|-------------|
| `entidad` | Colección afectada (ingresos, egresos, etc.) |
| `entidadId` | ID del documento modificado |
| `accion` | crear / actualizar / cancelar / eliminar-logico |
| `antes` | Datos originales antes del cambio |
| `despues` | Datos nuevos después del cambio |
| `usuarioEmail` | Email del usuario que hizo el cambio |
| `usuarioRol` | Rol del usuario |
| `fecha` | Timestamp del cambio |
| `descripcion` | Resumen legible del cambio |

La página de Auditoría permite:
- Filtrar por entidad, usuario y rango de fechas.
- Ver el detalle "antes/después" en un modal.
- Exportar a CSV.

---

## 8. Informes contables

Se creó un módulo de **comprobantes internos** para soporte contable:

> **Importante:** Estos comprobantes son soportes internos del hotel. **No constituyen facturación electrónica válida ante la DIAN.**

### Tipos de comprobante
- **Ingreso** → `HST-ING-YYYYMM-0001`
- **Egreso** → `HST-EGR-YYYYMM-0001`
- **Pago empleado** → `HST-PAG-YYYYMM-0001`

### Campos del comprobante
Consecutivo, tipo, tercero, documento/NIT, concepto, método de pago, monto, observaciones, referencia, estado (confirmado/anulado), registrado por, fecha.

### Funcionalidades
- Crear comprobante con consecutivo automático.
- Anular con motivo obligatorio (queda como "anulado", no se elimina).
- Exportar comprobantes a CSV.
- Exportar informe contable completo (movimientos filtrados por fecha y tipo).
- Opción de imprimir la vista.

---

## 9. Exportación CSV

Se implementó una utilidad reutilizable (`src/utils/exportCsv.js`) que:

- Recibe columnas con `label` y `key`.
- Usa **separador `;`** (punto y coma) para compatibilidad con Excel en Colombia.
- Incluye **BOM UTF-8** para que tildes y ñ se vean correctamente.
- Escapa comillas dobles correctamente.
- Convierte `null`/`undefined` en vacío.
- Descarga el archivo directamente desde el navegador.

### Qué se puede exportar

| Módulo | Archivo generado |
|--------|-----------------|
| Ingresos | `ingresos_hostly_YYYY-MM-DD.csv` |
| Egresos | `egresos_hostly_YYYY-MM-DD.csv` |
| Pagos empleados | `pagos_empleados_YYYY-MM-DD.csv` |
| Historial estancias | `historial_estancias_YYYY-MM-DD.csv` |
| Balance completo | `balance_DESDE_HASTA.csv` |
| Auditoría | `auditoria_YYYY-MM-DD.csv` |
| Comprobantes | `comprobantes_YYYY-MM-DD.csv` |
| Informe contable | `informe_contable_DESDE_HASTA.csv` |

---

## 10. Check-out e historial

### Proceso de check-out mejorado

Al hacer check-out se abre un modal que solicita:
1. **Monto cobrado** (COP).
2. **Método de pago**.
3. **Estado final de la habitación** (limpieza, disponible, mantenimiento).
4. **Observaciones** opcionales.

Al confirmar, el sistema automáticamente:
- Actualiza la reserva a `estado: "checkout"`.
- Cambia el estado de la habitación.
- **Crea un registro en `historial_estancias`** con todos los datos.
- **Registra un ingreso** en la colección `ingresos` si el monto > 0.

### Historial de estancias

La página de Historial permite:
- Ver todas las estancias completadas con información completa.
- Filtrar por rango de fechas, habitación, huésped, método de pago, usuario.
- Exportar los registros filtrados a CSV.

---

## 11. Seguridad y roles

### Navbar dinámico

El sidebar muestra solo las opciones del rol activo. Un contador nunca verá check-in/out; un vigilante nunca verá finanzas.

### Rutas protegidas

El componente `ProtectedRoute` en `App.jsx` valida en cada navegación que el rol del usuario tenga la ruta en su lista permitida (`ROL_RUTAS`). Si no tiene permiso, redirige automáticamente a su Inicio.

### Login → Inicio

Todos los roles, al iniciar sesión, son redirigidos a `/` (Inicio). El Inicio muestra el panel correspondiente al rol.

---

## 12. Archivos principales modificados

```
src/App.jsx                          Rutas, roles, protección
src/components/Layout.jsx            Sidebar dinámico por rol
src/context/AuthContext.jsx          Exposición del campo 'rol'
src/firebase/firestore.js            Funciones nuevas: auditoría, comprobantes, egresos, pagos
src/pages/DashboardPage.jsx          Panel por rol con datos reales
src/pages/ReservasPage.jsx           Cancelar con modal, cálculo de noches
src/pages/CheckoutPage.jsx           Modal de cobro, historial, ingreso automático
src/pages/ReportesPage.jsx           Datos reales, filtros, exportación
src/pages/IngresosPage.jsx           Edición, auditoría, CSV funcional
src/pages/EgresosPage.jsx            Edición, auditoría, CSV funcional
src/pages/PagosEmpleadosPage.jsx     Edición, auditoría, CSV funcional
src/pages/HistorialPage.jsx          Filtros, exportación CSV
src/pages/AuditoriaPage.jsx          NUEVO — Historial de cambios
src/pages/InformesContablesPage.jsx  NUEVO — Comprobantes internos
src/pages/UsuariosPage.jsx           NUEVO — Gestión de empleados (admin)
src/utils/dateMoney.js               NUEVO — Utilidades de fecha y COP
src/utils/exportCsv.js               NUEVO — Exportador CSV reutilizable
src/styles/global.css                Supresión de spinners en inputs
```

---

## 13. Nuevas colecciones Firestore

| Colección | Descripción |
|-----------|-------------|
| `historial_estancias` | Registro de cada estadía completada al hacer checkout |
| `egresos` | Gastos y salidas de dinero del hotel |
| `pagos_empleados` | Pagos de nómina y bonos |
| `auditoria` | Log de cambios en registros financieros |
| `comprobantes` | Soportes contables internos |
| `cajas_diarias` | Base para apertura/cierre de caja (funciones listas) |
| `novedades` | Novedades de servicio y seguridad (funciones listas) |

---

## 14. Cómo probar el proyecto

### Instalación y arranque

```bash
# Instalar dependencias
npm install

# Construir para producción
npm run build

# Iniciar servidor de desarrollo
npm run dev
```

### Crear usuarios de prueba

Desde Firebase Console → Authentication → Agregar usuario, y en Firestore → colección `empleados` crear el documento con el UID:

```json
{
  "nombre": "Admin Hotel",
  "email": "admin@hotel.com",
  "rol": "admin",
  "area": "Dirección",
  "creadoEn": "2025-05-20T00:00:00Z"
}
```

Roles disponibles: `admin`, `recepcionista`, `contador`, `vigilante`, `servicio`

### Pruebas por rol

| Rol | Email sugerido | Qué probar |
|-----|---------------|------------|
| admin | admin@hotel.com | Inicio general, reportes, auditoría |
| recepcionista | recepcion@hotel.com | Crear reserva, check-in, check-out |
| contador | contador@hotel.com | Ingresos, egresos, reportes, CSV |
| vigilante | vigilante@hotel.com | Registrar acceso, ver alertas |
| servicio | servicio@hotel.com | Marcar habitación lista |

### Probar exportación CSV
1. Registrar al menos 1 ingreso
2. Ir a Ingresos → botón `↓ CSV`
3. Abrir en Excel → verificar tildes y separadores

### Probar check-out completo
1. Crear reserva → hacer check-in
2. Ir a Check-out → botón "Check-out"
3. Llenar monto y método → confirmar
4. Verificar en Historial que aparece la estancia
5. Verificar en Ingresos que se registró el pago

---

## 15. Ideas futuras

- **Cierre de caja diario completo** — Apertura, cierre, cuadre por método de pago.
- **Novedades por habitación** — Registro de incidencias con prioridad y seguimiento.
- **Impresión de comprobantes** — Generar PDF de comprobantes internos.
- **Dashboard móvil** — Vista responsiva para gestión desde celular.
- **Filtros avanzados** — Por empleado, por tipo de habitación, por temporada.
- **Roles personalizables** — Crear roles con permisos granulares desde el panel.
- **Notificaciones internas** — Alertas entre roles (ej. habitación lista para check-in).
- **Copias de seguridad** — Exportación programada de toda la base de datos.
- **Integración futura con DIAN** — Facturación electrónica real cuando el hotel lo requiera.
- **Estadísticas avanzadas** — Gráficas de tendencias, temporadas, huéspedes frecuentes.
- **Módulo de mantenimiento** — Seguimiento de daños y reparaciones por habitación.

---

*Documentación generada para uso interno y presentación académica/comercial.*  
*Proyecto: Hostly — Hotel Management System*  
*Stack: React 18 + Vite + Firebase Firestore + Firebase Auth*
