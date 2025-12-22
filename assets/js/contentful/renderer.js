/**
 * Content Renderer for BTP C4E Website
 * Renders Contentful content into existing HTML templates
 */

const ContentRenderer = (function () {

  /**
   * Show loading state for an element
   */
  function showLoading(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('contentful-loading');
    }
  }

  /**
   * Hide loading state
   */
  function hideLoading(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.remove('contentful-loading');
    }
  }

  /**
   * Show error state
   */
  function showError(selector, message = 'Failed to load content') {
    const element = document.querySelector(selector);
    if (element) {
      element.innerHTML = `<div class="contentful-error">${message}</div>`;
    }
  }

  /**
   * Update page meta tags
   */
  function updateMetaTags(title, description) {
    if (title) {
      document.title = title;
    }
    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
    }
  }

  /**
   * Render site logo
   */
  async function renderLogo() {
    try {
      const data = await ContentfulClient.getSiteSettings();
      if (!data) return;

      const { entry, includes } = data;
      const logoUrl = ContentfulClient.resolveAssetUrl(entry, 'logo', includes);
      const logoWhiteUrl = ContentfulClient.resolveAssetUrl(entry, 'logoWhite', includes);

      if (logoUrl) {
        document.querySelectorAll('.header-logo img, .sidebar__logo img').forEach(img => {
          img.src = logoUrl;
          img.alt = entry.fields.siteName || 'BTP C4E';
        });
      }

      if (logoWhiteUrl) {
        document.querySelectorAll('.footer-logo img').forEach(img => {
          img.src = logoWhiteUrl;
          img.alt = entry.fields.siteName || 'BTP C4E';
        });
      }
    } catch (error) {
      console.error('Failed to render logo:', error);
    }
  }

  /**
   * Render navigation menu
   */
  async function renderNavigation() {
    try {
      const navItems = await ContentfulClient.getNavigation();
      const menuContainer = document.querySelector('#mobile-menu ul');
      if (!menuContainer || navItems.length === 0) return;

      const regularItems = navItems.filter(item => !item.fields.isCtaButton);
      const ctaItem = navItems.find(item => item.fields.isCtaButton);

      // Render menu items
      menuContainer.innerHTML = regularItems.map(item => `
        <li><a href="${item.fields.url}">${item.fields.title}</a></li>
      `).join('');

      // Update CTA button
      if (ctaItem) {
        document.querySelectorAll('.header-btn-wrap a.btn').forEach(btn => {
          btn.href = ctaItem.fields.url;
          btn.textContent = ctaItem.fields.title;
        });
      }
    } catch (error) {
      console.error('Failed to render navigation:', error);
    }
  }

  /**
   * Render footer content
   */
  async function renderFooter() {
    try {
      const [settingsData, locations, navItems] = await Promise.all([
        ContentfulClient.getSiteSettings(),
        ContentfulClient.getLocations(),
        ContentfulClient.getNavigation()
      ]);

      if (settingsData) {
        const settings = settingsData.entry.fields;

        // Footer description
        const footerAbout = document.querySelector('.footer-widget-about p');
        if (footerAbout && settings.footerDescription) {
          footerAbout.textContent = settings.footerDescription;
        }

        // Copyright
        const copyright = document.querySelector('.copyright-text p');
        if (copyright && settings.copyrightText) {
          copyright.innerHTML = `&copy; ${settings.copyrightText}`;
        }

        // Contact email
        const contactEmail = document.querySelector('.footer-widget-3 .link a[href^="mailto"]');
        if (contactEmail && settings.email) {
          contactEmail.href = `mailto:${settings.email}`;
          contactEmail.textContent = settings.email;
        }
      }

      // Global presence locations
      if (locations.length > 0) {
        const locationsContainer = document.querySelector('.footer-widget:last-child .link ul, #footer-locations');
        if (locationsContainer) {
          locationsContainer.innerHTML = locations.map(loc =>
            `<li>${loc.fields.city} (${loc.fields.region})</li>`
          ).join('');
        }
      }

      // Quick links
      if (navItems.length > 0) {
        const quickLinks = document.querySelector('.footer-widget-2 .link ul');
        if (quickLinks) {
          const links = navItems
            .filter(item => !item.fields.isCtaButton && item.fields.url !== 'index.html')
            .slice(0, 5);
          quickLinks.innerHTML = links.map(item =>
            `<li><a href="${item.fields.url}">${item.fields.title}</a></li>`
          ).join('');
        }
      }
    } catch (error) {
      console.error('Failed to render footer:', error);
    }
  }

  /**
   * Render sidebar content
   */
  async function renderSidebar() {
    try {
      const [settingsData, locations] = await Promise.all([
        ContentfulClient.getSiteSettings(),
        ContentfulClient.getLocations()
      ]);

      if (settingsData) {
        const settings = settingsData.entry.fields;

        // Sidebar description
        const sidebarText = document.querySelector('.sidebar__text p');
        if (sidebarText && settings.sidebarDescription) {
          sidebarText.textContent = settings.sidebarDescription;
        }

        // Contact email
        const sidebarEmail = document.querySelector('.sidebar__contact-text a[href^="mailto"]');
        if (sidebarEmail && settings.email) {
          sidebarEmail.href = `mailto:${settings.email}`;
          sidebarEmail.textContent = settings.email;
        }

        // Social links
        const linkedinLink = document.querySelector('.sidebar__social a');
        if (linkedinLink && settings.linkedinUrl) {
          linkedinLink.href = settings.linkedinUrl;
        }
      }

      // Locations in sidebar
      if (locations.length > 0) {
        const locationLink = document.querySelector('.sidebar__contact-text a[target="_blank"]');
        if (locationLink) {
          const cities = locations.map(l => l.fields.city).join(', ');
          locationLink.textContent = `Global Presence: ${cities}`;
        }
      }
    } catch (error) {
      console.error('Failed to render sidebar:', error);
    }
  }

  /**
   * Render BTP Pillars
   */
  async function renderBtpPillars(containerSelector) {
    try {
      showLoading(containerSelector);
      const pillars = await ContentfulClient.getBtpPillars();
      const container = document.querySelector(containerSelector);
      if (!container || pillars.length === 0) {
        hideLoading(containerSelector);
        return;
      }

      container.innerHTML = pillars.map((pillar, index) => `
        <div class="col-lg-4 col-md-6 mb-4" data-aos-delay="${700 + (index * 100)}" data-aos="fade-up">
          <div class="pillar-card" style="background: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); height: 100%;">
            <div class="pillar-icon" style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <i class="${pillar.fields.icon}" style="color: #fff; font-size: 24px;"></i>
            </div>
            <h4 style="font-size: 20px; font-weight: 600; margin-bottom: 15px; color: #1a1a2e;">${pillar.fields.name}</h4>
            <p style="color: #666; margin: 0; line-height: 1.6;">${pillar.fields.description}</p>
          </div>
        </div>
      `).join('');

      hideLoading(containerSelector);

      // Reinitialize AOS for new elements
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    } catch (error) {
      showError(containerSelector, 'Failed to load pillars');
      console.error('Failed to render BTP pillars:', error);
    }
  }

  /**
   * Render Services
   */
  async function renderServices(containerSelector) {
    try {
      showLoading(containerSelector);
      const { items: services, includes } = await ContentfulClient.getServices();
      const container = document.querySelector(containerSelector);
      if (!container || services.length === 0) {
        hideLoading(containerSelector);
        return;
      }

      container.innerHTML = services.map((service, index) => {
        const iconUrl = ContentfulClient.resolveAssetUrl(service, 'iconImage', includes);
        return `
          <div class="col-md-6">
            <div class="features-item">
              <div class="feat-icon-wrap">
                <div class="icon-img">
                  ${iconUrl ? `<img src="${iconUrl}" alt="${service.fields.title}">` : `<img src="assets/images/icon/feat-icon${index + 1}.png" alt="">`}
                </div>
              </div>
              <div class="feat-content">
                <h3 class="title"><a href="service.html">${service.fields.title}</a></h3>
                <p>${service.fields.shortDescription}</p>
              </div>
            </div>
          </div>
        `;
      }).join('');

      hideLoading(containerSelector);
    } catch (error) {
      showError(containerSelector, 'Failed to load services');
      console.error('Failed to render services:', error);
    }
  }

  /**
   * Render FAQs
   */
  async function renderFaqs(containerSelector, homePageOnly = false, accordionId = 'accordionExample') {
    try {
      showLoading(containerSelector);
      const faqs = await ContentfulClient.getFaqs(homePageOnly);
      const container = document.querySelector(containerSelector);
      if (!container || faqs.length === 0) {
        hideLoading(containerSelector);
        return;
      }

      container.innerHTML = `
        <div class="accordion" id="${accordionId}">
          ${faqs.map((faq, index) => `
            <div class="accordion-item">
              <div class="accordion-header" id="heading${accordionId}${index}">
                <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" type="button"
                        data-bs-toggle="collapse" data-bs-target="#collapse${accordionId}${index}"
                        aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse${accordionId}${index}">
                  <span class="title">${faq.fields.question}</span>
                </button>
              </div>
              <div id="collapse${accordionId}${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}"
                   aria-labelledby="heading${accordionId}${index}" data-bs-parent="#${accordionId}">
                <div class="accordion-body">
                  ${faq.fields.answer}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      hideLoading(containerSelector);
    } catch (error) {
      showError(containerSelector, 'Failed to load FAQs');
      console.error('Failed to render FAQs:', error);
    }
  }

  /**
   * Render Statistics/Counters
   */
  async function renderStats(containerSelector) {
    try {
      const stats = await ContentfulClient.getStats();
      const container = document.querySelector(containerSelector);
      if (!container || stats.length === 0) return;

      container.innerHTML = stats.map(stat => `
        <div class="col-lg-4">
          <div class="single-counter">
            <div class="content">
              <span><span class="odometer" data-count="${stat.fields.value}">0</span>${stat.fields.suffix || ''}</span>
              <p>${stat.fields.label}</p>
            </div>
          </div>
        </div>
      `).join('');

      // Reinitialize odometer
      initOdometer();
    } catch (error) {
      console.error('Failed to render stats:', error);
    }
  }

  /**
   * Render Solutions (Migration Accelerators and iFlows)
   */
  async function renderSolutions(migrationSelector, iflowSelector) {
    try {
      const [migrations, iflows] = await Promise.all([
        ContentfulClient.getSolutions('migration'),
        ContentfulClient.getSolutions('iflow')
      ]);

      // Render migration accelerators
      const migrationContainer = document.querySelector(migrationSelector);
      if (migrationContainer && migrations.length > 0) {
        showLoading(migrationSelector);
        migrationContainer.innerHTML = migrations.map((sol, i) => `
          <div class="accordion-item">
            <h2 class="accordion-header" id="migHead${i}">
              <button class="accordion-button ${i > 0 ? 'collapsed' : ''}" type="button"
                      data-bs-toggle="collapse" data-bs-target="#migCollapse${i}"
                      aria-expanded="${i === 0 ? 'true' : 'false'}">
                <span class="check-icon"><i class="fas fa-check-circle" style="color: #28a745; margin-right: 10px;"></i></span>
                ${sol.fields.name}
              </button>
            </h2>
            <div id="migCollapse${i}" class="accordion-collapse collapse ${i === 0 ? 'show' : ''}"
                 data-bs-parent="#migrationAccordion">
              <div class="accordion-body">${sol.fields.description}</div>
            </div>
          </div>
        `).join('');
        hideLoading(migrationSelector);
      }

      // Render pre-built iFlows
      const iflowContainer = document.querySelector(iflowSelector);
      if (iflowContainer && iflows.length > 0) {
        showLoading(iflowSelector);
        iflowContainer.innerHTML = iflows.map((sol, i) => `
          <div class="accordion-item">
            <h2 class="accordion-header" id="iflowHead${i}">
              <button class="accordion-button ${i > 0 ? 'collapsed' : ''}" type="button"
                      data-bs-toggle="collapse" data-bs-target="#iflowCollapse${i}"
                      aria-expanded="${i === 0 ? 'true' : 'false'}">
                <span class="check-icon"><i class="fas fa-check-circle" style="color: #28a745; margin-right: 10px;"></i></span>
                ${sol.fields.name}
              </button>
            </h2>
            <div id="iflowCollapse${i}" class="accordion-collapse collapse ${i === 0 ? 'show' : ''}"
                 data-bs-parent="#iflowsAccordion">
              <div class="accordion-body">${sol.fields.description}</div>
            </div>
          </div>
        `).join('');
        hideLoading(iflowSelector);
      }
    } catch (error) {
      console.error('Failed to render solutions:', error);
    }
  }

  /**
   * Initialize common elements (shared across all pages)
   * Only updates images from Contentful, keeps static HTML text
   */
  async function initCommon() {
    // Check if Contentful is configured
    if (!ContentfulClient.isConfigured()) {
      console.warn('Contentful is not configured. Using static HTML content.');
      return;
    }

    // Only update logo images from Contentful
    // Skip navigation, footer, sidebar text updates to avoid duplicates
    await renderLogo();
  }

  /**
   * Helper to reinitialize odometer after dynamic content
   */
  function initOdometer() {
    const counters = document.querySelectorAll('.odometer');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const finalValue = el.getAttribute('data-count');
          if (finalValue) {
            el.innerHTML = finalValue;
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach((counter) => {
      observer.observe(counter);
    });
  }

  // Public API
  return {
    showLoading,
    hideLoading,
    showError,
    updateMetaTags,
    renderLogo,
    renderNavigation,
    renderFooter,
    renderSidebar,
    renderBtpPillars,
    renderServices,
    renderFaqs,
    renderStats,
    renderSolutions,
    initCommon,
    initOdometer
  };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentRenderer;
}
