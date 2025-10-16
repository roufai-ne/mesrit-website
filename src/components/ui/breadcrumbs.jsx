// src/components/ui/breadcrumbs.jsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';

const Breadcrumbs = ({ 
  items = [], 
  className,
  separator = <ChevronRight className="w-4 h-4 text-secondary-400" />,
  showHome = true,
  homeUrl = "/",
  homeLabel = "Home"
}) => {
  const router = useRouter();

  // Auto-generate breadcrumbs from current route if no items provided
  const generateBreadcrumbs = () => {
    const pathSegments = router.asPath.split('/').filter(Boolean);
    const breadcrumbs = [];

    if (showHome) {
      breadcrumbs.push({
        label: homeLabel,
        href: homeUrl,
        icon: <Home className="w-4 h-4" />
      });
    }

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip query parameters
      const cleanSegment = segment.split('?')[0];
      
      // Convert segment to readable format
      const label = cleanSegment
        .replace(/-/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, l => l.toUpperCase());

      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrent: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb navigation" 
      className={clsx(
        "flex items-center space-x-1 text-sm",
        className
      )}
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isCurrent = item.isCurrent || isLast;

          return (
            <li key={index} className="flex items-center space-x-1">
              {index > 0 && (
                <span className="flex items-center justify-center">
                  {separator}
                </span>
              )}
              
              {isCurrent ? (
                <span 
                  className="flex items-center space-x-1 text-secondary-900 font-medium"
                  aria-current="page"
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center space-x-1 transition-colors duration-200",
                    "text-secondary-600 hover:text-primary-600",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-1 py-0.5"
                  )}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Breadcrumb context for managing breadcrumbs across the app
import { createContext, useContext, useState } from 'react';

const BreadcrumbContext = createContext();

export const BreadcrumbProvider = ({ children }) => {
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const updateBreadcrumbs = (newBreadcrumbs) => {
    setBreadcrumbs(newBreadcrumbs);
  };

  const addBreadcrumb = (breadcrumb) => {
    setBreadcrumbs(prev => [...prev, breadcrumb]);
  };

  const removeBreadcrumb = (index) => {
    setBreadcrumbs(prev => prev.filter((_, i) => i !== index));
  };

  const clearBreadcrumbs = () => {
    setBreadcrumbs([]);
  };

  return (
    <BreadcrumbContext.Provider value={{
      breadcrumbs,
      updateBreadcrumbs,
      addBreadcrumb,
      removeBreadcrumb,
      clearBreadcrumbs
    }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbs = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
  }
  return context;
};

// Hook for setting page breadcrumbs
import { useEffect } from 'react';

export const useBreadcrumb = (breadcrumbConfig) => {
  const { updateBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    if (breadcrumbConfig) {
      updateBreadcrumbs(breadcrumbConfig);
    }

    // Cleanup on unmount
    return () => {
      updateBreadcrumbs([]);
    };
  }, [breadcrumbConfig, updateBreadcrumbs]);
};

// Preset breadcrumb configurations for common admin routes
export const adminBreadcrumbs = {
  dashboard: [
    { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Admin', href: '/admin' },
    { label: 'Dashboard', href: '/admin/Dashboard', isCurrent: true }
  ],
  users: [
    { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Admin', href: '/admin' },
    { label: 'Users', href: '/admin/users', isCurrent: true }
  ],
  news: [
    { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Admin', href: '/admin' },
    { label: 'News', href: '/admin/news', isCurrent: true }
  ],
  documents: [
    { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Admin', href: '/admin' },
    { label: 'Documents', href: '/admin/documents', isCurrent: true }
  ],
  settings: [
    { label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Admin', href: '/admin' },
    { label: 'Settings', href: '/admin/settings', isCurrent: true }
  ]
};

// Responsive breadcrumb component with overflow handling
export const ResponsiveBreadcrumbs = ({ 
  items = [], 
  maxItems = 3,
  className,
  ...props 
}) => {
  const [showAll, setShowAll] = useState(false);

  const shouldTruncate = items.length > maxItems;
  const displayItems = shouldTruncate && !showAll 
    ? [
        items[0], // First item (usually home)
        { 
          label: '...', 
          href: '#',
          onClick: (e) => {
            e.preventDefault();
            setShowAll(true);
          }
        },
        ...items.slice(-2) // Last 2 items
      ]
    : items;

  return (
    <div className={clsx("flex items-center justify-between", className)}>
      <Breadcrumbs items={displayItems} {...props} />
      
      {shouldTruncate && showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="text-xs text-secondary-500 hover:text-secondary-700 ml-4"
        >
          Collapse
        </button>
      )}
    </div>
  );
};

export default Breadcrumbs;