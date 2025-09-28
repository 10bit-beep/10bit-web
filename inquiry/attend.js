let dropdown = null;

function toggleDropdown(e) {
  e.stopPropagation();
  const dropdownBtn = document.getElementById("dropdownBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const isVisible = dropdownMenu.style.display === "block";
  dropdownMenu.style.display = isVisible ? "none" : "block";
  dropdownBtn.setAttribute("aria-expanded", !isVisible);
}

function goToLink(item) {
  const link = item.getAttribute("data-link");
  if (link) window.location.href = link;
}

function toggleTeacherDropdown(e) {
  e.stopPropagation();
  const button = document.getElementById("teacher");

  if (dropdown) {
    dropdown.remove();
    dropdown = null;
    button.setAttribute("aria-expanded", "false");
    return;
  }

  dropdown = document.createElement("ul");
  dropdown.classList.add("dropdown", "teacher-dropdown");
  dropdown.style.position = "absolute";
  dropdown.style.top = `${button.offsetTop + button.offsetHeight}px`;
  dropdown.style.left = `${button.offsetLeft - 10}px`;
  dropdown.style.backgroundColor = "#fff";
  dropdown.style.border = "1px solid #ccc";
  dropdown.style.padding = "10px";
  dropdown.style.margin = "0";
  dropdown.style.listStyle = "none";
  dropdown.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
  dropdown.style.width = "120px";
  dropdown.style.zIndex = "1000";

  const li = document.createElement("li");
  const a = document.createElement("a");
  a.textContent = "로그아웃하기";
  a.href = "../main/main.html";
  a.style.textDecoration = "none";
  a.style.backgroundColor = "#ffff";
  a.style.color = "#ef5350";
  a.style.padding = "10px 22px";
  a.style.borderRadius = "8px";
  a.style.boxSizing = "border-box";
  a.style.textAlign = "center";
  a.style.fontWeight = "bold";
  a.style.fontSize = "14px";

  a.addEventListener("click", (e) => e.stopPropagation());
  li.appendChild(a);
  dropdown.appendChild(li);

  document.body.appendChild(dropdown);
  button.setAttribute("aria-expanded", "true");
}

// body에 연결된 전역 클릭
function handleDocumentClick() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  const dropdownBtn = document.getElementById("dropdownBtn");
  const button = document.getElementById("teacher");

  if (dropdownMenu) {
    dropdownMenu.style.display = "none";
    dropdownBtn?.setAttribute("aria-expanded", "false");
  }
  if (dropdown) {
    dropdown.remove();
    dropdown = null;
    button?.setAttribute("aria-expanded", "false");
  }
}

function changePage(e, link) {
  e.preventDefault();
  if (link.textContent === "◀" || link.textContent === "▶") return;
  document
    .querySelectorAll(".page-link")
    .forEach((l) => l.classList.remove("active"));
  link.classList.add("active");
}

function onClassChange() {
  const classSelect = document.getElementById("classSelect");
  const selectedValue = classSelect.value;
  fetchAndRenderTable(selectedValue);
}

let tableBody = null;

document.addEventListener("DOMContentLoaded", () => {
  tableBody = document.querySelector(".tb tbody");

  const classSelect = document.getElementById("classSelect");
  if (classSelect) {
    const initialClass = classSelect.value;
    fetchAndRenderTable(initialClass);
  } else {
    strengthenSSRTable();
  }
});

function fetchAndRenderTable(userClass) {
  const token = localStorage.getItem("token");
  fetch("/classroom/lookup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: JSON.stringify({ userClass }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      const students = Array.isArray(data)
        ? data
        : (data && (data.students || data.data)) || [];
      updateTable(students);
    })

    .catch((error) => {
      console.error("Error:", error);
      strengthenSSRTable();
    });
}

function updateTable(students) {
  if (!tableBody) {
    tableBody = document.querySelector(".tb tbody");
    if (!tableBody) return;
  }
  tableBody.innerHTML = "";

  if (!Array.isArray(students)) {
    console.error("Invalid data format: Expected an array.");
    return;
  }

  students.forEach((student) => {
    const row = document.createElement("tr");

    const studentNumberCell = document.createElement("td");
    studentNumberCell.textContent = student.studentNumber;

    const studentNameCell = document.createElement("td");
    studentNameCell.textContent = student.studentName ?? "—";

    const classNameCell = document.createElement("td");
    classNameCell.className = "class-name";
    classNameCell.textContent = student.userClass;

    const attendanceCell = document.createElement("td");
    const select = document.createElement("select");
    select.style.width = "70px";
    select.style.padding = "3px 10px";

    const presentOption = document.createElement("option");
    presentOption.value = "PRESENT";
    presentOption.text = "출석";

    const absentOption = document.createElement("option");
    absentOption.value = "ABSENT";
    absentOption.text = "미출석";

    select.appendChild(presentOption);
    select.appendChild(absentOption);

    if (student.attendance === "PRESENT") {
      select.value = "PRESENT";
    } else if (student.attendance === "ABSENT") {
      select.value = "ABSENT";
    }

    attendanceCell.appendChild(select);

    row.appendChild(studentNumberCell);
    row.appendChild(studentNameCell);
    row.appendChild(classNameCell);
    row.appendChild(attendanceCell);

    tableBody.appendChild(row);
  });
}

function strengthenSSRTable() {
  const tbodyTds = document.querySelectorAll(".tb tbody td");

  tbodyTds.forEach((td) => {
    if (td.textContent.trim() === "") {
      const parentRow = td.parentElement;
      const attendanceTd = parentRow.querySelector("td:nth-child(4)");

      if (td === attendanceTd) {
        const select = document.createElement("select");
        select.style.width = "70px";
        select.style.padding = "3px 10px";

        const Default = document.createElement("option");
        Default.value = "";
        Default.text = "선택";
        Default.disabled = true;
        Default.selected = true;

        const Present = document.createElement("option");
        Present.value = "PRESENT";
        Present.text = "출석";

        const Absent = document.createElement("option");
        Absent.value = "ABSENT";
        Absent.text = "미출석";

        select.appendChild(Default);
        select.appendChild(Present);
        select.appendChild(Absent);

        td.appendChild(select);
      }
    }
  });
}
