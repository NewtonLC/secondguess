# SOP Improvements - Quick Reference

## What Changed?

### 1. 📝 Document Title Prompt
When you click "Generate SOP", you'll now be asked to enter a document title.
- **Default**: "Standard Operating Procedure"
- **Action**: Enter your custom title or press OK for default
- **Cancel**: Stops generation

### 2. 🎨 Watermark on Cover
The cover page now has a subtle watermark:
- Circle with checkmark design
- White, 15% opacity
- Professional appearance
- Doesn't interfere with text

### 3. 🔢 TOC Starts from 1
Table of Contents now properly starts from 1:
- **Before**: 0, 1, 2, 3...
- **After**: 1, 2, 3, 4...
- Subsections: 1.1, 1.2, etc.

### 4. 📊 Fixed Flowchart Errors
Flowcharts now generate more reliably:
- Shorter labels (30 chars max)
- Simpler syntax requirements
- Fewer nodes (8 max)
- Fallback diagram if generation fails

### 5. 📋 Simplified Revision History
Revision history now shows only:
- Version 1.0
- Initial release
- Current date
- Single row (no multiple versions)

## How to Test

1. **Start the server**:
   ```bash
   cd secondguess
   npm start
   ```

2. **Open the app**: http://localhost:3000/new

3. **Have a conversation** about a workflow

4. **Click "Generate SOP"**

5. **Enter a title** (e.g., "Customer Onboarding Process")

6. **Verify**:
   - ✅ Cover page shows your custom title
   - ✅ Watermark appears on cover
   - ✅ TOC starts from 1
   - ✅ Flowcharts display correctly
   - ✅ Revision history has one row

## Files Changed

- `public/index-new.html` - Title prompt
- `public/sop-view.html` - Watermark, TOC, title display
- `src/services/sop-chart-generator.ts` - Flowchart fixes
- `src/services/sop-text-generator.ts` - Revision history

## Build Status

✅ **Compiled successfully** - Ready to test!

---

**Date**: November 26, 2025  
**Status**: Complete
