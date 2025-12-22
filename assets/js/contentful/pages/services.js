/**
 * Services Page Content Loader
 * Loads and renders Contentful content for the services page
 */

(function () {
  async function initServicesPage() {
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      // Initialize common elements
      await ContentRenderer.initCommon();

      // Load service page specific content
      const servicePageData = await ContentfulClient.getServicePage();

      if (servicePageData) {
        const { entry: servicePage, includes } = servicePageData;

        // Update meta tags
        ContentRenderer.updateMetaTags(
          servicePage.fields.metaTitle,
          servicePage.fields.metaDescription
        );

        // Banner title
        const bannerTitle = document.querySelector('.page-banner-content .title');
        if (bannerTitle && servicePage.fields.bannerTitle) {
          bannerTitle.textContent = servicePage.fields.bannerTitle;
        }

        // Consulting section image
        const consultingImage = ContentfulClient.resolveAssetUrl(servicePage, 'consultingImage', includes);
        if (consultingImage) {
          const consultingImg = document.querySelector('.consulting-section img, #consulting-image');
          if (consultingImg) consultingImg.src = consultingImage;
        }

        // Development section image
        const developmentImage = ContentfulClient.resolveAssetUrl(servicePage, 'developmentImage', includes);
        if (developmentImage) {
          const developmentImg = document.querySelector('.development-section img, #development-image');
          if (developmentImg) developmentImg.src = developmentImage;
        }
      }

      // Load services
      const servicesData = await ContentfulClient.getServices();

      if (servicesData && servicesData.items && servicesData.items.length > 0) {
        const { items: services, includes } = servicesData;

        // Render service cards
        const serviceCardsContainer = document.querySelector('#services-cards-container');
        if (serviceCardsContainer) {
          serviceCardsContainer.innerHTML = services.map((service, index) => {
            const iconUrl = ContentfulClient.resolveAssetUrl(service, 'iconImage', includes);
            const features = service.fields.features || [];

            return `
              <div class="col-md-6 mb-4">
                <div class="service-card" style="background: #fff; border-radius: 15px; padding: 30px; box-shadow: 0 5px 30px rgba(0,0,0,0.08); height: 100%;">
                  <div class="service-icon" style="margin-bottom: 20px;">
                    ${iconUrl ? `<img src="${iconUrl}" alt="${service.fields.title}" style="width: 60px; height: 60px;">` : ''}
                  </div>
                  <h3 style="font-size: 24px; font-weight: 600; margin-bottom: 15px; color: #1a1a2e;">${service.fields.title}</h3>
                  <p style="color: #666; line-height: 1.7; margin-bottom: 20px;">${service.fields.shortDescription}</p>
                  ${features.length > 0 ? `
                    <ul style="list-style: none; padding: 0; margin: 0;">
                      ${features.map(f => `<li style="padding: 5px 0; color: #555;"><i class="fas fa-check" style="color: #28a745; margin-right: 10px;"></i>${f}</li>`).join('')}
                    </ul>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('');
        }

        // Update individual service sections if they exist
        services.forEach((service, index) => {
          const serviceSection = document.querySelector(`#service-${index + 1}`);
          if (serviceSection) {
            const titleEl = serviceSection.querySelector('.title');
            const descEl = serviceSection.querySelector('.description, p');

            if (titleEl) titleEl.textContent = service.fields.title;
            if (descEl) descEl.textContent = service.fields.fullDescription || service.fields.shortDescription;
          }
        });
      }

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
