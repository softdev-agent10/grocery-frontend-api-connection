![A screenshot of the project](./public/desipayments_logo.png)
# Grocery Frontend Project
Welcome to the Grocery Frontend Project! This repository contains the code and documentation for the frontend of a grocery application built with Next.js, React, and TypeScript. Below is a summary of the project and key guidelines.

## Project Purpose

This is a frontend-only application built for a grocery platform. It displays user profiles, dashboards, sales data, and other core features. It interacts with a backend API for data fetching, and the entire frontend is built using a modular, scalable structure.

## Folder Structure

- `app/`: Core application layer with pages, layouts, and components (e.g., auth, dashboard, sales).
- `features/`: Domain-specific logic per feature, such as authentication state management.
- `hooks/`: Custom React hooks for reusable logic.
- `lib/`: Shared utilities (e.g., API calls, constants).
- `public/`: Static assets like images and fonts.
- `styles/`: Global styles and themes.
- `tests/`: Automated tests for components and logic.
- `docs/`: Project documentation (e.g., folder structure, technology stack, task templates).

## Technology Stack

- **Next.js**: Primary framework for server-side rendering, routing, and performance optimization.
- **React**: Core UI library for component-based architecture.
- **TypeScript**: Ensures type safety across the codebase, improving reliability and developer experience.
- **Redux**: Predictable state management for complex state interactions.
- **React Hooks**: For component state management and reusable logic.
- **Docker**: Containerization for consistent deployment across environments.
- **Tailwind CSS**: Utility-first styling for rapid UI development.
- **Jest & React Testing Library**: Testing framework ensuring component reliability.

## Engineering Rules

- Keep UI pages thin; business logic must reside in hooks or service layers.
- Centralize API calls in a dedicated service layer to keep components lean.
- Use consistent folder names and patterns, with each feature isolated for maintainability.
- Write unit and integration tests for every feature addition.

## How to Get Started

1. Clone the repository:  
   ```bash  
   git clone https://github.com/desipayments/grocery-frontend.git 

2. Install dependencies:  
   ```bash  
   npm install  

3. Run the development server:  
   ```bash  
   npm run dev    

4. Build for production:  
   ```bash  
   npm run build    

## Documentation

- Folder Structure: See `docs/folder_structure/v1/folder_structure.md` for a detailed breakdown of the project’s structure.
- Task Templates: For task assignments, see `docs/app/problems_template.md`.
- Technology Stack: See `docs/technology/v1/basic-tech.md` for details on tools and scaling plans.

## Contribution

We follow a modular monolith structure. Each feature should be developed in isolation under its own folder in `features/`. Ensure each module is tested, and please document any assumptions in the `solution.md` file.

## License

This project is licensed under the MIT License—see the LICENSE file for details.

## Contact

For any questions or issues, please contact the project maintainer:  
- Name: Mohammad Atif Hossain 
- Email: atif@desipayments.com
