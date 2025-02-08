// @desc    SEO utility functions for managing meta tags
export const SEO = {
    // @desc    Update page title and meta tags
    updateMeta: (config) => {
        const {
            title,
            description,
            keywords,
            image,
            url
        } = config;

        // Update title
        document.title = title ? `${title} | EventSphere` : 'EventSphere';

        // Update meta tags
        const metaTags = {
            'description': description,
            'keywords': keywords,
            'og:title': title,
            'og:description': description,
            'og:image': image,
            'og:url': url,
            'twitter:card': 'summary_large_image',
            'twitter:title': title,
            'twitter:description': description,
            'twitter:image': image
        };

        Object.entries(metaTags).forEach(([name, content]) => {
            if (!content) return;

            // Update existing tags or create new ones
            let meta = document.querySelector(`meta[name="${name}"]`) ||
                document.querySelector(`meta[property="${name}"]`);

            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
                document.head.appendChild(meta);
            }

            meta.setAttribute('content', content);
        });
    }
}; 