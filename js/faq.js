(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // src/js/lib/config.js
  var require_config = __commonJS({
    "src/js/lib/config.js"(exports, module) {
      var PAGE_CONFIG_ID = "awt-page-config";
      function parseJsonConfig(raw, fallback) {
        const fallbackValue = arguments.length > 1 ? fallback : null;
        if (raw == null) return fallbackValue;
        const text = String(raw).trim();
        if (!text) return fallbackValue;
        try {
          return JSON.parse(text);
        } catch (e) {
          return fallbackValue;
        }
      }
      function readJsonConfigById(root, id, fallback) {
        const fallbackValue = arguments.length > 2 ? fallback : null;
        if (!root || typeof root.getElementById !== "function" || !id) {
          return fallbackValue;
        }
        const el = root.getElementById(id);
        if (!el) return fallbackValue;
        const raw = "textContent" in el ? el.textContent : el.innerHTML;
        return parseJsonConfig(raw, fallbackValue);
      }
      function readPageConfig(root, fallback) {
        const empty = fallback && typeof fallback === "object" && !Array.isArray(fallback) ? fallback : {};
        const parsed = readJsonConfigById(root, PAGE_CONFIG_ID, null);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed;
        }
        return empty;
      }
      module.exports = {
        PAGE_CONFIG_ID,
        parseJsonConfig,
        readJsonConfigById,
        readPageConfig
      };
    }
  });

  // src/js/lib/email-storage.js
  var require_email_storage = __commonJS({
    "src/js/lib/email-storage.js"(exports, module) {
      var EMAIL_STORAGE_KEY = "email";
      function resolveStorage(storage) {
        if (storage && typeof storage.getItem === "function") return storage;
        try {
          if (typeof localStorage !== "undefined") return localStorage;
        } catch (e) {
          return null;
        }
        return null;
      }
      function getStoredEmail(storage) {
        const store = resolveStorage(storage);
        if (!store || typeof store.getItem !== "function") return "";
        try {
          return String(store.getItem(EMAIL_STORAGE_KEY) || "");
        } catch (e) {
          return "";
        }
      }
      function setStoredEmail(email, storage) {
        const store = resolveStorage(storage);
        if (!store || typeof store.setItem !== "function") return false;
        try {
          store.setItem(EMAIL_STORAGE_KEY, String(email || ""));
          return true;
        } catch (e) {
          return false;
        }
      }
      module.exports = {
        EMAIL_STORAGE_KEY,
        getStoredEmail,
        setStoredEmail
      };
    }
  });

  // src/js/lib/tracking.js
  var require_tracking = __commonJS({
    "src/js/lib/tracking.js"(exports, module) {
      var DEFAULT_BEACON_URL = "https://beacon.azo.workers.dev/";
      function toPlain(value) {
        try {
          return structuredClone(value);
        } catch (e) {
          try {
            return JSON.parse(JSON.stringify(value));
          } catch (e2) {
            return value;
          }
        }
      }
      function resolveSendBeacon(options) {
        if (options && typeof options.sendBeacon === "function") {
          return options.sendBeacon;
        }
        try {
          if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
            return navigator.sendBeacon.bind(navigator);
          }
        } catch (e) {
          return null;
        }
        return null;
      }
      function beacontrack(obj, options) {
        try {
          const clean = toPlain(obj);
          const json = JSON.stringify(clean);
          if (!json) return false;
          const sendBeacon = resolveSendBeacon(options);
          if (typeof sendBeacon !== "function") return false;
          const url = options && options.url || DEFAULT_BEACON_URL;
          const payload = typeof Blob === "function" ? new Blob([json], { type: "application/json" }) : json;
          return Boolean(sendBeacon(url, payload));
        } catch (error) {
          if (options && options.logger && typeof options.logger.error === "function") {
            options.logger.error("beacontrack failed", error);
          }
          return false;
        }
      }
      module.exports = {
        DEFAULT_BEACON_URL,
        toPlain,
        beacontrack
      };
    }
  });

  // src/js/components/faq.js
  var require_faq = __commonJS({
    "src/js/components/faq.js"(exports, module) {
      var { parseJsonConfig } = require_config();
      var { getStoredEmail, setStoredEmail } = require_email_storage();
      var { beacontrack } = require_tracking();
      var FAQ_MAX_SHOWN = 3;
      var ASK_AI_URL = "https://olgdvvxouytdchveiaad.supabase.co/functions/v1/ask-ai";
      var SUBSCRIBE_URL = "https://olgdvvxouytdchveiaad.supabase.co/functions/v1/subscribe";
      var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2R2dnhvdXl0ZGNodmVpYWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDA1OTEsImV4cCI6MjA2NzQ3NjU5MX0.Y8QlgS1L8oaxdNuRWtAF2QnCewXUE0dS91MSt_BtU_8";
      function faqSectionKey(section) {
        return String(section == null ? "" : section);
      }
      function faqInstanceId(section) {
        return `faq-${faqSectionKey(section)}`;
      }
      function faqAnswerPanelId(section) {
        return `${faqInstanceId(section)}-answer`;
      }
      function faqAskInputId(section) {
        return `${faqInstanceId(section)}-ask`;
      }
      function faqFollowupInputId(section) {
        return `${faqInstanceId(section)}-followup-email`;
      }
      function faqQuestionButtonId(section, index) {
        return `${faqInstanceId(section)}-q-${index}`;
      }
      function toggleOpenIndex(current, index) {
        if (!Number.isInteger(index) || index < 0) return current == null ? null : current;
        return current === index ? null : index;
      }
      function adjacentFaqIndex(index, delta, count) {
        const total = Number(count) || 0;
        if (total < 1) return 0;
        const from = Number.isInteger(index) ? index : 0;
        const step = Number(delta) || 0;
        return (from + step + total) % total;
      }
      function visibleFaqCount(items, shown, maxShown) {
        const max = Number.isInteger(maxShown) ? maxShown : FAQ_MAX_SHOWN;
        const available = Array.isArray(items) ? items.length : 0;
        const revealed = Number.isInteger(shown) ? shown : 0;
        return Math.max(0, Math.min(max, available, revealed));
      }
      function prefersReducedMotion(media) {
        try {
          if (media && typeof media.matches === "boolean") return media.matches;
          if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
            return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          }
        } catch (e) {
          return false;
        }
        return false;
      }
      function readFaqItems(root) {
        const doc = root || (typeof document !== "undefined" ? document : null);
        if (!doc || typeof doc.getElementById !== "function") return [];
        const el = doc.getElementById("faq-data");
        if (!el) return [];
        const parsed = parseJsonConfig(el.textContent, []);
        return Array.isArray(parsed) ? parsed : [];
      }
      function readPostId(root) {
        const doc = root || (typeof document !== "undefined" ? document : null);
        if (!doc || typeof doc.querySelector !== "function") return "";
        const meta = doc.querySelector('meta[name="postid"]');
        return meta ? meta.getAttribute("content") || "" : "";
      }
      function shuffleFaqItems(items) {
        if (!Array.isArray(items) || items.length < 2) return items;
        const copy = items.slice();
        for (let i = copy.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = copy[i];
          copy[i] = copy[j];
          copy[j] = temp;
        }
        return copy;
      }
      function createFaqComponent(options) {
        const opts = options || {};
        const doc = opts.document || (typeof document !== "undefined" ? document : null);
        const loc = opts.location || (typeof window !== "undefined" ? window.location : { href: "", hash: "" });
        const fetchFn = opts.fetch || (typeof fetch === "function" ? fetch.bind(globalThis) : null);
        const track = opts.track || beacontrack;
        const storage = opts.storage;
        return {
          items: readFaqItems(doc),
          shown: 0,
          maxShown: FAQ_MAX_SHOWN,
          openIndex: null,
          observer: null,
          loadTimer: null,
          loaded: false,
          revealTimer: null,
          aiLoading: false,
          aiState: "idle",
          aiQuestion: "",
          aiAnswer: "",
          followupEmail: getStoredEmail(storage),
          followupSending: false,
          followupMessage: "",
          section: "",
          question: "",
          aiFaqs: [],
          reducedMotion: false,
          get instanceId() {
            return faqInstanceId(this.section);
          },
          get answerPanelId() {
            return faqAnswerPanelId(this.section);
          },
          get askInputId() {
            return faqAskInputId(this.section);
          },
          get followupInputId() {
            return faqFollowupInputId(this.section);
          },
          get openItem() {
            if (this.openIndex == null || !this.items) return null;
            return this.items[this.openIndex] || null;
          },
          questionButtonId(index) {
            return faqQuestionButtonId(this.section, index);
          },
          isOpen(index) {
            return this.openIndex === index;
          },
          async init() {
            this.section = this.$el && this.$el.getAttribute("data-section") || "";
            this.reducedMotion = prefersReducedMotion();
            if (this.items.length > 0) this.shuffleItems();
            this.observeHeading();
          },
          revealItems() {
            if (this.revealTimer) return;
            const total = this.items ? this.items.length : 0;
            if (total === 0) return;
            this.shuffleItems();
            const targetCount = Math.min(this.maxShown, total);
            if (this.reducedMotion) {
              this.shown = targetCount;
              return;
            }
            this.revealTimer = setInterval(() => {
              if (this.shown >= targetCount) {
                clearInterval(this.revealTimer);
                this.revealTimer = null;
                return;
              }
              this.shown += 1;
            }, 500);
          },
          shuffleItems() {
            this.items = shuffleFaqItems(this.items);
          },
          observeHeading() {
            if (this.loaded || this.observer) return;
            const target = this.$el || null;
            if (!target || typeof IntersectionObserver === "undefined") {
              if (this.items.length > 0) this.revealItems();
              else this.loadData();
              return;
            }
            this.observer = new IntersectionObserver((entries) => {
              const entry = entries[0];
              if (!entry) return;
              if (entry.isIntersecting) {
                if (this.loadTimer) return;
                this.loadTimer = setTimeout(() => {
                  this.loaded = true;
                  this.loadTimer = null;
                  if (this.items.length > 0) this.revealItems();
                  else this.loadData();
                  if (this.observer) this.observer.disconnect();
                }, 1e3);
              } else if (this.loadTimer) {
                clearTimeout(this.loadTimer);
                this.loadTimer = null;
              }
            }, { threshold: 0.6 });
            this.observer.observe(target);
          },
          async loadData() {
            const id = readPostId(doc);
            if (!id || !fetchFn) return;
            const cdnUrl = `https://pub-1969d309989b4ee98dadd29698bd2213.r2.dev/${id}.json`;
            const workerUrl = `https://faq.azo.workers.dev/${id}/`;
            try {
              const cdnResponse = await fetchFn(cdnUrl);
              if (cdnResponse && cdnResponse.ok) {
                const cdnData = await cdnResponse.json();
                this.items = cdnData.list || [];
                this.shuffleItems();
                this.revealItems();
                return;
              }
              if (cdnResponse && cdnResponse.status !== 404) return;
            } catch (e) {
            }
            try {
              const response = await fetchFn(workerUrl);
              if (!response || !response.ok) return;
              const data = await response.json();
              this.items = data.list || [];
              this.shuffleItems();
              this.revealItems();
            } catch (error) {
              console.error("FAQ worker error:", error);
            }
          },
          toggleQuestion(index) {
            const next = toggleOpenIndex(this.openIndex, index);
            this.openIndex = next;
            if (next !== null) this.report(index);
          },
          onQuestionKeydown(event, index) {
            if (!event) return;
            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
            event.preventDefault();
            const count = visibleFaqCount(this.items, this.shown, this.maxShown);
            const next = adjacentFaqIndex(index, event.key === "ArrowRight" ? 1 : -1, count);
            const root = this.$el;
            if (!root || typeof root.querySelector !== "function") return;
            const button = root.querySelector(`#${faqQuestionButtonId(this.section, next)}`);
            if (button && typeof button.focus === "function") button.focus();
          },
          report(index) {
            const item = this.items[index];
            if (!item) return;
            item.index = index;
            item.total = this.items.length;
            track({ type: "faq", action: 1, post_id: readPostId(doc), item });
          },
          askQuestion(question) {
            const normalizedQuestion = String(question || "").trim();
            if (!normalizedQuestion) return;
            this.aiLoading = true;
            this.aiState = "idle";
            this.aiQuestion = normalizedQuestion;
            this.aiAnswer = "";
            this.followupMessage = "";
            const section = this.section || String(loc.hash || "").replace(/^#/, "");
            console.info("[ask-ai] browser request", {
              postid: readPostId(doc),
              question: normalizedQuestion,
              section,
              url: loc.href
            });
            if (!fetchFn) {
              this.aiState = "fallback";
              this.aiLoading = false;
              return Promise.resolve();
            }
            return fetchFn(ASK_AI_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`
              },
              body: JSON.stringify({
                postid: readPostId(doc),
                question: normalizedQuestion,
                section
              })
            }).then(async (response) => {
              const data = await response.json().catch(() => ({}));
              if (!response.ok) throw new Error(data.error || "Unable to answer this question");
              return data;
            }).then((data) => {
              console.info("[ask-ai] browser response", data);
              this.aiState = data.status === "fallback" ? "fallback" : "answered";
              this.aiQuestion = data.question || normalizedQuestion;
              this.aiAnswer = data.answer || "";
              if (data.status === "answered" && data.answer) {
                this.aiFaqs.push({
                  id: `${this.instanceId}-${Date.now()}-${this.aiFaqs.length}`,
                  question: this.aiQuestion,
                  answer: data.answer
                });
              }
              track({ type: "aifaq", action: 1, post_id: readPostId(doc), item: {
                question: normalizedQuestion,
                relevant: data.status !== "fallback",
                source: "backend_llm"
              } });
              this.question = "";
            }).catch((error) => {
              console.error("[ask-ai] browser error", error);
              this.aiState = "fallback";
              this.aiAnswer = "";
            }).finally(() => {
              this.aiLoading = false;
            });
          },
          async submitFollowup() {
            const email = String(this.followupEmail || "").trim();
            if (!email) return;
            const question = this.aiQuestion;
            this.followupSending = true;
            this.followupMessage = "";
            try {
              if (!fetchFn) throw new Error("Unable to submit email");
              const response = await fetchFn(SUBSCRIBE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email,
                  postId: readPostId(doc),
                  postUrl: loc.href,
                  question: String(question || "").trim(),
                  params: {
                    title: "Ask AI follow-up",
                    subtitle: `Please follow up on this question: ${String(question || "").trim()}`,
                    offer: "Ask AI"
                  }
                })
              });
              if (!response.ok) throw new Error("Unable to submit email");
              this.followupMessage = "Thanks! We\u2019ll get back to you.";
              setStoredEmail(email, storage);
              track({ type: "aifaq_followup", action: 1, post_id: readPostId(doc), item: { question, email } });
            } catch (error) {
              console.error("Ask AI follow-up error:", error);
              this.followupMessage = "Sorry, we could not save your email. Please try again.";
            } finally {
              this.followupSending = false;
            }
          }
        };
      }
      function faqData() {
        return createFaqComponent();
      }
      module.exports = {
        FAQ_MAX_SHOWN,
        faqInstanceId,
        faqAnswerPanelId,
        faqAskInputId,
        faqFollowupInputId,
        faqQuestionButtonId,
        toggleOpenIndex,
        adjacentFaqIndex,
        visibleFaqCount,
        prefersReducedMotion,
        readFaqItems,
        createFaqComponent,
        faqData
      };
    }
  });

  // src/js/faq.js
  var require_faq2 = __commonJS({
    "src/js/faq.js"(exports, module) {
      var { faqData } = require_faq();
      if (typeof window !== "undefined") {
        window.faqData = faqData;
      }
      module.exports = { faqData };
    }
  });
  require_faq2();
})();
