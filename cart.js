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
    
    if (cart.length === 0) {
        cartContent.innerHTML = '<p class="empty-cart">El carrito está vacío</p>';
        sendButton.disabled = true;
        return;
    }
    
    sendButton.disabled = false;
    
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
    
    // Agrupar por producto y color
    const grouped = {};
    cart.forEach(item => {
        const key = `${item.productName} - ${item.colorName}`;
        if (!grouped[key]) {
            grouped[key] = {};
        }
        if (!grouped[key][item.size]) {
            grouped[key][item.size] = 0;
        }
        grouped[key][item.size] += item.quantity;
    });
    
    let message = `🦆 *PEDIDO - LOS 2 PATITOS* 🦆\n\n`;
    message += `*DETALLE DEL PEDIDO:*\n\n`;
    
    Object.keys(grouped).forEach(productKey => {
        message += `*${productKey}*\n`;
        const sizes = grouped[productKey];
        Object.keys(sizes).sort((a, b) => parseInt(a) - parseInt(b)).forEach(size => {
            message += `  Talle ${size}: ${sizes[size]} unidad(es)\n`;
        });
        message += `\n`;
    });
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    message += `*TOTAL: ${totalItems} unidad(es)*\n\n`;
    message += `Gracias por tu pedido! 🛍️`;
    
    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Número de WhatsApp (cambiar por el número real)
    const whatsappNumber = "5491112345678"; // Formato: código país + número sin espacios ni guiones
    
    // Abrir WhatsApp
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
}

// Event listeners
document.getElementById('sendWhatsApp').addEventListener('click', sendToWhatsApp);

// Cargar carrito al iniciar
updateCart();

