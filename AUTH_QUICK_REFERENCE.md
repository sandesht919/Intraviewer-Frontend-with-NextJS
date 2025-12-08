# Quick Reference: Authentication System

## 🚀 Quick Start

### 1. Import the Hook
```typescript
import { useAuth } from '@/lib/hooks/useAuth';
```

### 2. Use in Component
```typescript
const { user, login, signup, logout, isAuthenticated, isLoading, error } = useAuth();
```

## 📋 Common Patterns

### Login
```typescript
const { login, isLoading, error } = useAuth();

const handleLogin = async () => {
  try {
    await login({ email: 'user@example.com', password: 'password' });
    // Success - redirect or update UI
  } catch (err) {
    // Error is in the error state
  }
};
```

### Signup
```typescript
const { signup, isLoading, error } = useAuth();

const handleSignup = async () => {
  try {
    await signup({
      email: 'user@example.com',
      password: 'password',
      confirmPassword: 'password',
      name: 'John Doe'
    });
    // Success
  } catch (err) {
    // Error is in the error state
  }
};
```

### Check Auth Status
```typescript
const { isAuthenticated, user } = useAuth();

if (isAuthenticated) {
  console.log('User:', user);
}
```

### Logout
```typescript
const { logout } = useAuth();

logout(); // Clears all auth data
```

### Protected Route
```typescript
const { isAuthenticated, isLoading } = useAuth();

if (isLoading) return <div>Loading...</div>;
if (!isAuthenticated) return <div>Please login</div>;

return <div>Protected Content</div>;
```

### Authenticated API Call
```typescript
import { useAuthenticatedFetch } from '@/lib/stores/authStore';

const authenticatedFetch = useAuthenticatedFetch();

const response = await authenticatedFetch('http://localhost:8000/api/data');
const data = await response.json();
```

## 🔑 State Properties

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Current user object |
| `isAuthenticated` | `boolean` | Whether user is logged in |
| `isLoading` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |
| `accessToken` | `string \| null` | JWT access token (from store) |
| `refreshToken` | `string \| null` | JWT refresh token (from store) |

## 🎯 Actions

| Action | Parameters | Description |
|--------|------------|-------------|
| `login()` | `{ email, password }` | Login user |
| `signup()` | `{ email, password, name?, confirmPassword? }` | Register user |
| `logout()` | None | Logout user |
| `refreshToken()` | None | Refresh access token |
| `clearError()` | None | Clear error message |

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User login |
| `/auth/signup` | POST | User registration |
| `/auth/refresh` | POST | Refresh token |

## 📦 User Object

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}
```

## ⚙️ Configuration

Set in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🔍 Direct Store Access

For advanced use cases:
```typescript
import { useAuthStore } from '@/lib/stores/authStore';

const accessToken = useAuthStore((state) => state.accessToken);
const user = useAuthStore((state) => state.user);
```

## 📚 Full Documentation

See `lib/AUTH_DOCUMENTATION.md` for complete documentation.
