import { TestBed } from "@angular/core/testing";
import { I18nService } from "./i18n.service";

describe('I18nService', () => {
    let service: I18nService;

    beforeEach(() => {
        localStorage.clear();
        service = TestBed.inject(I18nService);
    });

    it('should have a default language', () => {
        expect(['en', 'pt']).toContain(service.currentLang());
    });

    it('should switch language', () => {
        service.switchLanguage('pt');
        expect(service.currentLang()).toBe('pt');

        service.switchLanguage('en');
        expect(service.currentLang()).toBe('en');
    });

    it('should persits language in localStorage', () => {
        service.switchLanguage('pt');
        expect(localStorage.getItem('lang')).toBe(JSON.stringify('pt'));
    });

    it('should translate a simple key', () => {
        service.switchLanguage('pt');
        expect(service.translate('todo.add')).toBe('Adicionar Tarefa');
    });

    it('should translate eith params', () => {
        service.switchLanguage('en');
        expect(service.translate('todo.item_left', { count: 1 })).toBe('1 item left');
    });

    it('should return the key if translation not found', () => {
        expect(service.translate('non.existing.key')).toBe('non.existing.key');
    });

    it('should update document lang attribute on switch', () => {
        service.switchLanguage('pt');
        expect(document.documentElement.lang).toBe('pt');
    });
});








