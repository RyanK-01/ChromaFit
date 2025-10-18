# Component Library Documentation

This document provides detailed information about the custom React components used in the ChromaFit application.

## Table of Contents

- [Core Components](#core-components)
  - [Avatar3D](#avatar3d)
  - [AvatarUpload](#avatarupload)
  - [AddGarmentDialog](#addgarmentdialog)
  - [FitScoreDisplay](#fitscoredisplay)
  - [GarmentCard](#garmentcard)
  - [OutfitCard](#outfitcard)
  - [ErrorBoundary](#errorboundary)
- [Skeleton Components](#skeleton-components)
  - [GarmentCardSkeleton](#garmentcardskeleton)
  - [OutfitCardSkeleton](#outfitcardskeleton)
- [UI Components](#ui-components)

---

## Core Components

### Avatar3D

A 3D avatar viewer component that renders a customizable 3D human model with optional try-on visualization.

**Location:** `src/components/Avatar3D.tsx`

**Props:**
- `smplParams?: SMPLParams | null` - SMPL (Skinned Multi-Person Linear Model) parameters for avatar shape and pose
- `className?: string` - Additional CSS classes
- `showTryOn?: boolean` - Whether to display the try-on garment overlay
- `tryOnTexture?: string` - URL of the try-on texture/image

**Features:**
- Real-time 3D rendering using Three.js and react-three-fiber
- Interactive orbit controls for rotating and zooming
- Environment lighting for realistic appearance
- Dynamic avatar shape based on SMPL parameters
- Try-on garment visualization overlay

**Usage Example:**
```tsx
<Avatar3D 
  smplParams={userAvatar.smpl_params}
  showTryOn={true}
  tryOnTexture={tryOnResult.result_image_url}
  className="w-full h-[600px]"
/>
```

---

### AvatarUpload

A photo upload component for creating user avatars, supporting both drag-and-drop and file selection.

**Location:** `src/components/AvatarUpload.tsx`

**Props:**
- `onUpload: (file: File) => Promise<string>` - Callback function to handle file upload
- `onComplete: (imageUrl: string) => void` - Callback when upload is complete
- `isUploading?: boolean` - Loading state indicator
- `uploadProgress?: number` - Upload progress percentage (0-100)
- `error?: string` - Error message to display

**Features:**
- Drag-and-drop file upload
- File type validation (images only)
- Image preview before upload
- Upload progress indicator
- Error handling and display
- Responsive design

**Usage Example:**
```tsx
<AvatarUpload
  onUpload={handleFileUpload}
  onComplete={handleUploadComplete}
  isUploading={uploading}
  uploadProgress={progress}
  error={errorMessage}
/>
```

---

### AddGarmentDialog

A modal dialog for adding garments to the user's wardrobe via photo upload or product URL.

**Location:** `src/components/AddGarmentDialog.tsx`

**Props:**
- `children: React.ReactNode` - Trigger element (usually a button) to open the dialog

**Features:**
- Two input methods: photo upload or product URL
- Tab-based interface for switching between methods
- Drag-and-drop file upload support
- Image preview
- Automatic garment analysis via API
- Real-time processing status
- Error handling
- Automatic refresh of wardrobe data on success

**Usage Example:**
```tsx
<AddGarmentDialog>
  <Button>
    <Plus className="mr-2" />
    Add Garment
  </Button>
</AddGarmentDialog>
```

---

### FitScoreDisplay

Displays the fit analysis results with score, visual indicators, and detailed explanations.

**Location:** `src/components/FitScoreDisplay.tsx`

**Props:**
- `fitScore: FitScore` - Fit score object containing score value and explanation
- `className?: string` - Additional CSS classes

**Features:**
- Color-coded score display (green/yellow/red)
- Visual indicators (icons) based on fit quality
- Expandable detailed fit explanation
- Category-based fit analysis breakdown
- Responsive design

**Score Ranges:**
- **80-100%**: Excellent Fit (Green)
- **60-79%**: Good Fit (Yellow)
- **0-59%**: Poor Fit (Red)

**Usage Example:**
```tsx
<FitScoreDisplay 
  fitScore={tryOnResult.fit_score}
  className="mt-4"
/>
```

---

### GarmentCard

A card component for displaying garment information in the wardrobe.

**Location:** `src/components/GarmentCard.tsx`

**Props:**
- `garment: Garment` - Garment object with all garment data
- `onDelete?: (garmentId: string) => void` - Optional callback for delete action
- `showActions?: boolean` - Whether to show action buttons (default: true)

**Features:**
- Garment image with hover zoom effect
- Category badge with color coding
- Source indicator (upload/URL)
- External link for URL-sourced garments
- Delete functionality
- Measurement display
- Responsive grid layout

**Category Colors:**
- t-shirt: Blue
- jeans: Indigo
- dress: Pink
- shirt: Gray
- pants: Green
- shorts: Yellow
- jacket: Purple
- sweater: Orange
- skirt: Red
- shoes: Brown
- accessories: Teal

**Usage Example:**
```tsx
<GarmentCard 
  garment={garment}
  onDelete={handleDeleteGarment}
  showActions={true}
/>
```

---

### OutfitCard

A card component for displaying outfit collections in the explore/discovery section.

**Location:** `src/components/OutfitCard.tsx`

**Props:**
- `outfit: StyleSimilarity` - Outfit object with similarity data
- `showSimilarity?: boolean` - Whether to display similarity score (default: true)

**Features:**
- Grid display of up to 4 garment images
- Overflow indicator for outfits with more than 4 items
- Similarity score badge (when enabled)
- User profile information with avatar
- Hover effects for better interactivity
- Click to view detailed outfit page
- Responsive design

**Similarity Ranges:**
- **80-100%**: High similarity (Green)
- **60-79%**: Medium similarity (Yellow)
- **0-59%**: Low similarity (Gray)

**Usage Example:**
```tsx
<OutfitCard 
  outfit={similarOutfit}
  showSimilarity={true}
/>
```

---

### ErrorBoundary

A React error boundary component that catches JavaScript errors anywhere in the child component tree.

**Location:** `src/components/ErrorBoundary.tsx`

**Props:**
- `children: ReactNode` - Child components to wrap
- `fallback?: ReactNode` - Optional custom fallback UI

**Features:**
- Catches and handles React component errors
- Displays user-friendly error message
- Retry functionality
- Console logging for debugging
- Prevents app crashes from component errors

**Usage Example:**
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

## Skeleton Components

Skeleton components provide loading placeholders that improve perceived performance.

### GarmentCardSkeleton

Loading placeholder for `GarmentCard`.

**Location:** `src/components/GarmentCardSkeleton.tsx`

**Usage Example:**
```tsx
{isLoading ? (
  <GarmentCardSkeleton />
) : (
  <GarmentCard garment={garment} />
)}
```

---

### OutfitCardSkeleton

Loading placeholder for `OutfitCard`.

**Location:** `src/components/OutfitCardSkeleton.tsx`

**Usage Example:**
```tsx
{isLoading ? (
  <OutfitCardSkeleton />
) : (
  <OutfitCard outfit={outfit} />
)}
```

---

## UI Components

The application uses [shadcn/ui](https://ui.shadcn.com/) components for base UI elements. These components are located in `src/components/ui/` and include:

### Layout Components
- **Card** - Container component with header, content, and footer sections
- **Dialog** - Modal dialog for user interactions
- **Tabs** - Tabbed interface component

### Form Components
- **Button** - Customizable button with variants
- **Input** - Text input field
- **Label** - Form label component
- **Select** - Dropdown select component
- **Textarea** - Multi-line text input

### Feedback Components
- **Badge** - Small status or category indicator
- **Progress** - Progress bar component
- **Skeleton** - Loading placeholder component
- **Toast** - Notification component

### Display Components
- **Avatar** - User profile picture component
- **Separator** - Visual divider component
- **Scroll Area** - Custom scrollable container

### Navigation Components
- **Breadcrumb** - Navigation breadcrumb trail
- **Navigation Menu** - Main navigation component

---

## Component Guidelines

### Best Practices

1. **Props Validation**: All components use TypeScript interfaces for type safety
2. **Client Components**: Most components are marked with `'use client'` directive for interactivity
3. **Accessibility**: Components follow WCAG accessibility guidelines
4. **Responsive Design**: All components are mobile-friendly and responsive
5. **Error Handling**: Components include proper error states and boundaries
6. **Loading States**: Skeleton components for better UX during data fetching

### Styling

- **Tailwind CSS**: All components use Tailwind utility classes
- **CSS Variables**: Theme colors are defined in `globals.css`
- **Dark Mode Support**: Components support dark mode theming
- **Consistent Spacing**: Using Tailwind spacing scale (4px increments)

### Performance

- **Code Splitting**: Components are automatically code-split by Next.js
- **Image Optimization**: Using Next.js `Image` component for automatic optimization
- **Lazy Loading**: Heavy components (like Avatar3D) can be lazy-loaded
- **Memoization**: Complex calculations are memoized with `useMemo`

---

## Adding New Components

When creating new components, follow this structure:

```tsx
'use client'

import { ComponentProps } from '@/types'
import { Button } from '@/components/ui/button'

interface YourComponentProps {
  // Define props with TypeScript
  prop1: string
  prop2?: number
}

export function YourComponent({ prop1, prop2 = 0 }: YourComponentProps) {
  // Component logic
  
  return (
    <div className="your-styles">
      {/* Component JSX */}
    </div>
  )
}
```

### Checklist for New Components

- [ ] TypeScript interface for props
- [ ] Proper JSDoc comments
- [ ] Responsive design
- [ ] Accessibility attributes (aria-labels, roles)
- [ ] Error handling
- [ ] Loading states
- [ ] Unit tests (if applicable)
- [ ] Storybook story (if applicable)
- [ ] Documentation in this file

---

## Related Documentation

- [API Contracts](./API_CONTRACTS.md) - API endpoints used by components
- [Database Schema](./SCHEMA.md) - Data structures and types
- [Main README](../README.md) - Project overview and setup

---

**Last Updated:** October 18, 2025
