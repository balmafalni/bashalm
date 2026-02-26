// Sticky nav style on scroll
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav?.classList.toggle("scrolled", (window.scrollY || 0) > 8);
}, { passive: true });

// Mobile drawer
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");

function setDrawer(open) {
  if (!drawer || !menuBtn) return;
  if (open) {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    menuBtn.setAttribute("aria-expanded", "true");
  } else {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    menuBtn.setAttribute("aria-expanded", "false");
  }
}

menuBtn?.addEventListener("click", () => setDrawer(!drawer.classList.contains("open")));
drawer?.addEventListener("click", (e) => { if (e.target === drawer) setDrawer(false); });
document.querySelectorAll(".drawerLink").forEach((a) => a.addEventListener("click", () => setDrawer(false)));

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Modal
function openDialog(id) {
  const d = document.getElementById(id);
  if (d && typeof d.showModal === "function") d.showModal();
}
function closeDialogs() {
  document.querySelectorAll("dialog[open]").forEach((d) => d.close());
}
document.querySelectorAll("[data-open]").forEach((btn) => {
  btn.addEventListener("click", () => openDialog(btn.dataset.open));
});
document.querySelectorAll("[data-close]").forEach((btn) => btn.addEventListener("click", closeDialogs));
document.querySelectorAll("dialog").forEach((d) => {
  d.addEventListener("click", (e) => {
    const r = d.getBoundingClientRect();
    const inside = r.left <= e.clientX && e.clientX <= r.right && r.top <= e.clientY && e.clientY <= r.bottom;
    if (!inside) d.close();
  });
});

// Contact form -> mailto
const form = document.getElementById("contactForm");
const hint = document.getElementById("formHint");

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = (data.get("name") || "").toString().trim();
  const email = (data.get("email") || "").toString().trim();
  const business = (data.get("business") || "").toString().trim();
  const message = (data.get("message") || "").toString().trim();

  const subject = encodeURIComponent(`BEIN Studio Inquiry${business ? " — " + business : ""}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nBusiness: ${business || "-"}\n\nMessage:\n${message}\n`
  );

  window.location.href = `mailto:balmafalni@gmail.com?subject=${subject}&body=${body}`;
  if (hint) hint.textContent = "If your email app didn’t open, copy: balmafalni@gmail.com";
});

// Scroll reveal
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = document.querySelectorAll(".reveal");
  if (reduce) { els.forEach(el => el.classList.add("in")); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.14 });

  els.forEach(el => io.observe(el));
})();

// Slider helper (buttons + dots + snap)
function initSlider(root) {
  const track = root.querySelector("[data-track]");
  const prev = root.querySelector("[data-prev]");
  const next = root.querySelector("[data-next]");
  const dotsWrap = root.querySelector("[data-dots]");
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.children);
  dotsWrap.innerHTML = "";
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.addEventListener("click", () => scrollToIndex(i));
    dotsWrap.appendChild(b);
    return b;
  });

  function activeIndex() {
    const x = track.scrollLeft;
    let best = 0, bestDist = Infinity;
    slides.forEach((s, i) => {
      const dist = Math.abs(s.offsetLeft - x);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    return best;
  }

  function setDots(i) {
    dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
  }

  function scrollToIndex(i) {
    const el = slides[i];
    if (!el) return;
    track.scrollTo({ left: el.offsetLeft, behavior: "smooth" });
  }

  prev?.addEventListener("click", () => scrollToIndex(Math.max(0, activeIndex() - 1)));
  next?.addEventListener("click", () => scrollToIndex(Math.min(slides.length - 1, activeIndex() + 1)));

  let raf = null;
  track.addEventListener("scroll", () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => setDots(activeIndex()));
  }, { passive: true });

  // initial
  setDots(0);

  // Touch/trackpad feel: allow wheel to scroll horizontally
  root.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      track.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });
}

document.querySelectorAll("[data-slider]").forEach(initSlider);