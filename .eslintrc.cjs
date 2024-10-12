module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2022,
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  env: {
    node: true,
    es6: true,
    //
  },
  // prettier should be last so that it overrides all other configs, basically saying, don't error on whatever you've got configured for prettier
  extends: [
    "airbnb-base",
    "prettier",
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["prettier", "chai-friendly", "@typescript-eslint", "import"],
  rules: {
    "prettier/prettier": "warn", // in combination with plugins: ['prettier'] will show prettier conflicts (you might have to reload the window after you've made changes to .prettierrc)
    "no-shadow": "off",
    "consistent-return": "off",
    "arrow-body-style": ["off", "as-needed"],
    "no-param-reassign": "off",
    "no-underscore-dangle": "off",
    "import/named": "off",
    "import/prefer-default-export": "off",
    "import/no-named-as-default": "off",
    "import/no-named-as-default-member": "off",
    "class-methods-use-this": "off",
    "no-nested-ternary": "off",
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
    "no-use-before-define": [
      "error",
      { functions: false, classes: true, variables: true },
    ], // Allow functions to be declared after being called, but only if they're hoisted
    "no-restricted-syntax": [
      "error",
      "ForInStatement",
      "LabeledStatement",
      "WithStatement",
    ], // Basically just remove restricting ForOfStatement from Airbnb defaults
    "no-await-in-loop": "off",
    "no-console": "off",
    "import/extensions": "off",
    quotes: ["error", "double"],
    "import/no-unresolved": 0,
    indent: ["error", 2],
  },
  ignorePatterns: ["dist"],
  // chai specific config so that no-unused-expressions rule still applies in test files but not to
  // chai assertions so that you can do stuff like expect(userHabits[0].createdAt).to.exist
  overrides: [
    {
      files: "*.test.js",
      rules: {
        "no-unused-expressions": "off",
        "chai-friendly/no-unused-expressions": "error",
      },
    },
  ],
};
