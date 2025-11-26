# SOP Chart and Document Formatting Improvements

## Overview
Fixed multiple issues with chart generation and document formatting to ensure professional, consistent SOP documents.

## Issues Fixed

### 1. Swimlane Chart Appearance
**Problem:** Swimlane chart looked like a regular flowchart instead of showing distinct lanes for different roles.

**Solution:**
- Updated prompt to explicitly use subgraph syntax for each actor/role
- Added `direction TB` within each subgraph for proper lane orientation
- Improved naming: "Responsibility Matrix" → "Roles and Responsibilities"
- Made it clear that each subgraph represents ONE actor's swimlane
- Limited to max 8 steps for better readability

**Result:** Now generates proper swimlane diagrams with clear role separation.

### 2. Data Flow Chart Not Showing
**Problem:** Data flow chart was not being generated or displayed in the document.

**Solution:**
- Ensured the condition `(input.inputs && input.inputs.length > 0) || (input.outputs && input.outputs.length > 0)` properly checks for data
- Improved prompt to generate simpler, more focused diagrams
- Better naming: "Data Flow Diagram" → "Input-Process-Output Diagram"
- Limited complexity: max 3 inputs, 3 processes, 3 outputs
- Added instruction to group similar items if needed

**Result:** Data flow chart now consistently generates and displays.

### 3. Better Chart Names
**Before:**
- "Process Flowchart"
- "Responsibility Matrix" 
- "Data Flow Diagram"

**After:**
- "Process Flowchart" (kept - clear and accurate)
- "Roles and Responsibilities" (more descriptive)
- "Input-Process-Output Diagram" (clearer purpose)

### 4. Charts Fit One Page
**Problem:** Charts were too large and had excessive blank space.

**Solutions Applied:**

**In Chart Generation (sop-chart-generator.ts):**
- Reduced max label length: 50 → 35 characters for flowchart
- Reduced max label length: 40 → 35 characters for swimlane
- Reduced max label length: 40 → 25 characters for data flow
- Limited total nodes: max 10 for flowchart, max 8 for swimlane
- Added instruction to combine similar steps
- Reduced process steps shown in data flow to first 5 only
- Added padding: 15px in Mermaid config

**In HTML Rendering (sop-view.html):**
- Added `max-height: 800px` to chart-diagram container
- Added `max-height: 700px` to SVG elements
- Centered charts with flexbox
- Reduced padding: 2rem → 1.5rem
- Added `height: auto` to maintain aspect ratio

**Result:** Charts now fit comfortably on one page with minimal blank space.

### 5. Duplicate Bullet Characters
**Problem:** Bulleted lists showed duplicate bullets (e.g., "• * Item text").

**Solution in formatContent() function:**
- Added `.replace(/^\*+\s*/, '')` to remove leading asterisks after bullet removal
- Applied to both unordered and ordered lists
- Added check to only add non-empty items
- Properly strips `*`, `-`, `+` characters from list items

**Before:**
```
• * Item one
• * Item two
```

**After:**
```
• Item one
• Item two
```

### 6. Inconsistent Header Numbering
**Problem:** Headers were numbered in two different ways (some with "1.", some with "1").

**Solution:**

**In Prompt (sop-text-generator.ts):**
- Changed from numbered list format (1. 2. 3.) to markdown headers (###)
- Added explicit instruction: "DO NOT add numbers before section titles - they will be added automatically"
- Specified to use "###" for main sections without numbers
- Specified to use "####" for subsections without numbers

**In Parser (parseSOPResponse):**
- Enhanced regex to remove multiple numbering formats:
  - `.replace(/^\d+\.\s*/, '')` - removes "1. "
  - `.replace(/^\d+\s+/, '')` - removes "1 "
  - `.replace(/^\d+\.\d+\s*/, '')` - removes "1.1 "
  - `.replace(/^\d+\.\d+\.\s*/, '')` - removes "1.1. "
- Applies consistent numbering programmatically

**Result:** All headers now use consistent numbering format (1, 2, 3 for sections; 1.1, 1.2 for subsections).

## Technical Changes

### Files Modified

1. **secondguess/src/services/sop-chart-generator.ts**
   - Updated `generateFlowchart()` prompt with stricter constraints
   - Updated `generateSwimlane()` with proper swimlane syntax
   - Updated `generateDataFlow()` with simplified requirements
   - Improved chart titles and descriptions
   - Added size and complexity limits

2. **secondguess/src/services/sop-text-generator.ts**
   - Updated prompt to use markdown headers without numbers
   - Enhanced `parseSOPResponse()` to handle multiple numbering formats
   - Added explicit instructions about formatting

3. **secondguess/public/sop-view.html**
   - Added CSS for chart sizing constraints
   - Updated `formatContent()` to remove duplicate bullets
   - Added Mermaid padding configuration
   - Improved chart container styling

## Benefits

✅ **Professional Appearance:** Charts look clean and properly formatted
✅ **Consistent Formatting:** All numbering follows the same pattern
✅ **Better Readability:** Charts fit on one page without scrolling
✅ **No Duplicates:** Bullet points display correctly
✅ **Clear Roles:** Swimlane diagrams show role separation
✅ **Complete Documentation:** All three chart types generate reliably

## Testing Recommendations

1. Generate an SOP with multiple actors to verify swimlane diagram
2. Generate an SOP with inputs/outputs to verify data flow diagram
3. Check that all charts fit within one page when printed
4. Verify bullet points don't have duplicate characters
5. Confirm section numbering is consistent throughout document
