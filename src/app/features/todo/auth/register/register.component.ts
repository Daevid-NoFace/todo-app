import { Component, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../../../core/services/auth.service";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  error = signal<string | null>(null);
  submitted = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    this.submitted.set(true);

    if (this.form.invalid) return;

    const { name, email, password } = this.form.getRawValue();
    const errorKey = this.authService.register(name, email, password);
    this.error.set(errorKey);
  }
}
