/**
 * About Page Content Loader
 * Updates only images from Contentful, keeps static HTML text content
 */

(function () {
  async function initAboutPage() {
    // Check if Contentful is configured
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      // Initialize common elements (logo images only)
      await ContentRenderer.initCommon();

      // Load about page data for images only
      const aboutPageData = await ContentfulClient.getAboutPage();

      if (aboutPageData) {
        const { entry: aboutPage, includes } = aboutPageData;

        // Update "Who We Are" section image from Contentful
        const whoWeAreImage = ContentfulClient.resolveAssetUrl(aboutPage, 'whoWeAreImage', includes);
        if (whoWeAreImage) {
          const aboutImg = document.querySelector('.about-images img, #who-we-are-image');
          if (aboutImg) aboutImg.src = whoWeAreImage;
        }
      }

      // Static HTML content is used for text, stats, locations
      // This avoids duplicate rendering issues

    } catch (error) {
      console.error('Failed to initialize about page:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutPage);
  } else {
    initAboutPage();
  }
})();
