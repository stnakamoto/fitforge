# FitForge Technology Stack

## Architecture
Full-stack MERN application with separate client and server codebases.

## Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcryptjs for password hashing
- **Payment Processing**: Stripe integration
- **File Uploads**: Multer middleware
- **Scheduling**: node-cron for automated tasks
- **Environment**: dotenv for configuration

## Frontend Stack
- **Framework**: React 18 with functional components and hooks
- **Routing**: React Router DOM v6
- **State Management**: React Query for server state, Context API for auth
- **Forms**: React Hook Form for form handling
- **UI Components**: Custom components with Lucide React icons
- **Charts**: Recharts for data visualization
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios with interceptors
- **Payment UI**: Stripe React components
- **Date Handling**: date-fns library

## Development Tools
- **Backend Dev Server**: nodemon for auto-restart
- **Frontend Build**: Create React App (react-scripts)
- **Testing**: Jest and React Testing Library (configured but not actively used)

## Common Commands

### Development
```bash
# Start backend development server
npm run dev

# Start frontend development server
cd client && npm start

# Install dependencies
npm install
cd client && npm install
```

### Production
```bash
# Build client for production
npm run build

# Start production server
npm start
```

## Environment Variables
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: JWT signing secret
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`: Stripe public key
- `REACT_APP_API_URL`: API base URL for frontend

## API Structure
RESTful API with `/api` prefix and resource-based routing:
- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/workouts` - Workout operations
- `/api/nutrition` - Nutrition tracking
- `/api/ai-coach` - AI coaching features
- `/api/subscriptions` - Payment and subscription management
- `/api/admin` - Administrative functions