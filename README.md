# NENS - English Learning App

> **No English No Success** - A modern English learning platform

## Tech Stack

- **Framework:** Next.js 15.5.7 (with Turbopack)
- **Language:** JavaScript / JSX
- **UI Library:** React 19.1.0
- **Styling:** MUI + Emotion, TailwindCSS 4 + PostCSS
- **Authentication:** NextAuth.js v4
- **Code Quality:**
  - ESLint 9 (Flat Config)
  - Prettier 3
  - Husky + lint-staged
  - Commitlint (Conventional Commits)

## Prerequisites

- Node.js 20 or higher
- npm 10 or higher

## Folder Structure

```bash
engweb-fe/
├── app/ # App Router pages and layouts
├── api/ # API helpers and request wrappers
├── components/ # Reusable UI components by feature
├── context/ # React context providers
├── hooks/ # Custom React hooks
├── lib/ # Registry setup
├── assets/ # Static assets such as images and icons
├── styles/ # Shared style objects and theme-specific styles
├── theme/ # Theme provider and palette setup
├── utils/ # Utility functions and transformers
├── .env # Environment configuration
├── .prettierrc # Prettier configuration
├── commitlint.config.js # Commit message rules
├── eslint.config.mjs # ESLint flat config
├── middleware.js # Next.js middleware
├── next.config.js # Next.js config
├── package.json # Project scripts and dependencies
├── postcss.config.mjs # PostCSS / Tailwind config
└── README.md # Project documentation
```

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd engweb-fe
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` file with your configuration.

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command               | Description                             |
| --------------------- | --------------------------------------- |
| `npm run dev`         | Start development server with Turbopack |
| `npm run build`       | Build production bundle                 |
| `npm run start`       | Start production server                 |
| `npm run lint`        | Run ESLint checker                      |
| `npm run lint:fix`    | Auto-fix ESLint issues                  |
| `npm run format`      | Format code with Prettier               |
| `npm run lint-staged` | Run lint-staged (used by Husky hooks)   |

## Code Quality

### ESLint

Configuration file: `eslint.config.mjs` (ESLint Flat Config)

**Plugins:**

- `eslint-plugin-react` - React best practices
- `eslint-plugin-unicorn` - Additional code quality rules
- `eslint-plugin-prettier` - Prettier integration

**Key Rules:**

- React hooks validation
- Unused variables detection (with `_` prefix exception)
- Console statements warning in JSX files

### Prettier

Configuration file: `.prettierrc`

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100,
  "endOfLine": "lf"
}
```

### Git Hooks (Husky)

#### Pre-commit Hook

Located at: `.husky/pre-commit`

Automatically runs before each commit:

1. Executes `lint-staged` on staged files
2. Runs ESLint with auto-fix
3. Formats code with Prettier
4. **Blocks commit if there are unfixable errors**

#### Commit Message Hook

Located at: `.husky/commit-msg`

Validates commit messages using Commitlint.

### Commitlint

Configuration file: `commitlint.config.js`

Enforces [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Commit Message Format:**

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Examples:**

```bash
 feat: add user authentication
 fix(api): resolve timeout issue
 docs: update README
 style: format code with prettier
 refactor(auth): improve token validation
 test: add unit tests for login
 chore: update dependencies
```

**Allowed Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements
- `ci` - CI/CD changes
- `build` - Build system changes
- `revert` - Revert previous commit

### lint-staged

Configuration in `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,json,css,md}": ["eslint --fix", "prettier --write"]
  }
}
```

Automatically processes staged files before commit.

## Troubleshooting

### Husky hooks not working

Re-initialize Husky:

```bash
npm run prepare
```

### ESLint and Prettier conflicts

This project uses `eslint-config-prettier` to disable conflicting ESLint rules. Prettier formatting is enforced through `eslint-plugin-prettier`.

### Port 3000 already in use

**Option 1:** Kill the process using port 3000

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Option 2:** Use a different port

```powershell
$env:PORT=3001; npm run dev
```

### Editor errors

Make sure your editor is using the workspace settings:

- In VS Code: `Ctrl+Shift+P` "Preferences: Open Workspace Settings"
