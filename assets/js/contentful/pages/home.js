/**
 * Home Page Content Loader
 * Updates only images from Contentful, keeps static HTML text content
 */

(function () {
  async function initHomePage() {
    // Check if Contentful is configured
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      // Initialize common elements (logo images only)
      await ContentRenderer.initCommon();

      // Load home page data for images only
      const homePageData = await ContentfulClient.getHomePage();

      if (homePageData) {
        const { entry: homePage, includes } = homePageData;

        // Update hero image from Contentful
        const heroImage = ContentfulClient.resolveAssetUrl(homePage, 'heroImage', includes);
        if (heroImage) {
          const heroImg = document.querySelector('.hero-images .image img, .hero-img img');
          if (heroImg) heroImg.src = heroImage;
        }

        // Update consulting image from Contentful
        const consultingImage = ContentfulClient.resolveAssetUrl(homePage, 'consultingImage', includes);
        if (consultingImage) {
          const consultingImg = document.querySelector('.sasmix-overview-section .overview-images img');
          if (consultingImg) consultingImg.src = consultingImage;
        }
      }

      // Static HTML content is used for text, pillars, services, FAQs
      // This avoids duplicate rendering issues

    } catch (error) {
      console.error('Failed to initialize home page:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomePage);
  } else {
    initHomePage();
  }
})();
