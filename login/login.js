document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.querySelector('form');
  if (!loginForm) return;

  const container = loginForm.parentElement;
  if (!container) return;

  const logoutButton = document.createElement('button');
  logoutButton.textContent = '로그아웃';
  logoutButton.style.display = 'none';
  container.appendChild(logoutButton);

  const hasToken = !!localStorage.getItem('token');
  hasToken ? showLogout() : showLogin();

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const publicId = document.getElementById('userid').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!publicId || !password) {
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    const url = 'http://localhost:8080/auth/login';

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'userAgent': 'Web-' + navigator.userAgent
        },
        body: JSON.stringify({ publicId, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `서버 응답 오류: ${res.status}`);
      }

      const data = await res.json();

      if (data?.success && data?.token) {
        localStorage.setItem('token', data.token);
        alert(`환영합니다, ${publicId}님`);
        showLogout();

      } else {
        alert('로그인 실패: ' + (data?.message || '토큰이 없습니다.'));
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      alert('서버에 연결할 수 없습니다. 설정을 확인하세요.');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    alert('로그아웃 되었습니다.');
    showLogin();
  });

  function showLogout() {
    loginForm.style.display = 'none';
    logoutButton.style.display = 'inline-block';
  }
  function showLogin() {
    loginForm.style.display = 'block';
    logoutButton.style.display = 'none';
  }
});