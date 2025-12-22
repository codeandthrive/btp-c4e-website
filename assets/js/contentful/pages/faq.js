/**
 * FAQ Page Content Loader
 * Loads and renders Contentful content for the FAQ page
 */

(function () {
  async function initFaqPage() {
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      // Initialize common elements
      await ContentRenderer.initCommon();

      // Load FAQ page specific content
      const faqPageData = await ContentfulClient.getFaqPage();

      if (faqPageData) {
        const { entry: faqPage, includes } = faqPageData;

        // Update meta tags
        ContentRenderer.updateMetaTags(
          faqPage.fields.metaTitle,
          faqPage.fields.metaDescription
        );

        // Banner title
        const bannerTitle = document.querySelector('.page-banner-content .title');
        if (bannerTitle && faqPage.fields.bannerTitle) {
          bannerTitle.textContent = faqPage.fields.bannerTitle;
        }

        // Section title
        const sectionTitle = document.querySelector('.faq-section .section-title .title, #faq-section-title');
        if (sectionTitle && faqPage.fields.sectionTitle) {
          sectionTitle.textContent = faqPage.fields.sectionTitle;
        }

        // FAQ image
        const faqImage = ContentfulClient.resolveAssetUrl(faqPage, 'faqImage', includes);
        if (faqImage) {
          const faqImg = document.querySelector('.faq-images img, #faq-image');
          if (faqImg) faqImg.src = faqImage;
        }
      }

      // Load all FAQs (not just home page ones)
      await ContentRenderer.renderFaqs('#faq-accordion', false, 'faqPageAccordion');

    } catch (error) {
      console.error('Failed to initialize FAQ page:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaqPage);
  } else {
    initFaqPage();
  }
})();
