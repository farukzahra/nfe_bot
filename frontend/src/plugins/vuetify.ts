import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import '@/styles/theme.css'
import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  aliases: {
    VBtnAlt: VBtn,
  },
  defaults: {
    global: {
      rounded: 'sm',
    },
    VAppBar: {
      flat: true,
    },
    VBtn: {
      color: 'primary',
      height: 44,
    },
    VBtnAlt: {
      color: 'primary',
      height: 48,
      variant: 'outlined',
    },
    VCard: {
      rounded: 'sm',
    },
    VSheet: {
      color: '#212121',
    },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          primary: '#1697f6',
        },
      },
      light: {
        dark: false,
        colors: {
          primary: '#1697f6',
        },
      },
    },
  },
})
