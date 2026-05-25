(() => {
  // src/js/app.js
  function loadJs(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.setAttribute("defer", "true");
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      document.documentElement.firstChild.appendChild(script);
    });
  }
  function addMultilineHtml(html, divId) {
    const div = document.getElementById(divId);
    if (div) div.innerHTML = html.trim();
  }
  function getCookieValue(cookieName) {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(`${cookieName}=`)) return cookie.split("=")[1];
    }
    return null;
  }
  function getRandomCount() {
    return Math.floor(Math.random() * 1e3);
  }
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
  function beacontrack(obj) {
    try {
      const clean = toPlain(obj);
      const json = JSON.stringify(clean);
      if (!json) return;
      const beaconData = new Blob([json], { type: "application/json" });
      navigator.sendBeacon("https://beacon.azo.workers.dev/", beaconData);
    } catch (e) {
      console.error("beacontrack failed", e);
    }
  }
  function keywords() {
    return {
      keywords: [],
      init() {
        this.loadKeywords();
      },
      loadKeywords() {
        const filePaths = [
          "list.json",
          "/list.json",
          "https://allwomenstalk.com/list.json"
        ];
        const fetchKeywords = async (filePath) => {
          try {
            return await fetch(filePath).then((r) => {
              if (!r.ok) throw new Error("Network response was not ok");
              return r.json();
            });
          } catch (e) {
          }
        };
        const run = async () => {
          for (const fp of filePaths) {
            const list = await fetchKeywords(fp);
            if (list) {
              this.keywords = list.sort(() => 0.5 - Math.random()).slice(0, 6);
              break;
            }
          }
        };
        run();
      }
    };
  }
  function elaborateComponent() {
    return {
      postid: "",
      page: "",
      label: "",
      response: "",
      init(postid, page) {
        this.postid = postid;
        this.page = page;
        this.label = this.getRandomLabel() + " ...";
      },
      getRandomLabel() {
        const labels = ["Elaborate", "Expand", "More", "Details"];
        return labels[Math.floor(Math.random() * labels.length)];
      },
      async fetchData() {
        try {
          const response = await fetch("https://us-central1.gcp.data.mongodb-api.com/app/allwomenstalk-ebogu/endpoint/elaborate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postid: this.postid, page: this.page }),
            redirect: "follow"
          });
          return await response.text();
        } catch (error) {
          return null;
        }
      },
      async handleClick(button) {
        const event = { label: button.innerText.trim(), page: this.page };
        beacontrack({ type: "elaborate", action: 1, post_id: this.postid, item: event });
        button.disabled = true;
        button.innerText = "Loading...";
        const result = await this.fetchData();
        if (result) {
          try {
            this.response = JSON.parse(result).response;
          } catch (e) {
          }
        }
        this.label = this.getRandomLabel() + " ...";
        button.disabled = false;
      }
    };
  }
  function newsletterComponent() {
    const meta = document.querySelector('meta[name="postid"]');
    return {
      postId: meta ? meta.getAttribute("content") : "",
      postUrl: window.location.href,
      email: "",
      message: "",
      titles: [],
      title: "",
      subtitle: "",
      offer: "Subscriber Specials",
      init() {
        this.setupObserver();
        this.setTitle();
      },
      setTitle() {
        const jsonurl = "https://allwomenstalk.github.io/data/newsletter.json";
        fetch(jsonurl).then((r) => r.json()).then((data) => {
          this.titles = data;
        });
        const randomIndex = Math.floor(Math.random() * this.titles.length);
        if (this.titles[randomIndex]) {
          this.title = this.titles[randomIndex].title;
          this.subtitle = this.titles[randomIndex].subtitle;
        }
      },
      async sub() {
        try {
          const params = { title: this.title, subtitle: this.subtitle, offer: this.offer };
          const url = "https://olgdvvxouytdchveiaad.supabase.co/functions/v1/subscribe";
          const payload = { params, email: this.email, postTitle: this.postTitle, postId: this.postId };
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (!response.ok) throw new Error("Network response was not ok");
          await response.json();
          this.message = "Done! Thank you for subscribing!";
          localStorage.setItem("email", this.email);
          this.track("action");
        } catch (error) {
          this.message = "There was an error with your subscription.";
        }
      },
      async sendFormVisibleEvent() {
        this.setTitle();
        this.track("impression");
      },
      setupObserver() {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) this.sendFormVisibleEvent();
          });
        }, { threshold: 0.5 });
        observer.observe(this.$el);
      },
      async track(event) {
        const trackapi = `https://us-central1.gcp.data.mongodb-api.com/app/allwomenstalk-ebogu/endpoint/stats`;
        const bodyContent = {
          keys: { post_id: this.postId, type: "foodnewsletter", post_url: this.postUrl },
          inc: { [`${event}.${this.title}`]: 1 }
        };
        if (event === "action") bodyContent.inc.track_count = 1;
        else bodyContent.inc.impressions = 1;
        try {
          await fetch(trackapi, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyContent)
          });
        } catch (error) {
        }
      }
    };
  }
  var bg = `https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/73df9d6f-599e-471a-8fec-271e350ff1d1/0_3.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/a3baae07-2fd8-460b-ba7a-313eb51e656f/0_3.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/14772c47-1924-4985-8149-11fbd570d9c8/0_3.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/ec9ce53f-a3ff-4540-b2c0-38913317e8c2/0_3.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/09f00e87-e198-4e74-bf94-e355e1f90de9/0_0.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/07342aae-ea1e-4fed-8de4-2d1554fae572/0_0.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/24d2ccb7-bd32-4b9c-be83-d47d3208c79e/0_0.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/21c90a2e-f563-4be9-be60-b46824e75713/0_1.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/98ba8b4f-85f9-45a4-8168-70e0e1f87de5/0_1.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/499cd8bf-ccf9-4d84-a815-9e25cd39e248/0_0.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/bda2dc70-5ec2-4568-836e-d8af9571c999/0_1.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/9c07f23d-86d4-45b1-a21b-12bc89df16d4/0_0.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/cb62f3b7-26ed-4628-9b6d-abb0e388cb6f/0_3.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/904fbc56-4ff4-4def-ad8d-026464c846ac/0_2.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/ed5dc76f-0a65-4a01-981c-63bf26788567/0_0.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/fb7d44d7-7468-4f69-a708-0b41f3317797/0_2.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/9ec7f3b5-f59c-42be-8b55-b5cc6473d04d/0_1.png
https://pub-ff6bb52033e3451e83c2df5c4e8c073f.r2.dev/52a792a8-13a9-4c7f-be2c-9fb73cc33b2c/0_0.png`;
  function personalize() {
    return {
      open: false,
      theme: "light",
      changeCount: 0,
      themes: [
        { id: "light", label: "Light", desc: "Clean and bright", bg: "#f9fafb", accent: "#B77466" },
        { id: "warm", label: "Warm", desc: "Soft, sepia tones", bg: "#f4ecdf", accent: "#a85f50" },
        { id: "dark", label: "Dark", desc: "Easy on the eyes", bg: "#1d2025", accent: "#e0a99d" }
      ],
      // Same anonymous beacon pipeline + shape as faqData().report():
      // { type, action, post_id, item }. Lets us see how many people open
      // Customize, how often themes change, and which themes win.
      pid() {
        const meta = document.querySelector('meta[name="postid"]');
        return meta ? meta.getAttribute("content") : "";
      },
      track(item) {
        try {
          beacontrack({ type: "personalize", action: 1, post_id: this.pid(), item });
        } catch (e) {
        }
      },
      init() {
        try {
          this.theme = localStorage.getItem("awt-theme") || "light";
        } catch (e) {
        }
        window.addEventListener("open-personalize", () => {
          this.open = true;
          this.track({ event: "open", theme: this.theme });
        });
        this.$watch("open", (v) => this.toggleProfileBadge(v));
      },
      toggleProfileBadge(hide) {
        const el = document.getElementById("awsk-badge-slot");
        if (el) el.style.visibility = hide ? "hidden" : "";
      },
      setTheme(id) {
        const from = this.theme;
        this.theme = id;
        try {
          localStorage.setItem("awt-theme", id);
        } catch (e) {
        }
        const el = document.documentElement;
        if (id && id !== "light") el.setAttribute("data-theme", id);
        else el.removeAttribute("data-theme");
        if (id !== from) {
          this.changeCount += 1;
          this.track({ event: "theme", from, to: id, count: this.changeCount });
        }
      },
      reset() {
        this.setTheme("light");
      }
    };
  }
  document.addEventListener("alpine:init", () => {
    if (window.Alpine && Alpine.data) Alpine.data("personalize", personalize);
    const bannerHtml = `
<div class="flex w-full max-w-full items-center gap-x-2 overflow-hidden bg-gray-900 px-2 py-2.5 sm:gap-x-6 sm:px-3.5 sm:before:flex-1">
  <p class="min-w-0 flex-1 truncate text-sm leading-6 text-white opacity-0 sm:flex-none"
     :class="{ 'opacity-100': banner.text }"
     x-transition x-transition.duration.2500ms>
    <a :href="banner.link" target="_blank" class="block min-w-0 truncate">
      <strong x-text="banner.strong" class="font-semibold"></strong>
      <svg viewBox="0 0 2 2" class="mx-2 inline h-0.5 w-0.5 fill-current" aria-hidden="true"><circle cx="1" cy="1" r="1" /></svg>
      <span x-text="banner.text"></span>
      <svg viewBox="0 0 2 2" class="mx-2 hidden h-0.5 w-0.5 fill-current sm:inline" aria-hidden="true"><circle cx="1" cy="1" r="1" /></svg>
      <span class="flex-none rounded-full whitespace-nowrap bg-gray-50 px-3.5 py-1 text-sm font-semibold text-black shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
        <span x-text="banner.cta" class="hidden sm:inline-block"></span>
        <span aria-hidden="true">&rarr;</span>
      </span>
    </a>
  </p>
  <div class="flex shrink-0 justify-end sm:flex-1">
    <a href="https://allwomenstalk.com/banner/" target="_blank" class="text-white opacity-40 hover:opacity-80 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
      <span class="md:hidden text-black">Ad</span>
      <span class="hidden md:inline-block text-black">Adverise here</span>
    </a>
  </div>
</div>`;
    const targetDiv = document.getElementById("txtad");
    if (targetDiv) targetDiv.innerHTML = bannerHtml;
  });
  window.loadJs = loadJs;
  window.addMultilineHtml = addMultilineHtml;
  window.getCookieValue = getCookieValue;
  window.getRandomCount = getRandomCount;
  window.toPlain = toPlain;
  window.beacontrack = beacontrack;
  window.keywords = keywords;
  window.elaborateComponent = elaborateComponent;
  window.newsletterComponent = newsletterComponent;
  window.personalize = personalize;
  window.bg = bg;
})();
