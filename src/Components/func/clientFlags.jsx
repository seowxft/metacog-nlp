// A few signals about how the free-text boxes were filled in, saved with every
// text answer as a short JSON string (database column `clientFlags`).
//
// Nothing here blocks or changes anything for the participant. The numbers are
// only used afterwards, to screen the data for answers that were not typed by a
// person in this page: text pasted or dropped in, text written by a browser
// automation tool, or a participant who kept switching to another window while
// the box was on screen.
//
// One listener each is attached to the page when this file is first imported.
// Only events aimed at a <textarea> are counted, and hidden-window time is
// only counted while a <textarea> is on the page, so trial screens do not add
// to the numbers. `snapshot()` returns everything counted since the previous
// snapshot and starts again from zero.

const AGENT_ELEMENT_IDS = [
  // Elements the Claude in Chrome extension adds to the page while it is active.
  "claude-agent-stop-container",
  "claude-agent-animation-styles",
];

let counts;
let installed = false;

function zero() {
  counts = {
    keys: 0, // key presses inside a text box
    inputs: 0, // text changes inside a text box
    maxInsert: 0, // most characters added in one text change (typing = 1)
    untrusted: 0, // key or text events not produced by real user input
    pasteTries: 0, // paste attempts into a text box (they are blocked)
    dropTries: 0, // drag-and-drop attempts into a text box
    hiddenN: 0, // times the page was hidden while a text box was on screen
    hiddenMs: 0, // total time hidden, ms
    blurN: 0, // times the window lost focus while a text box was on screen
    blurMs: 0, // total time without focus, ms
    firstKeyAt: null, // performance.now() of the first key press
  };
}

function isTextBox(target) {
  return !!target && target.tagName === "TEXTAREA";
}

function textBoxOnScreen() {
  return !!document.querySelector("textarea");
}

let hiddenSince = null;
let blurSince = null;

function install() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  zero();

  // Capture phase, so these run even though the text box's own handler
  // cancels the paste or drop.
  document.addEventListener(
    "paste",
    (e) => {
      if (isTextBox(e.target)) counts.pasteTries += 1;
    },
    true,
  );
  document.addEventListener(
    "drop",
    (e) => {
      if (isTextBox(e.target)) counts.dropTries += 1;
    },
    true,
  );
  document.addEventListener(
    "keydown",
    (e) => {
      if (!isTextBox(e.target)) return;
      counts.keys += 1;
      if (counts.firstKeyAt === null) counts.firstKeyAt = performance.now();
      if (e.isTrusted === false) counts.untrusted += 1;
    },
    true,
  );
  document.addEventListener(
    "input",
    (e) => {
      if (!isTextBox(e.target)) return;
      counts.inputs += 1;
      var added = e.data ? e.data.length : 0;
      if (added > counts.maxInsert) counts.maxInsert = added;
      if (e.isTrusted === false) counts.untrusted += 1;
    },
    true,
  );

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      if (textBoxOnScreen()) {
        hiddenSince = performance.now();
        counts.hiddenN += 1;
      }
    } else if (hiddenSince !== null) {
      counts.hiddenMs += Math.round(performance.now() - hiddenSince);
      hiddenSince = null;
    }
  });
  window.addEventListener("blur", () => {
    if (textBoxOnScreen()) {
      blurSince = performance.now();
      counts.blurN += 1;
    }
  });
  window.addEventListener("focus", () => {
    if (blurSince !== null) {
      counts.blurMs += Math.round(performance.now() - blurSince);
      blurSince = null;
    }
  });
}

// Everything counted since the last snapshot, as a JSON string, then reset.
export function snapshot() {
  install();
  var now = performance.now();
  var agentDom = AGENT_ELEMENT_IDS.some((id) => !!document.getElementById(id));
  var out = {
    webdriver: navigator.webdriver === true ? 1 : 0, // browser driven by an automation tool
    agentDom: agentDom ? 1 : 0,
    keys: counts.keys,
    inputs: counts.inputs,
    maxInsert: counts.maxInsert,
    untrusted: counts.untrusted,
    pasteTries: counts.pasteTries,
    dropTries: counts.dropTries,
    hiddenN: counts.hiddenN,
    hiddenMs: counts.hiddenMs + (hiddenSince !== null ? Math.round(now - hiddenSince) : 0),
    blurN: counts.blurN,
    blurMs: counts.blurMs + (blurSince !== null ? Math.round(now - blurSince) : 0),
    // ms between the first key press in the box and this save
    firstKeyToSaveMs:
      counts.firstKeyAt === null ? null : Math.round(now - counts.firstKeyAt),
  };
  zero();
  return JSON.stringify(out);
}

install();
