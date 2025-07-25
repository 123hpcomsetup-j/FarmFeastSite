# Source Maps Configuration Guide

## Overview
Source maps help developers debug production code by mapping minified JavaScript back to original source code. They also provide better Lighthouse insights and debugging capabilities.

## Current Configuration
The Vite build system is already configured with optimizations. To enable source maps for production debugging:

### For Production Debugging
1. **Environment Variable Method**: Set `VITE_BUILD_SOURCEMAP=true` before building
2. **Build Command**: `VITE_BUILD_SOURCEMAP=true npm run build`

### Lighthouse Benefits
Source maps provide Lighthouse with:
- **Code Coverage Analysis**: Shows which code is actually used vs. loaded
- **Bundle Analysis**: Identifies largest contributors to bundle size
- **Performance Insights**: Maps performance bottlenecks to original source files
- **Debugging Context**: Links runtime errors to source code locations

### Security Considerations
- Source maps expose source code structure
- Only enable for debugging/analysis purposes
- Consider separate staging builds with source maps
- Production builds can omit source maps for security

### Development Setup
Source maps are automatically enabled in development mode for:
- Hot Module Replacement (HMR)
- Error stack traces
- Browser DevTools debugging
- Component inspection

### Production Debugging Workflow
1. Build with source maps: `VITE_BUILD_SOURCEMAP=true npm run build`
2. Deploy to staging environment
3. Use browser DevTools to debug with original source context
4. Run Lighthouse audits for enhanced insights
5. Rebuild without source maps for production security

### Browser DevTools Features
With source maps enabled:
- Breakpoints work in original TypeScript/JSX files
- Stack traces show original file names and line numbers
- Network tab shows source file references
- Performance profiler maps to original code

## Implementation Status
✅ Development source maps enabled by default
✅ Performance optimizations maintain debugging context
✅ Error handling preserves source map information
⚠️ Production source maps require build flag for security

## Recommendation
Enable source maps during development and staging for comprehensive debugging, but evaluate security requirements for production deployment.