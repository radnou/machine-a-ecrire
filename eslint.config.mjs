// import js from '@eslint/js'; // Replaced by tseslint.configs.eslintRecommended
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'; // For Prettier rules + plugin
// import eslintConfigPrettier from 'eslint-config-prettier'; // Usually, eslint-plugin-prettier/recommended includes this

// React specific plugins - keep them if project uses React
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      'packages/*/dist/',
      'packages/*/node_modules/',
    ],
  },

  // Base JavaScript and TypeScript recommended configurations
  tseslint.configs.eslintRecommended, // Use eslint:recommended via tseslint
  ...tseslint.configs.recommended,

  // Configuration for TypeScript files (including React specific setup)
  {
    files: ['**/*.{ts,tsx}'], // Apply to all TS/TSX files in the project
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser, // For browser environments (renderer, ui)
        ...globals.node, // For Node.js environments (electron-main, scripts)
        ...globals.es2020, // For ES2020 globals
        ...globals.jest, // For Jest tests
      },
      parser: tseslint.parser, // Specify the TypeScript parser
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: [
          './tsconfig.app.json',
          './tsconfig.electron.json',
          './tsconfig.node.json',
          './packages/*/tsconfig.json',
        ],
        tsconfigRootDir: import.meta.dirname, // Correctly resolves project paths
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin, // The typescript-eslint plugin
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      // 'prettier' plugin is often implicitly added by eslint-plugin-prettier/recommended
    },
    rules: {
      // Start with TypeScript ESLint recommended rules
      // ...tseslint.configs.recommended.rules, // This is already applied by extending above

      // React specific rules from the original config
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Add other custom rules here if needed
      // "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // Configuration for JS files (e.g., config files themselves)
  {
    files: ['**/*.js'], // Apply to JS files like config files
    languageOptions: {
      globals: {
        ...globals.node, // Config files are usually Node.js modules
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off', // Allow require in JS files
    },
  },

  // Prettier configuration - should be last to override other formatting rules
  eslintPluginPrettierRecommended,
  // If eslintPluginPrettierRecommended doesn't include eslint-config-prettier, add it:
  // eslintConfigPrettier
  {
    rules: {
      'prettier/prettier': 'warn', // Show Prettier differences as warnings
    },
  }
);
