document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.querySelector("form");

  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const publicId = document.getElementById("userid").value.trim();
    const password = document.getElementById("password").value.trim();
    const studentNumber = parseInt(
      document.getElementById("student").value.trim(),
      10
    );
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!publicId || !password || isNaN(studentNumber) || !name || !email) {
      alert("모든 항목을 올바르게 입력해주세요.");
      return;
    }

    fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentNumber: studentNumber,
        name: name,
        publicId: publicId,
        password: password,
        email: email,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text || "서버 오류가 발생했습니다.");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          alert("회원가입 성공");
          window.location.href = "../login/login.html";
        } else {
          alert("회원가입 실패: " + (data.message || "알 수 없는 오류"));
        }
      })
      .catch((error) => {
        console.error("회원가입 오류:", error);
        alert(
          "회원가입 오류: " + (error.message || "서버에 연결할 수 없습니다.")
        );
      });
  });
});
