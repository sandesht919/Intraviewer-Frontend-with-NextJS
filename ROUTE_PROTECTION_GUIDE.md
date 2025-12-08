# Route Protection Implementation Guide

## Overview

This document explains how route protection is implemented in the IntraViewer application to ensure that only authenticated users can access protected pages.

## Architecture

The route protection system uses a **two-layer approach**:

1. **Server-Side Protection (Next.js Middleware)** - Primary defense
2. **Client-Side Protection (RouteGuard Component)** - Additional UI layer

---

## 1. Server-Side Protection (Middleware)

### File: `middleware.ts`

The middleware runs on the server **before** any page loads, making it the most secure layer of protection.

### How It Works

1. **Checks authentication state** from cookies (synced by Zustand store)
2. **Redirects unauthenticated users** trying to access protected routes to `/auth/login`
3. **Redirects authenticated users** trying to access auth pages (login/signup) to home
4. **Allows public routes** without authentication

### Public Routes (No Authentication Required)

```typescript
const PUBLIC_ROUTES = [
  '/',           // Home page
  '/about',      // About page
  '/auth/login', // Login page
  '/auth/signup' // Signup page
];
```

### Protected Routes

**Any route NOT in the PUBLIC_ROUTES list requires authentication**, including:
- `/dashboard`
- `/interview/*`
- `/profile`
- Any other custom pages you create

### Configuration

The middleware is configured to run on all routes except:
- API routes (`/api/*`)
- Static files (`/_next/static/*`)
- Images (`/_next/image/*`)
- Public assets (`.svg`, `.png`, `.jpg`, etc.)

---

## 2. Client-Side Protection (RouteGuard)

### File: `components/guards/RouteGuard.tsx`

This component provides an additional layer of protection on the client side with better UX.

### Features

- ✅ Shows loading state while checking authentication
- ✅ Redirects with smooth transitions
- ✅ Stores attempted URL for redirect after login
- ✅ Can be used as a wrapper or HOC

### Usage Examples

#### Protect a Page (Requires Authentication)

```tsx
import { RouteGuard } from '@/components/guards/RouteGuard';

export default function DashboardPage() {
  return (
    <RouteGuard requireAuth={true}>
      <div>
        {/* Your protected content */}
      </div>
    </RouteGuard>
  );
}
```

#### Protect Auth Pages (Redirect if Already Logged In)

```tsx
import { RouteGuard } from '@/components/guards/RouteGuard';

export default function LoginPage() {
  return (
    <RouteGuard requireAuth={false} redirectTo="/">
      <div>
        {/* Your login form */}
      </div>
    </RouteGuard>
  );
}
```

#### Using as Higher-Order Component

```tsx
import { withRouteGuard } from '@/components/guards/RouteGuard';

function ProfilePage() {
  return <div>Profile Content</div>;
}

export default withRouteGuard(ProfilePage, { requireAuth: true });
```

---

## 3. Authentication State Sync

### File: `lib/utils/cookies.ts`

This utility syncs authentication state between:
- **localStorage** (used by Zustand for client-side state)
- **Cookies** (read by middleware for server-side checks)

### How It Works

1. When user **logs in** → `setAuthCookie()` is called
2. When user **logs out** → `clearAuthCookie()` is called
3. Middleware reads the cookie to check authentication

### Updated Auth Store

The `authStore.ts` has been updated to automatically sync with cookies:

```typescript
// After successful login
setAuthCookie(true, data.access_token);

// After successful signup
setAuthCookie(true, responseData.access_token);

// On logout
clearAuthCookie();
```

---

## 4. How to Add New Protected Routes

### Option A: Automatic Protection (Recommended)

Simply create a new page **outside** the public routes. It will be automatically protected by middleware.

```tsx
// app/settings/page.tsx
export default function SettingsPage() {
  return <div>Settings</div>;
}
```

This page is automatically protected! ✅

### Option B: Explicit Protection with RouteGuard

For better UX with loading states:

```tsx
// app/settings/page.tsx
import { RouteGuard } from '@/components/guards/RouteGuard';

export default function SettingsPage() {
  return (
    <RouteGuard requireAuth={true}>
      <div>Settings</div>
    </RouteGuard>
  );
}
```

---

## 5. How to Add New Public Routes

Edit `middleware.ts` and add your route to the `PUBLIC_ROUTES` array:

```typescript
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/auth/login',
  '/auth/signup',
  '/contact',      // ← Add new public route
  '/pricing',      // ← Add another public route
];
```

---

## 6. Testing the Protection

### Test Scenarios

1. **Unauthenticated User Tries to Access Protected Page**
   - Expected: Redirected to `/auth/login?redirect=/protected-page`
   - After login: Redirected back to `/protected-page`

2. **Authenticated User Tries to Access Login Page**
   - Expected: Redirected to `/` (home page)

3. **Authenticated User Accesses Protected Page**
   - Expected: Page loads normally

4. **Anyone Accesses Public Page**
   - Expected: Page loads normally (no auth check)

### Manual Testing Steps

1. **Test Protected Route Access (Not Logged In)**
   ```
   1. Clear browser cookies/localStorage
   2. Navigate to http://localhost:3000/dashboard
   3. Should redirect to /auth/login
   ```

2. **Test Login Redirect**
   ```
   1. Try to access /dashboard (redirected to login)
   2. Login successfully
   3. Should redirect back to /dashboard
   ```

3. **Test Auth Page Access (Logged In)**
   ```
   1. Login to the application
   2. Try to navigate to /auth/login
   3. Should redirect to / (home)
   ```

---

## 7. Security Considerations

### ✅ What's Protected

- All routes except those in `PUBLIC_ROUTES`
- Authentication tokens stored in httpOnly cookies (when possible)
- Server-side validation before page render

### ⚠️ Important Notes

1. **Never trust client-side checks alone** - Always validate on the server
2. **Middleware runs first** - It's your primary security layer
3. **RouteGuard is for UX** - It improves user experience but isn't a security feature
4. **API routes need separate protection** - Protect your API endpoints independently

### API Route Protection Example

```typescript
// app/api/protected-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('auth-storage');
  
  if (!authCookie) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Validate token and proceed...
}
```

---

## 8. Troubleshooting

### Issue: Infinite Redirect Loop

**Cause**: Middleware and RouteGuard have conflicting logic

**Solution**: Ensure middleware `PUBLIC_ROUTES` matches RouteGuard usage

### Issue: User Not Redirected After Login

**Cause**: Cookie not being set properly

**Solution**: Check browser console for errors, ensure `setAuthCookie()` is called

### Issue: Middleware Not Running

**Cause**: File location or export configuration

**Solution**: Ensure `middleware.ts` is at the root of the `Frontend` directory

---

## 9. File Structure

```
Frontend/
├── middleware.ts                          # Server-side route protection
├── lib/
│   ├── stores/
│   │   └── authStore.ts                  # Auth state + cookie sync
│   └── utils/
│       └── cookies.ts                    # Cookie utilities
├── components/
│   └── guards/
│       └── RouteGuard.tsx                # Client-side route guard
└── app/
    ├── auth/
    │   ├── login/page.tsx                # Login (protected from auth users)
    │   └── signup/page.tsx               # Signup (protected from auth users)
    ├── dashboard/page.tsx                # Protected page example
    └── page.tsx                          # Public home page
```

---

## 10. Summary

### Quick Reference

| Route Type | Middleware | RouteGuard | Accessible By |
|------------|-----------|------------|---------------|
| Public (`/`, `/about`) | ✅ Allows all | Not needed | Everyone |
| Auth Pages (`/auth/login`) | ✅ Redirects if authenticated | ✅ `requireAuth={false}` | Unauthenticated only |
| Protected (`/dashboard`) | ✅ Redirects if not authenticated | ✅ `requireAuth={true}` | Authenticated only |

### Best Practices

1. ✅ Use middleware for primary protection
2. ✅ Use RouteGuard for better UX
3. ✅ Always sync auth state with cookies
4. ✅ Test both authenticated and unauthenticated flows
5. ✅ Protect API routes separately

---

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify cookies are being set (DevTools → Application → Cookies)
3. Check middleware is running (add console.log in middleware.ts)
4. Ensure auth state is persisting in localStorage

---

**Last Updated**: December 2025
