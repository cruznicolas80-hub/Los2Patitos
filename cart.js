const colors = [
    { name: "Rojo", value: "rojo", hex: "#CC0000" },
    { name: "Azul Marino", value: "azul-marino", hex: "#0A2342" },
    { name: "Gris", value: "gris", hex: "#808080" }
];

const sizes = [4, 6, 8, 10, 12, 14, 16];
const WHATSAPP_NUMBER = "5491162883441";

// Cargar carrito desde localStorage
function loadCart() {
    const cartData = localStorage.getItem('cart');
    try {
        return cartData ? JSON.parse(cartData) : [];
    } catch (e) {
        return [];
    }
}

// Guardar carrito en localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Helper: Agrupar productos por ID -> Talle -> Color (valor)
function groupCartByProduct(cart) {
    const productsGrouped = {};
    cart.forEach(item => {
        if (!productsGrouped[item.productId]) {
            productsGrouped[item.productId] = {
                productName: item.productName,
                data: {} // [size][colorValue] = quantity
            };
        }
        if (!productsGrouped[item.productId].data[item.size]) {
            productsGrouped[item.productId].data[item.size] = {};
        }
        const colorKey = item.color; // Usamos el valor (ej: 'azul') para consistencia interna
        productsGrouped[item.productId].data[item.size][colorKey] = (productsGrouped[item.productId].data[item.size][colorKey] || 0) + item.quantity;
    });
    return productsGrouped;
}

// Actualizar el carrito
function updateCart() {
    const cart = loadCart();
    const cartContent = document.getElementById('cartContent');
    const sendButton = document.getElementById('sendWhatsApp');

    if (cart.length === 0) {
        cartContent.innerHTML = '<p class="empty-cart">El carrito está vacío</p>';
        sendButton.disabled = true;
        return;
    }

    sendButton.disabled = false;

    // Agrupar por producto
    const productsGrouped = groupCartByProduct(cart);

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
                const quantity = (product.data[size] && product.data[size][color.value]) || 0;
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

    // Obtener nombre del cliente
    const customerName = document.getElementById('customerName').value.trim();
    if (!customerName) {
        alert('Por favor ingresa tu nombre antes de enviar el pedido.');
        document.getElementById('customerName').focus();
        return;
    }

    // Crear tabla estructurada para WhatsApp
    let message = `🦆 *PEDIDO - LOS 2 PATITOS* 🦆\n\n`;
    message += `*Cliente: ${customerName}*\n`;
    message += `*Fecha: ${new Date().toLocaleDateString('es-ES')}*\n\n`;
    message += `*DETALLE DEL PEDIDO:*\n\n`;

    // Crear tabla por producto
    const productsGrouped = groupCartByProduct(cart);

    Object.keys(productsGrouped).forEach(productId => {
        const product = productsGrouped[productId];
        message += `*${product.productName}*\n`;

        // Crear tabla ASCII para cada producto
        const sizes = Object.keys(product.data).sort((a, b) => parseInt(a) - parseInt(b));
        const colors = [...new Set(sizes.flatMap(size => Object.keys(product.data[size])))].sort();
        // Obtener claves de color (values) presentes en este producto
        const productColorKeys = [...new Set(sizes.flatMap(size => Object.keys(product.data[size])))].sort();
        
        // Función auxiliar para obtener el nombre visual del color (ej: 'azul' -> 'Azul')
        const getColorName = (val) => (colors.find(c => c.value === val) || {}).name || val;

        // Encabezado de tabla
        message += `┌─────┬${colors.map(() => '────────────').join('┬')}┐\n`;
        message += `│Talle│${colors.map(color => color.padEnd(12)).join('│')}│\n`;
        message += `├─────┼${colors.map(() => '────────────').join('┼')}┤\n`;
        message += `┌─────┬${productColorKeys.map(() => '────────────').join('┬')}┐\n`;
        message += `│Talle│${productColorKeys.map(key => getColorName(key).padEnd(12)).join('│')}│\n`;
        message += `├─────┼${productColorKeys.map(() => '────────────').join('┼')}┤\n`;

        // Filas de datos
        sizes.forEach(size => {
            const row = productColorKeys.map(key => {
                const qty = product.data[size][key] || 0;
                return qty.toString().padEnd(12);
            });
            message += `│${size.padEnd(5)}│${row.join('│')}│\n`;
        });

        message += `└─────┴${colors.map(() => '────────────').join('┴')}┘\n\n`;
        message += `└─────┴${productColorKeys.map(() => '────────────').join('┴')}┘\n\n`;
    });

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    message += `*TOTAL: ${totalItems} unidad(es)*\n\n`;
    message += `💡 *Para ver el pedido en Google Sheets, usa el botón "Enviar Google Sheets" arriba*\n\n`;
    message += `Gracias por tu pedido! 🛍️`;

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);

    // Abrir WhatsApp
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');

    // Vaciar carrito y volver al inicio
    setTimeout(() => {
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
    }, 1000);
}

function generateHTML(customerName = 'Cliente') {
    const cart = loadCart();
    if (cart.length === 0) return '';

    // Agrupar por producto como en la tabla del carrito
    const productsGrouped = groupCartByProduct(cart);

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
            <h1>🦆 Los 2 Patitos - Pedido de ${customerName} 🦆</h1>
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
                const quantity = (product.data[size] && product.data[size][color.value]) || 0;
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

function downloadHTML() {
    const cart = loadCart();
    if (cart.length === 0) {
        alert('El carrito está vacío. Agrega productos antes de descargar el HTML.');
        return;
    }

    // Obtener nombre del cliente (opcional)
    const customerName = document.getElementById('customerName').value.trim() || 'Cliente';

    // Generar HTML del pedido
    const htmlContent = generateHTML(customerName);

    // Crear blob con el HTML
    const htmlBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const htmlUrl = URL.createObjectURL(htmlBlob);

    // Crear enlace de descarga
    const downloadLink = document.createElement('a');
    downloadLink.href = htmlUrl;
    downloadLink.download = `pedido_los2patitos_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Liberar URL
    URL.revokeObjectURL(htmlUrl);

    // Mostrar mensaje de éxito
    alert('Archivo HTML descargado. Puedes compartirlo por WhatsApp o email.');

    // Vaciar carrito y volver al inicio
    setTimeout(() => {
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
    }, 1000);
}

function createGist(htmlContent, customerName) {
    const token = 'TU_TOKEN_DE_GITHUB_AQUI'; // Reemplaza con tu token personal de GitHub
    if (token === 'TU_TOKEN_DE_GITHUB_AQUI') {
        alert('Por favor configura tu token de GitHub en el código.');
        return;
    }

    const gistData = {
        description: `Pedido de ${customerName} - Los 2 Patitos`,
        public: true,
        files: {
            'pedido.html': {
                content: htmlContent
            }
        }
    };

    fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(gistData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.html_url) {
            // Abrir WhatsApp con el enlace del gist
            const message = `🦆 *PEDIDO - LOS 2 PATITOS* 🦆\n\nCliente: ${customerName}\n\n📄 *Enlace al pedido en HTML:* ${data.html_url}\n\nGracias por tu pedido!`;
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');

            // Vaciar carrito y volver al inicio
            setTimeout(() => {
                localStorage.removeItem('cart');
                window.location.href = 'index.html';
            }, 1000);
        } else {
            alert('Error al crear el gist. Revisa tu token de GitHub.');
        }
    })
};

window.addEventListener('load', () => {
    const sendBtn = document.getElementById('sendWhatsApp');
    const downloadHtmlBtn = document.getElementById('downloadHTML');
    
    if (sendBtn) sendBtn.addEventListener('click', sendToWhatsApp);
    if (downloadHtmlBtn) downloadHtmlBtn.addEventListener('click', downloadHTML);

    // Cargar carrito al iniciar
    updateCart();
});    