// 🏗️ Sheffield Contracting: mobile menu + estimate forms.

// 📮 Where estimate requests go. Leave empty until the site is hosted.
// Paste a form-service URL here (Formspree, Web3Forms, Netlify, etc.) and
// requests are sent there, then the visitor lands on thanks.html.
// While it's empty, submitting opens a pre-written text (phones) or email (computers) to Bob.
const FORM_ENDPOINT = "";
const BOB_SMS = "+18706310116";
const BOB_EMAIL = "bsheffield1966@gmail.com";

// 🍔 Mobile menu
const menuBtn = document.querySelector(".menu-btn");
const links = document.getElementById("links");
if (menuBtn && links) {
  menuBtn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
}

// 📝 Estimate forms
const isPhone = matchMedia("(pointer: coarse)").matches;

function messageFrom(data) {
  const lines = [
    "Estimate request from the website",
    `Name: ${data.get("name")}`,
    `Phone: ${data.get("phone")}`,
    `Job: ${data.get("service")}`,
  ];
  if (data.get("town")) lines.push(`Town: ${data.get("town")}`);
  if (data.get("details")) lines.push(`Details: ${data.get("details")}`);
  return lines.join("\n");
}

function show(form, kind, text) {
  const box = form.querySelector(".status");
  box.className = `status show ${kind}`;
  box.textContent = text;
}

document.querySelectorAll("form.quote").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    if (data.get("company")) return; // 🍯 hidden field only bots fill in

    let firstBad = null;
    for (const field of form.querySelectorAll("[required]")) {
      const bad = !field.value.trim() || (field.type === "tel" && field.value.replace(/\D/g, "").length < 10);
      field.setAttribute("aria-invalid", String(bad));
      if (bad && !firstBad) firstBad = field;
    }
    if (firstBad) {
      show(form, "err", firstBad.type === "tel" ? "Please enter a 10-digit phone number so Bob can call you back." : "Please fill in your name and phone number.");
      firstBad.focus();
      return;
    }

    const button = form.querySelector("button[type=submit]");
    if (!FORM_ENDPOINT) {
      const text = encodeURIComponent(messageFrom(data));
      location.href = isPhone
        ? `sms:${BOB_SMS}?&body=${text}`
        : `mailto:${BOB_EMAIL}?subject=${encodeURIComponent("Estimate request")}&body=${text}`;
      show(form, "ok", isPhone ? "Your text to Bob is ready. Just hit send." : "Your email to Bob is ready. Just hit send.");
      return;
    }

    button.disabled = true;
    button.textContent = "Sending…";
    try {
      const res = await fetch(FORM_ENDPOINT, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      location.href = form.dataset.thanks;
    } catch {
      show(form, "err", "That didn't go through. Please call or text Bob at 870-631-0116.");
      button.disabled = false;
      button.textContent = "Request my free estimate";
    }
  });
});
