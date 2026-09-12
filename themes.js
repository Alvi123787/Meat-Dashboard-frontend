// Each theme's actual colors live in index.css as [data-theme="id"] CSS variable
// overrides. This file only holds the metadata needed to render the theme picker
// (name, description, and swatch colors for the preview dots).

export const THEMES = [
  {
    id: 'emerald-gold',
    name: 'Emerald & champagne gold',
    description: 'Luxurious, closest to the original MeatbyAlvi brand — just richer.',
    swatches: ['#0B3D2E', '#12694E', '#D4AF37', '#E8A5A0']
  },
  {
    id: 'midnight',
    name: 'Midnight indigo & neon mint',
    description: 'Dark, modern, high-contrast — feels like a premium tech product.',
    swatches: ['#14121F', '#6F63EF', '#2BE3A6', '#FFC857']
  },
  {
    id: 'sunset',
    name: 'Sunset citrus',
    description: 'Warm and energetic — a natural fit for a food delivery brand.',
    swatches: ['#3B1F2B', '#E85D33', '#F4B33E', '#E84393']
  },
  {
    id: 'royal-plum',
    name: 'Royal plum & rose gold',
    description: 'Elegant and a little unexpected — stands out without shouting.',
    swatches: ['#2E1A2E', '#7A2E5C', '#F2C879', '#D9A79C']
  },
  {
    id: 'ocean-teal',
    name: 'Ocean teal & coral',
    description: 'Fresh, clean, and trustworthy.',
    swatches: ['#0B3B3E', '#0E7C86', '#FF7A59', '#FFC857']
  },
  {
    id: 'charcoal-blue',
    name: 'Charcoal & electric blue',
    description: 'Sleek, data-forward, control-room feel — great for numbers.',
    swatches: ['#12141A', '#2F65F5', '#00D9C0', '#FF4D8D']
  }
]

export const DEFAULT_THEME_ID = 'emerald-gold'
