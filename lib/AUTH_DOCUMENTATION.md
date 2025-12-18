# Authentication System Documentation

## Overview

This authentication system uses **Zustand** for state management and integrates with the FastAPI backend. It provides a complete authentication solution with token management, automatic refresh, and persistence.

## Backend API Endpoints

The system integrates with the following backend endpoints:

- **POST** `http://localhost:8000/auth/signup` - User registration
- **POST** `http://localhost:8000/auth/login` - User login
- **POST** `http://localhost:8000/auth/refresh` - Token refresh

## Architecture

### 1. **Zustand Store** (`lib/stores/authStore.ts`)

The core authentication state management using Zustand with persistence.

**Features:**
- Global state management
- Automatic persistence to localStorage
- Token management (access & refresh tokens)
- Automatic token refresh on 401 errors
- Type-safe state and actions

**State:**
```typescript
{
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
```

**Actions:**
- `login(credentials)` - Login user
- `signup(data)` - Register new user
- `logout()` - Logout and clear state
- `refreshAccessToken()` - Refresh access token
- `clearError()` - Clear error message
- `setUser(user)` - Update user data

### 2. **useAuth Hook** (`lib/hooks/useAuth.ts`)

A convenient React hook that wraps the Zustand store.

**Usage:**
```typescript
import { useAuth } from '@/lib/hooks/useAuth';

function LoginComponent() {
  const { login, isLoading, error, isAuthenticated } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
      // Success!
    } catch (err) {
      // Error is available in the error state
    }
  };
  
  return (
    <div>
      {error && <p>{error}</p>}
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </div>
  );
}
```

### 3. **Authenticated Fetch** (`lib/stores/authStore.ts`)

A helper function for making authenticated API calls with automatic token refresh.

**Usage:**
```typescript
import { useAuthenticatedFetch } from '@/lib/stores/authStore';

function DataComponent() {
  const authenticatedFetch = useAuthenticatedFetch();
  
  const fetchData = async () => {
    const response = await authenticatedFetch('http://localhost:8000/api/data');
    const data = await response.json();
    return data;
  };
}
```

## Quick Start

### 1. Login

```typescript
import { useAuth } from '@/lib/hooks/useAuth';

function LoginPage() {
  const { login, isLoading, error } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await login({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      });
      // Redirect to dashboard or home
    } catch (err) {
      // Error is already in state
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### 2. Signup

```typescript
import { useAuth } from '@/lib/hooks/useAuth';

function SignupPage() {
  const { signup, isLoading, error } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await signup({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string,
        name: formData.get('name') as string,
      });
      // Redirect to dashboard
    } catch (err) {
      // Error is already in state
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input name="name" type="text" />
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <input name="confirmPassword" type="password" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

### 3. Protected Routes

```typescript
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return null; // Will redirect
  }
  
  return <div>Protected Content</div>;
}
```

### 4. Display User Info

```typescript
import { useAuth } from '@/lib/hooks/useAuth';

function UserProfile() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h1>Welcome, {user?.name || user?.email}!</h1>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 5. Making Authenticated API Calls

```typescript
import { useAuthenticatedFetch } from '@/lib/stores/authStore';
import { useState } from 'react';

function DataComponent() {
  const authenticatedFetch = useAuthenticatedFetch();
  const [data, setData] = useState(null);
  
  const fetchData = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:8000/api/data');
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error:', err);
    }
  };
  
  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

## Features

### ✅ Automatic Token Refresh

The `useAuthenticatedFetch` hook automatically refreshes the access token when it receives a 401 Unauthorized response.

### ✅ Persistent Authentication

User authentication state is automatically saved to localStorage and restored on page reload.

### ✅ Type Safety

Full TypeScript support with proper type definitions for all state and actions.

### ✅ Error Handling

Comprehensive error handling with user-friendly error messages.

### ✅ Loading States

Built-in loading states for all async operations.

## API Response Format

### Login/Signup Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Refresh Token Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Optional
}
```

## Environment Variables

Create a `.env.local` file in your frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Security Considerations

1. **Tokens are stored in localStorage** - For production, consider using httpOnly cookies for better security
2. **HTTPS** - Always use HTTPS in production
3. **Token Expiration** - Implement proper token expiration and refresh logic
4. **CORS** - Ensure backend has proper CORS configuration

## Troubleshooting

### Login fails with CORS error
- Ensure backend has CORS middleware configured
- Check that `NEXT_PUBLIC_API_URL` is correct

### Token refresh not working
- Verify the `/auth/refresh` endpoint is implemented in backend
- Check that refresh token is being sent correctly

### State not persisting
- Check browser localStorage is enabled
- Verify the `auth-storage` key exists in localStorage

## Advanced Usage

### Direct Store Access

For advanced use cases, you can access the store directly:

```typescript
import { useAuthStore } from '@/lib/stores/authStore';

function AdvancedComponent() {
  // Select specific state
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  
  // Access actions
  const { refreshAccessToken } = useAuthStore();
  
  return <div>...</div>;
}
```

### Custom API Calls

```typescript
import { useAuthStore } from '@/lib/stores/authStore';

async function customAPICall() {
  const { accessToken } = useAuthStore.getState();
  
  const response = await fetch('http://localhost:8000/api/endpoint', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
}
```

## Files Structure

```
Frontend/
├── lib/
│   ├── stores/
│   │   └── authStore.ts          # Zustand auth store
│   ├── hooks/
│   │   └── useAuth.ts            # Auth hook wrapper
│   ├── config/
│   │   └── api.ts                # API configuration
│   └── examples/
│       └── authExamples.tsx      # Usage examples
```

## Next Steps

1. Implement the backend auth endpoints (`/auth/signup`, `/auth/login`, `/auth/refresh`)
2. Update your login/signup pages to use the `useAuth` hook
3. Protect routes that require authentication
4. Add user profile management
5. Implement password reset functionality

## Support

For more examples, see `lib/examples/authExamples.tsx`.
