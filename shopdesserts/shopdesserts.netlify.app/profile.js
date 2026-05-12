document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra trạng thái đăng nhập
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        alert("Vui lòng đăng nhập để xem trang này!");
        window.location.href = 'auth.html';
        return;
    }

    // 2. Hiển thị thông tin cơ bản
    document.getElementById('profile-name').innerText = currentUser.username;
    document.getElementById('profile-id').innerText = `ID: #${currentUser.id}`;
    document.getElementById('profile-role').innerText = currentUser.role === 'admin' ? 'Quản trị viên' : 'Khách hàng';
    document.getElementById('user-initial').innerText = currentUser.username.charAt(0).toUpperCase();

    // 3. Hiển thị Email và SDT (Xử lý thông báo "Chưa bổ sung")
    const emailText = document.getElementById('display-email');
    const phoneText = document.getElementById('display-phone');

    if (currentUser.email) {
        emailText.innerText = currentUser.email;
        emailText.style.color = "#260f08";
        emailText.style.fontStyle = "normal";
    } else {
        emailText.innerText = "Khách hàng chưa bổ sung email";
        emailText.style.color = "#b89187";
        emailText.style.fontStyle = "italic";
    }

    if (currentUser.phone) {
        phoneText.innerText = currentUser.phone;
        phoneText.style.color = "#260f08";
        phoneText.style.fontStyle = "normal";
    } else {
        phoneText.innerText = "Khách hàng chưa bổ sung SĐT";
        phoneText.style.color = "#b89187";
        phoneText.style.fontStyle = "italic";
    }

    // Đổ dữ liệu cũ vào ô input để chỉnh sửa
    document.getElementById('input-email').value = currentUser.email || '';
    document.getElementById('input-phone').value = currentUser.phone || '';

    // 4. Render danh sách đơn hàng
    renderUserOrders(currentUser.id);
});

// HÀM LƯU THÔNG TIN (Email & SĐT)
window.saveProfileInfo = () => {
    const newEmail = document.getElementById('input-email').value.trim();
    const newPhone = document.getElementById('input-phone').value.trim();

    if (!newEmail || !newPhone) {
        alert("Vui lòng điền đầy đủ cả Email và Số điện thoại!");
        return;
    }

    const storage = sessionStorage.getItem('currentUser') ? sessionStorage : localStorage;
    let currentUser = JSON.parse(storage.getItem('currentUser'));

    currentUser.email = newEmail;
    currentUser.phone = newPhone;
    storage.setItem('currentUser', JSON.stringify(currentUser));

    let users = JSON.parse(localStorage.getItem('usersList')) || [];
    const index = users.findIndex(u => String(u.id) === String(currentUser.id));
    if (index !== -1) {
        users[index].email = newEmail;
        users[index].phone = newPhone;
        localStorage.setItem('usersList', JSON.stringify(users));
        alert("Cập nhật thông tin thành công!");
        location.reload();
    }
};

// HÀM ĐỔI MẬT KHẨU
window.changePassword = () => {
    const oldPass = document.getElementById('old-pass').value;
    const newPass = document.getElementById('new-pass').value;
    const confirmNewPass = document.getElementById('confirm-new-pass').value;

    if (!oldPass || !newPass || !confirmNewPass) {
        alert("Vui lòng nhập đầy đủ các trường mật khẩu!");
        return;
    }

    if (newPass !== confirmNewPass) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    const storage = sessionStorage.getItem('currentUser') ? sessionStorage : localStorage;
    let currentUser = JSON.parse(storage.getItem('currentUser'));
    let users = JSON.parse(localStorage.getItem('usersList')) || [];
    const index = users.findIndex(u => String(u.id) === String(currentUser.id));

    if (index !== -1) {
        if (users[index].password !== oldPass) {
            alert("Mật khẩu cũ không chính xác!");
            return;
        }

        users[index].password = newPass;
        localStorage.setItem('usersList', JSON.stringify(users));
        alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");

        // Đăng xuất để bảo mật
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
    }
};

// HÀM HIỂN THỊ ĐƠN HÀNG
function renderUserOrders(userId) {
    const allOrders = JSON.parse(localStorage.getItem('orderHistory')) || [];
    const myOrders = allOrders.filter(order => String(order.userId) === String(userId));
    const container = document.getElementById('personal-orders');

    if (myOrders.length === 0) {
        container.innerHTML = `<p style="text-align:center; color: #87635a; margin-top: 20px;">Bạn chưa có đơn hàng nào.</p>`;
        return;
    }

    container.innerHTML = myOrders.reverse().map(order => `
        <div class="order-item">
            <div class="order-header">
                <span>Mã đơn: ${order.orderId}</span>
                <span style="color: #c73a0f;">$${order.total.toFixed(2)}</span>
            </div>
            <div style="font-size: 13px; color: #87635a; margin-bottom: 10px;">Ngày đặt: ${order.date}</div>
            <div class="order-details">
                ${order.items.map(item => `
                    <div style="font-size: 14px; margin-bottom: 5px; display: flex; justify-content: space-between;">
                        <span>${item.qty}x ${item.name}</span>
                        <span>$${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// HÀM ĐĂNG XUẤT
window.handleLogout = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
    }
};