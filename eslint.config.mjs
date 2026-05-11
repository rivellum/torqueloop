import nextVitals from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextVitals,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      // Preserve the pre-upgrade lint gate signal while this app remains on React 18.
      // Next 16's config enables newer React Compiler rules that flag existing patterns
      // but are not part of the current go-live security fix.
      'react-hooks/error-boundaries': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
    },
  },
]

export default config
