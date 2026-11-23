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

// ---------- Contact form (mailto, no backend) ----------
const OWNER_EMAIL = "sarthaksajwan25@gmail.com";
document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const subject = `Portfolio contact from ${data.get("name")}`;
  const body = `${data.get("message")}\n\n— ${data.get("name")} (${data.get("email")})`;
  window.location.href = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
