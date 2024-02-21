module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': 'off',
    'vue/no-unused-components': 'off',
    'vue/multi-word-component-names': 'off',
    'no-undef': 'off',
    'vue/no-useless-template-attributes': 'off',
    'no-sparse-arrays': 'off',
    'no-const-assign': 'off',
    'no-empty': 'off',
    'vue/require-valid-default-prop': 'off',
    'no-case-declarations': 'off'
  }
}
