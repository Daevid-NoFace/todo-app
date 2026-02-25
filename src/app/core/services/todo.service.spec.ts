import { TestBed } from "@angular/core/testing";
import { TodoService } from "./todo.service";
import { StorageService } from "./storage.service";

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [TodoService, StorageService],
    });
    service = TestBed.inject(TodoService);
  });

  it('should be start with empty todos', () => {
    expect(service.todos()).toEqual([]);
    expect(service.activeCount()).toBe(0);
  });

  it('should add a todo', () => {
    service.add({ title: 'Test Todo', priority: 'medium' });

    expect(service.todos().length).toBe(1);
    expect(service.todos()[0].completed).toBe(false);
    expect(service.todos()[0].priority).toBe('medium');
  });

  it('should generate unique id and timestamps on add', () => {
    service.add({ title: 'Task 1', priority: 'low' });
    service.add({ title: 'Task 2', priority: 'high' });

    expect(service.todos()[0].id).not.toBe(service.todos()[1].id);
    expect(service.todos()[0].createdAt).toBeDefined();
    expect(service.todos()[0].updatedAt).toBeDefined();
  });

  it('should add new todos at the beginning', () => {
    service.add({ title: 'First', priority: 'low' });
    service.add({ title: 'Second', priority: 'high' });

    expect(service.todos()[0].title).toBe('Second');
    expect(service.todos()[1].title).toBe('First');
  });

  it('should update a todo', () => {
    service.add({ title: 'Original', priority: 'medium' });
    const id = service.todos()[0].id;

    service.update(id, { title: 'Updated', priority: 'high' });

    expect(service.todos()[0].title).toBe('Updated');
    expect(service.todos()[0].priority).toBe('high');
  });

  it('should delete a todo', () => {
    service.add({ title: 'To be deleted', priority: 'low' });
    const id = service.todos()[0].id;

    service.delete(id);

    expect(service.todos().length).toBe(0);
  })

  it('should toggle completion status', () => {
    service.add({ title: 'Toggle Test', priority: 'medium' });
    const id = service.todos()[0].id;

    expect(service.todos()[0].completed).toBe(false);

    service.toggleComplete(id);
    expect(service.todos()[0].completed).toBe(true);

    service.toggleComplete(id);
    expect(service.todos()[0].completed).toBe(false);
  });

  it('should update updateAt on changes', () => {
    vi.useFakeTimers();

    service.add({ title: 'Task', priority: 'low' });
    const id = service.todos()[0].id;
    const originalUpdatedAt = service.todos()[0].updatedAt;

    vi.advanceTimersByTime(1000); // Simulate time passing

    service.update(id, { title: 'Updated Task', priority: 'high' });
    expect(service.todos()[0].updatedAt).not.toBe(originalUpdatedAt);
  });

  it('should compute activeCount and completedCount correctly', () => {
    service.add({ title: 'Task 1', priority: 'low' });
    service.add({ title: 'Task 2', priority: 'medium' });
    service.add({ title: 'Task 3', priority: 'high' });

    const id = service.todos()[0].id;
    service.toggleComplete(id);

    expect(service.activeCount()).toBe(2);
    expect(service.completedCount()).toBe(1);
  });

  it('should clear completed todos', () => {
    service.add({ title: 'Active', priority: 'low' });
    service.add({ title: 'Done', priority: 'medium' });
    service.toggleComplete(service.todos()[0].id);

    service.clearCompleted();

    expect(service.todos().length).toBe(1);
    expect(service.todos()[0].title).toBe('Active');
  });

  it('should filter by status active', () => {
    service.add({ title: 'Active', priority: 'low' });
    service.add({ title: 'Completed', priority: 'high' });
    service.toggleComplete(service.todos()[0].id);

    service.updateFilter({ status: 'active' });

    expect(service.filteredTodos().length).toBe(1);
    expect(service.filteredTodos()[0].title).toBe('Active');
  });

  it('should filter by status completed', () => {
    service.add({ title: 'Active', priority: 'low' });
    service.add({ title: 'Completed', priority: 'high' });
    service.toggleComplete(service.todos()[0].id);

    service.updateFilter({ status: 'completed' });

    expect(service.filteredTodos().length).toBe(1);
    expect(service.filteredTodos()[0].title).toBe('Completed');
  });

  it('should filter by search term in title', () => {
    service.add({ title: 'Buy food', priority: 'low' });
    service.add({ title: 'Read book', priority: 'medium' });

    service.updateFilter({ searchTerm: 'book' });

    expect(service.filteredTodos().length).toBe(1);
    expect(service.filteredTodos()[0].title).toBe('Read book');
  });

  it('should filter by search term in description', () => {
    service.add({ title: 'Task 1', description: 'Buy milk', priority: 'low' });
    service.add({ title: 'Task 2', description: 'Read book', priority: 'medium' });

    service.updateFilter({ searchTerm: 'milk' });

    expect(service.filteredTodos().length).toBe(1);
    expect(service.filteredTodos()[0].title).toBe('Task 1');
  });

  it('should persist to localStorage', () => {
    service.add({ title: 'Persist Test', priority: 'low' });

    const storedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
    expect(storedTodos.length).toBe(1);
    expect(storedTodos[0].title).toBe('Persist Test');
  });
})










