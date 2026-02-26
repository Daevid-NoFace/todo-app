import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { StorageService } from "./storage.service";
import { AuthService } from "./auth.service";
import { Project } from "../models/project.model";

@Injectable({providedIn: 'root'})
export class ProjectService {
    private storageService = inject(StorageService);
    private authService = inject(AuthService);
    
    private get storageKey(): string {
        return `projects_${this.authService.currentUser()?.id ?? 'guest'}`;
    }

    private _projects = signal<Project[]>([]);
    
    constructor() {
        effect(() => {
            const storedProjects = this.storageService.get<Project[]>(this.storageKey);
            this._projects.set(storedProjects ?? this.seed());
        });
    }

    readonly projects = this._projects.asReadonly();

    readonly projectMap = computed(() => new Map(this.projects().map(project => [project.id, project])));

    private persist(): void {
        this.storageService.set(this.storageKey, this._projects());
    }

    addProject(data: Omit<Project, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>): void {
        const now = new Date().toISOString();
        const newProject: Project = {
            ...data,
            id: crypto.randomUUID(),
            ownerId: this.authService.currentUser()!.id,
            createdAt: now,
            updatedAt: now,
        };
        this._projects.update(projects => [...projects, newProject]);
        this.persist();
    }

    update(id: string, changes: Partial<Omit<Project, 'id' | 'ownerId' | 'createdAt'>>): void {
        this._projects.update(projects => projects.map(p =>
            p.id === id ? {...p, ...changes, updatedAt: new Date().toISOString()} : p
        ));
        this.persist();
    }

    delete(id: string): void {
        this._projects.update(projects => projects.filter(p => p.id !== id));
        this.persist();
    }

    private seed(): Project[] {
        const ownerId = this.authService.currentUser()?.id ?? 'guest';
        const now = new Date().toISOString();

        const projects: Project[] = [
            { id: crypto.randomUUID(), name: 'Personal', color: '#7C3AED', icon: 'home', ownerId, createdAt: now, updatedAt: now},
            { id: crypto.randomUUID(), name: 'Work', color: '#3B82F6', icon: 'briefcase', ownerId, createdAt: now, updatedAt: now},
            { id: crypto.randomUUID(), name: 'Health', color: '#10B981', icon: 'heart', ownerId, createdAt: now, updatedAt: now},
        ];

        this.storageService.set(this.storageKey, projects);
        return projects;
    }
}


