function handleSignup(e) {
  e.preventDefault(); // 기본 제출 방지

  const formData = new FormData(e.currentTarget); // FormData 사용
  const data = Object.fromEntries(formData.entries()); // formData를 사용하여 form입력값을 한 번에 가져옴
  if (
    !data.userid ||
    !data.password ||
    !data.student ||
    !data.name ||
    !data.email
  ) {
    alert("모든 항목을 올바르게 입력해주세요.");
    return;
  }

  fetch("http://localhost:8080/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(text || "서버 오류가 발생했습니다.");
        });
      }
      return response.json();
    })
    .then((result) => {
      if (result.success) {
        alert("회원가입 성공");
        window.location.href = "../login/login.html";
      } else {
        alert("회원가입 실패: " + (result.message || "알 수 없는 오류"));
      }
    })
    .catch((err) => {
      console.error("회원가입 오류:", err);
      alert("회원가입 오류: " + (err.message || "서버에 연결할 수 없습니다."));
    });
}
