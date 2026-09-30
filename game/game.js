// Story graph. Jeder Knoten entspricht einer ehemaligen HTML-Seite des Originalspiels.
// text  – Szenentext (Rechtschreibung/Grammatik gegenüber dem Original leicht bereinigt)
// bg    – grossflächiges Hintergrundbild für die Szene (optional; manche Spannungsmomente
//         bleiben bewusst ohne Bild, damit die Enden mehr Wirkung haben)
// ending– 'death' | 'win' | 'neutral' für Enden, sonst weggelassen
// choices – [{ label, next, icon }]

const STORY = {
  start: {
    text: "Herzlichen Glückwunsch zu deinem Geburtstag! Du kannst einen Gutschein von einem Laden deiner Wahl auswählen.",
    choices: [
      { label: "Tierheim", next: "tier", icon: "img/animal-welfare.jpg" },
      { label: "Juwelierladen", next: "juwelier", icon: "img/jewels.jpg" },
    ],
  },
  juwelier: {
    text: "Der Laden ist momentan geschlossen.",
    bg: "img/bg/jewels.jpg",
    choices: [{ label: "Zum Tierladen", next: "tier" }],
  },
  tier: {
    text: "Du willst also ein Tier aus dem Tierheim adoptieren, toll! Jetzt hast du deine Wahl getroffen. Wie möchtest du wieder nach Hause gehen?",
    bg: "img/bg/animal-welfare.jpg",
    choices: [
      { label: "laufend", next: "laufend" },
      { label: "mit dem Bus", next: "bus" },
    ],
  },
  bus: {
    text: "Leider gab es, als du in den Bus einsteigen wolltest, einen Amoklauf. Der ganze Bus wurde in die Luft gejagt. Du bist jetzt tot.",
    ending: "death",
  },
  laufend: {
    text: "Hui, hast du den Bus gesehen, der explodiert ist? Naja, egal, gehen wir halt zu Fuss nach Hause.",
    bg: "img/bg/house.jpg",
    choices: [{ label: "nach Hause gehen", next: "home", icon: "img/house.jpg" }],
  },
  home: {
    text: "Das war ein harter Tag. Du hast auch ein herziges Haustier adoptiert. Da es jetzt Nacht ist: Willst du schlafen gehen, oder willst du noch ein Buch lesen?",
    bg: "img/bg/bed.jpg",
    choices: [
      { label: "Buch lesen", next: "noise", icon: "img/desk.jpg" },
      { label: "schlafen gehen", next: "noise", icon: "img/bed.jpg" },
    ],
  },
  noise: {
    // Bewusst ohne Hintergrundbild: Der dunkle Moment vor dem Jump-Scare wirkt stärker.
    text: "Hast du dieses Geräusch aus der Küche gehört? Willst du schauen gehen, was passiert ist?",
    choices: [
      { label: "schauen gehen", next: "whathappened", minigame: "listen" },
      { label: "nein, bin zu müde", next: "murder" },
    ],
  },
  murder: {
    text: "Wärst du aufgestanden, hättest du herausgefunden, dass ein Mörder in dein Haus eingebrochen ist. Nun hat er, während du geschlafen hast, neben deinem Haustier auch dich erstochen. Oh je, nun bist du tot... Ruhe in Frieden!",
    bg: "img/psycho.png",
    ending: "death",
  },
  whathappened: {
    text: "Dein Haustier ist verschwunden, was willst du jetzt machen?",
    bg: "img/bg/binoculars.jpg",
    choices: [
      { label: "Polizei anrufen", next: "police", icon: "img/blue-light.jpg" },
      { label: "selber suchen gehen", next: "selfsearch", icon: "img/binoculars.jpg" },
    ],
  },
  police: {
    text: "Hmmm, die nehmen deinen Anruf nicht an... Willst du dein Haustier selber suchen gehen?",
    bg: "img/bg/blue-light.jpg",
    choices: [
      { label: "weiter anrufen", next: "police", icon: "img/blue-light.jpg" },
      { label: "selber suchen gehen", next: "selfsearch", icon: "img/binoculars.jpg" },
    ],
  },
  selfsearch: {
    text: "Siehst du den Mann neben der Lampe? Vielleicht kann er uns weiterhelfen...",
    bg: "img/bg/streetlamp.jpg",
    choices: [{ label: "Den Mann fragen gehen", next: "ask", icon: "img/streetlamp.jpg" }],
  },
  ask: {
    text: "Der Mann sagt, dass er zwar eine Gestalt weglaufen gesehen hat, aber nicht mehr weiss, in welche Richtung. Ging er wohl nach rechts? Oder nach links?",
    bg: "img/bg/streetlamp.jpg",
    choices: [
      { label: "rechts", next: "right" },
      { label: "links", next: "left" },
    ],
  },
  left: {
    text: "Siehst du diese Abdrücke? Das sind bestimmt die von deinem Tier. Verfolgen wir sie mal.",
    bg: "img/bg/search.jpg",
    choices: [{ label: "verfolgen", next: "follow" }],
  },
  right: {
    // Bewusst ohne Bild: der Unfall kommt aus dem Nichts.
    text: "Als du die Strasse überqueren wolltest, hat dich ein Betrunkener mit 200 km/h überfahren.",
    choices: [
      { label: "in Koma fallen", next: "koma" },
      { label: "sterben", next: "die" },
    ],
  },
  follow: {
    text: "Hmm, skurril: Die Pfotenabdrücke führen in ein Loch... Vielleicht sind die Abdrücke gar nicht von deinem Haustier.",
    bg: "img/bg/hole.jpg",
    choices: [
      { label: "trotzdem ins Loch reinkriechen", next: "inhole", icon: "img/hole.jpg" },
      { label: "woanders suchen...", next: "right" },
    ],
  },
  die: {
    text: "Du bist tot.",
    ending: "death",
  },
  koma: {
    text: "Zum Glück konnte jemand noch dein Haustier finden. Nach 7 Monaten im Koma bist du wieder wach, doch mit einem amputierten Arm. Aber zum Glück mag dich dein Haustier auch so ganz gerne.",
    ending: "neutral",
  },
  inhole: {
    text: "Es ist eng und dunkel. Willst du trotzdem weiter reinkriechen?",
    bg: "img/bg/hole.jpg",
    choices: [
      { label: "weiter kriechen", next: "kriechen", icon: "img/kriechen.jpg", minigame: "crawl" },
      { label: "nein, wieder woanders suchen", next: "right" },
    ],
  },
  kriechen: {
    // Kein Bild verfügbar in brauchbarer Auflösung – bleibt bewusst im Dunkeln.
    text: "Hmm, du spürst etwas Holz... Ist es wohl eine Tür?",
    choices: [{ label: "Aufmachen", next: "open", icon: "img/door.jpg" }],
  },
  open: {
    text: "Was ist denn das für eine Welt, die sich gerade unter uns befindet? Egal, suchen wir weiter.",
    bg: "img/world.jpg",
    choices: [{ label: "weiter suchen", next: "cont", icon: "img/search.jpg" }],
  },
  cont: {
    text: "Hörst du das Rauschen, das aus diesem Gebüsch kommt? Willst du schauen gehen, was das sein könnte?",
    bg: "img/bg/bushes.jpg",
    choices: [
      { label: "Ja, es kann mein Haustier sein", next: "see", icon: "img/bushes.jpg", minigame: "spot" },
      { label: "Nope! Ich habe Angst und werde wegrennen!", next: "run", icon: "img/Wegrennen.jpg" },
    ],
  },
  run: {
    text: "Oh Mist, weil du zu schnell gerannt bist, bist du von einer Klippe heruntergefallen... Du bist jetzt tot.",
    bg: "img/jumpingcliff.jpg",
    ending: "death",
  },
  see: {
    text: "Yea, du hast es geschafft! Du hast dein Haustier gefunden! Danke, dass du dir die Zeit genommen hast, dieses Spiel zu spielen.",
    bg: "img/foundanimal.jpg",
    ending: "win",
  },
};

// Minispiele, die einzelne Entscheidungen freischalten (passend zur jeweiligen Szene)
const MINIGAMES = {
  listen: {
    title: "🎧 Nerven-Probe",
    instructions: "Stoppe den Marker in der grünen Zone, um dich zu trauen nachzuschauen.",
    start: startListenGame,
  },
  crawl: {
    title: "🕳️ Durchzwängen",
    instructions: "Tippe schnell genug, um dich durch den engen Gang zu zwängen!",
    start: startCrawlGame,
  },
  spot: {
    title: "👁️ Im Dunkeln erkennen",
    instructions: "Tippe die aufblitzenden Augen an, bevor sie wieder verschwinden.",
    start: startSpotGame,
  },
};

// Metadaten für die Enden-Galerie
const ENDING_META = {
  bus: { title: "Der Amoklauf-Bus", emoji: "🚌" },
  murder: { title: "Der Einbrecher", emoji: "🔪", image: "img/psycho.png" },
  die: { title: "Der Verkehrsunfall", emoji: "🚗" },
  koma: { title: "Das Koma", emoji: "🩹" },
  run: { title: "Der Klippensturz", emoji: "🏔️", image: "img/jumpingcliff.jpg" },
  see: { title: "Wiedervereinigung", emoji: "🎉", image: "img/foundanimal.jpg" },
};

const els = {
  scene: document.getElementById("scene"),
  bg: document.getElementById("scene-bg"),
  text: document.getElementById("scene-text"),
  choices: document.getElementById("choices"),
  badge: document.getElementById("ending-badge"),
  restart: document.getElementById("restart"),
  card: document.getElementById("card"),
  flash: document.getElementById("flash"),
  confetti: document.getElementById("confetti"),
  progress: document.getElementById("ending-progress"),
  toast: document.getElementById("toast"),
  gallery: document.getElementById("gallery"),
  galleryGrid: document.getElementById("gallery-grid"),
  galleryClose: document.getElementById("gallery-close"),
  minigame: document.getElementById("minigame"),
  minigameTitle: document.getElementById("minigame-title"),
  minigameInstructions: document.getElementById("minigame-instructions"),
  minigameStage: document.getElementById("minigame-stage"),
  minigameFeedback: document.getElementById("minigame-feedback"),
  minigameClose: document.getElementById("minigame-close"),
  minigameSkip: document.getElementById("minigame-skip"),
  minigameProgress: document.getElementById("minigame-progress"),
  helpBtn: document.getElementById("help-btn"),
  help: document.getElementById("help"),
  titleScreen: document.getElementById("title-screen"),
  titleStart: document.getElementById("title-start"),
  titleReturning: document.getElementById("title-returning"),
  titleHelp: document.getElementById("title-help"),
  helpClose: document.getElementById("help-close"),
};

const ENDING_LABEL = {
  death: "💀 Game Over",
  win: "🎉 Ende erreicht",
  neutral: "🩹 Ende erreicht",
};

const ALL_ENDING_IDS = Object.keys(STORY).filter((id) => STORY[id].ending);
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const STORAGE_KEY = "geburtstagsabenteuer_endings";
const LOCK_HINT_KEY = "geburtstagsabenteuer_seen_lock_hint";

function loadFoundEndings() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch {
    return new Set();
  }
}

function saveFoundEndings(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

let foundEndings = loadFoundEndings();

function pulse(el) {
  el.classList.remove("pulse");
  void el.offsetWidth;
  el.classList.add("pulse");
}

function updateProgressBadge() {
  const all = foundEndings.size >= ALL_ENDING_IDS.length;
  els.progress.textContent = `🏆 ${foundEndings.size}/${ALL_ENDING_IDS.length} Enden${all ? " – alle gefunden!" : ""}`;
  pulse(els.progress);
}

// --- Minispiel-Bestleistungen (⭐ pro Minispiel-Typ) ---
const MINIGAME_STORAGE_KEY = "geburtstagsabenteuer_minigames";
const MINIGAME_STARS_LABEL = ["nicht gemeistert", "⭐", "⭐⭐", "⭐⭐⭐"];

function loadMinigameStats() {
  try {
    return JSON.parse(localStorage.getItem(MINIGAME_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveMinigameStats(stats) {
  localStorage.setItem(MINIGAME_STORAGE_KEY, JSON.stringify(stats));
}

let minigameStats = loadMinigameStats();

function updateMinigameBadge() {
  const types = Object.keys(MINIGAMES);
  const mastered = types.filter((t) => minigameStats[t] >= 1).length;
  els.minigameProgress.textContent = `🎮 ${mastered}/${types.length} gemeistert`;
  els.minigameProgress.title = types
    .map((t) => `${MINIGAMES[t].title}: ${MINIGAME_STARS_LABEL[minigameStats[t] || 0]}`)
    .join(" · ");
  pulse(els.minigameProgress);
}

function recordMinigameResult(type, stars) {
  const prevBest = minigameStats[type] || 0;
  if (stars > prevBest) {
    minigameStats[type] = stars;
    saveMinigameStats(minigameStats);
  }
  updateMinigameBadge();
}

function renderGallery() {
  els.galleryGrid.innerHTML = "";
  ALL_ENDING_IDS.forEach((id) => {
    const meta = ENDING_META[id];
    const node = STORY[id];
    const found = foundEndings.has(id);

    const card = document.createElement("div");
    card.className = `gallery-card${found ? "" : " locked"} ending-${node.ending}`;

    if (found && meta.image) {
      card.style.backgroundImage = `url("${meta.image}")`;
    }

    const label = document.createElement("span");
    label.className = "gallery-label";
    label.textContent = found ? `${meta.emoji} ${meta.title}` : "🔒 ???";
    card.appendChild(label);

    els.galleryGrid.appendChild(card);
  });
}

function openGallery() {
  renderGallery();
  els.gallery.hidden = false;
}

function closeGallery() {
  els.gallery.hidden = true;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  els.toast.appendChild(toast);
  window.setTimeout(() => toast.classList.add("toast-in"), 10);
  window.setTimeout(() => {
    toast.classList.remove("toast-in");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3200);
}

function fireConfetti() {
  if (REDUCED_MOTION) return;
  const colors = ["#4ade80", "#6c8cff", "#f5b942", "#ff5b6a", "#f2f2f2"];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("i");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.3}s`;
    piece.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 160}px`);
    els.confetti.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

function burstMiniConfetti(container) {
  if (REDUCED_MOTION) return;
  const colors = ["#4ade80", "#6c8cff", "#f5b942", "#ff5b6a", "#f2f2f2"];
  for (let i = 0; i < 20; i++) {
    const piece = document.createElement("i");
    piece.className = "confetti-piece confetti-piece-mini";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.15}s`;
    piece.style.animationDuration = `${0.7 + Math.random() * 0.5}s`;
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 90}px`);
    container.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

function fireImpact() {
  els.flash.classList.remove("flash-active");
  void els.flash.offsetWidth;
  els.flash.classList.add("flash-active");

  if (!REDUCED_MOTION) {
    els.card.classList.remove("shake");
    void els.card.offsetWidth;
    els.card.classList.add("shake");
  }
}

let activeMinigameCleanup = null;

function setMinigameFeedback(message, success) {
  els.minigameFeedback.textContent = message;
  els.minigameFeedback.classList.toggle("minigame-success", !!success);
  els.minigameFeedback.classList.toggle("minigame-fail", success === false);
}

function openMinigame(type, onDone) {
  const game = MINIGAMES[type];
  let failCount = 0;

  els.minigameTitle.textContent = game.title;
  els.minigameInstructions.textContent = game.instructions;
  els.minigameStage.innerHTML = "";
  setMinigameFeedback("", null);
  els.minigameSkip.hidden = true;
  els.minigame.hidden = false;

  function finish(stars) {
    if (activeMinigameCleanup) activeMinigameCleanup();
    activeMinigameCleanup = null;
    els.minigameSkip.onclick = null;

    if (stars > 0) {
      burstMiniConfetti(els.minigameStage);
      recordMinigameResult(type, stars);
    }
    window.setTimeout(() => {
      els.minigame.hidden = true;
      onDone();
    }, stars > 0 ? 700 : 200);
  }

  els.minigameSkip.onclick = () => {
    setMinigameFeedback("⏭️ Übersprungen", null);
    finish(0);
  };

  const cleanup = game.start(
    els.minigameStage,
    (stars) => finish(stars),
    () => {
      failCount++;
      if (failCount >= 3) els.minigameSkip.hidden = false;
    }
  );
  activeMinigameCleanup = cleanup || null;
}

function closeMinigame() {
  if (activeMinigameCleanup) activeMinigameCleanup();
  activeMinigameCleanup = null;
  els.minigameSkip.onclick = null;
  els.minigame.hidden = true;
}

// --- Nerven-Probe: Marker in der Zielzone stoppen ---
function startListenGame(stage, onSuccess, onFail) {
  let raf = null;

  function round() {
    stage.innerHTML = `
      <div class="listen-track">
        <div class="listen-zone"></div>
        <div class="listen-marker"></div>
      </div>
      <button type="button" class="minigame-action">JETZT!</button>
    `;
    const marker = stage.querySelector(".listen-marker");
    const btn = stage.querySelector(".minigame-action");
    let pos = 0;
    let dir = 1;

    function tick() {
      pos += dir * 1.8;
      if (pos >= 100) { pos = 100; dir = -1; }
      if (pos <= 0) { pos = 0; dir = 1; }
      marker.style.left = pos + "%";
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    btn.addEventListener("click", () => {
      cancelAnimationFrame(raf);
      const dist = Math.abs(pos - 50);
      const success = dist <= 12;
      if (success) {
        const stars = dist <= 4 ? 3 : dist <= 8 ? 2 : 1;
        setMinigameFeedback("✅ Du hast dich getraut!", true);
        onSuccess(stars);
      } else {
        setMinigameFeedback("❌ Zu zögerlich... nochmal!", false);
        onFail();
        window.setTimeout(round, 700);
      }
    });
  }

  round();
  return () => { if (raf) cancelAnimationFrame(raf); };
}

// --- Durchzwängen: schnell genug tippen ---
function startCrawlGame(stage, onSuccess, onFail) {
  let timer = null;

  function round() {
    const target = 16;
    const duration = 3500;
    let count = 0;
    let done = false;

    stage.innerHTML = `
      <div class="crawl-bar"><div class="crawl-fill"></div></div>
      <button type="button" class="minigame-action crawl-btn">🤜 Drücken!</button>
    `;
    const fill = stage.querySelector(".crawl-fill");
    const btn = stage.querySelector(".crawl-btn");
    const startTime = Date.now();

    timer = window.setInterval(() => {
      if (!done && Date.now() - startTime >= duration) {
        done = true;
        clearInterval(timer);
        setMinigameFeedback("❌ Zu langsam... nochmal!", false);
        onFail();
        window.setTimeout(round, 700);
      }
    }, 100);

    btn.addEventListener("click", () => {
      if (done) return;
      count++;
      fill.style.width = Math.min(100, (count / target) * 100) + "%";
      if (count >= target) {
        done = true;
        clearInterval(timer);
        const elapsed = Date.now() - startTime;
        const stars = elapsed <= 1500 ? 3 : elapsed <= 2500 ? 2 : 1;
        setMinigameFeedback("✅ Geschafft, du zwängst dich durch!", true);
        onSuccess(stars);
      }
    });
  }

  round();
  return () => { if (timer) clearInterval(timer); };
}

// --- Im Dunkeln erkennen: aufblitzende Ziele antippen ---
function startSpotGame(stage, onSuccess, onFail) {
  const timeouts = [];
  const setTimeoutTracked = (fn, ms) => {
    const t = window.setTimeout(fn, ms);
    timeouts.push(t);
    return t;
  };

  function round() {
    const rounds = 3;
    const needed = 2;
    let current = 0;
    let hits = 0;

    stage.innerHTML = `<div class="spot-area"><p class="spot-status"></p></div>`;
    const area = stage.querySelector(".spot-area");
    const status = stage.querySelector(".spot-status");

    function nextFlash() {
      if (current >= rounds) {
        if (hits >= needed) {
          const stars = hits >= 3 ? 3 : 2;
          setMinigameFeedback("✅ Du hast es entdeckt!", true);
          onSuccess(stars);
        } else {
          setMinigameFeedback("❌ Zu langsam... nochmal!", false);
          onFail();
          setTimeoutTracked(round, 700);
        }
        return;
      }
      current++;
      status.textContent = `Runde ${current}/${rounds}`;

      setTimeoutTracked(() => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "spot-dot";
        dot.textContent = "👁️";
        dot.style.left = Math.random() * 78 + 4 + "%";
        dot.style.top = Math.random() * 68 + 4 + "%";
        let caught = false;

        dot.addEventListener("click", () => {
          if (caught) return;
          caught = true;
          hits++;
          dot.remove();
          nextFlash();
        });

        area.appendChild(dot);
        setTimeoutTracked(() => {
          if (!caught) {
            dot.remove();
            nextFlash();
          }
        }, 750);
      }, 400 + Math.random() * 800);
    }

    nextFlash();
  }

  round();
  return () => { timeouts.forEach((t) => window.clearTimeout(t)); };
}

function render(id) {
  const node = STORY[id];

  els.card.classList.add("fade-out");
  window.setTimeout(() => {
    els.text.textContent = node.text;

    if (node.bg) {
      els.bg.style.backgroundImage = `url("${node.bg}")`;
      els.scene.classList.add("has-bg");
    } else {
      els.bg.style.backgroundImage = "";
      els.scene.classList.remove("has-bg");
    }

    els.card.classList.remove("death", "win", "neutral");
    if (node.ending) {
      els.card.classList.add(node.ending);
      els.badge.textContent = ENDING_LABEL[node.ending];
      els.badge.hidden = false;

      const isNew = !foundEndings.has(id);
      if (isNew) {
        foundEndings.add(id);
        saveFoundEndings(foundEndings);
      }
      updateProgressBadge();

      if (node.ending === "win") fireConfetti();
      if (node.ending === "death") fireImpact();

      if (isNew) {
        const meta = ENDING_META[id];
        window.setTimeout(() => showToast(`🏅 Neues Ende freigeschaltet: ${meta.title}`), 350);
      }
    } else {
      els.badge.hidden = true;
    }

    els.choices.innerHTML = "";

    if (node.ending) {
      const btn = document.createElement("button");
      btn.className = "choice restart-choice";
      btn.textContent = "Nochmal von vorne";
      if (!REDUCED_MOTION) btn.classList.add("choice-enter");
      btn.addEventListener("click", () => render("start"));
      els.choices.appendChild(btn);
    } else {
      const hasLocked = node.choices.some((c) => c.minigame);
      if (hasLocked && !localStorage.getItem(LOCK_HINT_KEY)) {
        localStorage.setItem(LOCK_HINT_KEY, "1");
        window.setTimeout(() => showToast("🎮 Diese Auswahl braucht zuerst ein Minispiel!"), 500);
      }

      node.choices.forEach((choice, i) => {
        const btn = document.createElement("button");
        btn.type = "button";

        if (choice.icon) {
          btn.className = "choice choice-tile";
          const img = document.createElement("img");
          img.src = choice.icon;
          img.alt = "";
          img.loading = "lazy";
          btn.appendChild(img);
        } else {
          btn.className = "choice";
        }

        if (!REDUCED_MOTION) {
          btn.classList.add("choice-enter");
          btn.style.animationDelay = `${i * 70}ms`;
        }

        const span = document.createElement("span");
        span.className = "choice-label";
        span.textContent = choice.label;
        btn.appendChild(span);

        if (choice.minigame) {
          btn.classList.add("choice-locked");
          btn.title = "Erst Minispiel lösen";
          const lock = document.createElement("span");
          lock.className = "choice-lock";
          lock.textContent = "🎮";
          btn.appendChild(lock);
          btn.addEventListener("click", () => {
            openMinigame(choice.minigame, () => render(choice.next));
          });
        } else {
          btn.addEventListener("click", () => render(choice.next));
        }

        els.choices.appendChild(btn);

        if (i < 9) btn.dataset.key = String(i + 1);
      });
    }

    location.hash = id;
    els.card.classList.remove("fade-out");
  }, 180);
}

els.restart.addEventListener("click", () => render("start"));
els.progress.addEventListener("click", openGallery);
els.galleryClose.addEventListener("click", closeGallery);
els.gallery.addEventListener("click", (e) => {
  if (e.target === els.gallery) closeGallery();
});

els.minigameClose.addEventListener("click", closeMinigame);
els.minigame.addEventListener("click", (e) => {
  if (e.target === els.minigame) closeMinigame();
});

function openHelp() {
  els.help.hidden = false;
}
function closeHelp() {
  els.help.hidden = true;
}
els.helpBtn.addEventListener("click", openHelp);
els.helpClose.addEventListener("click", closeHelp);
els.help.addEventListener("click", (e) => {
  if (e.target === els.help) closeHelp();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !els.minigame.hidden) {
    closeMinigame();
    return;
  }
  if (e.key === "Escape" && !els.gallery.hidden) {
    closeGallery();
    return;
  }
  if (e.key === "Escape" && !els.help.hidden) {
    closeHelp();
    return;
  }
  if (!els.minigame.hidden || !els.gallery.hidden || !els.help.hidden || !els.titleScreen.hidden) return;
  const btn = els.choices.querySelector(`[data-key="${e.key}"]`);
  if (btn) btn.click();
});

updateProgressBadge();
updateMinigameBadge();

els.titleStart.addEventListener("click", () => {
  els.titleScreen.hidden = true;
});
els.titleHelp.addEventListener("click", openHelp);

const startId = location.hash.replace("#", "");
render(STORY[startId] ? startId : "start");

if (STORY[startId]) {
  els.titleScreen.hidden = true;
} else if (foundEndings.size > 0) {
  els.titleReturning.textContent = `Willkommen zurück! Bisher gefunden: 🏆 ${foundEndings.size}/${ALL_ENDING_IDS.length} Enden`;
  els.titleReturning.hidden = false;
}
