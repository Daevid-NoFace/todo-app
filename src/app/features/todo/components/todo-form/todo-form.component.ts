import { Component, inject, input, output, signal, effect } from "@angular/core";
import {FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { Priority } from "../../../../core/models/todo.model";

@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.component.html',
  imports: [ReactiveFormsModule, TranslatePipe],
})

export class TodoFormComponent {
  private fb = inject(FormBuilder);

  submitted = signal(false);

  editTodo = input<{ title: string; description?: string; priority: Priority, dueDate?: string } | null>(null);

  todoCreated = output<{ title: string; description?: string; priority: Priority, dueDate?: string }>();

  cancelled = output<void>();

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    priority: ['medium' as Priority],
    dueDate: [''],
  });

  constructor() {
    effect(() => {
      const todo = this.editTodo();

      if (todo) {
        this.form.patchValue({
          title: todo.title,
          description: todo.description ?? '',
          priority: todo.priority,
          dueDate: todo.dueDate ?? '',
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true)

    if (this.form.invalid) {
      return;
    }

    this.todoCreated.emit({
      title: this.form.value.title!,
      description: this.form.value.description || undefined,
      priority: this.form.value.priority!,
      dueDate: this.form.value.dueDate || undefined,
    });

    if (!this.editTodo()) {
      this.form.reset({ title: '', description: '', priority: 'medium', dueDate: '' });
      this.submitted.set(false);
    }
  }
}
