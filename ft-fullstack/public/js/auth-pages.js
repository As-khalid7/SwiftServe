function showMsg(el, text, type) {
  el.textContent = text;
  el.className = `form-msg show ${type}`;
}

function saveSession(token, user) {
  localStorage.setItem("ft_token", token);
  localStorage.setItem("ft_user", JSON.stringify(user));
}

function redirectAfterAuth(user) {
  if (user.role === "admin") {
    window.location.href = "/admin/dashboard.html";
  } else {
    window.location.href = "/index.html";
  }
}

// ---------- LOGIN ----------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("formMsg");
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return showMsg(msg, data.error || "تعذّر تسجيل الدخول.", "error");

      saveSession(data.token, data.user);
      showMsg(msg, "تم تسجيل الدخول بنجاح، جاري التحويل...", "success");
      setTimeout(() => redirectAfterAuth(data.user), 600);
    } catch (err) {
      showMsg(msg, "تعذّر الاتصال بالسيرفر.", "error");
    }
  });
}

// ---------- REGISTER ----------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("formMsg");
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

    if (password !== password2) {
      return showMsg(msg, "كلمتا المرور غير متطابقتين.", "error");
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) return showMsg(msg, data.error || "تعذّر إنشاء الحساب.", "error");

      saveSession(data.token, data.user);
      showMsg(msg, "تم إنشاء الحساب بنجاح، جاري التحويل...", "success");
      setTimeout(() => redirectAfterAuth(data.user), 600);
    } catch (err) {
      showMsg(msg, "تعذّر الاتصال بالسيرفر.", "error");
    }
  });
}

// ---------- FORGOT PASSWORD ----------
const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("formMsg");
    const email = document.getElementById("email").value.trim();

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) return showMsg(msg, data.error || "حدث خطأ ما.", "error");
      showMsg(msg, data.message, "success");
      forgotForm.reset();
    } catch (err) {
      showMsg(msg, "تعذّر الاتصال بالسيرفر.", "error");
    }
  });
}

// ---------- RESET PASSWORD ----------
const resetForm = document.getElementById("resetForm");
if (resetForm) {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const email = params.get("email");

  if (!token || !email) {
    document.getElementById("resetFormWrap").style.display = "none";
    document.getElementById("resetInvalid").style.display = "block";
  }

  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("formMsg");
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

    if (password !== password2) {
      return showMsg(msg, "كلمتا المرور غير متطابقتين.", "error");
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password })
      });
      const data = await res.json();
      if (!res.ok) return showMsg(msg, data.error || "تعذّر إعادة تعيين كلمة المرور.", "error");

      showMsg(msg, data.message, "success");
      setTimeout(() => (window.location.href = "/login.html"), 1200);
    } catch (err) {
      showMsg(msg, "تعذّر الاتصال بالسيرفر.", "error");
    }
  });
}

// If already logged in, bounce away from auth pages
(function redirectIfLoggedIn() {
  const onAuthPage = document.body.hasAttribute("data-auth-page");
  const token = localStorage.getItem("ft_token");
  const userJson = localStorage.getItem("ft_user");
  if (onAuthPage && token && userJson) {
    redirectAfterAuth(JSON.parse(userJson));
  }
})();
