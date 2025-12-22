/**
 * Home Page Content Loader
 * Loads and renders Contentful content for the home page
 */

(function () {
  async function initHomePage() {
    // Check if Contentful is configured
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      // Initialize common elements
      await ContentRenderer.initCommon();

      // Load home page specific content
      const homePageData = await ContentfulClient.getHomePage();

      if (homePageData) {
        const { entry: homePage, includes } = homePageData;

        // Update meta tags
        ContentRenderer.updateMetaTags(
          homePage.fields.metaTitle,
          homePage.fields.metaDescription
        );

        // Hero section
        const heroTitle = document.querySelector('.hero-content .title');
        if (heroTitle && homePage.fields.heroTitle) {
          heroTitle.innerHTML = `${homePage.fields.heroTitle} <span>${homePage.fields.heroSubtitle || ''}</span>`;
        }

        const heroText = document.querySelector('.hero-content .text, .hero-content p');
        if (heroText && homePage.fields.heroDescription) {
          heroText.textContent = homePage.fields.heroDescription;
        }

        // Hero image
        const heroImage = ContentfulClient.resolveAssetUrl(homePage, 'heroImage', includes);
        if (heroImage) {
          const heroImg = document.querySelector('.hero-images .image img, .hero-img img');
          if (heroImg) heroImg.src = heroImage;
        }

        // Pillars section title
        const pillarsTitle = document.querySelector('#pillars-section .section-title2 .title, .pillars-section .title');
        if (pillarsTitle && homePage.fields.pillarsTitle) {
          pillarsTitle.textContent = homePage.fields.pillarsTitle;
        }

        // Services section title
        const servicesTitle = document.querySelector('.sasmix-features-section .section-title2 .title');
        if (servicesTitle && homePage.fields.servicesTitle) {
          servicesTitle.textContent = homePage.fields.servicesTitle;
        }

        // Consulting section
        const consultingTitle = document.querySelector('.consulting-section .title, .sasmix-overview-section .title');
        if (consultingTitle && homePage.fields.consultingTitle) {
          consultingTitle.textContent = homePage.fields.consultingTitle;
        }

        const consultingDesc = document.querySelector('.consulting-section .text, .sasmix-overview-section .text');
        if (consultingDesc && homePage.fields.consultingDescription) {
          consultingDesc.textContent = homePage.fields.consultingDescription;
        }

        const consultingImage = ContentfulClient.resolveAssetUrl(homePage, 'consultingImage', includes);
        if (consultingImage) {
          const consultingImg = document.querySelector('.consulting-section img, .sasmix-overview-section .overview-images img');
          if (consultingImg) consultingImg.src = consultingImage;
        }
      }

      // Load dynamic content sections in parallel
      await Promise.all([
        ContentRenderer.renderBtpPillars('#pillars-container'),
        ContentRenderer.renderServices('#services-container'),
        ContentRenderer.renderFaqs('#faq-container', true, 'homeFaqAccordion')
      ]);

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
