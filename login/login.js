function initLoginPage() {
  const loginForm = document.querySelector("form");
  const logoutButton = document.getElementById("logoutButton");

  if (!loginForm || !logoutButton) return;

  // 로그인 상태 확인
  const hasToken = !!localStorage.getItem("token");
  hasToken ? showLogout() : showLogin();

  // 로그인
  window.handleLogin = async function (e) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const publicId = formData.get("userid")?.trim();
    const password = formData.get("password")?.trim();

    if (!publicId || !password) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return false;
    }

    const url = "http://localhost:8080/auth/login";
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          userAgent: "Web-" + navigator.userAgent,
        },
        body: JSON.stringify({ publicId, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `서버 응답 오류: ${res.status}`);
      }

      const data = await res.json();

      if (data?.success && data?.token) {
        localStorage.setItem("token", data.token);
        alert(`환영합니다, ${publicId}님`);
        showLogout();
      } else {
        alert("로그인 실패: " + (data?.message || "토큰이 없습니다."));
      }
    } catch (err) {
      console.error("로그인 오류:", err);
      alert("서버에 연결할 수 없습니다. 설정을 확인하세요.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }

    return false; // form 제출 막기
  };

  // 로그아웃
  window.handleLogout = function () {
    localStorage.removeItem("token");
    alert("로그아웃 되었습니다.");
    showLogin();
  };

  function showLogout() {
    loginForm.style.display = "none";
    logoutButton.style.display = "inline-block";
  }
  function showLogin() {
    loginForm.style.display = "block";
    logoutButton.style.display = "none";
  }
}

// 초기 실행
initLoginPage();
