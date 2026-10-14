/**
 * Xelerator Trial Page Content Loader
 * Page body is static; only the shared chrome (footer, sidebar) comes from Contentful
 */

(function () {
  async function initXeleratorTrialPage() {
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      await ContentRenderer.initCommon();
    } catch (error) {
      console.error('Failed to load xelerator trial page content:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initXeleratorTrialPage);
  } else {
    initXeleratorTrialPage();
  }
})();
