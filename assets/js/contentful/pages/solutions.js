/**
 * Solutions Page Content Loader
 * Updates only images from Contentful, keeps static HTML text content
 */

(function () {
  async function initSolutionsPage() {
    // Check if Contentful is configured
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      // Initialize common elements (logo images only)
      await ContentRenderer.initCommon();

      // Load solutions page data for images only
      const solutionsPageData = await ContentfulClient.getSolutionsPage();

      if (solutionsPageData) {
        // Update any page-specific images from Contentful if they exist
        // Currently solutions page uses icons from static HTML
      }

      // Static HTML content is used for text, migration accelerators, iFlows
      // This avoids duplicate rendering issues

    } catch (error) {
      console.error('Failed to initialize solutions page:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSolutionsPage);
  } else {
    initSolutionsPage();
  }
})();
