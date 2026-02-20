import { Component, inject, input, output } from "@angular/core";
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

  editTodo = input<{ title: string; description?: string; priority: Priority } | null>(null);

  todoCreated = output<{ title: string; description?: string; priority: Priority }>();

  cancelled = output<void>();

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    priority: ['medium' as Priority],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.todoCreated.emit({
      title: this.form.value.title!,
      description: this.form.value.description || undefined,
      priority: this.form.value.priority!,
    });

    if (!this.editTodo()) {
      this.form.reset({ title: '', description: '', priority: 'medium' });
    }
  }

}
