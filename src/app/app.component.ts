import { Component, OnInit, signal } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminFormComponent } from './components/admin-form/admin-form.component';
import { ClientPortalComponent } from './components/client-portal/client-portal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent, AdminFormComponent, ClientPortalComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      @if (currentView() !== 'client-form') {
        <header
          class="bg-[#003366] text-white h-14 flex items-center justify-between px-4 shadow-md z-10 print:hidden sticky top-0"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 bg-white rounded flex items-center justify-center text-[#003366] font-bold text-xl shadow-sm"
            >
              P
            </div>
            <h1 class="font-semibold text-lg tracking-wide">
              HIS-PIPITOS
              <span class="text-gray-300 font-normal text-sm ml-2 hidden sm:inline">| Centro de Requerimientos</span>
            </h1>
          </div>
          <div class="flex items-center gap-4 text-sm font-medium">
            <div
              class="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-[#003366] font-bold shadow-sm"
            >
              AD
            </div>
          </div>
        </header>
      }

      <div class="flex flex-1 overflow-hidden">
        @if (currentView() !== 'client-form') {
          <aside class="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm print:hidden z-0">
            <nav class="flex-1 p-4 space-y-2 mt-4">
              <button
                type="button"
                (click)="changeView('dashboard')"
                [class]="
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-left font-medium ' +
                  (currentView() === 'dashboard'
                    ? 'bg-blue-50 text-[#003366] border-l-4 border-[#003366] shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100')
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"
                  />
                </svg>
                Tablero
              </button>
            </nav>
          </aside>
        }

        <main class="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 print:p-0 print:bg-white relative">
          @if (currentView() === 'dashboard') {
            <app-dashboard (createNew)="changeView('admin-form')"></app-dashboard>
          }
          @if (currentView() === 'admin-form') {
            <app-admin-form (saved)="changeView('dashboard')"></app-admin-form>
          }
          @if (currentView() === 'client-form') {
            <app-client-portal [projectId]="activeProjectId()"></app-client-portal>
          }
        </main>
      </div>
    </div>
  `,
})
export class AppComponent implements OnInit {
  readonly currentView = signal<'dashboard' | 'admin-form' | 'client-form'>('dashboard');
  readonly activeProjectId = signal<string>('');

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    const id = urlParams.get('id');

    if (view === 'client' && id) {
      this.activeProjectId.set(id);
      this.currentView.set('client-form');
    }
  }

  changeView(view: 'dashboard' | 'admin-form'): void {
    this.currentView.set(view);
    if (window.history.pushState) {
      window.history.pushState({}, document.title, window.location.pathname);
    }
  }
}
