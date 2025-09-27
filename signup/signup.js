async function handleSignup(e) {
  e.preventDefault();

  const form = e.currentTarget;
  const formData = new FormData(form);

  const publicId = formData.get("userid")?.trim();
  const password = formData.get("password")?.trim();
  const studentNumber = parseInt(formData.get("student")?.trim(), 10);
  const email = formData.get("email")?.trim();
  const club = formData.get("room")?.trim();

  if (
    !publicId ||
    !password ||
    Number.isNaN(studentNumber) ||
    !email ||
    !club
  ) {
    alert(
      "학생번호/아이디/비밀번호/이메일/실이름(동아리)를 모두 입력해주세요."
    );
    return false; // form submit 막기
  }

  try {
    const res = await fetch("http://localhost:8080/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {}

    if (!res.ok) {
      const msg =
        (data && (data.message || data.error)) ||
        raw ||
        "서버 오류가 발생했습니다.";
      throw new Error(msg);
    }

    if (data?.success) {
      alert("회원가입 성공");
      window.location.href = "../signup/signup.html";
    } else {
      const msg =
        (data && (data.message || "알 수 없는 오류")) || "알 수 없는 오류";
      alert("회원가입 실패: " + msg);
    }
  } catch (err) {
    console.error("회원가입 오류:", err);
    alert("회원가입 오류: " + (err.message || "서버에 연결할 수 없습니다."));
  }

  return false; // submit 막기
}
