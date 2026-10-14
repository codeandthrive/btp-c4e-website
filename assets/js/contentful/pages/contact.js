/**
 * Contact Page Content Loader
 * Loads and renders Contentful content for the contact page
 */

(function () {
  async function initContactPage() {
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      // Initialize common elements
      await ContentRenderer.initCommon();

      // Load contact page specific content
      const contactPage = await ContentfulClient.getContactPage();

      if (contactPage) {
        // Update meta tags
        ContentRenderer.updateMetaTags(
          contactPage.fields.metaTitle,
          contactPage.fields.metaDescription
        );

        // Banner title
        const bannerTitle = document.querySelector('.page-banner-content .title');
        if (bannerTitle && contactPage.fields.bannerTitle) {
          bannerTitle.textContent = contactPage.fields.bannerTitle;
        }

        // Form title
        const formTitle = document.querySelector('.contact-form-wrap .title, #contact-form-title');
        if (formTitle && contactPage.fields.formTitle) {
          formTitle.textContent = contactPage.fields.formTitle;
        }

        // Web3Forms key
        if (contactPage.fields.web3formsKey) {
          const web3formsInput = document.querySelector('input[name="access_key"]');
          if (web3formsInput) {
            web3formsInput.value = contactPage.fields.web3formsKey;
          }
        }
      }

      // Contact info cards (Email / Address). locationsText is multi-line;
      // its line breaks are kept by white-space: pre-line in site-enhance.css
      if (contactPage) {
        const setCard = (cardSelector, title, text) => {
          const card = document.querySelector(cardSelector);
          if (!card) return;
          const titleEl = card.querySelector('.title');
          const textEl = card.querySelector('p');
          if (titleEl && title) titleEl.textContent = title;
          if (textEl && text) textEl.textContent = text;
        };

        const fields = contactPage.fields;
        setCard('#contact-email-card', fields.emailTitle, fields.email);
        setCard('#contact-locations-card', fields.locationsTitle, fields.locationsText);
      }

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
