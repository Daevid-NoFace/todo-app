import {
  ChangeDetectionStrategy,
  Component,
  computed,
  output,
  inject,
  signal,
  effect,
} from '@angular/core';
import { TodoService } from '../../core/services/todo.service';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../pipes/translate.pipe';

interface CalendarCell {
  dayNum: number;
  dateStr: string;
  isOtherMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasTasks: boolean;
}

@Component({
  selector: 'app-right-panel',
  imports: [LucideAngularModule, TranslatePipe],
  templateUrl: './right-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightPanelComponent {
  protected todoService = inject(TodoService);

  readonly dateSelected = output<string | null>();

  // --- Calendar ---
  readonly viewMonth = signal(new Date());
  readonly selectedDate = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.todoService.filter().view !== 'date') {
        this.selectedDate.set(null);
      }
    });
  }

  readonly viewMonthLabel = computed(() =>
    this.viewMonth().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  );

  readonly weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  private readonly datesWithTasks = computed(() => {
    const set = new Set<string>();

    for (const todo of this.todoService.todos()) {
      if (todo.dueDate) set.add(todo.dueDate);
    }
    return set;
  });

  readonly calendarDays = computed((): CalendarCell[] => {
    const vm = this.viewMonth();
    const year = vm.getFullYear();
    const month = vm.getMonth();
    const todayStr = this.toDateStr(new Date());
    const datesWithTasks = this.datesWithTasks();
    const selected = this.selectedDate();
    const cells: CalendarCell[] = [];

    // Monday-based offset: Sun(0)->6, Mon(1)->0, ..., Sat(6)->5
    const firstDow = new Date(year, month, 1).getDay();
    const startOffset = (firstDow + 6) % 7;

    // Previous month fill
    for (let i = startOffset; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      const dateStr = this.toDateStr(d);
      cells.push({
        dayNum: d.getDate(),
        dateStr,
        isOtherMonth: true,
        isToday: false,
        isSelected: dateStr === selected,
        hasTasks: datesWithTasks.has(dateStr),
      });
    }

    // Current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNum: day,
        dateStr,
        isOtherMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selected,
        hasTasks: datesWithTasks.has(dateStr),
      });
    }

    // Next month fill to complete 6 rows
    const remaining = 42 - cells.length;

    for (let day = 1; day <= remaining; day++) {
      const d = new Date(year, month + 1, day);
      const dateStr = this.toDateStr(d);
      cells.push({
        dayNum: day,
        dateStr,
        isOtherMonth: true,
        isToday: false,
        isSelected: dateStr === selected,
        hasTasks: datesWithTasks.has(dateStr),
      });
    }

    return cells;
  });

  selectDate(dateStr: string): void {
    const current = this.selectedDate();

    if (current === dateStr) {
      this.selectedDate.set(null);
      this.todoService.updateFilter({ view: 'all', dateFilter: undefined });
      this.dateSelected.emit(null);
    } else {
      this.selectedDate.set(dateStr);
      this.todoService.updateFilter({ view: 'date', dateFilter: dateStr });
      this.dateSelected.emit(dateStr);
    }
  }

  prevMonth(): void {
    const d = new Date(this.viewMonth());
    d.setMonth(d.getMonth() - 1);
    this.viewMonth.set(d);
  }

  nextMonth(): void {
    const d = new Date(this.viewMonth());
    d.setMonth(d.getMonth() + 1);
    this.viewMonth.set(d);
  }

  // --- Weekly Chart ---
  readonly weekStats = computed(() => this.todoService.completionByDay());

  barGradient(rate: number): string {
    if (rate >= 80) return 'linear-gradient(90deg, #10B981, #34D399)';
    if (rate >= 50) return 'linear-gradient(90deg, #7C3AED, #a78BFA)';
    return 'linear-gradient(90deg, #F59E0B, #FCD34D)';
  }

  // --- Stats ---
  readonly streak = computed(() => this.todoService.streak());

  readonly todayCompleted = computed(() => {
    const todayStr = this.toDateStr(new Date());
    return this.todoService.todos().filter((t) => t.completedAt?.startsWith(todayStr)).length;
  });

  readonly todayTotal = computed(() => {
    const todayStr = this.toDateStr(new Date());
    return this.todoService.todos().filter((t) => t.dueDate === todayStr).length;
  });

  readonly weeklyRate = computed(() => {
    const activeDays = this.todoService.completionByDay().filter((d) => d.completed > 0).length;
    return Math.round((activeDays / 7) * 100);
  });

  // --- Helpers ---
  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
