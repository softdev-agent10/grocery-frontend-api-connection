# Grocery Frontend Folder Structure (Next.js)

This document explains the production-grade folder structure for the frontend of this project, the purpose of each folder, and the engineering rules to follow.

## 1) Project Root

The root directory contains core configuration files and entry points.

- `.gitignore`: Specifies files/folders to be ignored by Git.
- `package.json`: Lists project dependencies and scripts.
- `next.config.ts`: Configures Next.js behavior.
- `tsconfig.json`: TypeScript configuration.
- `README.md`: Project overview for developers.

### Rules:
- Keep configuration files at the root for easy access.
- Never commit sensitive data (e.g., environment variables).

## 2) app/ - Core Application Layer

This folder contains all runtime pages, layouts, and components.

- `auth/`: Authentication pages (e.g., login, register).
- `api/`: API routes for frontend interactions (e.g., auth APIs).
- `dashboard/`: Dashboard layout and pages.
- `sales/`: Sales-related pages and layouts.
- `error.tsx`: Global error boundary component.
- `globals.css`: Global styling.
- `layout.tsx`: Main layout for consistent structure.
- `loading.tsx`: Loading fallback UI.
- `page.tsx`: Root page (homepage).

### Use For:
- Organizing all UI components and pages.
- Ensure each feature (auth, dashboard, sales) has its own dedicated folder.

### Rules:
- Keep pages thin; business logic should be in separate services or hooks.
- Use Next.js routing conventions for page organization.
- Ensure layouts are consistent across pages.

## 3) Docker - Containerization

This folder contains Docker configuration files for building and deploying the frontend in a containerized environment.

- `Dockerfile`: Defines how to build the Docker image for the frontend (e.g., install dependencies, build the Next.js app).
- `docker-compose.yml`: Defines services, such as the frontend container, and potentially a reverse proxy or other services (e.g., backend, database).
- `.dockerignore`: Specifies which files and directories should be excluded from the Docker build context.


### Use For:
- Building a Docker image of the frontend for deployment.
- Running the app locally or in a production environment using container orchestration.
- Reducing Docker image size by avoiding unnecessary files (e.g., local node modules, test files).


### Rules:
- Keep the Dockerfile and docker-compose.yml up-to-date with any changes in the project (e.g., new environment variables or dependencies).
- Ensure the Docker image is lightweight by only installing necessary production dependencies.
- List common exclusions like `node_modules/`, `*.log`, and `build/`.
- Ensure only essential files (like Docker-related configs and app source code) are included.



## 4) docs/ - Documentation

Documentation for the project structure and guidelines.

- `README.md`: Overview of the project, setup, and folder guidelines.

### Use For:
- Providing onboarding documentation for developers.
- Explaining folder structure and rules.

### Rules:
- Keep the README updated with any major structural changes.
- Provide quick-start guides and environment setup.

## 5) features/ - Domain-specific Logic

Encapsulates feature-specific state management, types, and utilities.

- `auth/`: State management and types for authentication.
  - `store.ts`: Redux/Zustand store for auth state.
  - `types.ts`: Type definitions (e.g., user, token).
  - `utils.ts`: Auth-related utilities (e.g., login helper).

### Use For:
- Keeping all feature-specific logic modular and reusable.
- Managing state, types, and utility functions per feature.

### Rules:
- Keep each feature isolated for maintainability.
- Use strongly-typed interfaces for consistency.

## 6) hooks/ - Custom React Hooks

Reusable hooks for shared logic.

- `useAuth.ts`: Custom hook for authentication logic.
- `useDebounce.ts`: Debouncing hook for input fields.
- `useTheme.ts`: Custom hook for theme toggling.

### Use For:
- Encapsulating shared logic that can be reused across components.

### Rules:
- Hooks should only contain logic and state management, not UI rendering.
- Keep hooks independent of specific UI components.

## 7) lib/ - Shared Utilities

Low-level utilities that support the app.

- `auth.ts`: Auth-related helpers (e.g., token handling).
- `axios.ts`: Axios instance for API calls.
- `constants.ts`: Shared constants (e.g., API URLs).
- `db.ts`: Database or external service connection (e.g., setup database clients or APIs, if required)


## 8) public/ - Static Assets

This folder holds all static resources such as images, fonts, and other public files.

### Use For:
- Storing assets that need to be directly accessible by the client (e.g., images, logos, fonts).

### Rules:
- Keep static assets organized by type (e.g., separate folders for images, fonts).
- Do not place sensitive files here.

## 9) styles/ - Styling

This folder holds global styles and theme definitions.

- `globals.css`: Global CSS styles applied throughout the app.
- `theme.ts`: Theme-related styles (e.g., colors, spacing).

### Use For:
- Defining global styles that apply across the entire application.
- Centralizing theme variables for consistent design.

### Rules:
- Use modular CSS or CSS-in-JS libraries if needed (like styled-components).
- Ensure styles are scoped properly to avoid global conflicts.

## 10) tests/ - Tests

This folder contains automated tests for the frontend.

- `unit/`: Unit tests for individual components and functions.
- `integration/`: Integration tests that test interactions between components or with APIs.
- `setupTests.ts`: Test setup file (e.g., configuring testing library).

### Use For:
- Ensuring components and business logic work as expected.

### Rules:
- Write unit tests for isolated logic.
- Write integration tests for page-level and API interactions.

## 11) types/ - Type Definitions

This folder stores TypeScript type definitions.

- `index.ts`: Centralized type definitions for the app.

### Use For:
- Defining interfaces and types used throughout the app.

### Rules:
- Ensure strong typing for props, state, and API responses.
- Keep all type definitions centralized for reusability.

## 12) Engineering Rules (Must Follow)

- Keep pages thin; all business logic should reside in hooks, services, or utils.
- Centralize API calls in a dedicated service layer.
- Use consistent folder names and patterns (e.g., lowercase, clear names).
- Add unit and integration tests for every new feature.
- Ensure global styles and theme variables remain consistent.

## 13) Naming and Cleanup Notes

- Ensure all file names are consistent (e.g., "page.tsx" not "psge.tsx").
- Standardize naming patterns for folders (e.g., lowercase, no special characters).

## 14) Module Delivery Order

Follow a feature-by-feature implementation approach.

- Build auth first.
- Build dashboard next.
- Build sales and other modules afterward.

## 15) API Interaction Pattern

Follow a clear pattern for API calls.

- Use a service layer for API logic.
- Keep components clean, only rendering UI and delegating business logic.
