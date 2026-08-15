let content = null;
let currentUser = null;

function getToken() {
  return localStorage.getItem("ft_token");
}

async function apiFetch(url, opts = {}) {
  const headers = Object.assign({}, opts.headers || {}, {
    Authorization: `Bearer ${getToken()}`
  });
  const res = await fetch(url, Object.assign({}, opts, { headers }));
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("ft_token");
    localStorage.removeItem("ft_user");
    window.location.href = "/login.html";
    throw new Error("Unauthorized");
  }
  return res;
}

async function guardAndInit() {
  const token = getToken();
  if (!token) return (window.location.href = "/login.html");

  try {
    const res = await apiFetch("/api/auth/me");
    const data = await res.json();
    if (!res.ok || data.user.role !== "admin") {
      window.location.href = "/login.html";
      return;
    }
    currentUser = data.user;
    document.getElementById("userChip").textContent = `${currentUser.name} (${currentUser.email})`;
  } catch (err) {
    return;
  }

  await loadContent();
  bindNav();
  bindLogout();
  bindLogoUpload();
  bindSave();
  bindServiceAdd();
  loadUsers();
}

async function loadContent() {
  const res = await fetch("/api/content");
  const data = await res.json();
  content = data.content;
  fillForm();
}

function fillForm() {
  // brand
  document.getElementById("brandNameAr").value = content.brand.name_ar || "";
  document.getElementById("brandNameEn").value = content.brand.name_en || "";
  renderLogoPreview();

  // colors
  setColorField("colorNavy", "hexNavy", content.colors.navy);
  setColorField("colorPanel", "hexPanel", content.colors.panel);
  setColorField("colorTeal", "hexTeal", content.colors.teal);
  setColorField("colorGold", "hexGold", content.colors.gold);
  setColorField("colorWhite", "hexWhite", content.colors.white);
  ["colorNavy", "colorPanel", "colorTeal", "colorGold", "colorWhite"].forEach((id) => {
    document.getElementById(id).addEventListener("input", (e) => {
      const hexId = "hex" + id.replace("color", "");
      document.getElementById(hexId).textContent = e.target.value;
    });
  });

  // hero
  document.getElementById("heroTitleAr").value = content.hero.title_ar || "";
  document.getElementById("heroTitleEn").value = content.hero.title_en || "";
  document.getElementById("heroSubAr").value = content.hero.sub_ar || "";
  document.getElementById("heroSubEn").value = content.hero.sub_en || "";
  document.getElementById("stat1bAr").value = content.hero.stat1b_ar || "";
  document.getElementById("stat1bEn").value = content.hero.stat1b_en || "";
  document.getElementById("stat1sAr").value = content.hero.stat1s_ar || "";
  document.getElementById("stat1sEn").value = content.hero.stat1s_en || "";
  document.getElementById("stat2num").value = content.hero.stat2_num || "";
  document.getElementById("stat2sAr").value = content.hero.stat2s_ar || "";
  document.getElementById("stat2sEn").value = content.hero.stat2s_en || "";
  document.getElementById("stat3bAr").value = content.hero.stat3b_ar || "";
  document.getElementById("stat3bEn").value = content.hero.stat3b_en || "";
  document.getElementById("stat3sAr").value = content.hero.stat3s_ar || "";
  document.getElementById("stat3sEn").value = content.hero.stat3s_en || "";

  // about
  document.getElementById("aboutTitleAr").value = content.about.title_ar || "";
  document.getElementById("aboutTitleEn").value = content.about.title_en || "";
  document.getElementById("aboutP1Ar").value = content.about.p1_ar || "";
  document.getElementById("aboutP1En").value = content.about.p1_en || "";
  document.getElementById("aboutP2Ar").value = content.about.p2_ar || "";
  document.getElementById("aboutP2En").value = content.about.p2_en || "";
  renderSteps();

  // vision
  document.getElementById("visionTitleAr").value = content.vision.title_ar || "";
  document.getElementById("visionTitleEn").value = content.vision.title_en || "";
  document.getElementById("visionTextAr").value = content.vision.text_ar || "";
  document.getElementById("visionTextEn").value = content.vision.text_en || "";

  // services
  renderServices();

  // contact
  document.getElementById("contactTitleAr").value = content.contact.title_ar || "";
  document.getElementById("contactTitleEn").value = content.contact.title_en || "";
  document.getElementById("contactDescAr").value = content.contact.desc_ar || "";
  document.getElementById("contactDescEn").value = content.contact.desc_en || "";
  document.getElementById("contactEmail").value = content.contact.email || "";
  document.getElementById("contactAddressAr").value = content.contact.address_ar || "";
  document.getElementById("contactAddressEn").value = content.contact.address_en || "";
  document.getElementById("waNumber").value = content.contact.whatsapp_number || "";
  document.getElementById("waMsgAr").value = content.contact.whatsapp_message_ar || "";
  document.getElementById("waMsgEn").value = content.contact.whatsapp_message_en || "";
}

function setColorField(inputId, hexId, value) {
  document.getElementById(inputId).value = value;
  document.getElementById(hexId).textContent = value;
}

function renderLogoPreview() {
  const box = document.getElementById("logoPreview");
  box.innerHTML = content.brand.logo_url
    ? `<img src="${content.brand.logo_url}" alt="logo">`
    : `<svg viewBox="0 0 40 40" style="width:60%;height:60%">
         <path d="M6 8 H24 M6 8 V32 M6 19 H19" stroke="#FFFFFF" stroke-width="4.4" fill="none" stroke-linecap="square"/>
         <path d="M20 8 L34 8 L26 16" stroke="#D4AF37" stroke-width="4" fill="none" stroke-linecap="square"/>
         <path d="M22 24 H34 M28 24 V32" stroke="#14B8A6" stroke-width="4.4" fill="none" stroke-linecap="square"/>
       </svg>`;
}

function renderSteps() {
  const wrap = document.getElementById("stepsWrap");
  wrap.innerHTML = "";
  (content.about.steps || []).forEach((step, i) => {
    const item = document.createElement("div");
    item.className = "svc-edit-item";
    item.innerHTML = `
      <button type="button" class="remove-btn" data-remove-step="${i}">حذف ✕</button>
      <div class="grid-2">
        <div class="field-sm"><label>التسمية (عربي)</label><input data-step="${i}" data-field="label_ar" value="${escapeHtml(step.label_ar || "")}"></div>
        <div class="field-sm"><label>التسمية (إنجليزي)</label><input data-step="${i}" data-field="label_en" value="${escapeHtml(step.label_en || "")}" style="direction:ltr;"></div>
      </div>`;
    wrap.appendChild(item);
  });

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "btn btn-outline";
  addBtn.textContent = "+ إضافة خطوة";
  addBtn.addEventListener("click", () => {
    content.about.steps.push({ label_ar: "", label_en: "" });
    renderSteps();
  });
  wrap.appendChild(addBtn);

  wrap.querySelectorAll("[data-remove-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      content.about.steps.splice(Number(btn.getAttribute("data-remove-step")), 1);
      renderSteps();
    });
  });
}

function renderServices() {
  const wrap = document.getElementById("servicesWrap");
  wrap.innerHTML = "";
  (content.services || []).forEach((svc, i) => {
    const item = document.createElement("div");
    item.className = "svc-edit-item";
    item.innerHTML = `
      <button type="button" class="remove-btn" data-remove-svc="${i}">حذف ✕</button>
      <div class="field-sm"><label>الرقم / الوسم</label><input data-svc="${i}" data-field="num" value="${escapeHtml(svc.num || "")}" style="direction:ltr;max-width:160px;"></div>
      <div class="grid-2">
        <div class="field-sm"><label>العنوان (عربي)</label><input data-svc="${i}" data-field="title_ar" value="${escapeHtml(svc.title_ar || "")}"></div>
        <div class="field-sm"><label>العنوان (إنجليزي)</label><input data-svc="${i}" data-field="title_en" value="${escapeHtml(svc.title_en || "")}" style="direction:ltr;"></div>
        <div class="field-sm"><label>الوصف (عربي)</label><textarea data-svc="${i}" data-field="desc_ar" rows="2">${escapeHtml(svc.desc_ar || "")}</textarea></div>
        <div class="field-sm"><label>الوصف (إنجليزي)</label><textarea data-svc="${i}" data-field="desc_en" rows="2" style="direction:ltr;">${escapeHtml(svc.desc_en || "")}</textarea></div>
      </div>`;
    wrap.appendChild(item);
  });

  wrap.querySelectorAll("[data-remove-svc]").forEach((btn) => {
    btn.addEventListener("click", () => {
      content.services.splice(Number(btn.getAttribute("data-remove-svc")), 1);
      renderServices();
    });
  });
}

function bindServiceAdd() {
  document.getElementById("addServiceBtn").addEventListener("click", () => {
    if (content.services.length >= 7) {
      alert("الحد الأقصى 7 خدمات.");
      return;
    }
    content.services.push({ num: String(content.services.length + 1).padStart(2, "0"), title_ar: "", title_en: "", desc_ar: "", desc_en: "" });
    renderServices();
  });
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function bindNav() {
  document.querySelectorAll(".admin-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-nav-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".admin-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.querySelector(`.admin-panel[data-panel="${btn.dataset.panel}"]`).classList.add("active");
    });
  });
}

function bindLogout() {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("ft_token");
    localStorage.removeItem("ft_user");
    window.location.href = "/login.html";
  });
}

function bindLogoUpload() {
  document.getElementById("logoInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("logo", file);
    try {
      const res = await apiFetch("/api/content/logo", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "تعذّر رفع الشعار.");
      content.brand.logo_url = data.url;
      renderLogoPreview();
    } catch (err) {
      alert("تعذّر رفع الشعار.");
    }
  });
}

function collectFormIntoContent() {
  content.brand.name_ar = document.getElementById("brandNameAr").value;
  content.brand.name_en = document.getElementById("brandNameEn").value;

  content.colors.navy = document.getElementById("colorNavy").value;
  content.colors.panel = document.getElementById("colorPanel").value;
  content.colors.teal = document.getElementById("colorTeal").value;
  content.colors.gold = document.getElementById("colorGold").value;
  content.colors.white = document.getElementById("colorWhite").value;

  content.hero.title_ar = document.getElementById("heroTitleAr").value;
  content.hero.title_en = document.getElementById("heroTitleEn").value;
  content.hero.sub_ar = document.getElementById("heroSubAr").value;
  content.hero.sub_en = document.getElementById("heroSubEn").value;
  content.hero.stat1b_ar = document.getElementById("stat1bAr").value;
  content.hero.stat1b_en = document.getElementById("stat1bEn").value;
  content.hero.stat1s_ar = document.getElementById("stat1sAr").value;
  content.hero.stat1s_en = document.getElementById("stat1sEn").value;
  content.hero.stat2_num = document.getElementById("stat2num").value;
  content.hero.stat2s_ar = document.getElementById("stat2sAr").value;
  content.hero.stat2s_en = document.getElementById("stat2sEn").value;
  content.hero.stat3b_ar = document.getElementById("stat3bAr").value;
  content.hero.stat3b_en = document.getElementById("stat3bEn").value;
  content.hero.stat3s_ar = document.getElementById("stat3sAr").value;
  content.hero.stat3s_en = document.getElementById("stat3sEn").value;

  content.about.title_ar = document.getElementById("aboutTitleAr").value;
  content.about.title_en = document.getElementById("aboutTitleEn").value;
  content.about.p1_ar = document.getElementById("aboutP1Ar").value;
  content.about.p1_en = document.getElementById("aboutP1En").value;
  content.about.p2_ar = document.getElementById("aboutP2Ar").value;
  content.about.p2_en = document.getElementById("aboutP2En").value;
  document.querySelectorAll("[data-step]").forEach((inp) => {
    const i = Number(inp.getAttribute("data-step"));
    const field = inp.getAttribute("data-field");
    content.about.steps[i][field] = inp.value;
  });

  content.vision.title_ar = document.getElementById("visionTitleAr").value;
  content.vision.title_en = document.getElementById("visionTitleEn").value;
  content.vision.text_ar = document.getElementById("visionTextAr").value;
  content.vision.text_en = document.getElementById("visionTextEn").value;

  document.querySelectorAll("[data-svc]").forEach((inp) => {
    const i = Number(inp.getAttribute("data-svc"));
    const field = inp.getAttribute("data-field");
    content.services[i][field] = inp.value;
  });

  content.contact.title_ar = document.getElementById("contactTitleAr").value;
  content.contact.title_en = document.getElementById("contactTitleEn").value;
  content.contact.desc_ar = document.getElementById("contactDescAr").value;
  content.contact.desc_en = document.getElementById("contactDescEn").value;
  content.contact.email = document.getElementById("contactEmail").value;
  content.contact.address_ar = document.getElementById("contactAddressAr").value;
  content.contact.address_en = document.getElementById("contactAddressEn").value;
  content.contact.whatsapp_number = document.getElementById("waNumber").value;
  content.contact.whatsapp_message_ar = document.getElementById("waMsgAr").value;
  content.contact.whatsapp_message_en = document.getElementById("waMsgEn").value;
}

function bindSave() {
  document.getElementById("saveBtn").addEventListener("click", async () => {
    collectFormIntoContent();
    const status = document.getElementById("saveStatus");
    status.textContent = "جاري الحفظ...";
    try {
      const res = await apiFetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content)
      });
      const data = await res.json();
      if (!res.ok) {
        status.textContent = data.error || "تعذّر الحفظ.";
        return;
      }
      status.textContent = "✔ تم الحفظ بنجاح — التعديلات ظاهرة الآن على الموقع.";
      setTimeout(() => (status.textContent = ""), 4000);
    } catch (err) {
      status.textContent = "تعذّر الاتصال بالسيرفر.";
    }
  });
}

async function loadUsers() {
  try {
    const res = await apiFetch("/api/users");
    const data = await res.json();
    const tbody = document.getElementById("usersTbody");
    tbody.innerHTML = "";
    data.users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(u.name)}</td>
        <td style="direction:ltr;text-align:left;">${escapeHtml(u.email)}</td>
        <td><span class="badge ${u.role}">${u.role === "admin" ? "مسؤول" : "مستخدم"}</span></td>
        <td style="direction:ltr;text-align:left;color:var(--ink-faint);">${u.created_at}</td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    // guarded already
  }
}

document.addEventListener("DOMContentLoaded", guardAndInit);
