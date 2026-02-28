# Contributing to Integration Glue Predictive Intelligence

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Use the bug report template
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Relevant logs

### Suggesting Features

1. Check if the feature has been suggested
2. Clearly describe the feature
3. Explain the use case
4. Consider implementation approach

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the coding style
   - Add tests for new features
   - Update documentation
   - Keep commits atomic and descriptive

4. **Run tests**
   ```bash
   npm test
   npm run lint
   ```

5. **Commit changes**
   ```bash
   git commit -m "feat: add new feature"
   ```
   Use conventional commit messages:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation
   - `test:` Tests
   - `refactor:` Code refactoring
   - `chore:` Maintenance

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Describe your changes
   - Reference related issues
   - Ensure CI passes

## Development Setup

```bash
# Clone repository
git clone https://github.com/iacosta3994/integration-glue-predictive-intelligence.git
cd integration-glue-predictive-intelligence

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run tests
npm test

# Start development server
npm run dev
```

## Coding Standards

- Use ES6+ features
- Follow ESLint rules
- Write descriptive variable names
- Add JSDoc comments for functions
- Keep functions small and focused
- Write tests for new code

## Testing

- Write unit tests for all new features
- Maintain test coverage above 80%
- Test edge cases
- Use meaningful test descriptions

## Documentation

- Update README.md for new features
- Add JSDoc comments
- Update API documentation
- Include code examples

## Questions?

Open an issue for questions or clarifications.

Thank you for contributing! 🚀
