const WA_SVG_PATH = "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.77.46 3.45 1.34 4.94L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.19c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.81-.11a16.7 16.7 0 0 1-1.63-.6c-2.87-1.24-4.74-4.14-4.89-4.33-.14-.19-1.17-1.56-1.17-2.98s.73-2.11 1-2.4c.26-.29.57-.36.76-.36h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.14.11.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.13-.29.28-.13.55.17.28.75 1.24 1.62 2 1.11.99 2.05 1.3 2.33 1.44.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.18-.28.36-.23.6-.14.24.09 1.55.73 1.82.86.26.14.44.2.5.32.07.12.07.68-.17 1.36Z";

let state = { content: null, lang: localStorage.getItem("ft_lang") || "ar" };

async function loadContent() {
  const res = await fetch("/api/content");
  if (!res.ok) throw new Error("Failed to load content");
  const data = await res.json();
  state.content = data.content;
  render();
}

function el(tag, opts = {}) {
  const node = document.createElement(tag);
  Object.entries(opts).forEach(([k, v]) => {
    if (k === "html") node.innerHTML = v;
    else if (k === "text") node.textContent = v;
    else if (k === "class") node.className = v;
    else node.setAttribute(k, v);
  });
  return node;
}

function applyColors(colors) {
  const root = document.documentElement.style;
  root.setProperty("--navy-950", colors.navy);
  root.setProperty("--navy-800", colors.panel);
  root.setProperty("--teal", colors.teal);
  root.setProperty("--gold", colors.gold);
  root.setProperty("--white", colors.white);
}

function svcIcon(index) {
  const icons = [
    '<rect x="4" y="3" width="16" height="12" rx="1.5"/><path d="M2 19h20M9 19v-4M15 19v-4"/>',
    '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/><circle cx="17" cy="9" r="1.2" fill="currentColor" stroke="none"/>',
    '<path d="M8 3 3 12l5 9M16 3l5 9-5 9M14 3l-4 18"/>',
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9Z"/>',
    '<path d="M3 15a4 4 0 0 1 4-4h.5a5.5 5.5 0 0 1 10.9-1H19a3.5 3.5 0 0 1 0 7H7a4 4 0 0 1-4-4Z"/>',
    '<rect x="5" y="5" width="14" height="14" rx="3"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M8 15c1 1 2.2 1.5 4 1.5s3-.5 4-1.5M5 9H2M5 15H2M22 9h-3M22 15h-3M9 5V2M15 5V2M9 22v-3M15 22v-3"/>'
  ];
  return icons[index] || icons[0];
}

function stepIcon(index) {
  const icons = [
    '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    '<path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
    '<path d="M5 13l4 4L19 7"/>'
  ];
  return icons[index] || icons[0];
}

function render() {
  const c = state.content;
  const lang = state.lang;
  const t = (ar, en) => (lang === "ar" ? ar : en);

  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  document.body.classList.toggle("lang-en", lang === "en");
  document.querySelectorAll("[data-lang-opt]").forEach((elx) => {
    elx.classList.toggle("active", elx.getAttribute("data-lang-opt") === lang);
  });

  applyColors(c.colors);

  // brand
  document.title = c.brand.name_en;
  document.querySelectorAll(".js-brand-name").forEach((n) => (n.textContent = c.brand.name_en));
  document.querySelectorAll(".js-logo-slot").forEach((slot) => {
    slot.innerHTML = c.brand.logo_url
      ? `<img src="${c.brand.logo_url}" alt="${c.brand.name_en}">`
      : defaultLogoSvg();
  });

  // hero
  const heroTitle = document.getElementById("heroTitle");
  if (heroTitle) heroTitle.innerHTML = t(c.hero.title_ar, c.hero.title_en);
  const heroSub = document.getElementById("heroSub");
  if (heroSub) heroSub.textContent = t(c.hero.sub_ar, c.hero.sub_en);
  setText("stat1b", t(c.hero.stat1b_ar, c.hero.stat1b_en));
  setText("stat1s", t(c.hero.stat1s_ar, c.hero.stat1s_en));
  setText("stat2num", c.hero.stat2_num);
  setText("stat2s", t(c.hero.stat2s_ar, c.hero.stat2s_en));
  setText("stat3b", t(c.hero.stat3b_ar, c.hero.stat3b_en));
  setText("stat3s", t(c.hero.stat3s_ar, c.hero.stat3s_en));

  // about
  const aboutTitle = document.getElementById("aboutTitle");
  if (aboutTitle) aboutTitle.innerHTML = t(c.about.title_ar, c.about.title_en);
  setText("aboutP1", t(c.about.p1_ar, c.about.p1_en));
  setText("aboutP2", t(c.about.p2_ar, c.about.p2_en));
  const stepsWrap = document.getElementById("aboutSteps");
  if (stepsWrap) {
    stepsWrap.innerHTML = "";
    (c.about.steps || []).forEach((step, i) => {
      const item = el("div", { class: "mini-stat" });
      const ic = el("div", { class: "ic" });
      ic.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${stepIcon(i)}</svg>`;
      const label = el("div");
      label.innerHTML = `<b>${t(step.label_ar, step.label_en)}</b>`;
      item.appendChild(ic);
      item.appendChild(label);
      stepsWrap.appendChild(item);
    });
  }

  // vision
  setText("visionTitle", t(c.vision.title_ar, c.vision.title_en));
  setText("visionText", t(c.vision.text_ar, c.vision.text_en));

  // services
  const svcGrid = document.getElementById("svcGrid");
  if (svcGrid) {
    svcGrid.innerHTML = "";
    (c.services || []).forEach((s, i) => {
      const isLast = i === (c.services.length - 1) && c.services.length === 7;
      const card = el("div", { class: isLast ? "svc-card svc-highlight" : "svc-card" });
      if (isLast) {
        card.innerHTML = `
          <span class="svc-num">${s.num}</span>
          <div class="svc-highlight-body">
            <div class="svc-ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${svcIcon(i)}</svg></div>
            <div>
              <h3>${t(s.title_ar, s.title_en)}</h3>
              <p>${t(s.desc_ar, s.desc_en)}</p>
            </div>
          </div>`;
      } else {
        card.innerHTML = `
          <span class="svc-num">${s.num}</span>
          <div class="svc-ic"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${svcIcon(i)}</svg></div>
          <h3>${t(s.title_ar, s.title_en)}</h3>
          <p>${t(s.desc_ar, s.desc_en)}</p>`;
      }
      svcGrid.appendChild(card);
    });
  }

  // contact
  setText("contactTitle", t(c.contact.title_ar, c.contact.title_en));
  setText("contactDesc", t(c.contact.desc_ar, c.contact.desc_en));
  setText("contactEmail", c.contact.email);
  setText("contactAddress", t(c.contact.address_ar, c.contact.address_en));

  const waMessage = t(c.contact.whatsapp_message_ar, c.contact.whatsapp_message_en);
  const waLink = `https://wa.me/${c.contact.whatsapp_number}?text=${encodeURIComponent(waMessage)}`;
  document.querySelectorAll(".js-wa-link").forEach((a) => a.setAttribute("href", waLink));

  // menu labels
  setText("menuAbout", t("من نحن", "About Us"));
  setText("menuVision", t("رؤيتنا", "Our Vision"));
  setText("menuContact", t("تواصل معنا", "Contact Us"));
  renderAuthMenuItem(t);

  // footer
  setText("footAbout", t("من نحن", "About Us"));
  setText("footVision", t("رؤيتنا", "Our Vision"));
  setText("footContact", t("تواصل معنا", "Contact Us"));
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function defaultLogoSvg() {
  return `<svg viewBox="0 0 40 40" style="width:60%;height:60%">
    <path d="M6 8 H24 M6 8 V32 M6 19 H19" stroke="#FFFFFF" stroke-width="4.4" fill="none" stroke-linecap="square"/>
    <path d="M20 8 L34 8 L26 16" stroke="#D4AF37" stroke-width="4" fill="none" stroke-linecap="square"/>
    <path d="M22 24 H34 M28 24 V32" stroke="#14B8A6" stroke-width="4.4" fill="none" stroke-linecap="square"/>
  </svg>`;
}

function renderAuthMenuItem(t) {
  const slot = document.getElementById("menuAuthSlot");
  if (!slot) return;
  const token = localStorage.getItem("ft_token");
  const userJson = localStorage.getItem("ft_user");
  slot.innerHTML = "";

  if (token && userJson) {
    const user = JSON.parse(userJson);
    const hello = el("div", { class: "menu-sub", text: t(`مرحباً، ${user.name}`, `Hi, ${user.name}`) });
    slot.appendChild(hello);

    if (user.role === "admin") {
      const dashLink = el("a", { href: "/admin/dashboard.html", text: t("لوحة التحكم", "Admin Dashboard") });
      slot.appendChild(dashLink);
    }

    const logout = el("div", { class: "menu-item", text: t("تسجيل الخروج", "Log Out") });
    logout.addEventListener("click", () => {
      localStorage.removeItem("ft_token");
      localStorage.removeItem("ft_user");
      renderAuthMenuItem(t);
      closeMenu();
    });
    slot.appendChild(logout);
  } else {
    const loginLink = el("a", { href: "/login.html", text: t("تسجيل الدخول", "Log In") });
    slot.appendChild(loginLink);
  }
}

function openMenu() {
  document.getElementById("menuOverlay")?.classList.add("open");
}
function closeMenu() {
  document.getElementById("menuOverlay")?.classList.remove("open");
}

function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem("ft_lang", lang);
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("burgerBtn")?.addEventListener("click", openMenu);
  document.getElementById("menuClose")?.addEventListener("click", closeMenu);
  document.querySelectorAll(".menu-overlay a[href^='#']").forEach((a) =>
    a.addEventListener("click", closeMenu)
  );
  document.querySelectorAll("[data-lang-opt]").forEach((btn) =>
    btn.addEventListener("click", () => setLanguage(btn.getAttribute("data-lang-opt")))
  );

  loadContent().catch((err) => {
    console.error(err);
    const hero = document.getElementById("top");
    if (hero) hero.innerHTML = "<p style='padding:60px;text-align:center'>تعذّر تحميل محتوى الموقع. تأكد من تشغيل السيرفر.</p>";
  });
});
