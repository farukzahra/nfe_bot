import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import '@/styles/theme.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  defaults: {
    VCard: {
      elevation: 0,
      rounded: 'lg',
      border: true,
    },
    VTextField: {
      variant: 'outlined',
      density: 'compact',
      rounded: 'lg',
    },
    VSelect: {
      variant: 'outlined',
      density: 'compact',
      rounded: 'lg',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'compact',
      rounded: 'lg',
    },
    VBtn: {
      rounded: 'lg',
      fontWeight: '500',
    },
    VChip: {
      rounded: 'lg',
    },
    VAlert: {
      rounded: 'lg',
    },
    VDataTable: {
      rounded: 'lg',
    },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#16161E',
          surface: '#1E1E2D',
          'surface-variant': '#26263A',
          primary: '#1697f6',
          'on-primary': '#ffffff',
          secondary: '#7C7C8A',
          error: '#FF5252',
          info: '#1697f6',
          success: '#56CA00',
          warning: '#FFB400',
        },
      },
      light: {
        dark: false,
        colors: {
          background: '#F4F5FA',
          surface: '#FFFFFF',
          'surface-variant': '#F0F1F8',
          primary: '#1697f6',
          'on-primary': '#ffffff',
          secondary: '#8A8D93',
          error: '#FF5252',
          info: '#1697f6',
          success: '#56CA00',
          warning: '#FFB400',
        },
      },
    },
  },
})
