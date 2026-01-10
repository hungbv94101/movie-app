# Movie App - React Frontend

A modern movie discovery application built with React, TypeScript, and Vite. Features both REST API and GraphQL integration for optimal performance and developer experience.

## 🎬 Features

### User Interface
- ✅ Modern, responsive design with Mantine UI
- ✅ Dark/light theme support
- ✅ Mobile-optimized interface
- ✅ Loading states and error handling

### Movie Discovery
- ✅ Advanced movie search functionality
- ✅ Real-time search with debouncing
- ✅ Movie grid with pagination
- ✅ Detailed movie information cards
- ✅ Favorite management system

### API Integration
- ✅ REST API support for traditional endpoints
- ✅ GraphQL integration with Apollo Client
- ✅ Type-safe API calls with TypeScript
- ✅ Optimized caching and state management

### State Management
- ✅ Zustand for lightweight state management
- ✅ Apollo Client for GraphQL state
- ✅ Persistent authentication state
- ✅ Optimistic UI updates

## 🛠 Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6.0
- **UI Library**: Mantine UI 7.0
- **GraphQL Client**: Apollo Client 3.11
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Tabler Icons
- **Development**: ESLint, TypeScript strict mode

## 🚀 Quick Setup

> **Note:** Backend API runs in Docker. You do **not** need to run PHP or MySQL locally. See `../movie-api/README.md` for backend setup.

### 1. Clone the repository
```bash
git clone <repo-url>
cd movie-project/movie-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
- App: http://localhost:5173
- Make sure backend is running at http://localhost:8000

### 4. API Endpoint Configuration
- Default API endpoint: `http://localhost:8000`
- To change, edit `src/services/authApi.ts` and `src/services/apolloClient.ts`

## 🔑 Password Reset Flow
- User requests password reset → receives **temporary password** via email
- Login with temporary password → **redirected to change password page**
- After password change, user can access all features

## 📝 Useful Commands
- Lint code: `npm run lint`
- Typecheck: `npm run typecheck`
- Build for production: `npm run build`

## ⚠️ Troubleshooting
- Ensure backend is running in Docker at port 8000
- If API calls fail, check CORS config in backend
- For environment variables, see `.env` and Vite config

## 🧑‍💻 Development Notes
- Hot reload enabled
- All API calls use Docker backend
- For backend setup, see `../movie-api/README.md`

---
