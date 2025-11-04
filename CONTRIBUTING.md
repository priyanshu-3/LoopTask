# Contributing to LoopTask 🤝

First off, thank you for considering contributing to LoopTask! It's people like you that make LoopTask such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template**:
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS, Windows, Linux]
 - Browser: [e.g. Chrome, Safari]
 - Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Features 💡

Feature requests are welcome! Before submitting, please:

1. Check if the feature has already been requested
2. Provide a clear use case
3. Explain why this feature would be useful

**Feature Request Template**:
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request.
```

### Pull Requests 🔀

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/looptask.git
cd looptask

# Add upstream remote
git remote add upstream https://github.com/ayushkumardev/looptask.git

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable names

**Good Example**:
```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

function getUserProfile(userId: string): Promise<UserProfile> {
  // Implementation
}
```

**Bad Example**:
```typescript
function getUser(id: any): any {
  // Implementation
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Add JSDoc comments for complex components

**Good Example**:
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

/**
 * Reusable button component with variants
 */
export default function Button({ variant, onClick, children }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

### File Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable components
├── lib/             # Utility functions and API clients
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
└── styles/          # Global styles
```

### Naming Conventions

- **Files**: PascalCase for components (`Button.tsx`), camelCase for utilities (`formatDate.ts`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserProfile`)

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use consistent spacing (4px increments)
- Prefer Tailwind over custom CSS

**Good Example**:
```tsx
<div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
  <Icon className="w-6 h-6 text-blue-500" />
  <span className="text-gray-300">Content</span>
</div>
```

### Git Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples**:
```
feat: add GitHub integration
fix: resolve authentication error
docs: update setup guide
style: format code with prettier
refactor: simplify API client
test: add unit tests for Button component
chore: update dependencies
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Write tests for all new features
- Aim for 80%+ code coverage
- Test edge cases and error scenarios
- Use descriptive test names

**Example**:
```typescript
describe('Button Component', () => {
  it('should render with primary variant', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Documentation

### Code Comments

- Add JSDoc comments for public functions
- Explain complex logic
- Keep comments up-to-date

**Example**:
```typescript
/**
 * Generates an AI summary of developer activities
 * @param commits - Array of GitHub commits
 * @param prs - Array of pull requests
 * @param meetings - Array of calendar events
 * @returns Promise resolving to summary text
 */
export async function generateAISummary(
  commits: GitHubCommit[],
  prs: GitHubPR[],
  meetings: CalendarEvent[]
): Promise<string> {
  // Implementation
}
```

### README Updates

- Update README.md for new features
- Add examples and screenshots
- Keep installation instructions current

## Review Process

### What We Look For

1. **Code Quality**: Clean, readable, maintainable
2. **Testing**: Adequate test coverage
3. **Documentation**: Clear comments and docs
4. **Performance**: No unnecessary re-renders or API calls
5. **Security**: No vulnerabilities or exposed secrets
6. **Accessibility**: WCAG 2.1 compliance

### Review Timeline

- Initial review within 48 hours
- Feedback provided within 1 week
- Merged after approval and CI passes

## Community

### Getting Help

- **Discord**: [Join our server](https://discord.gg/looptask)
- **GitHub Discussions**: Ask questions
- **Email**: dev@looptask.com

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Invited to contributor Discord channel

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Don't hesitate to ask! We're here to help:
- Open a GitHub Discussion
- Join our Discord
- Email us at dev@looptask.com

---

**Thank you for contributing to LoopTask! 🚀**
