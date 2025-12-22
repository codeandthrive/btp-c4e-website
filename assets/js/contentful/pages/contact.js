/**
 * Contact Page Content Loader
 * Updates only images from Contentful, keeps static HTML text content
 */

(function () {
  async function initContactPage() {
    // Check if Contentful is configured
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      // Initialize common elements (logo images only)
      await ContentRenderer.initCommon();

      // Load contact page data
      const contactPage = await ContentfulClient.getContactPage();

      if (contactPage) {
        // Update Web3Forms key if needed (form functionality)
        if (contactPage.fields.web3formsKey) {
          const web3formsInput = document.querySelector('input[name="access_key"]');
          if (web3formsInput) {
            web3formsInput.value = contactPage.fields.web3formsKey;
          }
        }
      }

      // Static HTML content is used for text, contact info, locations
      // This avoids duplicate rendering issues

    } catch (error) {
      console.error('Failed to initialize contact page:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactPage);
  } else {
    initContactPage();
  }
})();
