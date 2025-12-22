/**
 * About Page Content Loader
 * Loads and renders Contentful content for the about page
 */

(function () {
  async function initAboutPage() {
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful not configured. Using static content.');
      return;
    }

    try {
      // Initialize common elements
      await ContentRenderer.initCommon();

      // Load about page specific content
      const aboutPageData = await ContentfulClient.getAboutPage();

      if (aboutPageData) {
        const { entry: aboutPage, includes } = aboutPageData;

        // Update meta tags
        ContentRenderer.updateMetaTags(
          aboutPage.fields.metaTitle,
          aboutPage.fields.metaDescription
        );

        // Banner title
        const bannerTitle = document.querySelector('.page-banner-content .title');
        if (bannerTitle && aboutPage.fields.bannerTitle) {
          bannerTitle.textContent = aboutPage.fields.bannerTitle;
        }

        // Who We Are section
        const whoWeAreTitle = document.querySelector('.about-content .title, #who-we-are-title');
        if (whoWeAreTitle && aboutPage.fields.whoWeAreTitle) {
          whoWeAreTitle.textContent = aboutPage.fields.whoWeAreTitle;
        }

        const whoWeAreDesc1 = document.querySelector('.about-content .text-1, #who-we-are-desc-1');
        if (whoWeAreDesc1 && aboutPage.fields.whoWeAreDescription1) {
          whoWeAreDesc1.textContent = aboutPage.fields.whoWeAreDescription1;
        }

        const whoWeAreDesc2 = document.querySelector('.about-content .text-2, #who-we-are-desc-2');
        if (whoWeAreDesc2 && aboutPage.fields.whoWeAreDescription2) {
          whoWeAreDesc2.textContent = aboutPage.fields.whoWeAreDescription2;
        }

        // Who We Are image
        const whoWeAreImage = ContentfulClient.resolveAssetUrl(aboutPage, 'whoWeAreImage', includes);
        if (whoWeAreImage) {
          const aboutImg = document.querySelector('.about-images img, #who-we-are-image');
          if (aboutImg) aboutImg.src = whoWeAreImage;
        }

        // Stats section title
        const statsTitle = document.querySelector('.counter-section .title, #stats-title');
        if (statsTitle && aboutPage.fields.statsTitle) {
          statsTitle.textContent = aboutPage.fields.statsTitle;
        }
      }

      // Load statistics
      await ContentRenderer.renderStats('#stats-container');

      // Load locations for global presence section
      const locations = await ContentfulClient.getLocations();
      const locationsContainer = document.querySelector('#locations-container');
      if (locationsContainer && locations.length > 0) {
        // Group by region
        const byRegion = {};
        locations.forEach(loc => {
          const region = loc.fields.region || 'Other';
          if (!byRegion[region]) byRegion[region] = [];
          byRegion[region].push(loc.fields.city);
        });

        locationsContainer.innerHTML = Object.entries(byRegion).map(([region, cities]) => `
          <div class="col-md-4 mb-4">
            <div class="location-card" style="background: #fff; border-radius: 10px; padding: 25px; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
              <h4 style="color: #667eea; font-size: 18px; margin-bottom: 15px;">${region}</h4>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${cities.map(city => `<li style="padding: 5px 0; color: #666;"><i class="fas fa-map-marker-alt" style="color: #667eea; margin-right: 10px;"></i>${city}</li>`).join('')}
              </ul>
            </div>
          </div>
        `).join('');
      }

    } catch (error) {
      console.error('Failed to initialize about page:', error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAboutPage);
  } else {
    initAboutPage();
  }
})();
