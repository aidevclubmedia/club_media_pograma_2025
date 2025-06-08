# Image Display Troubleshooting Guide

## Table of Contents
1. [Quick Diagnostic Checklist](#quick-diagnostic-checklist)
2. [Common Image Display Issues](#common-image-display-issues)
3. [Path and URL Issues](#path-and-url-issues)
4. [File Format and Compatibility](#file-format-and-compatibility)
5. [Browser Cache Problems](#browser-cache-problems)
6. [Server Configuration Issues](#server-configuration-issues)
7. [Development vs Production Issues](#development-vs-production-issues)
8. [Performance and Loading Issues](#performance-and-loading-issues)
9. [Preventive Measures](#preventive-measures)
10. [Code Examples and Solutions](#code-examples-and-solutions)

---

## Quick Diagnostic Checklist

Before diving into specific issues, run through this quick checklist:

- [ ] Check browser developer tools console for errors
- [ ] Verify image file exists at the specified path
- [ ] Test image URL directly in browser address bar
- [ ] Check file permissions (if applicable)
- [ ] Verify file format is supported
- [ ] Test in different browsers
- [ ] Check network tab for failed requests
- [ ] Verify server is serving static files correctly

---

## Common Image Display Issues

### 1. Images Not Loading (Broken Image Icons)

**Symptoms:**
- Broken image icons (🖼️) appear instead of images
- Alt text is displayed
- Console shows 404 errors

**Diagnostic Steps:**
1. Open browser developer tools (F12)
2. Check Console tab for error messages
3. Check Network tab for failed image requests
4. Right-click broken image and "Copy image address"
5. Paste URL in new browser tab to test directly

**Common Causes & Solutions:**

#### A. Incorrect File Paths

**Problem:** Wrong relative or absolute paths
```javascript
// ❌ Incorrect paths
src="/src/images/product.png"        // Development path in production
src="./images/product.png"           // Relative path issues
src="images/product.png"             // Missing leading slash
```

**Solution:**
```javascript
// ✅ Correct paths for production
src="/images/product.png"            // Absolute path from public root
src={`${import.meta.env.BASE_URL}images/product.png`}  // Vite base URL
```

#### B. Case Sensitivity Issues

**Problem:** File name case doesn't match
```javascript
// ❌ File is "Product.PNG" but code uses:
src="/images/product.png"
```

**Solution:**
```javascript
// ✅ Match exact case
src="/images/Product.PNG"

// Or rename files to lowercase for consistency
```

#### C. Missing Files

**Diagnostic Command:**
```bash
# Check if file exists
ls -la public/images/
find . -name "*.png" -type f
```

**Solution:**
- Verify files are in correct directory
- Check build process includes image files
- Ensure images are copied to dist/build folder

### 2. Images Display Incorrectly

**Symptoms:**
- Images appear distorted, stretched, or cropped
- Wrong aspect ratio
- Images too large or too small

**Solutions:**

#### A. CSS Styling Issues
```css
/* ❌ Problematic styles */
img {
  width: 100px;
  height: 100px; /* Forces square, distorts aspect ratio */
}

/* ✅ Better approaches */
img {
  max-width: 100px;
  height: auto; /* Maintains aspect ratio */
  object-fit: contain; /* Fits within bounds */
}

/* For specific use cases */
.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover; /* Crops to fill */
  object-position: center;
}
```

#### B. Responsive Image Issues
```javascript
// ✅ Responsive image component
const ResponsiveImage = ({ src, alt, className }) => (
  <img 
    src={src}
    alt={alt}
    className={`max-w-full h-auto ${className}`}
    loading="lazy"
    onError={(e) => {
      e.target.src = '/images/placeholder.png';
      console.error(`Failed to load image: ${src}`);
    }}
  />
);
```

---

## Path and URL Issues

### Development vs Production Path Differences

**Problem:** Images work in development but fail in production

**Development (Vite):**
```javascript
// ❌ This works in dev but fails in production
src="/src/data/images/product.png"
```

**Production Solution:**
```javascript
// ✅ Move images to public folder and use absolute paths
src="/images/product.png"

// ✅ Or use dynamic imports for bundled images
import productImage from '../assets/images/product.png';
<img src={productImage} alt="Product" />
```

### Base URL Configuration

**For apps deployed in subdirectories:**

```javascript
// vite.config.js
export default defineConfig({
  base: '/my-app/', // If deployed to domain.com/my-app/
  // ... other config
});

// In components
const imageUrl = `${import.meta.env.BASE_URL}images/product.png`;
```

### Dynamic Path Generation

```javascript
// ✅ Robust path generation
const getImagePath = (imageName) => {
  const basePath = import.meta.env.PROD 
    ? import.meta.env.BASE_URL 
    : '/';
  return `${basePath}images/${imageName}`;
};

// Usage
<img src={getImagePath('product.png')} alt="Product" />
```

---

## File Format and Compatibility

### Supported Formats by Browser

| Format | Chrome | Firefox | Safari | Edge | Use Case |
|--------|--------|---------|--------|------|----------|
| JPEG   | ✅     | ✅      | ✅     | ✅   | Photos |
| PNG    | ✅     | ✅      | ✅     | ✅   | Transparency |
| WebP   | ✅     | ✅      | ✅     | ✅   | Modern, efficient |
| SVG    | ✅     | ✅      | ✅     | ✅   | Vector graphics |
| AVIF   | ✅     | ❌      | ✅     | ✅   | Next-gen format |

### Format Validation

```javascript
// ✅ Check file format before loading
const isValidImageFormat = (filename) => {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return validExtensions.includes(extension);
};

// Usage in component
const ImageComponent = ({ src, alt }) => {
  if (!isValidImageFormat(src)) {
    console.warn(`Unsupported image format: ${src}`);
    return <div className="placeholder">Invalid image format</div>;
  }
  
  return <img src={src} alt={alt} />;
};
```

### Progressive Enhancement with Multiple Formats

```javascript
// ✅ Modern image component with fallbacks
const ModernImage = ({ baseName, alt, className }) => (
  <picture>
    <source srcSet={`/images/${baseName}.avif`} type="image/avif" />
    <source srcSet={`/images/${baseName}.webp`} type="image/webp" />
    <img 
      src={`/images/${baseName}.jpg`} 
      alt={alt}
      className={className}
      loading="lazy"
    />
  </picture>
);
```

---

## Browser Cache Problems

### Symptoms
- Old images display after updates
- Images work in incognito mode but not regular browsing
- Inconsistent behavior across page refreshes

### Diagnostic Steps

1. **Hard Refresh:** Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. **Clear Browser Cache:** Developer Tools > Application > Storage > Clear Storage
3. **Test in Incognito Mode**
4. **Check Cache Headers:** Network tab > Response Headers

### Solutions

#### A. Cache Busting with Query Parameters
```javascript
// ✅ Add timestamp or version to force refresh
const cacheBustUrl = (url) => {
  const timestamp = new Date().getTime();
  return `${url}?v=${timestamp}`;
};

// Usage
<img src={cacheBustUrl('/images/product.png')} alt="Product" />
```

#### B. Proper Cache Headers (Server Configuration)

**Nginx:**
```nginx
# Cache images for 1 year but allow revalidation
location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
}
```

**Apache (.htaccess):**
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
</IfModule>
```

#### C. Versioned Assets (Build Process)
```javascript
// vite.config.js - Automatic file hashing
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  }
});
```

---

## Server Configuration Issues

### Static File Serving

#### Vite Development Server
```javascript
// vite.config.js
export default defineConfig({
  publicDir: 'public', // Serves files from public/ at root
  server: {
    fs: {
      strict: false // Allow serving files outside root if needed
    }
  }
});
```

#### Express.js Server
```javascript
// ✅ Serve static files
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ✅ Handle image requests with proper headers
app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'public/images', filename);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).send('Image not found');
  }
  
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.sendFile(filepath);
});
```

### CORS Issues

**Problem:** Images from external domains blocked

**Solution:**
```javascript
// ✅ Proxy external images through your server
app.get('/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    
    res.set('Content-Type', response.headers.get('content-type'));
    res.send(buffer);
  } catch (error) {
    res.status(500).send('Error fetching image');
  }
});
```

---

## Development vs Production Issues

### Common Deployment Problems

#### 1. Build Process Not Including Images

**Vite Build Check:**
```bash
# Check if images are in build output
npm run build
ls -la dist/images/

# If missing, verify public folder structure
ls -la public/images/
```

#### 2. Different Base URLs

```javascript
// ✅ Environment-aware image paths
const getImageUrl = (imagePath) => {
  if (import.meta.env.DEV) {
    return imagePath; // Development server handles it
  }
  
  // Production - use CDN or absolute path
  const baseUrl = import.meta.env.VITE_CDN_URL || '';
  return `${baseUrl}${imagePath}`;
};
```

#### 3. Environment Variables

```bash
# .env.production
VITE_CDN_URL=https://cdn.example.com/
VITE_IMAGE_BASE_PATH=/static/images/
```

```javascript
// Usage in components
const imagePath = `${import.meta.env.VITE_IMAGE_BASE_PATH}product.png`;
```

---

## Performance and Loading Issues

### Lazy Loading Implementation

```javascript
// ✅ Intersection Observer for lazy loading
const LazyImage = ({ src, alt, className, placeholder }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s'
          }}
        />
      )}
      {!isLoaded && placeholder && (
        <div className="placeholder">{placeholder}</div>
      )}
    </div>
  );
};
```

### Image Optimization

```javascript
// ✅ Responsive images with srcSet
const OptimizedImage = ({ baseName, alt, sizes }) => (
  <img
    src={`/images/${baseName}-800w.jpg`}
    srcSet={`
      /images/${baseName}-400w.jpg 400w,
      /images/${baseName}-800w.jpg 800w,
      /images/${baseName}-1200w.jpg 1200w
    `}
    sizes={sizes || "(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"}
    alt={alt}
    loading="lazy"
  />
);
```

---

## Preventive Measures

### 1. Consistent File Organization

```
public/
├── images/
│   ├── products/
│   │   ├── thumbnails/
│   │   └── full-size/
│   ├── ui/
│   │   ├── icons/
│   │   └── backgrounds/
│   └── placeholders/
└── documents/
```

### 2. Image Validation Utility

```javascript
// utils/imageValidator.js
export const validateImage = async (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  
  // Validate image dimensions
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        reject(new Error('Image too small'));
      } else {
        resolve(true);
      }
    };
    img.onerror = () => reject(new Error('Invalid image'));
    img.src = URL.createObjectURL(file);
  });
};
```

### 3. Error Boundary for Images

```javascript
// components/ImageErrorBoundary.jsx
class ImageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Image loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="image-error-fallback">
          <span>Failed to load image</span>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 4. Automated Testing

```javascript
// tests/imageLoading.test.js
describe('Image Loading', () => {
  test('all product images load successfully', async () => {
    const products = await getProductCatalog();
    
    for (const product of products) {
      const response = await fetch(product.imageUrl);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toMatch(/^image\//);
    }
  });
});
```

### 5. Monitoring and Logging

```javascript
// utils/imageMonitoring.js
export const trackImageError = (imageSrc, error) => {
  // Log to analytics service
  analytics.track('Image Load Error', {
    imageSrc,
    error: error.message,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  });
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error(`Image failed to load: ${imageSrc}`, error);
  }
};

// Usage in components
<img 
  src={imageSrc}
  onError={(e) => trackImageError(imageSrc, new Error('Load failed'))}
  alt={alt}
/>
```

---

## Code Examples and Solutions

### Complete Image Component with Error Handling

```javascript
// components/RobustImage.jsx
import React, { useState, useRef, useEffect } from 'react';

const RobustImage = ({
  src,
  alt,
  fallbackSrc = '/images/placeholder.png',
  className = '',
  lazy = true,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(lazy ? null : src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCurrentSrc(src);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, lazy]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback if not already using it
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    
    // Log error for monitoring
    console.error(`Failed to load image: ${src}`);
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          {...props}
        />
      )}
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-500">Loading...</span>
        </div>
      )}
      
      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-500">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default RobustImage;
```

### Image Preloading Utility

```javascript
// utils/imagePreloader.js
export const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map(url => 
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error(`Failed to preload: ${url}`));
        img.src = url;
      })
    )
  );
};

// Usage
useEffect(() => {
  const productImages = products.map(p => p.imageUrl);
  preloadImages(productImages)
    .then(() => console.log('All images preloaded'))
    .catch(error => console.error('Preload failed:', error));
}, [products]);
```

### Build-time Image Validation

```javascript
// scripts/validateImages.js
import fs from 'fs';
import path from 'path';

const validateImageFiles = () => {
  const imageDir = 'public/images';
  const requiredImages = [
    'logo.png',
    'background.jpg',
    // ... other required images
  ];

  const missingImages = requiredImages.filter(img => 
    !fs.existsSync(path.join(imageDir, img))
  );

  if (missingImages.length > 0) {
    console.error('Missing required images:', missingImages);
    process.exit(1);
  }

  console.log('All required images present');
};

validateImageFiles();
```

This comprehensive guide covers the most common image display issues and their solutions. Remember to always test your images in different environments and browsers, and implement proper error handling and monitoring to catch issues early.