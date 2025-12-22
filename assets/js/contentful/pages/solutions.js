/**
 * Solutions Page Content Loader
 * Loads and renders Contentful content for the solutions page
 */

(function () {
  async function initSolutionsPage() {
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      // Initialize common elements
      await ContentRenderer.initCommon();

      // Load solutions page specific content
      const solutionsPage = await ContentfulClient.getSolutionsPage();

      if (solutionsPage) {
        // Update meta tags
        ContentRenderer.updateMetaTags(
          solutionsPage.fields.metaTitle,
          solutionsPage.fields.metaDescription
        );

        // Banner title
        const bannerTitle = document.querySelector('.page-banner-content .title');
        if (bannerTitle && solutionsPage.fields.bannerTitle) {
          bannerTitle.textContent = solutionsPage.fields.bannerTitle;
        }

        // Subtitle
        const subtitle = document.querySelector('.solutions-subtitle, .section-subtitle');
        if (subtitle && solutionsPage.fields.subtitle) {
          subtitle.textContent = solutionsPage.fields.subtitle;
        }
      }

      // Load solutions
      await ContentRenderer.renderSolutions('#migration-accordion', '#iflows-accordion');

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
