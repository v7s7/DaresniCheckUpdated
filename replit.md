# Overview

Daresni is a modern tutoring platform that connects students with expert tutors for personalized learning experiences. The platform enables students to find and book tutors across multiple subjects, while providing tutors with tools to manage their availability, sessions, and earnings. The application supports multi-language functionality (English and Arabic with RTL support) and includes comprehensive user management for students, tutors, and administrators.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built with **React 18** and **Vite** for fast development and build processes. The application uses **TailwindCSS** for styling with a component-based design system powered by **Radix UI** primitives. Key architectural decisions include:

- **Component Library**: Comprehensive UI component system using shadcn/ui with Radix UI primitives for accessibility
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Form Handling**: React Hook Form for performant form validation and submission
- **Styling**: TailwindCSS with custom CSS variables for theming and dark mode support
- **Icons**: Lucide React for consistent iconography

## Backend Architecture

The backend leverages **Firebase** services for a serverless architecture:

- **Authentication**: Firebase Authentication for secure user management
- **Database**: Cloud Firestore as the primary NoSQL database with real-time capabilities
- **File Storage**: Firebase Storage for user avatars and document uploads
- **Hosting**: Firebase Hosting for static site deployment
- **Security**: Firebase Security Rules for database access control

The application also includes a **Node.js/Express** server setup with TypeScript, suggesting a hybrid architecture where Firebase handles primary backend services while Express provides additional API capabilities.

## Data Architecture

The data model is designed around three main user roles (students, tutors, administrators) with the following core entities:

- **Users**: Central user profiles with role-based permissions
- **Subjects**: Tutor expertise areas and teaching capabilities
- **Bookings**: Session scheduling and management
- **Reviews**: Rating and feedback system
- **Availability**: Tutor schedule management

Firestore indexes are configured for optimized queries on user roles, ratings, and booking relationships.

## Development Tools

- **Database ORM**: Drizzle ORM with PostgreSQL schema definitions (configured but not actively used)
- **Code Quality**: ESLint and Prettier for code formatting and linting
- **Build Tools**: Vite with TypeScript support and development server
- **Styling**: PostCSS for CSS processing

# External Dependencies

## Firebase Services

- **Firebase Authentication**: User authentication and authorization
- **Cloud Firestore**: Real-time NoSQL database for application data
- **Firebase Storage**: File storage for user-uploaded content
- **Firebase Hosting**: Static site hosting and deployment
- **Firebase Security Rules**: Database and storage access control

## UI and Styling

- **Radix UI**: Accessible component primitives (@radix-ui/react-*)
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Class Variance Authority**: Utility for component variant styling

## State Management and Data Fetching

- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form handling and validation
- **@hookform/resolvers**: Form validation resolvers

## Database and Backend

- **Drizzle ORM**: Type-safe database ORM (configured for PostgreSQL)
- **@neondatabase/serverless**: Database connection (configured but not active)
- **Express**: Server framework for additional API endpoints

## Development and Build

- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **ESLint**: Code linting and quality checks

## Internationalization

The application includes a custom i18n module supporting English and Arabic languages with RTL text direction support.

## Payment Processing

A stubbed payment module is included with placeholders for future integration with payment providers like Stripe or PayPal.