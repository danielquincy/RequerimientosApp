import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import type { RequirementDoc } from '../../models/requirement.model';

@Component({
  selector: 'app-client-portal',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    @if (loading()) {
      <div class="flex justify-center items-center p-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
      </div>
    } @else if (projectData()) {
      <div
        class="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none animate-fade-in"
      >
        <div
          class="bg-[#003366] text-white p-8 text-center print:bg-white print:text-[#003366] print:border-b-2 print:border-[#003366] print:p-0 print:pb-4"
        >
          <div
            class="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center text-[#003366] font-bold text-3xl mb-4 print:hidden"
          >
            P
          </div>
          <h1 class="text-2xl font-bold mb-2">Formulario de Requerimientos</h1>
          <p class="text-blue-200 print:text-gray-600">
            Por favor, responde las siguientes preguntas para iniciar el diseño técnico.
          </p>
        </div>

        <div
          class="p-8 bg-blue-50 border-b border-blue-100 print:bg-transparent print:p-0 print:pt-6 print:border-none"
        >
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Información del Proyecto</h3>
          <p class="text-xl font-semibold text-[#003366]">{{ projectData()?.projectName }}</p>
          <p class="text-gray-700 mt-2">
            <span class="font-medium">Objetivo:</span> {{ projectData()?.mainObjective }}
          </p>
        </div>

        <form [formGroup]="clientForm" class="p-8 space-y-8 print:p-0 print:pt-6">
          <div formArrayName="answers" class="space-y-6">
            @for (q of projectData()?.customQuestions; track $index) {
              <div class="space-y-2">
                <label class="block text-base font-medium text-gray-800 break-words">
                  {{ $index + 1 }}. {{ q.text }}
                </label>
                <textarea
                  [formControlName]="$index"
                  rows="3"
                  class="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-[#003366] bg-gray-50 print:border-none print:bg-transparent print:p-0 print:italic print:text-gray-700"
                  placeholder="Tu respuesta..."
                ></textarea>
              </div>
            }
          </div>

          <div class="pt-6 border-t border-gray-200 flex justify-between items-center print:hidden">
            <p class="text-xs text-gray-500">Tus respuestas se guardarán en la nube del proyecto.</p>
            <button
              type="button"
              (click)="submitAnswers()"
              [disabled]="!clientForm.valid || isSaved()"
              class="px-6 py-3 bg-yellow-500 text-[#003366] font-bold rounded-md hover:bg-yellow-400 transition-colors shadow-sm disabled:opacity-50"
            >
              {{ isSaved() ? 'Guardado ✅' : 'Guardar y Descargar PDF' }}
            </button>
          </div>
        </form>
      </div>
    } @else {
      <div class="text-center p-20 text-red-600 font-bold">Documento no encontrado o ID inválido.</div>
    }
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
export class ClientPortalComponent implements OnInit {
  @Input() projectId!: string;
  private readonly fb = inject(FormBuilder);
  readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly projectData = signal<RequirementDoc | null>(null);
  readonly isSaved = signal(false);

  clientForm: FormGroup = this.fb.group({
    answers: this.fb.array([]),
  });

  get answersArray(): FormArray {
    return this.clientForm.get('answers') as FormArray;
  }

  async ngOnInit(): Promise<void> {
    if (this.projectId) {
      const data = await this.api.getProjectById(this.projectId);
      if (data) {
        this.projectData.set(data);
        data.customQuestions.forEach((q) => {
          this.answersArray.push(this.fb.control(q.answer || '', Validators.required));
        });
        if (data.status === 'Completado') this.isSaved.set(true);
      }
    }
    this.loading.set(false);
  }

  async submitAnswers(): Promise<void> {
    if (!this.clientForm.valid || !this.projectData()) return;
    const answers = this.clientForm.value.answers as string[];
    const doc = this.projectData()!;

    const updatedQuestions = doc.customQuestions.map((q, i) => ({ ...q, answer: answers[i] }));
    const updatedDoc: RequirementDoc = { ...doc, status: 'Completado', customQuestions: updatedQuestions };

    await this.api.saveProject(updatedDoc);
    this.isSaved.set(true);

    setTimeout(() => window.print(), 500);
  }
}
