/**
 * FAQ Page Content Loader
 * Page chrome comes from the faqPage singleton; the FAQ items come from the
 * shared `faq` collection (the same source the home page uses).
 */

(function () {
  const $ = (sel) => document.querySelector(sel);

  const setText = (sel, val) => {
    const el = $(sel);
    if (el && val != null) el.textContent = val;
  };
  const setHeadingWithIcon = (sel, val) => {
    const el = $(sel);
    if (!el || !val) return;
    const img = el.querySelector('img');
    el.innerHTML = (img ? img.outerHTML + ' ' : '') + val;
  };

  async function initFaqPage() {
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      await ContentRenderer.initCommon();

      const data = await ContentfulClient.getFaqPage();
      if (data) {
        const { entry, includes } = data;
        const f = entry.fields;

        ContentRenderer.updateMetaTags(f.metaTitle, f.metaDescription);

        // Banner + section headings
        setText('.page-banner .title', f.bannerTitle);
        setHeadingWithIcon('.sasmix-faq-section .sub-title', f.faqSubtitle);
        setText('.sasmix-faq-section .section-title2 .title', f.sectionTitle);

        // FAQ side image
        const faqImage = ContentfulClient.resolveAssetUrl(entry, 'faqImage', includes);
        if (faqImage) {
          const el = $('.faq-left .image img');
          if (el) el.src = faqImage;
        }
      }

      // Render ALL FAQs from the shared collection into the accordion container
      await ContentRenderer.renderFaqs('.faq-accordion', false, 'faqPageAccordion');

      if (typeof AOS !== 'undefined') AOS.refresh();
    } catch (error) {
      console.error('Failed to initialize FAQ page:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaqPage);
  } else {
    initFaqPage();
  }
})();
