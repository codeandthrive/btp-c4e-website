/**
 * Contentful Client for BTP C4E Website
 * Fetches content from Contentful Delivery API
 *
 * SETUP: Replace the configuration values below with your Contentful credentials
 */

const ContentfulClient = (function () {
  // ==========================================
  // CONFIGURATION
  // ==========================================
  const CONFIG = {
    spaceId: 'iaj5xp6qjazm',
    accessToken: 'KAYIz7ai3-jwRrB8MkguQn-h3l8JKLSgb-OQMESwCxw',
    environment: 'master'
  };

  const BASE_URL = `https://cdn.contentful.com/spaces/${CONFIG.spaceId}/environments/${CONFIG.environment}`;

  // Cache for API responses (5 minute TTL)
  const cache = new Map();
  const CACHE_TTL = 5 * 60 * 1000;

  /**
   * Make API request to Contentful
   */
  async function fetchFromContentful(endpoint, params = {}) {
    const queryString = new URLSearchParams({
      access_token: CONFIG.accessToken,
      ...params
    }).toString();

    const url = `${BASE_URL}${endpoint}?${queryString}`;
    const cacheKey = url;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Contentful API error: ${response.status}`);
      }
      const data = await response.json();

      // Cache the response
      cache.set(cacheKey, { data, timestamp: Date.now() });

      return data;
    } catch (error) {
      console.error('Contentful fetch error:', error);
      throw error;
    }
  }

  /**
   * Get entries by content type
   */
  async function getEntries(contentType, options = {}) {
    const params = {
      content_type: contentType,
      ...options
    };
    return fetchFromContentful('/entries', params);
  }

  /**
   * Get single entry by ID
   */
  async function getEntry(entryId, options = {}) {
    return fetchFromContentful(`/entries/${entryId}`, options);
  }

  /**
   * Helper to resolve asset URL from includes
   */
  function resolveAssetUrl(entry, fieldName, includes) {
    const field = entry.fields[fieldName];
    if (!field || !field.sys) return null;

    const assetId = field.sys.id;
    const assets = includes?.Asset || [];
    const asset = assets.find(a => a.sys.id === assetId);

    if (asset && asset.fields && asset.fields.file) {
      return 'https:' + asset.fields.file.url;
    }
    return null;
  }

  /**
   * Helper to resolve linked entries
   */
  function resolveEntry(entry, fieldName, includes) {
    const field = entry.fields[fieldName];
    if (!field) return null;

    const entries = includes?.Entry || [];

    if (Array.isArray(field)) {
      return field.map(f => {
        const linkedEntry = entries.find(e => e.sys.id === f.sys.id);
        return linkedEntry || null;
      }).filter(Boolean);
    }

    const linkedEntry = entries.find(e => e.sys.id === field.sys.id);
    return linkedEntry || null;
  }

  // ==========================================
  // PUBLIC API - Convenience Methods
  // ==========================================

  return {
    // Core methods
    getEntries,
    getEntry,
    resolveAssetUrl,
    resolveEntry,

    /**
     * Get site settings (singleton)
     */
    async getSiteSettings() {
      const response = await getEntries('siteSettings', { limit: 1, include: 2 });
      if (response.items && response.items.length > 0) {
        return {
          entry: response.items[0],
          includes: response.includes
        };
      }
      return null;
    },

    /**
     * Get navigation items
     */
    async getNavigation() {
      const response = await getEntries('navigationItem', { order: 'fields.order' });
      return response.items || [];
    },

    /**
     * Get global presence locations
     */
    async getLocations() {
      const response = await getEntries('location', { order: 'fields.order' });
      return response.items || [];
    },

    /**
     * Get SAP BTP pillars
     */
    async getBtpPillars() {
      const response = await getEntries('btpPillar', { order: 'fields.order' });
      return response.items || [];
    },

    /**
     * Get services
     */
    async getServices() {
      const response = await getEntries('service', { order: 'fields.order', include: 2 });
      return {
        items: response.items || [],
        includes: response.includes
      };
    },

    /**
     * Get solutions by category
     */
    async getSolutions(category = null) {
      const params = { order: 'fields.order' };
      if (category) {
        params['fields.category'] = category;
      }
      const response = await getEntries('solution', params);
      return response.items || [];
    },

    /**
     * Get FAQs
     */
    async getFaqs(homePageOnly = false) {
      const params = { order: 'fields.order' };
      if (homePageOnly) {
        params['fields.showOnHomePage'] = true;
      }
      const response = await getEntries('faq', params);
      return response.items || [];
    },

    /**
     * Get statistics
     */
    async getStats() {
      const response = await getEntries('stat', { order: 'fields.order' });
      return response.items || [];
    },

    /**
     * Get home page content
     */
    async getHomePage() {
      const response = await getEntries('homePage', { limit: 1, include: 2 });
      if (response.items && response.items.length > 0) {
        return {
          entry: response.items[0],
          includes: response.includes
        };
      }
      return null;
    },

    /**
     * Get service page content
     */
    async getServicePage() {
      const response = await getEntries('servicePage', { limit: 1, include: 2 });
      if (response.items && response.items.length > 0) {
        return {
          entry: response.items[0],
          includes: response.includes
        };
      }
      return null;
    },

    /**
     * Get solutions page content
     */
    async getSolutionsPage() {
      const response = await getEntries('solutionsPage', { limit: 1 });
      return response.items ? response.items[0] : null;
    },

    /**
     * Get about page content
     */
    async getAboutPage() {
      const response = await getEntries('aboutPage', { limit: 1, include: 2 });
      if (response.items && response.items.length > 0) {
        return {
          entry: response.items[0],
          includes: response.includes
        };
      }
      return null;
    },

    /**
     * Get FAQ page content
     */
    async getFaqPage() {
      const response = await getEntries('faqPage', { limit: 1, include: 2 });
      if (response.items && response.items.length > 0) {
        return {
          entry: response.items[0],
          includes: response.includes
        };
      }
      return null;
    },

    /**
     * Get contact page content
     */
    async getContactPage() {
      const response = await getEntries('contactPage', { limit: 1 });
      return response.items ? response.items[0] : null;
    },

    /**
     * Check if Contentful is configured
     */
    isConfigured() {
      return CONFIG.spaceId !== 'YOUR_SPACE_ID' && CONFIG.accessToken !== 'YOUR_ACCESS_TOKEN';
    }
  };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentfulClient;
}
