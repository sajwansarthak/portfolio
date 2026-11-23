// ---------- Theme toggle ----------
const root = document.documentElement;
const themeBtn = document.getElementById("theme-toggle");
const themeIcon = themeBtn.querySelector(".theme-icon");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "light" ? "☾" : "☀";
}

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (_) {}
applyTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));

themeBtn.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (_) {}
});

// ---------- Mobile menu ----------
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");

menuBtn.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuBtn.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  })
);

// ---------- Navbar border on scroll ----------
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

// ---------- Typing effect ----------
const roles = ["Software Developer", "DevOps Engineer", "Cloud & Kubernetes Enthusiast", "MERN Stack Developer"];
const typedEl = document.getElementById("typed");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion) {
  typedEl.textContent = roles[0];
} else {
  let roleIdx = 0, charIdx = 0, deleting = false;
  (function tick() {
    const word = roles[roleIdx];
    charIdx += deleting ? -1 : 1;
    typedEl.textContent = word.slice(0, charIdx);
    let delay = deleting ? 45 : 90;
    if (!deleting && charIdx === word.length) { deleting = true; delay = 1600; }
    else if (deleting && charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; delay = 300; }
    setTimeout(tick, delay);
  })();
}

// ---------- Project filters ----------
const filterBtns = document.querySelectorAll(".filter");
const projectCards = document.querySelectorAll(".project-card");

filterBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
    const f = btn.dataset.filter;
    projectCards.forEach((card) => {
      const cats = card.dataset.category.split(" ");
      card.classList.toggle("hidden", f !== "all" && !cats.includes(f));
    });
  })
);

// ---------- Contact form (Render API, mailto fallback) ----------
const OWNER_EMAIL = "sarthaksajwan25@gmail.com";
const API_URL = (window.PORTFOLIO_CONFIG && window.PORTFOLIO_CONFIG.API_URL || "").replace(/\/$/, "");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const submitBtn = contactForm.querySelector("button[type=submit]");

// Render free instances sleep when idle — wake the API as soon as the page loads
if (API_URL) fetch(`${API_URL}/api/health`).catch(() => {});

function setStatus(text, type) {
  formStatus.textContent = text;
  formStatus.className = `form-status ${type || ""}`;
}

function openMailto(data) {
  const subject = `Portfolio contact from ${data.name}`;
  const body = `${data.message}\n\n— ${data.name} (${data.email})`;
  window.location.href = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(contactForm));
  if (!API_URL) return openMailto(data);

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  setStatus("");

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000); // allow for cold start
    const res = await fetch(`${API_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      contactForm.reset();
      setStatus("Thanks! Your message was sent — I'll get back to you soon.", "success");
    } else if (res.status === 400 || res.status === 429) {
      setStatus(json.error || "Please check your details and try again.", "error");
    } else {
      throw new Error(json.error || "Server error");
    }
  } catch (_) {
    setStatus("Couldn't reach the server — opening your email app instead.", "error");
    openMailto(data);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  }
});

// ---------- Copy email ----------
const copyBtn = document.getElementById("copy-email");
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.email);
    copyBtn.textContent = "Copied ✓";
  } catch (_) {
    copyBtn.textContent = copyBtn.dataset.email;
  }
  setTimeout(() => (copyBtn.textContent = "Copy email"), 2000);
});

// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

// ---------- Active nav link ----------
const sections = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav-links a");
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navAnchors.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`)
      );
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
sections.forEach((s) => sectionObserver.observe(s));
