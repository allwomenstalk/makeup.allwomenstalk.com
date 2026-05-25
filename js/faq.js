(() => {
  // src/js/faq.js
  function readFaqItems() {
    const el = document.getElementById("faq-data");
    if (!el) return [];
    try {
      const data = JSON.parse(el.textContent);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }
  function postId() {
    const meta = document.querySelector('meta[name="postid"]');
    return meta ? meta.getAttribute("content") : "";
  }
  function faqData() {
    return {
      items: readFaqItems(),
      shown: 0,
      maxShown: 3,
      observer: null,
      loadTimer: null,
      loaded: false,
      revealTimer: null,
      async init() {
        if (this.items.length > 0) this.shuffleItems();
        this.observeHeading();
      },
      revealItems() {
        if (this.revealTimer) return;
        const total = this.items ? this.items.length : 0;
        if (total === 0) return;
        this.shuffleItems();
        const targetCount = Math.min(this.maxShown, total);
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
        if (!this.items || this.items.length < 2) return;
        for (let i = this.items.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = this.items[i];
          this.items[i] = this.items[j];
          this.items[j] = temp;
        }
      },
      observeHeading() {
        if (this.loaded || this.observer) return;
        const target = this.$el || null;
        if (!target || !window.IntersectionObserver) {
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
        const id = postId();
        if (!id) return;
        const cdnUrl = `https://pub-1969d309989b4ee98dadd29698bd2213.r2.dev/${id}.json`;
        const workerUrl = `https://faq.azo.workers.dev/${id}/`;
        try {
          const cdnResponse = await fetch(cdnUrl);
          if (cdnResponse.ok) {
            const cdnData = await cdnResponse.json();
            this.items = cdnData.list || [];
            this.shuffleItems();
            this.revealItems();
            return;
          }
          if (cdnResponse.status !== 404) return;
        } catch (e) {
        }
        try {
          const response = await fetch(workerUrl);
          if (!response.ok) return;
          const data = await response.json();
          this.items = data.list || [];
          this.shuffleItems();
          this.revealItems();
        } catch (error) {
          console.error("FAQ worker error:", error);
        }
      },
      report(index) {
        this.shown = Math.min(this.shown, this.maxShown);
        const item = this.items[index];
        item.index = index;
        item.total = this.items.length;
        this.shown++;
        beacontrack({ type: "faq", action: 1, post_id: postId(), item });
      },
      askQuestion() {
        var _a, _b;
        const question = document.querySelector('input[x-model="question"]').value.trim();
        if (!question) return;
        const postUrl = window.location.href;
        const siteDomain = "allwomenstalk.com";
        const prompt = `Answer question: ${question}, in context of ${postUrl}, link back to article and suggest more relevant articles from ${siteDomain}`;
        const chatUrl = `https://chat.openai.com/?hints=search&q=${encodeURIComponent(prompt)}`;
        window.open(chatUrl, "_blank");
        const item = {
          question,
          index: -1,
          total: ((_b = (_a = this.items) == null ? void 0 : _a.length) != null ? _b : 0) + 1,
          isAI: true,
          source: "user_input"
        };
        beacontrack({ type: "aifaq", action: 1, post_id: postId(), item });
      }
    };
  }
  window.faqData = faqData;
})();
