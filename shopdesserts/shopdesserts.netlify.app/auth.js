// 1. TỰ ĐỘNG KHỞI TẠO TÀI KHOẢN ADMIN
(function setupAdminAccount() {
    let users = JSON.parse(localStorage.getItem('usersList')) || [];
    if (!users.find(u => u.username === 'admin')) {
        users.push({
            id: 9999,
            username: 'admin',
            password: '123',
            role: 'admin'
        });
        localStorage.setItem('usersList', JSON.stringify(users));
    }
})();

// 2. CHUYỂN ĐỔI FORM
window.toggleAuth = () => {
    document.getElementById('login-form').classList.toggle('hide');
    document.getElementById('register-form').classList.toggle('hide');
};

// 3. HÀM ĐĂNG NHẬP (Sửa lại phần điều hướng)
window.handleLogin = () => {
    const userInp = document.getElementById('login-user').value.trim();
    const passInp = document.getElementById('login-pass').value.trim();

    let users = JSON.parse(localStorage.getItem('usersList')) || [];
    const found = users.find(u => u.username === userInp && u.password === passInp);

    if (found) {
        localStorage.setItem('currentUser', JSON.stringify({
            id: found.id,
            username: found.username,
            role: found.role || 'user'
        }));
        alert("Đăng nhập thành công!");
        window.location.href = 'index.html'; // LUÔN VỀ INDEX
    } else {
        alert("Sai tài khoản hoặc mật khẩu!");
    }
};

// 4. HÀM ĐĂNG KÝ
window.handleRegister = () => {
    const userInp = document.getElementById('reg-user').value.trim();
    const passInp = document.getElementById('reg-pass').value.trim();
    const confirmInp = document.getElementById('reg-confirm').value.trim();

    if (!userInp || !passInp || passInp !== confirmInp) {
        alert("Thông tin không hợp lệ hoặc mật khẩu không khớp!");
        return;
    }

    let users = JSON.parse(localStorage.getItem('usersList')) || [];
    if (users.find(u => u.username === userInp)) {
        alert("Tài khoản đã tồn tại!");
        return;
    }

    users.push({ id: Date.now(), username: userInp, password: passInp, role: 'user' });
    localStorage.setItem('usersList', JSON.stringify(users));
    alert("Đăng ký thành công!");
    toggleAuth();
};