/**
 * About Page Content Loader
 * Renders the entire About page from a single Contentful entry (aboutPage).
 * "Who We Are" body is a JSON list field (whoWeAreParagraphs).
 */

(function () {
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
  const setLink = (sel, text, url) => {
    const el = $(sel);
    if (!el) return;
    if (text != null) {
      // preserve a trailing icon (e.g. the arrow on the CTA link)
      const icon = el.querySelector('i');
      el.innerHTML = esc(text) + (icon ? ' ' + icon.outerHTML : '');
    }
    if (url) el.href = url;
  };

  function renderParagraphs(items) {
    const content = $('#about-who .overview-content');
    if (!content || !Array.isArray(items) || items.length === 0) return;
    const anchor = content.querySelector('.ab-btn');
    content.querySelectorAll(':scope > p').forEach((p) => p.remove());
    const html = items
      .map((t, i) => `<p data-aos-delay="${700 + i * 50}" data-aos="fade-up">${esc(t)}</p>`)
      .join('');
    if (anchor) anchor.insertAdjacentHTML('beforebegin', html);
    else content.insertAdjacentHTML('beforeend', html);
  }

  async function initAboutPage() {
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      await ContentRenderer.initCommon();

      const data = await ContentfulClient.getAboutPage();
      if (!data) return;
      const { entry, includes } = data;
      const f = entry.fields;

      ContentRenderer.updateMetaTags(f.metaTitle, f.metaDescription);

      // Banner
      setText('.page-banner .title', f.bannerTitle);

      // Who We Are
      setHeadingWithIcon('#about-who .sub-title', f.whoWeAreSubtitle);
      setText('#about-who .section-title2 .title', f.whoWeAreTitle);
      renderParagraphs(f.whoWeAreParagraphs);
      setLink('#about-who .ab-btn a.btn', f.aboutButtonText, f.aboutButtonUrl);
      const img = ContentfulClient.resolveAssetUrl(entry, 'whoWeAreImage', includes);
      if (img) {
        const el = $('#about-who .overview-image-wrap .image img');
        if (el) el.src = img;
      }

      // Counter / CTA band
      setText('#about-cta .section-title2 .title', f.statsTitle);
      setLink('#about-cta .download-link', f.ctaLinkText, f.ctaLinkUrl);

      if (typeof AOS !== 'undefined') AOS.refresh();
    } catch (error) {
      console.error('Failed to initialize about page:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutPage);
  } else {
    initAboutPage();
  }
})();
