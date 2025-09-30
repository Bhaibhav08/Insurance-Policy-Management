import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct features array', () => {
    expect(component.features).toBeDefined();
    expect(component.features.length).toBe(4);
    
    expect(component.features[0].icon).toBe('🛡️');
    expect(component.features[0].title).toBe('Comprehensive Coverage');
    expect(component.features[0].description).toContain('Protect what matters most');
    
    expect(component.features[1].icon).toBe('⚡');
    expect(component.features[1].title).toBe('Quick Claims Processing');
    expect(component.features[1].description).toContain('Fast and efficient claims processing');
    
    expect(component.features[2].icon).toBe('💰');
    expect(component.features[2].title).toBe('Competitive Premiums');
    expect(component.features[2].description).toContain('Affordable insurance solutions');
    
    expect(component.features[3].icon).toBe('📱');
    expect(component.features[3].title).toBe('Digital Management');
    expect(component.features[3].description).toContain('Manage your policies');
  });

  it('should have correct policy categories array', () => {
    expect(component.policyCategories).toBeDefined();
    expect(component.policyCategories.length).toBe(4);
    
    expect(component.policyCategories[0].name).toBe('Life Insurance');
    expect(component.policyCategories[0].icon).toBe('👨‍👩‍👧‍👦');
    expect(component.policyCategories[0].color).toBe('bg-blue-500');
    expect(component.policyCategories[0].description).toContain('Secure your family');
    
    expect(component.policyCategories[1].name).toBe('Health Insurance');
    expect(component.policyCategories[1].icon).toBe('🏥');
    expect(component.policyCategories[1].color).toBe('bg-green-500');
    expect(component.policyCategories[1].description).toContain('Protect your health');
    
    expect(component.policyCategories[2].name).toBe('Auto Insurance');
    expect(component.policyCategories[2].icon).toBe('🚗');
    expect(component.policyCategories[2].color).toBe('bg-red-500');
    expect(component.policyCategories[2].description).toContain('Drive with confidence');
    
    expect(component.policyCategories[3].name).toBe('Home Insurance');
    expect(component.policyCategories[3].icon).toBe('🏠');
    expect(component.policyCategories[3].color).toBe('bg-purple-500');
    expect(component.policyCategories[3].description).toContain('Safeguard your home');
  });

  it('should render features in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const featureElements = compiled.querySelectorAll('.bg-gray-50 .grid .bg-white.p-8.rounded-lg');
    expect(featureElements.length).toBe(4);
  });

  it('should render policy categories in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const categoryElements = compiled.querySelectorAll('.grid .bg-white.border.border-gray-200.p-8.rounded-lg');
    expect(categoryElements.length).toBe(4);
  });

  it('should display feature icons correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const featureIcons = compiled.querySelectorAll('.bg-gray-50 .grid .bg-white.p-8.rounded-lg .w-12.h-12.bg-blue-100.rounded-lg span');
    
    expect(featureIcons[0].textContent).toContain('🛡️');
    expect(featureIcons[1].textContent).toContain('⚡');
    expect(featureIcons[2].textContent).toContain('💰');
    expect(featureIcons[3].textContent).toContain('📱');
  });

  it('should display policy category icons correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const categoryIcons = compiled.querySelectorAll('.grid .bg-white.border.border-gray-200.p-8.rounded-lg .w-16.h-16');
    
    expect(categoryIcons[0].textContent).toContain('👨‍👩‍👧‍👦');
    expect(categoryIcons[1].textContent).toContain('🏥');
    expect(categoryIcons[2].textContent).toContain('🚗');
    expect(categoryIcons[3].textContent).toContain('🏠');
  });

  it('should have proper CSS classes for policy categories', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const categoryElements = compiled.querySelectorAll('.grid .bg-white.border.border-gray-200.p-8.rounded-lg .w-16.h-16');
    
    expect(categoryElements[0].classList.contains('bg-blue-500')).toBeTruthy();
    expect(categoryElements[1].classList.contains('bg-green-500')).toBeTruthy();
    expect(categoryElements[2].classList.contains('bg-red-500')).toBeTruthy();
    expect(categoryElements[3].classList.contains('bg-purple-500')).toBeTruthy();
  });

  it('should display feature titles correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const featureTitles = compiled.querySelectorAll('.bg-gray-50 .grid .bg-white.p-8.rounded-lg h3');
    
    expect(featureTitles[0].textContent).toContain('Comprehensive Coverage');
    expect(featureTitles[1].textContent).toContain('Quick Claims Processing');
    expect(featureTitles[2].textContent).toContain('Competitive Premiums');
    expect(featureTitles[3].textContent).toContain('Digital Management');
  });

  it('should display policy category names correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const categoryNames = compiled.querySelectorAll('.grid .bg-white.border.border-gray-200.p-8.rounded-lg h3');
    
    expect(categoryNames[0].textContent).toContain('Life Insurance');
    expect(categoryNames[1].textContent).toContain('Health Insurance');
    expect(categoryNames[2].textContent).toContain('Auto Insurance');
    expect(categoryNames[3].textContent).toContain('Home Insurance');
  });
});

