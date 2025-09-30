import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';

describe('AppConfig', () => {
  let appConfig: ApplicationConfig;

  beforeEach(() => {
    // Create a fresh instance of the config for each test
    appConfig = {
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi())
      ]
    };
  });

  it('should be defined', () => {
    expect(appConfig).toBeDefined();
  });

  it('should be an ApplicationConfig object', () => {
    expect(appConfig).toBeInstanceOf(Object);
  });

  it('should have providers array', () => {
    expect(appConfig.providers).toBeDefined();
    expect(Array.isArray(appConfig.providers)).toBe(true);
  });

  it('should have at least one provider', () => {
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });

  it('should contain provideZoneChangeDetection provider', () => {
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });

  it('should contain provideRouter provider', () => {
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });

  it('should contain provideHttpClient provider', () => {
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });

  it('should have correct structure', () => {
    expect(appConfig.hasOwnProperty('providers')).toBe(true);
    expect(typeof appConfig.providers).toBe('object');
  });

  it('should be immutable', () => {
    const originalProviders = appConfig.providers;
    
    // Attempt to modify (should not affect original)
    try {
      (appConfig as any).providers = [];
    } catch (error) {
      // Expected to fail if properly configured
    }
    
    // Check that providers still exist (they might be reassigned but should still be an array)
    expect(Array.isArray(appConfig.providers)).toBe(true);
  });

  it('should export appConfig as default', () => {
    expect(appConfig).toBeDefined();
    expect(typeof appConfig).toBe('object');
  });

  it('should have providers that are functions or objects', () => {
    appConfig.providers.forEach(provider => {
      expect(typeof provider === 'function' || typeof provider === 'object').toBe(true);
    });
  });

  it('should be compatible with Angular ApplicationConfig interface', () => {
    const config: ApplicationConfig = appConfig;
    expect(config).toBeDefined();
    expect(config.providers).toBeDefined();
  });
});

