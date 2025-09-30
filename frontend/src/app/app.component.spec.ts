import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, BehaviorSubject } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'logout', 'refreshAuthState'], {
      currentUser$: of(null)
    });
    
    // Create a more complete router spy with events observable
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: of({}),
      url: '/home',
      isActive: jasmine.createSpy('isActive').and.returnValue(false)
    });
    
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { queryParams: {} }
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule.withRoutes([
        { path: 'home', component: {} as any },
        { path: 'policies', component: {} as any },
        { path: 'login', component: {} as any },
        { path: 'register', component: {} as any },
        { path: 'dashboard', component: {} as any },
        { path: 'my-policies', component: {} as any },
        { path: 'claims', component: {} as any },
        { path: 'admin-dashboard', component: {} as any },
        { path: 'admin/users', component: {} as any },
        { path: 'admin/audit', component: {} as any },
        { path: 'agent-dashboard', component: {} as any },
        { path: '', redirectTo: '/home', pathMatch: 'full' }
      ])],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct title', () => {
    expect(component.title).toEqual('InsureGuard - Insurance Management System');
  });

  it('should initialize with null currentUser', () => {
    expect(component.currentUser).toBeNull();
  });

  it('should handle logout and navigation', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should call refreshAuthState', () => {
    component.refreshAuthState();
    expect(authService.refreshAuthState).toHaveBeenCalled();
  });

  it('should handle authentication state', () => {
    // Test unauthenticated state
    authService.isAuthenticated.and.returnValue(false);
    expect(authService.isAuthenticated()).toBe(false);

    // Test authenticated state
    authService.isAuthenticated.and.returnValue(true);
    component.currentUser = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    expect(authService.isAuthenticated()).toBe(true);
    expect(component.currentUser).toBeTruthy();
  });
});
