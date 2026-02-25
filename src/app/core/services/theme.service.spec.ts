import { TestBed } from "@angular/core/testing";
import { ThemeService } from "./theme.service";

beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
       writable: true,
       value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
       })),
    });
});

describe('ThemeService', () => {
    let service: ThemeService;

    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('dark');
        service = TestBed.inject(ThemeService);
    })

    it('should default to light mode', () => {
        expect(service.darkMode()).toBe(false);
    })

    it('should toogle to dark mode', () => {
        service.toggle();
        expect(service.darkMode()).toBe(true);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should toggle to light mode', () => {
        service.toggle();
        service.toggle();
        expect(service.darkMode()).toBe(false);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should persist theme to localStorage', () => {
        service.toggle();
        expect(localStorage.getItem('theme')).toBe(JSON.stringify('dark'));
    });

    it('should load saved theme from localStorage', () => {
        TestBed.resetTestingModule();
        localStorage.setItem('theme', JSON.stringify('dark'));
        TestBed.configureTestingModule({});
        const newService = TestBed.inject(ThemeService);
        expect(newService.darkMode()).toBe(true);
    });
});









