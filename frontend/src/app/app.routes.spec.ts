import { Routes } from '@angular/router';
import { routes } from './app.routes';

describe('App Routes', () => {
  it('should be defined', () => {
    expect(routes).toBeDefined();
  });

  it('should be an array', () => {
    expect(Array.isArray(routes)).toBe(true);
  });

  it('should have at least one route', () => {
    expect(routes.length).toBeGreaterThan(0);
  });

  it('should have Routes type', () => {
    const routesArray: Routes = routes;
    expect(routesArray).toBeDefined();
  });

  it('should contain home route', () => {
    const homeRoute = routes.find(route => route.path === 'home' || route.path === '');
    expect(homeRoute).toBeDefined();
  });

  it('should contain login route', () => {
    const loginRoute = routes.find(route => route.path === 'login');
    expect(loginRoute).toBeDefined();
  });

  it('should contain register route', () => {
    const registerRoute = routes.find(route => route.path === 'register');
    expect(registerRoute).toBeDefined();
  });

  it('should contain dashboard route', () => {
    const dashboardRoute = routes.find(route => route.path === 'dashboard');
    expect(dashboardRoute).toBeDefined();
  });

  it('should contain policies route', () => {
    const policiesRoute = routes.find(route => route.path === 'policies');
    expect(policiesRoute).toBeDefined();
  });

  it('should contain claims route', () => {
    const claimsRoute = routes.find(route => route.path === 'claims');
    expect(claimsRoute).toBeDefined();
  });

  it('should contain profile route', () => {
    const profileRoute = routes.find(route => route.path === 'profile');
    expect(profileRoute).toBeDefined();
  });

  it('should contain admin routes', () => {
    const adminRoutes = routes.filter(route => 
      route.path?.startsWith('admin') || 
      route.path === 'admin-dashboard' ||
      route.path === 'users' ||
      route.path === 'audit'
    );
    expect(adminRoutes.length).toBeGreaterThan(0);
  });

  it('should contain agent routes', () => {
    const agentRoutes = routes.filter(route => 
      route.path?.startsWith('agent') || 
      route.path === 'agent-dashboard'
    );
    expect(agentRoutes.length).toBeGreaterThan(0);
  });

  it('should have wildcard route for 404', () => {
    const wildcardRoute = routes.find(route => route.path === '**');
    expect(wildcardRoute).toBeDefined();
  });

  it('should have redirect route', () => {
    const redirectRoute = routes.find(route => 
      route.path === '' && 'redirectTo' in route
    );
    expect(redirectRoute).toBeDefined();
  });

  it('should have valid route structure', () => {
    routes.forEach(route => {
      expect(route.hasOwnProperty('path')).toBe(true);
      expect(typeof route.path).toBe('string');
    });
  });

  it('should have loadComponent or component for each route', () => {
    routes.forEach(route => {
      if (route.path !== '**' && route.path !== '') {
        expect(
          'loadComponent' in route || 
          'component' in route || 
          'loadChildren' in route
        ).toBe(true);
      }
    });
  });

  it('should have proper path formats', () => {
    routes.forEach(route => {
      if (route.path) {
        expect(route.path).toMatch(/^[a-zA-Z0-9\-_\/\*\?\:]*$/);
      }
    });
  });

  it('should not have duplicate paths', () => {
    const paths = routes
      .map(route => route.path)
      .filter(path => path !== undefined);
    
    const uniquePaths = new Set(paths);
    expect(paths.length).toBe(uniquePaths.size);
  });

  it('should have proper route hierarchy', () => {
    const hasRootRoutes = routes.some(route => 
      route.path === '' || route.path === 'home' || route.path === 'dashboard'
    );
    expect(hasRootRoutes).toBe(true);
  });

  it('should be compatible with Angular Routes type', () => {
    const routesArray: Routes = routes;
    expect(routesArray).toBeDefined();
    expect(Array.isArray(routesArray)).toBe(true);
  });

  it('should have consistent route naming', () => {
    routes.forEach(route => {
      if (route.path && route.path !== '**' && route.path !== '') {
        expect(route.path).toMatch(/^[a-z0-9\-_\/\:]*$/);
      }
    });
  });
});

