// Live chat side panel: DOM creation, message rendering, badge, sound, vibration.
// See docs/steering/done/20260412-live-chat.md

import { sendChatMessage } from "./liveShare.js";

const MAX_MESSAGE_LENGTH = 100;

// Generate a unique nonce for self-echo detection.
function makeNonce() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Play a short beep via WebAudio (no external asset needed).
// Respects prefers-reduced-motion.
function playBeep() {
  try {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    osc.onended = () => { try { ctx.close(); } catch {} };
  } catch {
    // Ignore — audio is a nice-to-have
  }
}

function vibrate() {
  try {
    if (navigator.vibrate) navigator.vibrate(80);
  } catch {}
}

// Escape helpers to safely render user-supplied text.
function text(node, value) {
  node.textContent = value;
}

// Create the side panel DOM and wire up send/receive logic.
// Options:
//   roomId       — string
//   role         — "learner" | "teacher"
//   displayName  — string (may be empty for learner)
//   t            — i18n function (accepts key → string)
export function createChatPanel({ roomId, role, displayName, t }) {
  // --- DOM construction ---
  const panel = document.createElement("div");
  panel.className = "live-chat-panel";
  panel.setAttribute("aria-label", t("app.chatTitle") || "チャット");

  const header = document.createElement("div");
  header.className = "live-chat-header";

  const title = document.createElement("span");
  title.className = "live-chat-title";
  title.textContent = (t("app.chatTitle") || "チャット");
  header.appendChild(title);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "live-chat-close";
  closeBtn.setAttribute("aria-label", t("app.chatMinimize") || "閉じる");
  closeBtn.textContent = "×";
  header.appendChild(closeBtn);
  panel.appendChild(header);

  const listWrap = document.createElement("div");
  listWrap.className = "live-chat-messages";
  panel.appendChild(listWrap);

  const form = document.createElement("form");
  form.className = "live-chat-form";

  const textarea = document.createElement("textarea");
  textarea.className = "live-chat-input";
  textarea.maxLength = MAX_MESSAGE_LENGTH;
  textarea.rows = 2;
  textarea.placeholder = t("app.chatPlaceholder") || "100字までのメッセージ";
  form.appendChild(textarea);

  const formRow = document.createElement("div");
  formRow.className = "live-chat-form-row";
  const counter = document.createElement("span");
  counter.className = "live-chat-counter";
  counter.textContent = "0/" + MAX_MESSAGE_LENGTH;
  formRow.appendChild(counter);
  const sendBtn = document.createElement("button");
  sendBtn.type = "submit";
  sendBtn.className = "live-chat-send";
  sendBtn.textContent = t("app.chatSend") || "おくる";
  formRow.appendChild(sendBtn);
  form.appendChild(formRow);
  panel.appendChild(form);

  // --- Toggle button (fixed, bottom right) ---
  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "live-chat-toggle";
  toggleBtn.setAttribute("aria-label", t("app.chatOpen") || "チャットを開く");
  toggleBtn.innerHTML = "💬";
  const badge = document.createElement("span");
  badge.className = "live-chat-badge";
  badge.hidden = true;
  badge.textContent = "0";
  toggleBtn.appendChild(badge);

  document.body.appendChild(panel);
  document.body.appendChild(toggleBtn);
  document.body.classList.add("live-mode");

  // --- State ---
  let isOpen = true;
  let unread = 0;
  const pendingNonces = new Set();

  function updateBadge() {
    if (unread > 0 && !isOpen) {
      badge.hidden = false;
      badge.textContent = String(unread > 99 ? "99+" : unread);
    } else {
      badge.hidden = true;
    }
  }

  function openPanel() {
    isOpen = true;
    panel.classList.add("is-open");
    toggleBtn.classList.add("is-hidden");
    unread = 0;
    updateBadge();
    textarea.focus();
  }
  function closePanel() {
    isOpen = false;
    panel.classList.remove("is-open");
    toggleBtn.classList.remove("is-hidden");
  }

  closeBtn.addEventListener("click", closePanel);
  toggleBtn.addEventListener("click", openPanel);

  // --- Rendering ---
  function roleLabel(msg) {
    if (msg.sender === "learner") return t("app.chatYouLearner") || "きみ";
    // teacher
    if (msg.name) return msg.name;
    return t("app.chatTeacherDefault") || "せんせい";
  }

  function renderMessage(msg) {
    const row = document.createElement("div");
    row.className = "live-chat-msg";
    // Alignment: own messages to the right, others to the left.
    const isSelf =
      (role === "learner" && msg.sender === "learner") ||
      (role === "teacher" && msg.sender === "teacher" && msg.name === displayName);
    row.classList.add(isSelf ? "is-self" : "is-other");
    row.classList.add(msg.sender === "learner" ? "from-learner" : "from-teacher");

    const who = document.createElement("div");
    who.className = "live-chat-who";
    text(who, roleLabel(msg));
    row.appendChild(who);

    const bubble = document.createElement("div");
    bubble.className = "live-chat-bubble";
    text(bubble, msg.text);
    row.appendChild(bubble);

    listWrap.appendChild(row);
    // Auto-scroll to bottom.
    listWrap.scrollTop = listWrap.scrollHeight;
  }

  function handleIncomingMessage(msg) {
    renderMessage(msg);
    // Self-echo detection via nonce.
    const isOwnEcho = msg.nonce && pendingNonces.has(msg.nonce);
    if (isOwnEcho) {
      pendingNonces.delete(msg.nonce);
      return;
    }
    // Notify if panel is closed or messages came while not watching.
    if (!isOpen) {
      unread += 1;
      updateBadge();
    }
    playBeep();
    vibrate();
  }

  function handleHistory(messages) {
    listWrap.textContent = "";
    for (const msg of messages) renderMessage(msg);
  }

  // --- Sending ---
  textarea.addEventListener("input", () => {
    counter.textContent = textarea.value.length + "/" + MAX_MESSAGE_LENGTH;
  });

  async function sendCurrent() {
    const txt = textarea.value.trim();
    if (!txt) return;
    if (txt.length > MAX_MESSAGE_LENGTH) return;
    sendBtn.disabled = true;
    const nonce = makeNonce();
    pendingNonces.add(nonce);
    const ok = await sendChatMessage(roomId, {
      sender: role,
      name: role === "teacher" ? (displayName || "") : "",
      text: txt,
      nonce,
    });
    sendBtn.disabled = false;
    if (ok) {
      textarea.value = "";
      counter.textContent = "0/" + MAX_MESSAGE_LENGTH;
    } else {
      pendingNonces.delete(nonce);
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendCurrent();
  });
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendCurrent();
    }
  });

  // Start open.
  openPanel();

  return {
    onChat: handleIncomingMessage,
    onChatHistory: handleHistory,
    destroy() {
      panel.remove();
      toggleBtn.remove();
      document.body.classList.remove("live-mode");
    },
  };
}
