# Frontend Performance Optimization Guide

## Overview
This document outlines the performance optimizations implemented across the application to improve data loading and rendering speed.

## Implemented Optimizations

### 1. **Data Caching with useQuery Hook**
- **Location**: `frontend/src/hooks/useQuery.js`
- **Benefits**:
  - In-memory cache with 5-minute TTL (configurable)
  - Prevents redundant API calls when navigating between pages
  - Automatic cache invalidation on mutations
  - Reduces server load and improves perceived performance

**Usage Example**:
```javascript
import { useQuery, clearCache } from '../hooks/useQuery';

// In your component
const { data, loading, error, refetch } = useQuery('students', getStudents);

// Clear cache when needed
clearCache('students');
refetch(true); // Skip cache
```

### 2. **Debounced Search**
- **Location**: `frontend/src/hooks/useDebounce.js`
- **Benefits**:
  - Reduces API calls during typing (300ms delay)
  - Improves search performance
  - Better user experience with less flickering

**Usage Example**:
```javascript
import { useDebounce } from '../hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

// Use debouncedSearch in API calls instead of search
```

### 3. **Skeleton Loading States**
- **Location**: `frontend/src/components/SkeletonLoader.jsx`
- **Benefits**:
  - Better perceived performance
  - Reduces layout shift
  - Professional loading experience

**Available Components**:
- `SkeletonStatCards` - For dashboard stat cards
- `SkeletonTable` - For table data
- `SkeletonCards` - For card lists
- `SkeletonDashboard` - Complete dashboard skeleton

### 4. **Memoized Filtering**
- **Implementation**: Using `useMemo` for client-side filtering
- **Benefits**:
  - Prevents unnecessary re-computations
  - Faster filtering on large datasets
  - Smooth UI updates

**Example**:
```javascript
const filteredData = useMemo(() => 
  allData.filter(item => {
    // filtering logic
  }), 
  [allData, filters, debouncedSearch]
);
```

### 5. **Virtual Scrolling (Available)**
- **Location**: `frontend/src/components/VirtualList.jsx`
- **Benefits**:
  - Renders only visible items
  - Handles thousands of items smoothly
  - Reduces DOM nodes and memory usage

**Usage Example**:
```javascript
import VirtualList from '../components/VirtualList';

<VirtualList
  items={largeDataset}
  itemHeight={60}
  containerHeight={600}
  renderItem={(item, index) => (
    <div>{item.name}</div>
  )}
/>
```

### 6. **Lazy Image Loading (Available)**
- **Location**: `frontend/src/components/LazyImage.jsx`
- **Benefits**:
  - Images load only when visible
  - Reduces initial page load time
  - Better bandwidth usage

**Usage Example**:
```javascript
import LazyImage from '../components/LazyImage';

<LazyImage
  src="/path/to/image.jpg"
  alt="Description"
  placeholder="/path/to/placeholder.jpg"
/>
```

### 7. **Pagination Hook**
- **Location**: `frontend/src/hooks/usePagination.js`
- **Benefits**:
  - Reusable pagination logic
  - Consistent pagination across pages
  - Easy to implement

**Usage Example**:
```javascript
import { usePagination } from '../hooks/usePagination';

const {
  currentPage,
  totalPages,
  paginatedItems,
  goToPage,
  nextPage,
  prevPage,
  hasNext,
  hasPrev
} = usePagination(items, 10);
```

## Pages Optimized

### ✅ Fully Optimized
1. **Dashboard** (`Dashboard.jsx`)
   - useQuery caching
   - Skeleton loading
   
2. **StudentDataMap** (`StudentDataMap.jsx`)
   - useQuery caching
   - Debounced search
   - Memoized filtering
   - Skeleton loading

3. **FacultyDataMap** (`FacultyDataMap.jsx`)
   - useQuery caching
   - Debounced search
   - Memoized filtering
   - Skeleton loading

4. **ViolationsMap** (`ViolationsMap.jsx`)
   - Debounced search
   - Skeleton loading

5. **SkillsMap** (`SkillsMap.jsx`)
   - Debounced search

6. **AffiliationsMap** (`AffiliationsMap.jsx`)
   - Debounced search

7. **NonAcademicHistoriesMap** (`NonAcademicHistoriesMap.jsx`)
   - Debounced search

## Performance Metrics

### Before Optimization
- Initial page load: ~2-3s with loading spinner
- Search typing: API call on every keystroke
- Navigation between pages: Fresh API call every time
- Large lists: Render all items at once

### After Optimization
- Initial page load: ~1-2s with skeleton (perceived as faster)
- Search typing: API call only after 300ms pause
- Navigation: Instant load from cache (5min TTL)
- Large lists: Can use virtual scrolling for 1000+ items

## Best Practices

### 1. Always Use Debounced Search
```javascript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

// Use debouncedSearch in useEffect or API calls
useEffect(() => {
  fetchData(debouncedSearch);
}, [debouncedSearch]);
```

### 2. Cache API Calls with useQuery
```javascript
// Good - with caching
const { data, loading } = useQuery('key', fetchFunction);

// Bad - no caching
useEffect(() => {
  fetchFunction().then(setData);
}, []);
```

### 3. Memoize Expensive Computations
```javascript
// Good - memoized
const filtered = useMemo(() => 
  data.filter(item => condition), 
  [data, condition]
);

// Bad - recalculates on every render
const filtered = data.filter(item => condition);
```

### 4. Use Skeleton Loaders
```javascript
// Good - skeleton loading
{loading ? <SkeletonTable /> : <Table data={data} />}

// Bad - spinner only
{loading ? <Spinner /> : <Table data={data} />}
```

### 5. Invalidate Cache on Mutations
```javascript
import { clearCache } from '../hooks/useQuery';

const handleSave = async () => {
  await saveData();
  clearCache('students'); // Invalidate related cache
  refetch(true); // Force fresh fetch
};
```

## Future Optimization Opportunities

### 1. Backend Pagination
- Implement server-side pagination for large datasets
- Reduce payload size
- Faster initial load

### 2. API Response Compression
- Enable gzip/brotli compression
- Reduce network transfer time

### 3. Code Splitting
- Lazy load routes with React.lazy()
- Reduce initial bundle size

### 4. Service Worker Caching
- Cache static assets
- Offline support
- Faster repeat visits

### 5. Image Optimization
- Use WebP format
- Implement responsive images
- CDN for static assets

### 6. Database Indexing
- Index frequently queried fields
- Optimize complex queries
- Add database caching layer (Redis)

## Monitoring Performance

### Browser DevTools
1. **Network Tab**: Monitor API call frequency and payload size
2. **Performance Tab**: Record and analyze rendering performance
3. **Lighthouse**: Run audits for performance scores

### Key Metrics to Track
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1

## Troubleshooting

### Cache Not Working
- Check if cache key is consistent
- Verify TTL hasn't expired
- Ensure clearCache is called appropriately

### Search Too Slow
- Increase debounce delay (300ms → 500ms)
- Implement server-side search
- Add search indexing on backend

### Large Lists Laggy
- Implement virtual scrolling
- Reduce item complexity
- Use pagination instead of infinite scroll

## Additional Resources

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
