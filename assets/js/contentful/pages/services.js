/**
 * Services Page Content Loader
 * Updates only images from Contentful, keeps static HTML text content
 */

(function () {
  async function initServicesPage() {
    // Check if Contentful is configured
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      // Initialize common elements (logo images only)
      await ContentRenderer.initCommon();

      // Load service page data for images only
      const servicePageData = await ContentfulClient.getServicePage();

      if (servicePageData) {
        const { entry: servicePage, includes } = servicePageData;

        // Update consulting section image from Contentful
        const consultingImage = ContentfulClient.resolveAssetUrl(servicePage, 'consultingImage', includes);
        if (consultingImage) {
          const consultingImg = document.querySelector('.consulting-section img, #consulting-image');
          if (consultingImg) consultingImg.src = consultingImage;
        }

        // Update development section image from Contentful
        const developmentImage = ContentfulClient.resolveAssetUrl(servicePage, 'developmentImage', includes);
        if (developmentImage) {
          const developmentImg = document.querySelector('.development-section img, #development-image');
          if (developmentImg) developmentImg.src = developmentImage;
        }
      }

      // Update service icon images from Contentful
      const servicesData = await ContentfulClient.getServices();
      if (servicesData && servicesData.items) {
        const { items: services, includes } = servicesData;

        // Update existing service icon images (don't replace the entire cards)
        services.forEach((service, index) => {
          const iconUrl = ContentfulClient.resolveAssetUrl(service, 'iconImage', includes);
          if (iconUrl) {
            // Try to find service icons by various selectors
            const iconImg = document.querySelector(
              `.service-card:nth-child(${index + 1}) .service-icon img, ` +
              `.features-item:nth-child(${index + 1}) .icon-img img, ` +
              `#service-icon-${index + 1}`
            );
            if (iconImg) iconImg.src = iconUrl;
          }
        });
      }

      // Static HTML content is used for text, service cards, features
      // This avoids duplicate rendering issues

    } catch (error) {
      console.error('Failed to initialize services page:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServicesPage);
  } else {
    initServicesPage();
  }
})();
