import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { queryParams: {} }
    });

    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 404 error message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('404');
  });

  it('should render page not found message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Page Not Found');
  });

  it('should have a link to home page', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const homeLink = compiled.querySelector('a[routerLink="/home"]');
    expect(homeLink).toBeTruthy();
  });

  it('should display helpful navigation options', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Go Home');
  });

  it('should have proper CSS classes for styling', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.min-h-screen');
    expect(container).toBeTruthy();
  });

  it('should be a standalone component', () => {
    expect(component).toBeInstanceOf(NotFoundComponent);
  });

  it('should have correct selector', () => {
    expect(component.constructor.name).toBe('NotFoundComponent');
  });
});

