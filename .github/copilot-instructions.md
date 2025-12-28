# Los 2 Patitos - Guía para Agentes de IA

## Descripción General
**Los 2 Patitos** es una aplicación web de e-commerce mayorista de indumentaria (ropa). Permite a los clientes buscar productos, seleccionar talles y colores en un modal interactivo, agregar al carrito y enviar pedidos por WhatsApp.

## Arquitectura de Dos Páginas

### 1. **Catálogo (index.html + script.js)**
- Página principal con búsqueda y grid de productos
- Modal dinámico para seleccionar talle/color/cantidad
- Productos almacenados en array estático `products[]`
- Búsqueda en tiempo real filtra por nombre y descripción
- Sincroniza carrito en localStorage en tiempo real

### 2. **Carrito (cart.html + cart.js)**
- Visualiza pedido en tabla: talles × colores con cantidades
- Agrupa automáticamente items del mismo producto
- Integración WhatsApp: genera mensaje formateado y abre `wa.me`
- Permite eliminar productos o combinaciones específicas (talle+color)

## Patrones de Datos Críticos

### Estructura del Carrito (localStorage: 'cart')
```javascript
cart = [
  {
    productId: 1,
    productName: "Remera Básica",
    size: "10",              // número como string
    color: "azul",           // valor enum: 'blanco'|'azul'|'rojo'
    colorName: "Azul",       // nombre legible
    quantity: 5,
    price: "$15.00"
  }
]
```

### Mapeos Globales (sincronizados en script.js y cart.js)
```javascript
const sizes = [4, 6, 8, 10, 12, 14, 16, 18];        // talles disponibles
const colors = [
  { name: "Blanco", value: "blanco", hex: "#FFFFFF" },
  { name: "Azul", value: "azul", hex: "#0066CC" },
  { name: "Rojo", value: "rojo", hex: "#CC0000" }
];
```

## Flujos Críticos

### Agregar al Carrito (script.js)
1. Modal abierto en `openProductModal(productId)` → renderiza size/color/qty selectors
2. Usuario selecciona talle (agrega clase `selected`)
3. Usuario selecciona color (agrega clase `selected`)
4. Usuario incrementa cantidad con botones +/-
5. `addToCartFromModal()` valida (talle ≠ null, color ≠ null, qty > 0)
6. Verifica si existe `[productId][size][color]` → suma quantities
7. `saveCart()` escribe en localStorage; carrito persiste entre sesiones

### Visualización del Carrito (cart.js)
- `updateCart()` carga desde localStorage, agrupa por producto
- Crea tabla: filas=talles, columnas=colores
- Solo mostramos celdas con cantidad > 0
- Click en celda = `removeSizeColor(productId, size, color)`

### Envío WhatsApp (ambos archivos)
- Agrupa items por `"${productName} - ${colorName}"`
- Formatea: `Talle 10: 3 unidad(es)`
- Template fijo con emojis 🦆
- **Configurar número:** variable hardcodeada `whatsappNumber` en `script.js` línea ~350

## Convenciones Específicas

### Validaciones Modales
- Siempre requerir: talle, color, cantidad > 0
- Mensajes con `alert()` (simple pero funcional)
- Resetear inputs después de agregar (formulario limpio para próximo producto)

### Sincronización localStorage
- Clave única: `'cart'` (string constante)
- Serializar/deserializar con JSON
- Recargar antes de manipular (`loadCart()`)
- Guardar siempre después de cambios (`saveCart()`)

### Estilos Base
- Gradiente morado: `135deg, #667eea 0%, #764ba2`
- Bordes redondeados: 15-20px
- Sombras: `0 10px 30px rgba(0, 0, 0, 0.2)`
- Transiciones 0.3s ease en interactivos

## Puntos de Extensión Frecuentes

- **Agregar productos:** Editar array `products[]` en script.js
- **Cambiar talles/colores:** Actualizar arrays `sizes[]` y `colors[]` en AMBOS archivos
- **Modificar mensaje WhatsApp:** Editar template en `sendToWhatsApp()`
- **Número WhatsApp:** Variable `whatsappNumber` en script.js línea ~350

## Dependencias
- Vanilla JS (ES6+), sin librerías externas
- CSS Grid para catálogo
- localStorage API para persistencia
- WhatsApp Web API (`wa.me` URL scheme)

---

**Nota:** Este es un proyecto de producción simple. Al agregar features, mantener sincronización entre `script.js` y `cart.js` para talles/colores.
