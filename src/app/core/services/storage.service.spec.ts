import { StorageService } from "./storage.service";

describe('StorageService', () => {
    let service: StorageService;

    beforeEach(() => {
        localStorage.clear();
        service = new StorageService();
    });

    it('should set and get a value', () => {
        service.set('key', { name: "test" });
        expect(service.get('key')).toEqual({ name: 'test' });
    });

    it('should return null for non existing key', () => {
        expect(service.get('missing')).toBeNull();
    });

    it('should remove a value', () => {
        service.set('key', 'value');
        service.remove('key');
        expect(service.get('key')).toBeNull();
    });

    it('should handle arrays', () => {
        const items = [1, 2, 3];
        service.set('items', items);
        expect(service.get<number[]>('items')).toEqual([1, 2, 3]);
    });
});