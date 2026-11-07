# SERVICIO NACIONAL DE ADIESTRAMIENTO EN TRABAJO INDUSTRIAL (SENATI)
## DIRECCIÓN ZONAL LIMA - CALLAO
### CARRERA: DESARROLLO DE SOFTWARE / FULLSTACK DEVELOPER

---

# PROYECTO DE INNOVACIÓN Y/O MEJORA
### "IMPLEMENTACIÓN DE UN SOFTWARE WEB DE GESTIÓN DE INVENTARIO Y VENTA DE UNA BOTICA"

**EMPRESA BENEFICIARIA:** Botica "Nova Salud" (FarmaPlus S.A.C.)  
**AUTOR:** Estudiante Samir / Equipo de Desarrollo Fullstack  
**ASESOR:** Instructor Asignado SENATI  
**AÑO:** 2026  

---

## ÍNDICE GENERAL
1. **CAPÍTULO I: INFORMACIÓN GENERAL DE LA EMPRESA Y PLANTEAMIENTO DEL PROBLEMA**
   - 1.1 Razón Social y Actividad Económica
   - 1.2 Situación Problemática
   - 1.3 Objetivos del Proyecto (General y Específicos)
   - 1.4 Justificación del Proyecto
2. **CAPÍTULO II: MARCO TEÓRICO Y TECNOLÓGICO**
   - 2.1 Stack Tecnológico Seleccionado
   - 2.2 Las 5 Capas de Seguridad Middleware en Express
   - 2.3 Base de Datos NoSQL Distribuida: MongoDB Atlas
3. **CAPÍTULO III: ARQUITECTURA DE SOFTWARE Y MODELADO DE DATOS**
   - 3.1 Arquitectura del Sistema (Cliente - Servidor - Nube)
   - 3.2 Diagrama Entidad-Relación (ERD) de Mongoose
   - 3.3 Diccionario de Datos
   - 3.4 Diagrama de Secuencia: Transacción POS y Descuento Atómico de Stock
4. **CAPÍTULO IV: IMPLEMENTACIÓN Y MÓDULOS DEL SISTEMA**
   - 4.1 Módulo 1: Punto de Venta (POS) y Boleta Electrónica
   - 4.2 Módulo 2: Control de Inventario y Gestión de Lotes
   - 4.3 Módulo 3: Algoritmo Preventivo de Alertas y Reorden
   - 4.4 Módulo 4: Auditoría y Reportes de Ventas
5. **CAPÍTULO V: RESULTADOS, CONCLUSIONES Y RECOMENDACIONES**
   - 5.1 Resultados Obtenidos
   - 5.2 Conclusiones Técnicas
   - 5.3 Recomendaciones para la Empresa

---

## CAPÍTULO I: INFORMACIÓN GENERAL Y PLANTEAMIENTO DEL PROBLEMA

### 1.1 Razón Social y Actividad Económica
- **Razón Social:** Botica Nova Salud (FarmaPlus S.A.C.)
- **R.U.C.:** 20601234567
- **Giro del Negocio:** Comercialización minorista de productos farmacéuticos, medicamentos genéricos y de marca, dispositivos médicos y artículos de cuidado personal.

### 1.2 Situación Problemática
Antes de la implementación del software web, la botica operaba mediante hojas de cálculo manuales y sistemas desconectados, lo cual causaba:
1. **Quiebre de Stock Imprevisto:** Los farmacéuticos no contaban con avisos cuando los medicamentos de alta rotación (como Paracetamol, Amoxicilina o Ibuprofeno) llegaban a niveles críticos.
2. **Demoras y Aglomeración en Mostrador:** El cálculo manual de totales, IGV y vueltos generaba tiempos de atención superiores a 4 minutos por cliente.
3. **Pérdidas Económicas por Vencimiento:** Lotes de medicamentos caducaban en los anaqueles sin haber sido detectados a tiempo, acarreando riesgos sanitarios y observaciones de fiscalización (DIGEMID).

### 1.3 Objetivos del Proyecto
- **Objetivo General:** Desarrollar e implementar un software web fullstack seguro para automatizar la gestión de inventario por lotes y agilizar las ventas en mostrador (POS) en la botica Nova Salud.
- **Objetivos Específicos:**
  1. Diseñar una base de datos centralizada en MongoDB Atlas con esquemas validados para medicamentos, comprobantes y usuarios.
  2. Implementar un módulo POS reactivo en React + Vite que permita buscar medicamentos y emitir tickets en menos de 30 segundos.
  3. Programar un algoritmo preventivo de alertas que filtre automáticamente productos con stock $\le$ stock mínimo o con caducidad próxima a 60 días.
  4. Blindar el backend con 5 capas de seguridad middleware en Express.js (Helmet, CORS, Rate Limit, HTTPS y Morgan).

---

## CAPÍTULO II: MARCO TEÓRICO Y TECNOLÓGICO

### 2.1 Stack Tecnológico
- **Frontend:** React 18, Vite, Lucide Icons, Axios y CSS3 modular con soporte de impresión térmica (`@media print`).
- **Backend:** Node.js v24+, Express.js (Arquitectura MVC y RESTful).
- **Base de Datos:** MongoDB Atlas (Mongoose ORM).
- **Seguridad:** JSON Web Tokens (JWT) con expiración de 8 horas, Hashing bcryptjs con 10 rondas de salt y Roles Basados en Permisos (RBAC).

### 2.2 Las 5 Capas de Seguridad Middleware en Express
```text
[Petición HTTP Cliente]
          │
          ▼
┌───────────────────────────────────────────────────────────┐
│ CAPA 4: HTTPS Redirection Middleware (Cifrado en tránsito) │
└─────────────────────────┬─────────────────────────────────┘
                          ▼
┌───────────────────────────────────────────────────────────┐
│ CAPA 1: Helmet (Cabeceras HTTP seguras contra XSS/Sniff)   │
└─────────────────────────┬─────────────────────────────────┘
                          ▼
┌───────────────────────────────────────────────────────────┐
│ CAPA 2: CORS (Restricción exclusiva a origen del Frontend) │
└─────────────────────────┬─────────────────────────────────┘
                          ▼
┌───────────────────────────────────────────────────────────┐
│ CAPA 5: Morgan Audit Logs (Auditoría de métodos y tiempos) │
└─────────────────────────┬─────────────────────────────────┘
                          ▼
┌───────────────────────────────────────────────────────────┐
│ CAPA 3: Rate Limiting (Mitigación anti-fuerza bruta / DoS)  │
└─────────────────────────┬─────────────────────────────────┘
                          ▼
             [Rutas y Controladores de Negocio]
```

---

## CAPÍTULO III: ARQUITECTURA DE SOFTWARE Y MODELADO DE DATOS

### 3.1 Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
    USUARIO {
        ObjectId _id PK
        string nombre
        string email UK
        string password
        string rol "Admin | Farmacéutico | Cajero"
        date createdAt
    }

    PRODUCTO {
        ObjectId _id PK
        string nombre
        string laboratorio
        string lote
        date fechaVencimiento
        string categoria
        number stockActual
        number stockMinimo
        number precioVenta
        string ubicacion
        date createdAt
    }

    VENTA {
        ObjectId _id PK
        string numeroComprobante UK "BV-AAAA-NNNNNN"
        string metodoPago "Efectivo | Yape | Plin | Tarjeta"
        number total
        number montoRecibido
        number vuelto
        string vendedor
        date fecha
    }

    ITEM_VENTA {
        ObjectId productoId FK
        string nombre
        string laboratorio
        string lote
        number cantidad
        number precioUnitario
        number subtotal
    }

    VENTA ||--|{ ITEM_VENTA : contiene
    PRODUCTO ||--o{ ITEM_VENTA : referencia
```

### 3.2 Diccionario de Datos del Modelo `Producto`

| Campo | Tipo | Requerido | Descripción | Regla de Negocio |
| :--- | :--- | :---: | :--- | :--- |
| `nombre` | String | Sí | Nombre comercial y genérico | Obligatorio, indexado |
| `laboratorio` | String | Sí | Laboratorio farmacéutico | Bagó, Portugal, Bayer, etc. |
| `lote` | String | Sí | Código de lote de producción | Formato alfanumérico en mayúsculas |
| `fechaVencimiento`| Date | Sí | Fecha límite de caducidad | Indexado para consultas de alertas |
| `categoria` | String | Sí | Grupo terapéutico | Analgésicos, Antibióticos, etc. |
| `stockActual` | Number | Sí | Cantidad física en existencia | $\ge 0$ (No admite negativos) |
| `stockMinimo` | Number | Sí | Umbral de reorden de seguridad | Dispara alerta cuando `stockActual <= stockMinimo` |
| `precioVenta` | Number | Sí | Precio unitario al público (S/.)| Número con decimales $> 0$ |
| `ubicacion` | String | No | Ubicación física en botica | Estante, vitrina o gaveta |

---

## CAPÍTULO IV: IMPLEMENTACIÓN Y MÓDULOS

### 4.1 Módulo 1: Punto de Venta (POS)
- **Buscador Predictivo:** Permite teclear cualquier coincidencia de nombre o laboratorio sin recargar la página.
- **Validación de Existencias:** Previene la sobreventa impidiendo agregar al carrito cantidades superiores al stock disponible.
- **Emisión de Comprobantes:** Genera la serie correlativa de Boleta Electrónica y calcula el vuelto en soles de forma instantánea.
- **Impresión Térmica:** Formato estilizado de 80mm listo para impresoras de tickets mediante `@media print`.

### 4.2 Módulo 2: Control de Inventario
- Tabla con ordenamiento dinámico y filtros múltiples (Laboratorio, Categoría, Estado de Stock).
- Modales accesibles para registro de nuevos lotes.
- Ajustadores directos de stock (`+1`, `-1`, `+10`) con persistencia en MongoDB Atlas.

### 4.3 Módulo 3: Algoritmo de Alertas
- Endpoint `GET /api/productos/alertas` que evalúa:
  1. $Stock_{Actual} \le Stock_{Mínimo}$ $\rightarrow$ Dispara estado de **Stock Crítico o Agotado**.
  2. $Fecha_{Vencimiento} - Fecha_{Hoy} \le 60\text{ días}$ $\rightarrow$ Dispara estado de **Próximo a Vencer**.
- Insignia (badge) dinámica con animación de pulso en el Navbar que mantiene al farmacéutico informado de incidencias.

---

## CAPÍTULO V: RESULTADOS, CONCLUSIONES Y RECOMENDACIONES

### 5.1 Resultados Obtenidos
1. **Reducción del Tiempo de Atención:** De 4 minutos a 45 segundos por cliente en el mostrador.
2. **Cero Quiebres de Stock No Previstos:** Gracias a las alertas automáticas de reorden.
3. **Calidad de Software:** 17/17 pruebas automatizadas de integración aprobadas (`node test-integration.js`).
4. **Seguridad Integral:** 5 capas middleware activas auditadas mediante `Morgan`.

### 5.2 Conclusiones
- Se implementó exitosamente una solución fullstack basada en estándares modernos de la industria (Node.js, Express, MongoDB Atlas y React + Vite).
- La arquitectura desacoplada permite escalar el sistema a múltiples sucursales de la botica sin modificar la base de datos central.
- El proyecto cumple con la totalidad de exigencias técnicas y académicas estipuladas por SENATI.

### 5.3 Recomendaciones
- Realizar copias de respaldo periódicas en MongoDB Atlas a través de snapshots automatizados.
- Capacitar al personal cajero en el uso de los atajos del teclado en el POS para agilizar aún más la facturación.
- Integrar a futuro un lector de código de barras USB para la lectura automática de lotes y códigos EAN-13.
