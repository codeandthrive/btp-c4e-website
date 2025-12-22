/**
 * FAQ Page Content Loader
 * Updates only images from Contentful, keeps static HTML text content
 */

(function () {
  async function initFaqPage() {
    // Check if Contentful is configured
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      // Initialize common elements (logo images only)
      await ContentRenderer.initCommon();

      // Load FAQ page data for images only
      const faqPageData = await ContentfulClient.getFaqPage();

      if (faqPageData) {
        const { entry: faqPage, includes } = faqPageData;

        // Update FAQ section image from Contentful
        const faqImage = ContentfulClient.resolveAssetUrl(faqPage, 'faqImage', includes);
        if (faqImage) {
          const faqImg = document.querySelector('.faq-images img, #faq-image');
          if (faqImg) faqImg.src = faqImage;
        }
      }

      // Static HTML content is used for FAQ questions and answers
      // This avoids duplicate rendering issues

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
