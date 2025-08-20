document.addEventListener("DOMContentLoaded", () => {
  const dropdownBtn = document.getElementById("dropdownBtn");
    const dropdownMenu = document.getElementById("dropdownMenu");
  
    if (dropdownBtn && dropdownMenu) {
      dropdownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isVisible = dropdownMenu.style.display === "block";
        dropdownMenu.style.display = isVisible ? "none" : "block";
        dropdownBtn.setAttribute("aria-expanded", !isVisible);
      });
  
      dropdownMenu.querySelectorAll(".dropdown-item").forEach((item) => {
        item.addEventListener("click", () => {
          const link = item.getAttribute("data-link");
          if (link) {
            window.location.href = link;
          }
        });
      });
    }
  
    const button = document.getElementById("teacher");
    let dropdown = null;
  
    if (button) {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
  
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
  
        a.addEventListener("click", (e) => {
          e.stopPropagation();
        });
        li.appendChild(a);
        dropdown.appendChild(li);
  
        document.body.appendChild(dropdown);
        button.setAttribute("aria-expanded", "true");
      });
    }
  
    document.addEventListener("click", () => {
      if (dropdownMenu) {
        dropdownMenu.style.display = "none";
        dropdownBtn?.setAttribute("aria-expanded", "false");
      }
      if (dropdown) {
        dropdown.remove();
        dropdown = null;
        button?.setAttribute("aria-expanded", "false");
      }
    });
  
    const pageLinks = document.querySelectorAll(".page-link");
  
    pageLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        if (link.textContent === "◀" || link.textContent === "▶") return;
  
        pageLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      });
    });
  
    const classSelect = document.getElementById("classSelect");
    const tableBody = document.querySelector(".tb tbody");
  
    function fetchAndRenderTable(classRoomName) {
      fetch("/classroom/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classRoomName: classRoomName }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          updateTable(data);
        })
        .catch((error) => {
          console.error("Error:", error);
          strengthenSSRTable();
        });
    }
  
    if (classSelect) {
      const initialClass = classSelect.options[classSelect.selectedIndex].text;
      fetchAndRenderTable(initialClass);
  
      classSelect.addEventListener("change", () => {
        const selectedValue =
          classSelect.options[classSelect.selectedIndex].text;
        fetchAndRenderTable(selectedValue);
      });
    } else {
      strengthenSSRTable();
    }
  
    function updateTable(students) {
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
        studentNameCell.textContent = student.studentName;
  
        const classNameCell = document.createElement("td");
        classNameCell.className = "class-name";
        classNameCell.textContent = student.classRoomName;
  
        const attendanceCell = document.createElement("td");
        const select = document.createElement("select");
        select.style.width = "70px";
        select.style.padding = "3px 10px";
  
        const presentOption = document.createElement("option");
        presentOption.value = "출석";
        presentOption.text = "출석";
  
        const absentOption = document.createElement("option");
        absentOption.value = "미출석";
        absentOption.text = "미출석";
  
        select.appendChild(presentOption);
        select.appendChild(absentOption);
  
        if (student.attendance === "PRESENT") {
          presentOption.selected = true;
        } else if (student.attendance === "ABSENT") {
          absentOption.selected = true;
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
            Present.value = "출석";
            Present.text = "출석";
  
            const Absent = document.createElement("option");
            Absent.value = "미출석";
            Absent.text = "미출석";
  
            select.appendChild(Default);
            select.appendChild(Present);
            select.appendChild(Absent);
  
            td.appendChild(select);
          }
        }
      });
    }
  });