import { definePreset, palette } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

const navy = palette('#10253b');
const copper = palette('#c17a4a');

const cardShadow = '0 12px 40px rgba(16, 37, 59, 0.08)';

export const grfPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '14px',
      xl: '18px'
    },
    navy,
    copper
  },
  semantic: {
    primary: {
      50: '{navy.50}',
      100: '{navy.100}',
      200: '{navy.200}',
      300: '{navy.300}',
      400: '{navy.400}',
      500: '{navy.500}',
      600: '{navy.600}',
      700: '{navy.700}',
      800: '{navy.800}',
      900: '{navy.900}',
      950: '{navy.950}'
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{copper.500}',
      offset: '2px',
      shadow: 'none'
    },
    formField: {
      paddingX: '0.875rem',
      paddingY: '0.75rem',
      borderRadius: '12px'
    },
    content: {
      borderRadius: '18px'
    },
    overlay: {
      select: { shadow: cardShadow },
      popover: { shadow: cardShadow },
      modal: {
        borderRadius: '18px',
        shadow: '0 12px 40px rgba(16, 37, 59, 0.12)'
      }
    },
    colorScheme: {
      light: {
        surface: {
          0: '#fffdf9',
          50: '#f6f3ee',
          100: '#efeae2',
          200: '#e6dfd4',
          300: '#d4cbbd',
          400: '#b7aea0',
          500: '#8f867a',
          600: '#5d6b78',
          700: '#3d4c5c',
          800: '#1b2a38',
          900: '#10253b',
          950: '#0b1c2d'
        },
        mask: {
          background: 'rgba(11, 28, 45, 0.45)'
        },
        formField: {
          background: '#ffffff',
          borderColor: '#e6dfd4',
          hoverBorderColor: '{copper.400}',
          focusBorderColor: '{copper.500}',
          color: '#1b2a38',
          placeholderColor: '#5d6b78'
        },
        text: {
          color: '#1b2a38',
          hoverColor: '#10253b',
          mutedColor: '#5d6b78',
          hoverMutedColor: '#3d4c5c'
        },
        content: {
          background: '#fffdf9',
          borderColor: '#e6dfd4',
          color: '#1b2a38'
        }
      }
    }
  },
  components: {
    button: {
      root: {
        label: {
          fontWeight: '600'
        }
      }
    }
  }
});
