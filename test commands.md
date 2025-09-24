# Run all tests in specific files
npm test -- --testPathPattern="dark-mode|enhanced-financial|settings-panel|store-command"

# Run only failed tests (after identifying them)
npm test -- --onlyFailures

# Run tests with verbose output 
npm test -- --verbose

# Run a specific test by name pattern
npm test -- --testNamePattern="should render main application structure"

# Run tests in watch mode (helpful during development)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage