# THE VAULT DESIGN SYSTEM
**Version:** 2.0  
**Updated:** 2026-03-15  
**Vision:** Premium High-Security Study Experience

---

## 🎨 COLOR PALETTE

### Core Vault Colors
```typescript
background: '#0a0a04'      // Vault-Dark — Main background (Deep Space)
surface: '#121210'         // Vault-Surface — Elevated panels
surfaceLight: '#1a1a18'    // Hover/Active states
```

### Premium Accents
```typescript
gold: 'hsl(45, 93%, 47%)'     // #EAB308 — Platinum/Premium UI only
purple: 'hsl(262, 83%, 57%)'  // #8B5CF6 — Standard branding
success: 'hsl(142, 76%, 36%)' // #22C55E — Success/Glow effects
```

### Text Hierarchy
```typescript
text: '#ffffff'          // Primary text
textSecondary: '#a1a1aa' // Muted (zinc-400)
textTertiary: '#71717a'  // Subtle (zinc-500)
```

### Glassmorphism Support
```typescript
glass: 'rgba(255, 255, 255, 0.05)'       // Semi-transparent fill
glassBorder: 'rgba(255, 255, 255, 0.1)' // 1px border for glass cards
glassHover: 'rgba(255, 255, 255, 0.08)'  // Hover state
```

---

## 📐 TYPOGRAPHY

### Font Stack
- **Headings:** Plus Jakarta Sans (Bold/ExtraBold) — Tracking: -0.02em
- **Body:** Inter (Regular/Medium) — High legibility
- **Math/Code:** JetBrains Mono

### Scale
```typescript
fontSize: {
  xs: 11,    // Helper text
  sm: 13,    // Secondary text
  base: 15,  // Body text
  lg: 17,    // Subheadings
  xl: 20,    // Card titles
  xxl: 28,   // Page titles
  xxxl: 36,  // Hero titles
}
```

---

## ✨ GLASSMORPHISM PATTERN

### Standard Glass Card
```typescript
{
  backgroundColor: 'rgba(18, 18, 16, 0.7)', // 70% opacity surface
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  // Use BlurView component for backdrop blur effect
}
```

### Implementation Example
```jsx
import { BlurView } from 'expo-blur';

<BlurView intensity={20} tint="dark" style={styles.glassCard}>
  {/* Content */}
</BlurView>

const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: 'rgba(18, 18, 16, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
});
```

---

## 🎭 ANIMATIONS

### Micro-Animations (400ms default)
```typescript
// Scale-In (for cards appearing)
{
  transform: [{ scale: 0.95 }],
  opacity: 0,
}
// Animate to:
{
  transform: [{ scale: 1 }],
  opacity: 1,
}
```

### Shimmer Effect (Premium CTAs)
Use `react-native-reanimated` to create a shimmer that sweeps across gold buttons.

### Haptic Feedback
Trigger on all interactions using `expo-haptics`:
```typescript
import * as Haptics from 'expo-haptics';

onPress={() => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // Handle action
}}
```

---

## 🛡️ SECURITY FEATURES

### Screenshot Prevention
✅ **Implemented:** `expo-screen-capture` in PDF viewer  
- Prevents all screen captures in native PDF viewer
- Shows security warning on attempt (iOS only)

### Dynamic Watermarking
✅ **Implemented:** Email + IP + Timestamp overlay  
- Diagonal watermark on every PDF page
- Generated server-side by `serve-pdf` edge function

### Single Session Enforcement
✅ **Implemented:** Device session tracking  
- Heartbeat every 5 minutes
- Auto-kills old sessions on new login
- Shows "Vault Conflict" alert

---

## 🎯 UX PATTERNS

### Zero Vertical Scrolling
- Use tab-based navigation
- Horizontal drawers for subject/topic selection
- Internal card scrolling only

### Quick-Action HUD
- Floating action button (FAB) always accessible
- Actions: "Ask AI", "Search Notes"
- Position: Bottom-right, 16px from edges

### Loading States
- Use skeleton shimmers matching Vault-Surface (#121210)
- Animate shimmer from left to right
- Duration: 1.5s loop

---

## 🏆 TIER-SPECIFIC UI

### Silver (Starter)
- Purple accents only
- No AI features visible
- Download buttons disabled with upgrade CTA

### Gold (Standard)
- Purple accents
- AI credits displayed (1,000/month)
- Download enabled

### Platinum (Lifetime)
- **Gold accents throughout**
- AI credits displayed (10,000/month)
- Vault icon (offline mode)
- Premium badge with glow effect

---

## 📦 COMPONENT LIBRARY

### Glass Card
```jsx
<View style={styles.glassCard}>
  <Text style={styles.glassCardTitle}>Title</Text>
  <Text style={styles.glassCardBody}>Content</Text>
</View>
```

### Glow Button (Platinum)
```jsx
<Pressable style={styles.glowButton}>
  <Text style={styles.glowButtonText}>Premium Action</Text>
</Pressable>

const styles = StyleSheet.create({
  glowButton: {
    backgroundColor: 'hsl(45, 93%, 47%)',
    borderRadius: 12,
    padding: 16,
    shadowColor: 'hsl(45, 93%, 47%)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
});
```

---

## 🚫 LEGACY PITFALLS (AVOID)

- ❌ Never gate entire app behind tier check (use granular content gating)
- ❌ Never call hooks after conditional returns
- ❌ Never use `bio` — use `biology` (stream labels)
- ❌ Never hardcode credentials (use env vars)
- ❌ Never use cyan (#0ea5e9) — deprecated in Vault system

---

## 📚 REFERENCES

- Glassmorphism: https://glassmorphism.com/
- Plus Jakarta Sans: Google Fonts
- Inter: Google Fonts
- JetBrains Mono: JetBrains
- Expo Blur: https://docs.expo.dev/versions/latest/sdk/blur-view/
- Expo Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/

---

**Maintained by:** Notebase Development Team  
**Last Review:** 2026-03-15
