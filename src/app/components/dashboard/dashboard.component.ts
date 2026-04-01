import { Component, inject, Output, EventEmitter, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <h2 class="text-2xl font-semibold text-[#003366] mb-6">Panel de Control de Proyectos</h2>

      @if (toastMsg()) {
        <div
          class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 shadow-sm flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          {{ toastMsg() }}
        </div>
      }

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 class="font-semibold text-gray-700">Proyectos Activos</h3>
          <button
            type="button"
            (click)="createNew.emit()"
            class="text-sm bg-[#003366] text-white px-4 py-2 rounded shadow-sm hover:bg-blue-800 transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Crear Nuevo
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-white text-gray-500 border-b border-gray-100">
              <tr>
                <th class="px-6 py-3 font-medium">Proyecto</th>
                <th class="px-6 py-3 font-medium">Cliente</th>
                <th class="px-6 py-3 font-medium">Estado</th>
                <th class="px-6 py-3 font-medium text-right">Enlace para Cliente</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (doc of api.projects(); track doc.id) {
                <tr class="hover:bg-blue-50 transition-colors">
                  <td class="px-6 py-4 font-bold text-[#003366]">{{ doc.projectName }}</td>
                  <td class="px-6 py-4">{{ doc.clientName }}</td>
                  <td class="px-6 py-4">
                    <span
                      [class]="
                        'px-3 py-1 rounded-full text-xs font-bold ' +
                        (doc.status === 'Completado'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200')
                      "
                    >
                      {{ doc.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-3">
                    @if (doc.status === 'Pendiente') {
                      <button
                        type="button"
                        (click)="copyLink(doc.id)"
                        class="text-blue-700 hover:text-blue-900 font-medium text-xs border border-blue-200 px-3 py-1.5 rounded bg-white shadow-sm flex items-center gap-1 ml-auto"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                          />
                        </svg>
                        Copiar Enlace
                      </button>
                    } @else {
                      <button
                        type="button"
                        class="text-[#003366] hover:underline font-bold text-xs flex items-center gap-1 ml-auto"
                      >
                        Ver Documento Completo
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-12 w-12 mx-auto text-gray-300 mb-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Aún no hay proyectos. Comienza creando uno nuevo.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.4s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class DashboardComponent {
  readonly api = inject(ApiService);
  @Output() createNew = new EventEmitter<void>();
  readonly toastMsg = signal('');

  copyLink(id: string): void {
    const url = `${window.location.origin}${window.location.pathname}?view=client&id=${id}`;

    const fallbackCopy = (text: string): void => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallo copia', err);
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => this.showToast()).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
      this.showToast();
    }
  }

  private showToast(): void {
    this.toastMsg.set('¡Enlace copiado! Envíalo a tu cliente.');
    setTimeout(() => this.toastMsg.set(''), 3500);
  }
}
