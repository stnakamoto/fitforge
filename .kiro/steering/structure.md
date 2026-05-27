# FitForge Project Structure

## Root Directory Organization

```
fitforge/
├── client/                 # React frontend application
├── middleware/             # Express middleware functions
├── models/                 # Mongoose data models
├── routes/                 # Express API route handlers
├── node_modules/           # Backend dependencies
├── .env                    # Environment variables
├── server.js               # Express server entry point
└── package.json            # Backend dependencies and scripts
```

## Backend Structure

### Models (`/models/`)
Mongoose schemas defining data structure:
- `User.js` - User profiles, authentication, subscription data
- `Workout.js` - Exercise routines and workout templates
- `Nutrition.js` - Meal plans and nutrition tracking
- `AICoach.js` - AI coaching data and recommendations

### Routes (`/routes/`)
Express route handlers organized by feature:
- `auth.js` - Login, register, token management
- `users.js` - Profile management, onboarding
- `workouts.js` - Workout CRUD operations
- `nutrition.js` - Nutrition tracking endpoints
- `aiCoach.js` - AI coaching features
- `subscriptions.js` - Stripe payment integration
- `admin.js` - Administrative functions

### Middleware (`/middleware/`)
- `auth.js` - JWT authentication, admin/premium authorization

## Frontend Structure (`/client/`)

### Source Organization (`/client/src/`)

```
src/
├── components/
│   ├── Layout/             # Navigation, layout components
│   └── UI/                 # Reusable UI components
├── contexts/               # React Context providers
├── pages/                  # Route-level page components
│   ├── Auth/               # Login, register, onboarding
│   ├── Dashboard/          # Main dashboard
│   ├── Workouts/           # Workout management
│   ├── Nutrition/          # Nutrition tracking
│   ├── Progress/           # Analytics and progress
│   ├── AICoach/            # AI coaching interface
│   ├── Subscription/       # Payment and billing
│   ├── Profile/            # User profile management
│   └── Admin/              # Administrative interface
├── App.js                  # Main app component with routing
└── App.css                 # Global styles
```

## Naming Conventions

### Files and Directories
- **Components**: PascalCase (e.g., `LoadingSpinner.js`)
- **Pages**: PascalCase with descriptive names (e.g., `AdminDashboard.js`)
- **Models**: PascalCase singular (e.g., `User.js`)
- **Routes**: camelCase plural (e.g., `workouts.js`)
- **CSS**: Match component name (e.g., `LoadingSpinner.css`)

### Code Conventions
- **React Components**: Functional components with hooks
- **API Endpoints**: RESTful with `/api` prefix
- **Database Fields**: camelCase with descriptive names
- **Environment Variables**: UPPER_SNAKE_CASE

## Authentication Flow
- JWT tokens stored in localStorage with key `fitforge_token`
- Axios interceptors handle token attachment and 401 responses
- Protected routes use `ProtectedRoute` wrapper component
- Admin routes use `AdminRoute` wrapper component
- Premium features gated with `premiumAuth` middleware

## State Management Patterns
- **Global Auth State**: AuthContext with useAuth hook
- **Server State**: React Query for API data caching
- **Form State**: React Hook Form for form management
- **UI State**: Local component state with useState

## File Upload Structure
- Static files served from `/uploads` directory
- Multer middleware handles file processing
- User avatars and workout images stored locally