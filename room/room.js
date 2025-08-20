document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'http://localhost:3000';
  const ENDPOINTS = {
    save: '/api/attendance',
    list: '/api/attendance/list' 
  };

  async function postJSON(url, payload) {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`POST ${url} 실패: ${res.status} ${text}`);
    }
    return res.json().catch(() => ({}));
  }

  async function getJSON(urlWithQuery) {
    const res = await fetch(`${API_BASE}${urlWithQuery}`);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`GET ${urlWithQuery} 실패: ${res.status} ${text}`);
    }
    return res.json();
  }

  const dropdownBtn = document.getElementById('dropdownBtn');
  const dropdownMenu = document.getElementById('dropdownMenu');

  dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = dropdownMenu.style.display === 'block';
    dropdownMenu.style.display = isVisible ? 'none' : 'block';
    dropdownBtn.setAttribute('aria-expanded', !isVisible);
  });

  dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const link = item.getAttribute('data-link');
      if (link) {
        window.location.href = link;
      }
    });
  });

  document.addEventListener('click', () => {
    dropdownMenu.style.display = 'none';
    dropdownBtn.setAttribute('aria-expanded', 'false');
  });

  const tbodyTds = document.querySelectorAll(".tb tbody td");

  tbodyTds.forEach(td => {
    if (td.textContent.trim() === "") {
      const parentRow = td.parentElement;
      const attendanceTd = parentRow.querySelector('td:nth-child(4)');

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

  const pageLinks = document.querySelectorAll('.page-link');

  pageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      if (link.textContent === '◀' || link.textContent === '▶') return;

      pageLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const page = parseInt(link.textContent, 10);
      if (!isNaN(page)) {
        loadList(page).catch(console.error);
      }
    });
  });

  function attachAttendanceChangeHandlers() {
    document.querySelectorAll(".tb tbody select").forEach(select => {
      if (select.dataset.binded === '1') return;
      select.dataset.binded = '1';

      select.addEventListener("change", async () => {
        const row = select.closest("tr");
        const studentId = (row.querySelector("td:nth-child(1)")?.textContent || "").trim();
        const name = (row.querySelector("td:nth-child(2)")?.textContent || "").trim();
        const lab = (row.querySelector("td:nth-child(3)")?.textContent || "").trim();
        const status = select.value; 

        if (!studentId || !lab || !status) {
          alert("학번/실/출석 값이 올바르지 않습니다.");
          return;
        }

        const oldDisabled = select.disabled;
        select.disabled = true;

        try {
          const payload = { studentId, name, lab, attendance: status };
          const result = await postJSON(ENDPOINTS.save, payload);
          if (result && result.message) {
            console.log("서버 응답:", result.message);
          }
          select.style.outline = "2px solid #4caf50";
          setTimeout(() => { select.style.outline = ""; }, 600);
        } catch (err) {
          console.error(err);
          alert("출석 저장에 실패했습니다. 네트워크 또는 서버 상태를 확인하세요.");
        } finally {
          select.disabled = oldDisabled;
        }
      });
    });
  }

  attachAttendanceChangeHandlers();

  const classSelect = document.getElementById('classSelect');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  function setupPagination(current, total) {
    const container = document.querySelector('.nextPage-container');
    if (!container) return;

    const links = Array.from(container.querySelectorAll('.page-link'));
    const first = links.find(a => a.textContent === '◀');
    const last  = links.find(a => a.textContent === '▶');

    links.forEach(a => {
      const n = parseInt(a.textContent, 10);
      if (!isNaN(n)) {
        a.classList.toggle('active', n === current);
        a.onclick = (e) => {
          e.preventDefault();
          loadList(n).catch(console.error);
        };
      }
    });

    if (first) {
      first.onclick = (e) => {
        e.preventDefault();
        const prev = Math.max(1, current - 1);
        if (prev !== current) loadList(prev).catch(console.error);
      };
    }
    if (last) {
      last.onclick = (e) => {
        e.preventDefault();
        const next = Math.min(total, current + 1);
        if (next !== current) loadList(next).catch(console.error);
      };
    }
  }

  function renderRows(items = []) {
    const tbody = document.querySelector('.tb tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    items.forEach(item => {
      const tr = document.createElement('tr');

      const tdId = document.createElement('td');
      tdId.textContent = item.studentId ?? '';

      const tdName = document.createElement('td');
      tdName.textContent = item.name ?? '';

      const tdLab = document.createElement('td');
      tdLab.textContent = item.lab ?? '';

      const tdAtt = document.createElement('td');

      const select = document.createElement('select');
      select.style.width = "70px";
      select.style.padding = "3px 10px";

      const optDefault = document.createElement('option');
      optDefault.value = "";
      optDefault.text = "선택";
      optDefault.disabled = true;
      optDefault.selected = !item.attendance;

      const optPresent = document.createElement('option');
      optPresent.value = "출석";
      optPresent.text = "출석";

      const optAbsent = document.createElement('option');
      optAbsent.value = "미출석";
      optAbsent.text = "미출석";

      select.appendChild(optDefault);
      select.appendChild(optPresent);
      select.appendChild(optAbsent);

      if (item.attendance === '출석') select.value = '출석';
      else if (item.attendance === '미출석') select.value = '미출석';

      tdAtt.appendChild(select);

      tr.appendChild(tdId);
      tr.appendChild(tdName);
      tr.appendChild(tdLab);
      tr.appendChild(tdAtt);

      tbody.appendChild(tr);
    });

    attachAttendanceChangeHandlers();
  }

  async function loadList(page = 1) {
    const cls = classSelect?.value || '';
    const q = searchInput?.value || '';
    const params = new URLSearchParams();
    if (cls) params.set('class', cls);
    if (q) params.set('q', q);
    params.set('page', String(page));

    const data = await getJSON(`${ENDPOINTS.list}?${params.toString()}`);

    const items = data.items || [];
    renderRows(items);

    const current = Number(data.page || page);
    const total = Number(data.totalPages || 1);
    setupPagination(current, total);
  }

  loadList(1).catch(err => {
    console.warn('초기 목록 로드 실패(확실하지 않음):', err.message);
  });
});