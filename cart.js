const colors = [
    { name: "Blanco", value: "blanco", hex: "#FFFFFF" },
    { name: "Azul", value: "azul", hex: "#0066CC" },
    { name: "Rojo", value: "rojo", hex: "#CC0000" }
];

const sizes = [4, 6, 8, 10, 12, 14, 16, 18];

// Cargar carrito desde localStorage
function loadCart() {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
}

// Guardar carrito en localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Actualizar el carrito
function updateCart() {
    const cart = loadCart();
    const cartContent = document.getElementById('cartContent');
    const sendButton = document.getElementById('sendWhatsApp');
    const downloadButton = document.getElementById('downloadCSV');

    if (cart.length === 0) {
        cartContent.innerHTML = '<p class="empty-cart">El carrito está vacío</p>';
        sendButton.disabled = true;
        downloadButton.disabled = true;
        return;
    }

    sendButton.disabled = false;
    downloadButton.disabled = false;

    // Agrupar por producto
    const productsGrouped = {};
    cart.forEach(item => {
        if (!productsGrouped[item.productId]) {
            productsGrouped[item.productId] = {
                productName: item.productName,
                data: {} // [size][color] = quantity
            };
        }
        if (!productsGrouped[item.productId].data[item.size]) {
            productsGrouped[item.productId].data[item.size] = {};
        }
        if (!productsGrouped[item.productId].data[item.size][item.color]) {
            productsGrouped[item.productId].data[item.size][item.color] = 0;
        }
        productsGrouped[item.productId].data[item.size][item.color] += item.quantity;
    });

    let html = '<div class="cart-tables-container">';
    
    Object.keys(productsGrouped).forEach(productId => {
        const product = productsGrouped[productId];
        
        html += `
            <div class="cart-product-table-wrapper">
                <div class="cart-product-header">
                    <h3>${product.productName}</h3>
                    <button class="remove-product-btn" onclick="removeProduct(${productId})">✕ Eliminar Producto</button>
                </div>
                <div class="cart-table-wrapper">
                    <table class="cart-size-color-table">
                        <thead>
                            <tr>
                                <th>Talle</th>
                                ${colors.map(color => `<th>${color.name}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        sizes.forEach(size => {
            html += `<tr><td class="size-cell"><strong>${size}</strong></td>`;
            colors.forEach(color => {
                const quantity = product.data[size] && product.data[size][color.value] ? product.data[size][color.value] : 0;
                if (quantity > 0) {
                    html += `<td class="quantity-cell has-quantity" onclick="removeSizeColor(${productId}, ${size}, '${color.value}')" title="Clic para eliminar">
                        ${quantity}
                    </td>`;
                } else {
                    html += `<td class="quantity-cell">-</td>`;
                }
            });
            html += `</tr>`;
        });
        
        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    cartContent.innerHTML = html;
}

function removeProduct(productId) {
    let cart = loadCart();
    cart = cart.filter(item => item.productId != productId);
    saveCart(cart);
    updateCart();
}

function removeSizeColor(productId, size, color) {
    let cart = loadCart();
    cart = cart.filter(item => !(item.productId == productId && item.size == size && item.color === color));
    saveCart(cart);
    updateCart();
}

function sendToWhatsApp() {
    const cart = loadCart();
    if (cart.length === 0) return;

    // Crear tabla estructurada para WhatsApp
    let message = `🦆 *PEDIDO - LOS 2 PATITOS* 🦆\n\n`;
    message += `*DETALLE DEL PEDIDO:*\n\n`;

    // Crear tabla por producto
    const productsGrouped = {};
    cart.forEach(item => {
        if (!productsGrouped[item.productId]) {
            productsGrouped[item.productId] = {
                productName: item.productName,
                data: {}
            };
        }
        if (!productsGrouped[item.productId].data[item.size]) {
            productsGrouped[item.productId].data[item.size] = {};
        }
        if (!productsGrouped[item.productId].data[item.size][item.colorName]) {
            productsGrouped[item.productId].data[item.size][item.colorName] = 0;
        }
        productsGrouped[item.productId].data[item.size][item.colorName] += item.quantity;
    });

    Object.keys(productsGrouped).forEach(productId => {
        const product = productsGrouped[productId];
        message += `*${product.productName}*\n`;

        // Crear tabla ASCII para cada producto
        const sizes = Object.keys(product.data).sort((a, b) => parseInt(a) - parseInt(b));
        const colors = [...new Set(sizes.flatMap(size => Object.keys(product.data[size])))].sort();

        // Encabezado de tabla
        message += `┌─────┬${colors.map(() => '────────────').join('┬')}┐\n`;
        message += `│Talle│${colors.map(color => color.padEnd(12)).join('│')}│\n`;
        message += `├─────┼${colors.map(() => '────────────').join('┼')}┤\n`;

        // Filas de datos
        sizes.forEach(size => {
            const row = colors.map(color => {
                const qty = product.data[size][color] || 0;
                return qty.toString().padEnd(12);
            });
            message += `│${size.padEnd(5)}│${row.join('│')}│\n`;
        });

        message += `└─────┴${colors.map(() => '────────────').join('┴')}┘\n\n`;
    });

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    message += `*TOTAL: ${totalItems} unidad(es)*\n\n`;
    message += `💡 *Para preparar el pedido más fácilmente, descarga el CSV desde el botón azul arriba*\n\n`;
    message += `Gracias por tu pedido! 🛍️`;

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);

    // Número de WhatsApp (cambiar por el número real)
    const whatsappNumber = "5491112345678"; // Formato: código país + número sin espacios ni guiones

    // Abrir WhatsApp
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
}

function generateHTML() {
    const cart = loadCart();
    if (cart.length === 0) return '';

    // Agrupar por producto como en la tabla del carrito
    const productsGrouped = {};
    cart.forEach(item => {
        if (!productsGrouped[item.productId]) {
            productsGrouped[item.productId] = {
                productName: item.productName,
                data: {}
            };
        }
        if (!productsGrouped[item.productId].data[item.size]) {
            productsGrouped[item.productId].data[item.size] = {};
        }
        if (!productsGrouped[item.productId].data[item.size][item.color]) {
            productsGrouped[item.productId].data[item.size][item.color] = 0;
        }
        productsGrouped[item.productId].data[item.size][item.color] += item.quantity;
    });

    // Generar HTML completo
    let html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedido - Los 2 Patitos</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            text-align: center;
        }
        .header h1 {
            color: #667eea;
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header .date {
            color: #666;
            font-size: 1.1em;
        }
        .cart-tables-container {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }
        .cart-product-table-wrapper {
            background: white;
            border-radius: 15px;
            padding: 20px;
            border: 1px solid #e0e0e0;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        }
        .cart-product-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #ddd;
        }
        .cart-product-header h3 {
            color: #333;
            font-size: 1.3em;
            margin: 0;
        }
        .cart-table-wrapper {
            overflow-x: auto;
        }
        .cart-size-color-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 10px;
            overflow: hidden;
        }
        .cart-size-color-table thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .cart-size-color-table th {
            padding: 15px;
            text-align: center;
            font-weight: bold;
        }
        .cart-size-color-table td {
            padding: 12px 8px;
            text-align: center;
            border-bottom: 1px solid #eee;
        }
        .size-cell {
            font-weight: bold;
            background: #f9f9f9;
        }
        .quantity-cell {
            font-weight: bold;
            font-size: 1.1em;
        }
        .quantity-cell.has-quantity {
            background: #e8f5e8;
            color: #2e7d32;
        }
        .total-section {
            background: white;
            border-radius: 15px;
            padding: 25px;
            margin-top: 30px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
            text-align: center;
        }
        .total-section h2 {
            color: #667eea;
            font-size: 2em;
            margin-bottom: 10px;
        }
        .print-button {
            background: #25D366;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 1.1em;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
        }
        .print-button:hover {
            background: #20BA5A;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .print-button {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🦆 Los 2 Patitos 🦆</h1>
            <p>Pedido de Indumentaria</p>
            <div class="date">Fecha: ${new Date().toLocaleDateString('es-ES')}</div>
        </div>

        <div class="cart-tables-container">
`;

    // Crear tabla por producto
    Object.keys(productsGrouped).forEach(productId => {
        const product = productsGrouped[productId];

        html += `
            <div class="cart-product-table-wrapper">
                <div class="cart-product-header">
                    <h3>${product.productName}</h3>
                </div>
                <div class="cart-table-wrapper">
                    <table class="cart-size-color-table">
                        <thead>
                            <tr>
                                <th>Talle</th>
                                ${colors.map(color => `<th>${color.name}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
`;

        sizes.forEach(size => {
            html += `<tr><td class="size-cell"><strong>${size}</strong></td>`;
            colors.forEach(color => {
                const quantity = product.data[size] && product.data[size][color.value] ? product.data[size][color.value] : 0;
                const cellClass = quantity > 0 ? 'quantity-cell has-quantity' : 'quantity-cell';
                html += `<td class="${cellClass}">${quantity > 0 ? quantity : '-'}</td>`;
            });
            html += `</tr>`;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
`;
    });

    // Total general
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    html += `
        </div>

        <div class="total-section">
            <h2>Total Unidades: ${totalItems}</h2>
            <button class="print-button" onclick="window.print()">🖨️ Imprimir Pedido</button>
        </div>
    </div>
</body>
</html>`;

    return html;
}

function downloadCSV() {
    const html = generateHTML();
    if (!html) return;

    // Abrir en nueva ventana
    const newWindow = window.open('', '_blank');
    newWindow.document.write(html);
    newWindow.document.close();
}

// Event listeners
document.getElementById('sendWhatsApp').addEventListener('click', sendToWhatsApp);
document.getElementById('downloadCSV').addEventListener('click', downloadCSV);

// Cargar carrito al iniciar
updateCart();

