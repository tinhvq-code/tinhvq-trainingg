document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // 1. Kiểm tra quyền Admin
    if (!currentUser || currentUser.role !== 'admin') {
        alert("Bạn không có quyền truy cập trang này!");
        window.location.href = 'index.html';
        return;
    }

    // Khởi chạy hiển thị dữ liệu
    renderAllOrders();
    renderAdminProducts();

    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const products = JSON.parse(localStorage.getItem('productsList')) || [];

            const editIndexRaw = productForm.dataset.editIndex;
            const isEditing = editIndexRaw !== undefined;

            const name = document.getElementById('p-name').value;
            const category = document.getElementById('p-category').value;
            const price = parseFloat(document.getElementById('p-price').value);
            const imageUrl = document.getElementById('p-image').value;

            const productData = {
                id: isEditing ? products[Number(editIndexRaw)].id : Date.now(),
                name: name,
                category: category,
                price: price,
                image: {
                    thumbnail: imageUrl,
                    mobile: imageUrl,
                    tablet: imageUrl,
                    desktop: imageUrl
                }
            };

            if (isEditing) {
                products[Number(editIndexRaw)] = productData;
                delete productForm.dataset.editIndex;
                alert("Cập nhật sản phẩm thành công!");

                const submitBtn = productForm.querySelector('button');
                submitBtn.innerText = "Lưu sản phẩm";
                submitBtn.style.background = "#1ea475";
            } else {
                products.push(productData);
                alert("Thêm sản phẩm thành công!");
            }

            localStorage.setItem('productsList', JSON.stringify(products));
            productForm.reset();
            renderAdminProducts();
        });
    }
});

// --- CÁC HÀM PHẢI KHAI BÁO NGOÀI DOMContentLoaded ĐỂ WINDOW CÓ THỂ GỌI ---

function renderAllOrders() {
    const allOrders = JSON.parse(localStorage.getItem('orderHistory')) || [];
    const allUsers = JSON.parse(localStorage.getItem('usersList')) || [];
    const listBody = document.getElementById('all-orders-list');

    if (!listBody) return;
    if (allOrders.length === 0) {
        listBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Chưa có đơn hàng nào.</td></tr>';
        return;
    }

    listBody.innerHTML = allOrders.map(order => {
        const user = allUsers.find(u => String(u.id) === String(order.userId));
        const username = user ? user.username : "Khách ẩn";
        const email = (user && user.email) ? user.email : "Chưa cập nhật";
        const phone = (user && user.phone) ? user.phone : "Chưa cập nhật";

        return `
            <tr>
                <td style="padding: 12px; border: 1px solid #eee;">
                    <strong>${username}</strong><br>
                    <small>${email}</small><br>
                    <small>${phone}</small>
                </td>
                <td style="padding: 12px; border: 1px solid #eee;">${order.orderId}</td>
                <td style="padding: 12px; border: 1px solid #eee;">${order.date}</td>
                <td style="padding: 12px; border: 1px solid #eee;">${order.items.map(i => `${i.name} (x${i.qty})`).join('<br>')}</td>
                <td style="padding: 12px; border: 1px solid #eee; color: #c73a0f; font-weight: bold;">$${order.total.toFixed(2)}</td>
            </tr>`;
    }).join('');
}

function renderAdminProducts() {
    const products = JSON.parse(localStorage.getItem('productsList')) || [];
    const productBody = document.getElementById('admin-product-list');

    if (!productBody) return;
    if (products.length === 0) {
        productBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Kho hàng trống.</td></tr>';
        return;
    }

    productBody.innerHTML = products.map((p, index) => {
        const imgSrc = (p.image && typeof p.image === 'object') ? p.image.thumbnail : p.image;
        return `
            <tr>
                <td style="padding: 12px; border: 1px solid #eee; text-align: center;">
                    <img src="${imgSrc}" width="50" height="50" style="object-fit: cover; border-radius: 5px;" onerror="this.src='https://via.placeholder.com/50'">
                </td>
                <td style="padding: 12px; border: 1px solid #eee;">${p.name}</td>
                <td style="padding: 12px; border: 1px solid #eee; font-weight: bold;">$${p.price.toFixed(2)}</td>
                <td style="padding: 12px; border: 1px solid #eee; text-align: center;">
                    <button onclick="editProduct(${index})" style="background: #2196F3; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer;">Sửa</button>
                    <button onclick="deleteProduct(${index})" style="background: #c73a0f; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer;">Xóa</button>
                </td>
            </tr>`;
    }).join('');
}

window.editProduct = (index) => {
    const products = JSON.parse(localStorage.getItem('productsList')) || [];
    const p = products[index];
    const productForm = document.getElementById('product-form');
    if (!p) return;

    document.getElementById('p-name').value = p.name;
    document.getElementById('p-category').value = p.category;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-image').value = (typeof p.image === 'object' ? p.image.desktop : p.image);

    productForm.dataset.editIndex = index;
    const btn = productForm.querySelector('button');
    btn.innerText = "Cập nhật sản phẩm";
    btn.style.background = "#2196F3";
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteProduct = (index) => {
    if (confirm("Xóa sản phẩm này?")) {
        let products = JSON.parse(localStorage.getItem('productsList')) || [];
        products.splice(index, 1);
        localStorage.setItem('productsList', JSON.stringify(products));
        renderAdminProducts();
    }
};