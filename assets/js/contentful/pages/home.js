/**
 * Home Page Content Loader
 * Loads and renders Contentful content for the home page
 */

(function () {
  /**
   * Clear all dynamic containers before rendering
   * This prevents duplicate content issues
   */
  function clearContainers() {
    // Clear pillars container
    const pillarsContainer = document.querySelector('#pillars-container');
    if (pillarsContainer) pillarsContainer.innerHTML = '';

    // Clear services container
    const servicesContainer = document.querySelector('#services-container');
    if (servicesContainer) servicesContainer.innerHTML = '';

    // FAQ container uses static content (Xelerator FAQs) — do not clear.
    // const faqContainer = document.querySelector('#faq-container');
    // if (faqContainer) faqContainer.innerHTML = '';
  }

  async function initHomePage() {
    // Check if Contentful is configured
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      // Clear all containers first to prevent duplicates
      clearContainers();

      // Initialize common elements (logo, navigation, footer, sidebar)
      await ContentRenderer.initCommon();

      // Load home page data
      const homePageData = await ContentfulClient.getHomePage();

      if (homePageData) {
        const { entry: homePage, includes } = homePageData;

        // Update meta tags
        ContentRenderer.updateMetaTags(
          homePage.fields.metaTitle,
          homePage.fields.metaDescription
        );

        // Hero section - Title
        const heroTitle = document.querySelector('.hero-content .title');
        if (heroTitle) {
          // Check if there's a separate subtitle field
          if (homePage.fields.heroTitle && homePage.fields.heroSubtitle) {
            heroTitle.innerHTML = `${homePage.fields.heroTitle} <span>${homePage.fields.heroSubtitle}</span>`;
          } else if (homePage.fields.heroTitle) {
            heroTitle.innerHTML = homePage.fields.heroTitle;
          }
        }

        // Hero description
        const heroDescription = document.querySelector('.hero-content p');
        if (heroDescription && homePage.fields.heroDescription) {
          heroDescription.textContent = homePage.fields.heroDescription;
        }

        // Hero CTA buttons
        const heroPrimaryBtn = document.querySelector('.hero-btn-group .hero-cta-primary');
        if (heroPrimaryBtn) {
          if (homePage.fields.heroPrimaryButtonText) heroPrimaryBtn.textContent = homePage.fields.heroPrimaryButtonText;
          if (homePage.fields.heroPrimaryButtonUrl) heroPrimaryBtn.href = homePage.fields.heroPrimaryButtonUrl;
        }
        const heroSecondaryBtn = document.querySelector('.hero-btn-group .hero-cta-secondary');
        if (heroSecondaryBtn) {
          if (homePage.fields.heroSecondaryButtonText) heroSecondaryBtn.textContent = homePage.fields.heroSecondaryButtonText;
          if (homePage.fields.heroSecondaryButtonUrl) heroSecondaryBtn.href = homePage.fields.heroSecondaryButtonUrl;
        }

        // Hero image
        const heroImage = ContentfulClient.resolveAssetUrl(homePage, 'heroImage', includes);
        if (heroImage) {
          const heroImg = document.querySelector('.hero-images .image img, .hero-img img');
          if (heroImg) heroImg.src = heroImage;
        }

        const f = homePage.fields;

        // Helper: set the text of a heading while preserving a leading decorative <img>
        const setHeadingWithIcon = (selector, value) => {
          const el = document.querySelector(selector);
          if (!el || !value) return;
          const img = el.querySelector('img');
          el.innerHTML = (img ? img.outerHTML + ' ' : '') + value;
        };
        const setText = (selector, value) => {
          const el = document.querySelector(selector);
          if (el && value != null) el.textContent = value;
        };
        const setImg = (selector, url) => {
          if (!url) return;
          const el = document.querySelector(selector);
          if (el) el.src = url;
        };

        // ---- Consulting section (#consulting-section) ----
        setHeadingWithIcon('#consulting-section .sub-title', f.consultingTag);
        setText('#consulting-section .section-title2 .title', f.consultingTitle);
        setText('#consulting-section .overview-content > p', f.consultingDescription);
        setText('#consulting-section .image-content .image-text .title', f.consultingBadgeTitle);
        setText('#consulting-section .image-content .image-text p', f.consultingBadgeText);
        setImg('#consulting-section .overview-image .image img',
               ContentfulClient.resolveAssetUrl(homePage, 'consultingImage', includes));

        // ---- Xelerator section (#xelerator-section) ----
        setText('#xelerator-section .overview-content .title', f.xeleratorTitle);
        setText('#xelerator-section .overview-content p', f.xeleratorDescription);
        setText('#xelerator-section .image-content .image-text .title', f.xeleratorBadgeTitle);
        setText('#xelerator-section .image-content .image-text p', f.xeleratorBadgeText);
        setImg('#xelerator-section .overview-image .image img',
               ContentfulClient.resolveAssetUrl(homePage, 'xeleratorImage', includes));

        // ---- FAQ section heading ----
        setHeadingWithIcon('.sasmix-faq-section .sub-title', f.faqSubtitle);
        setText('.sasmix-faq-section .section-title2 .title', f.faqTitle);
      }

      // Load and render BTP Pillars
      await ContentRenderer.renderBtpPillars('#pillars-container');

      // Load and render Services
      await ContentRenderer.renderServices('#services-container');

      // Load and render FAQs flagged for the home page (Xelerator FAQs)
      await ContentRenderer.renderFaqs('#faq-container', true, 'homePageFaq');

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
