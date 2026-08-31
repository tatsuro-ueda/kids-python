// Live share: one-way SSE-based code sharing (learner → teacher, read-only)
// See docs/steering/done/20260412-remote-pair-view.md

const ROOM_ID_REGEX = /^[A-Za-z0-9_-]{1,32}$/;

export function isValidRoomId(id) {
  return typeof id === "string" && ROOM_ID_REGEX.test(id);
}

export function detectLiveRoomId() {
  const hash = location.hash;
  if (!hash.startsWith("#live=")) return null;
  const id = hash.slice(6);
  return isValidRoomId(id) ? id : null;
}

export function buildLiveUrl(roomId) {
  return `${location.origin}${location.pathname}#live=${roomId}`;
}

export async function checkRoomExists(roomId) {
  try {
    const res = await fetch(`/api/live/${encodeURIComponent(roomId)}/exists`);
    if (!res.ok) return false;
    const json = await res.json();
    return !!json.exists;
  } catch {
    return false;
  }
}

const OUTPUT_FIELD_MAX = 5000;

function truncate(s) {
  if (typeof s !== "string") return "";
  if (s.length <= OUTPUT_FIELD_MAX) return s;
  return s.slice(0, OUTPUT_FIELD_MAX) + "…";
}

// LearnerBroadcaster: debounced POST on each edit; also supports immediate
// output push after an execution completes.
export function createLearnerBroadcaster(roomId) {
  let timer = null;
  let stopped = false;
  let latestCode = null;
  // Outgoing state: code is always the latest-edited code; output is present
  // only when an execution just finished (we leave it undefined so the server
  // preserves the previously-stored output between runs).
  let pendingOutput = undefined;

  async function sendState({ code, includeOutput }) {
    if (stopped) return;
    const body = { code };
    if (includeOutput && pendingOutput !== undefined) {
      body.output = pendingOutput;
      pendingOutput = undefined;
    }
    try {
      await fetch(`/api/live/${encodeURIComponent(roomId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      // Silent: next update will retry
    }
  }

  async function flush() {
    timer = null;
    if (stopped || latestCode === null) return;
    const code = latestCode;
    latestCode = null;
    await sendState({ code, includeOutput: true });
  }

  return {
    push(code) {
      if (stopped) return;
      latestCode = code;
      if (timer) return;
      timer = setTimeout(flush, 400);
    },
    async pushNow(code) {
      if (stopped) return;
      latestCode = code;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      await flush();
    },
    async pushOutput(code, output) {
      if (stopped) return;
      pendingOutput = {
        stdout: truncate(output.stdout || ""),
        stderr: truncate(output.stderr || ""),
        errorLine: Number.isInteger(output.errorLine) && output.errorLine > 0
          ? output.errorLine
          : null,
      };
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      latestCode = null;
      await sendState({ code, includeOutput: true });
    },
    stop() {
      stopped = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}

// createLiveSubscriber: subscribe to SSE typed events (state, chat-history, chat).
// Used by both teacher viewer and learner chat receiver. Callers pass only the
// handlers they care about.
export function createLiveSubscriber(roomId, handlers = {}) {
  const es = new EventSource(`/api/live/${encodeURIComponent(roomId)}/stream`);
  const { onState, onChatHistory, onChat, onError } = handlers;
  es.addEventListener("state", (ev) => {
    try {
      const data = JSON.parse(ev.data);
      onState && onState(data);
    } catch {}
  });
  es.addEventListener("chat-history", (ev) => {
    try {
      const data = JSON.parse(ev.data);
      onChatHistory && onChatHistory(data.messages || []);
    } catch {}
  });
  es.addEventListener("chat", (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      onChat && onChat(msg);
    } catch {}
  });
  es.onerror = () => {
    onError && onError();
  };
  return {
    close() {
      es.close();
    },
  };
}

// Backwards-compatible alias for the teacher viewer: wraps createLiveSubscriber.
export function createTeacherViewer(roomId, onState, onError) {
  return createLiveSubscriber(roomId, { onState, onError });
}

export async function sendChatMessage(roomId, { sender, name, text, nonce }) {
  try {
    const res = await fetch(`/api/live/${encodeURIComponent(roomId)}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, name: name || "", text, nonce: nonce || "" }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
