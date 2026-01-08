# Structure API - Authentication

## Architecture

```
src/app/
├── core/
│   ├── models/
│   │   └── auth.model.ts          # Interfaces & Types
│   ├── services/
│   │   └── auth.service.ts        # Service d'authentification
│   ├── interceptors/
│   │   └── auth.interceptor.ts    # Interceptor HTTP
│   └── guards/
│       └── auth.guard.ts          # Guard pour protéger routes
└── features/
    └── login/
        ├── login.component.ts
        ├── login.component.html
        └── login.component.css
```

## API Endpoints

### Base URL
```
http://localhost:8080/api/auth/jwt
```

### Endpoints disponibles

#### 1. Login
- **URL**: `POST /login`
- **Body**: 
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
}
```

#### 2. Refresh Token
- **URL**: `POST /refresh`
- **Body**:
```json
{
  "refreshToken": "eyJhbGc..."
}
```

#### 3. Logout
- **URL**: `POST /logout`
- **Headers**: `Authorization: Bearer {token}`

#### 4. Get Current User
- **URL**: `GET /me`
- **Headers**: `Authorization: Bearer {token}`

## Utilisation

### Dans un Component

```typescript
import { AuthService } from './core/services/auth.service';

constructor(private authService: AuthService) {}

// Login
login() {
  this.authService.login({ email: 'user@example.com', password: 'pass' })
    .subscribe({
      next: (response) => console.log('Connecté!'),
      error: (error) => console.error('Erreur:', error)
    });
}

// Logout
logout() {
  this.authService.logout().subscribe();
}

// Check si user est connecté
isLoggedIn() {
  return this.authService.isAuthenticated();
}

// Get current user
getCurrentUser() {
  return this.authService.currentUser();
}
```

### Protéger une Route

```typescript
// app-routing.module.ts
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]  // Route protégée
  }
];
```

## Fonctionnalités

✅ Login / Logout
✅ Refresh token automatique (quand token expire)
✅ Interceptor HTTP (ajoute token automatiquement)
✅ Guard pour protéger routes
✅ Signals pour reactive state management
✅ Error handling
✅ Loading states

## Prochaines étapes

Pour ajouter d'autres APIs (CRUD Client, etc.), créer:
1. Nouveau model dans `core/models/`
2. Nouveau service dans `core/services/`
3. Utiliser le même pattern avec signals
