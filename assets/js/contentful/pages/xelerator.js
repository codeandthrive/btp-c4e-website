/**
 * Xelerator Page Content Loader
 * Renders the entire Xelerator page from a single Contentful entry (xeleratorPage).
 * Repeating groups (capabilities, steps, stats) are JSON list fields on that entry.
 */

(function () {
  // --- small DOM helpers ---
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) =>
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const setText = (sel, val) => {
    const el = $(sel);
    if (el && val != null) el.textContent = val;
  };
  const setHeadingWithIcon = (sel, val) => {
    const el = $(sel);
    if (!el || !val) return;
    const img = el.querySelector('img');
    el.innerHTML = (img ? img.outerHTML + ' ' : '') + esc(val);
  };
  const setImg = (sel, url) => {
    if (!url) return;
    const el = $(sel);
    if (el) el.src = url;
  };
  const setLink = (sel, text, url) => {
    const el = $(sel);
    if (!el) return;
    if (text != null) el.textContent = text;
    if (url) el.href = url;
  };

  function renderPlatformList(items) {
    const container = $('#xel-platform-list');
    if (!container || !Array.isArray(items) || items.length === 0) return;
    // split into two balanced columns
    const mid = Math.ceil(items.length / 2);
    const cols = [items.slice(0, mid), items.slice(mid)];
    const itemHtml = (txt) => `
      <div class="overview-list-item">
        <div class="icon"><span><i class="fas fa-check"></i></span></div>
        <div class="content"><p>${esc(txt)}</p></div>
      </div>`;
    container.innerHTML = `
      <div class="row">
        ${cols.map((col) => `
          <div class="col-lg-6">
            <div class="overview-list-item-wrap" data-aos-delay="800" data-aos="fade-up">
              ${col.map(itemHtml).join('')}
            </div>
          </div>`).join('')}
      </div>`;
  }

  function renderCapabilities(items) {
    const grid = $('#xel-capabilities-grid');
    if (!grid || !Array.isArray(items) || items.length === 0) return;
    grid.innerHTML = items.map((c) => `
      <div class="col-md-6 col-lg-4">
        <div class="service-card" style="background: #fff; border-radius: 15px; padding: 30px; box-shadow: 0 5px 30px rgba(0, 0, 0, 0.08); height: 100%;">
          <div class="service-icon" style="margin-bottom: 20px">
            <i class="${esc(c.icon || 'fas fa-check-circle')}" style="font-size: 54px; color: #3b82f6;"></i>
          </div>
          <h3 style="font-size: 22px; font-weight: 600; margin-bottom: 15px; color: #1a1a2e;">${esc(c.title)}</h3>
          <p style="color: #666; line-height: 1.7; margin-bottom: 0;">${esc(c.description)}</p>
        </div>
      </div>`).join('');
  }

  function renderSteps(items) {
    const container = $('#xel-steps');
    if (!container || !Array.isArray(items) || items.length === 0) return;
    container.innerHTML = items.map((s, i) => `
      <div class="overview-list-item" data-aos-delay="${700 + i * 100}" data-aos="fade-up">
        <div class="icon"><span><i class="fas fa-check"></i></span></div>
        <div class="content"><p><strong>${esc(s.title)}</strong> - ${esc(s.description)}</p></div>
      </div>`).join('');
  }

  function renderStats(items) {
    const row = $('#xel-stats');
    if (!row || !Array.isArray(items) || items.length === 0) return;
    row.innerHTML = items.map((s) => `
      <div class="col-lg-3 col-sm-6">
        <div class="single-counter">
          <span class="counter">${esc(s.value)}</span>${s.suffix ? `<span>${esc(s.suffix)}</span>` : ''}
          <p>${esc(s.label)}</p>
        </div>
      </div>`).join('');
  }

  async function initXeleratorPage() {
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      // Common chrome (logo, footer, sidebar)
      await ContentRenderer.initCommon();

      const data = await ContentfulClient.getXeleratorPage();
      if (!data) return;
      const { entry, includes } = data;
      const f = entry.fields;

      // Meta + banner
      ContentRenderer.updateMetaTags(f.metaTitle, f.metaDescription);
      setText('.page-banner .title', f.bannerTitle);

      // Intro
      setHeadingWithIcon('#xel-intro .sub-title', f.introSubtitle);
      setText('#xel-intro .section-title2 .title', f.introTitle);
      setText('#xel-intro .overview-content > p', f.introDescription);
      setImg('#xel-intro .overview-image-wrap .image img',
             ContentfulClient.resolveAssetUrl(entry, 'introImage', includes));
      setLink('#xel-intro .btn-wrap a.btn:not(.btn-2)', f.demoButtonText, f.demoButtonUrl);
      setLink('#xel-intro .btn-wrap a.btn-2', f.loginButtonText, f.loginButtonUrl);
      renderPlatformList(f.platformList);

      // Capabilities
      setHeadingWithIcon('#xel-capabilities .sub-title', f.capabilitiesSubtitle);
      setText('#xel-capabilities .section-title2 .title', f.capabilitiesTitle);
      setText('#xel-capabilities .section-title-wrap > p', f.capabilitiesIntro);
      renderCapabilities(f.capabilities);

      // How it works
      setHeadingWithIcon('#xel-how .sub-title', f.howItWorksSubtitle);
      setText('#xel-how .section-title2 .title', f.howItWorksTitle);
      setImg('#xel-how .overview-image-wrap .image img',
             ContentfulClient.resolveAssetUrl(entry, 'howItWorksImage', includes));
      renderSteps(f.steps);

      // Stats / counters
      renderStats(f.stats);

      // CTA
      setText('#xel-cta .cta-content .title', f.ctaTitle);
      setText('#xel-cta .cta-content p', f.ctaDescription);
      setLink('#xel-cta .cta-btn a.btn', f.ctaButtonText, f.ctaButtonUrl);

      // Refresh AOS for newly injected elements
      if (typeof AOS !== 'undefined') AOS.refresh();
    } catch (error) {
      console.error('Failed to initialize Xelerator page:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initXeleratorPage);
  } else {
    initXeleratorPage();
  }
})();
