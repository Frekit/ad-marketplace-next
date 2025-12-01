# API Client Library Guide

## Overview

The API Client Library provides a centralized, type-safe wrapper for all API calls throughout the application. It eliminates repetitive fetch code and provides consistent error handling, loading states, and response typing.

## Files

- `src/lib/api-client.ts` - Core API client class
- `src/hooks/useApi.ts` - React hook for managing API state

## Usage

### Basic Usage with Hook

```typescript
'use client';

import { useApi } from '@/hooks/useApi';

interface User {
  id: string;
  name: string;
  email: string;
}

export function UserProfile() {
  const { data: user, loading, error, get } = useApi<User>();

  const loadUser = async () => {
    await get('/api/user/profile');
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {user && <p>Hello, {user.name}!</p>}
      <button onClick={loadUser}>Load Profile</button>
    </div>
  );
}
```

### POST Request

```typescript
const { data, loading, error, post } = useApi<{ id: string }>();

const createProject = async (name: string, description: string) => {
  const result = await post('/api/projects', {
    name,
    description,
  });

  if (result) {
    console.log('Created project:', result.id);
  }
};
```

### Direct Client Usage

For non-React contexts or when you don't need state management:

```typescript
import { apiClient } from '@/lib/api-client';

// GET
const response = await apiClient.get<User>('/api/user/profile');
if (response.data) {
  console.log('User:', response.data);
}

// POST
const createResponse = await apiClient.post<{ id: string }>('/api/projects', {
  name: 'My Project',
});

// Error handling
if (createResponse.error) {
  console.error('Failed:', createResponse.error);
}
```

## Methods

### GET
```typescript
const response = await apiClient.get<T>(path: string)
const { data, error, loading } = useApi<T>();
await api.get('/api/endpoint');
```

### POST
```typescript
const response = await apiClient.post<T>(path: string, body: any)
await api.post('/api/endpoint', { data: 'value' });
```

### PUT
```typescript
const response = await apiClient.put<T>(path: string, body: any)
await api.put('/api/endpoint/123', { name: 'updated' });
```

### PATCH
```typescript
const response = await apiClient.patch<T>(path: string, body: any)
await api.patch('/api/endpoint/123', { status: 'active' });
```

### DELETE
```typescript
const response = await apiClient.delete<T>(path: string)
await api.delete('/api/endpoint/123');
```

## Response Format

All API calls return an `ApiResponse<T>` object:

```typescript
interface ApiResponse<T> {
  data?: T;        // The response data (if successful)
  error?: string;  // Error message (if failed)
  status: number;  // HTTP status code
}
```

## Error Handling

### With Hook
```typescript
const { data, error, loading } = useApi<User>();

if (error) {
  console.error('Failed to load user:', error);
  // Handle error...
}
```

### Direct Client
```typescript
const response = await apiClient.get<User>('/api/user');

if (response.error) {
  console.error('Error:', response.error);
} else if (response.data) {
  console.log('Success:', response.data);
}
```

## Type Safety

The client is fully typed with TypeScript generics:

```typescript
interface CreateProjectRequest {
  name: string;
  description: string;
}

interface CreateProjectResponse {
  id: string;
  name: string;
}

const response = await apiClient.post<CreateProjectResponse>(
  '/api/projects',
  {
    name: 'My Project',
    description: 'A great project',
  } as CreateProjectRequest
);

// response.data is typed as CreateProjectResponse
if (response.data) {
  console.log(response.data.id); // ✓ TypeScript knows 'id' exists
}
```

## Comparison: Before and After

### Before (Repetitive)
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [user, setUser] = useState<User | null>(null);

const loadUser = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await fetch('/api/user/profile');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    setUser(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    setLoading(false);
  }
};
```

### After (Clean)
```typescript
const { user, loading, error, get } = useApi<User>();

const loadUser = async () => {
  await get('/api/user/profile');
};
```

## Benefits

✅ **Reduced Code Duplication** - No more repetitive fetch/loading/error handling
✅ **Type Safety** - Full TypeScript support with generics
✅ **Consistent Error Handling** - All errors handled the same way
✅ **Automatic Loading States** - No need to manage loading state manually
✅ **Easy to Test** - Single API client to mock in tests
✅ **Centralized Logic** - Changes to API handling affect entire app

## Migration Guide

To migrate existing code to use the API client:

### 1. Replace fetch calls with useApi hook
```typescript
// Before
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData);
}, []);

// After
const { data } = useApi();
useEffect(() => {
  api.get('/api/data');
}, []);
```

### 2. Use loading and error states
```typescript
// Before
if (!data) return <Spinner />;
// Manual error handling

// After
const { data, loading, error } = useApi();
if (loading) return <Spinner />;
if (error) return <ErrorMessage msg={error} />;
```

### 3. Replace direct fetch in event handlers
```typescript
// Before
const handleSave = async () => {
  const response = await fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json();
};

// After
const handleSave = async () => {
  const result = await api.post('/api/save', data);
};
```

## Examples

### Form Submission
```typescript
export function CreateProjectForm() {
  const { post, loading, error } = useApi<{ id: string }>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await post('/api/projects', {
      name: formData.get('name'),
      description: formData.get('description'),
    });

    if (result) {
      console.log('Project created:', result.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      <textarea name="description" />
      <button disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

### Data Fetching with Refresh
```typescript
export function ProposalList() {
  const { data: proposals, loading, get, reset } = useApi<Proposal[]>();

  useEffect(() => {
    get('/api/freelancer/proposals');
  }, []);

  const handleRefresh = async () => {
    reset();
    await get('/api/freelancer/proposals');
  };

  return (
    <div>
      <button onClick={handleRefresh} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>
      {proposals?.map(p => (
        <ProposalCard key={p.id} proposal={p} />
      ))}
    </div>
  );
}
```

### Combined Operations
```typescript
export function UserSettings() {
  const { patch, delete: deleteApi, loading, error } = useApi();

  const handleUpdateProfile = async (updates: any) => {
    const result = await patch('/api/user/profile', updates);
    if (result) {
      toast.success('Profile updated!');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure?')) return;
    const result = await deleteApi('/api/user/account');
    if (result) {
      router.push('/');
    }
  };

  return (
    <div>
      {error && <ErrorBanner msg={error} />}
      <button onClick={handleUpdateProfile} disabled={loading}>Update</button>
      <button onClick={handleDeleteAccount} disabled={loading}>Delete Account</button>
    </div>
  );
}
```

## Best Practices

1. **Always type responses** - Use TypeScript generics for type safety
2. **Handle errors** - Check for error state or error in response
3. **Show loading states** - Use loading flag to disable buttons/show spinners
4. **Don't mix methods** - Use apiClient for consistency, avoid raw fetch
5. **Reset on unmount** - Call reset() in useEffect cleanup if needed
6. **Reuse hooks** - Create custom hooks combining useApi for domain-specific operations

```typescript
// Custom hook for user operations
export function useUserApi() {
  const api = useApi<User>();

  return {
    loadProfile: () => api.get('/api/user/profile'),
    updateProfile: (data: any) => api.patch('/api/user/profile', data),
    ...api,
  };
}

// Usage
const { loadProfile, updateProfile, loading } = useUserApi();
```
