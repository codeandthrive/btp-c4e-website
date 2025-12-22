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

    // Clear FAQ container
    const faqContainer = document.querySelector('#faq-container');
    if (faqContainer) faqContainer.innerHTML = '';
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

        // Hero image
        const heroImage = ContentfulClient.resolveAssetUrl(homePage, 'heroImage', includes);
        if (heroImage) {
          const heroImg = document.querySelector('.hero-images .image img, .hero-img img');
          if (heroImg) heroImg.src = heroImage;
        }

        // Consulting section
        const consultingTitle = document.querySelector('.sasmix-overview-section .section-title2 .title');
        if (consultingTitle && homePage.fields.consultingTitle) {
          consultingTitle.textContent = homePage.fields.consultingTitle;
        }

        const consultingDesc = document.querySelector('.sasmix-overview-section .overview-content > p');
        if (consultingDesc && homePage.fields.consultingDescription) {
          consultingDesc.textContent = homePage.fields.consultingDescription;
        }

        // Consulting image
        const consultingImage = ContentfulClient.resolveAssetUrl(homePage, 'consultingImage', includes);
        if (consultingImage) {
          const consultingImg = document.querySelector('.sasmix-overview-section .overview-image .image img');
          if (consultingImg) consultingImg.src = consultingImage;
        }
      }

      // Load and render BTP Pillars
      await ContentRenderer.renderBtpPillars('#pillars-container');

      // Load and render Services
      await ContentRenderer.renderServices('#services-container');

      // Load and render FAQs (home page only)
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
