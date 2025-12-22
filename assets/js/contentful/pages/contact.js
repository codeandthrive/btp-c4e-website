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

      // Load site settings for contact info
      const settingsData = await ContentfulClient.getSiteSettings();
      if (settingsData) {
        const settings = settingsData.entry.fields;

        // Email
        const emailLinks = document.querySelectorAll('.contact-info a[href^="mailto"], #contact-email');
        emailLinks.forEach(link => {
          if (settings.email) {
            link.href = `mailto:${settings.email}`;
            link.textContent = settings.email;
          }
        });

        // LinkedIn
        const linkedinLinks = document.querySelectorAll('.contact-social a[href*="linkedin"], #contact-linkedin');
        linkedinLinks.forEach(link => {
          if (settings.linkedinUrl) {
            link.href = settings.linkedinUrl;
          }
        });
      }

      // Load locations for contact info
      const locations = await ContentfulClient.getLocations();
      const locationsContainer = document.querySelector('#contact-locations');
      if (locationsContainer && locations.length > 0) {
        locationsContainer.innerHTML = `
          <h4 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1a1a2e;">Global Presence</h4>
          <div class="row">
            ${locations.map(loc => `
              <div class="col-md-6 mb-3">
                <div style="display: flex; align-items: center;">
                  <i class="fas fa-map-marker-alt" style="color: #667eea; margin-right: 10px; font-size: 18px;"></i>
                  <div>
                    <strong>${loc.fields.city}</strong>
                    <span style="color: #888; font-size: 14px;"> (${loc.fields.region})</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
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
