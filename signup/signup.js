document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.querySelector('form');

  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const publicId = document.getElementById('userid').value.trim();
    const password = document.getElementById('password').value.trim();
    const studentNumber = parseInt(document.getElementById('student').value.trim(), 10);
    const email = document.getElementById('email').value.trim();
    const club = document.getElementById('room').value.trim();

    if (!publicId || !password || Number.isNaN(studentNumber) || !email || !club) {
      alert('학생번호/아이디/비밀번호/이메일/실이름(동아리)를 모두 입력해주세요.');
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentNumber,
          publicId,
          password,
          email,
          club,
        }),
      });

      const raw = await res.text();
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch {}

      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || raw || '서버 오류가 발생했습니다.';
        throw new Error(msg);
      }

      if (data?.success) {
        alert('회원가입 성공');
        window.location.href = '../login/login.html';
      } else {
        const msg = (data && (data.message || '알 수 없는 오류')) || '알 수 없는 오류';
        alert('회원가입 실패: ' + msg);
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      alert('회원가입 오류: ' + (err.message || '서버에 연결할 수 없습니다.'));
    }
  });
});