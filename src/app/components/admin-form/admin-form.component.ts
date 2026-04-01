import { Component, inject, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiService } from '../../services/api.service';
import type { Question, RequirementDoc } from '../../models/requirement.model';

@Component({
  selector: 'app-admin-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 animate-fade-in">
      <div class="p-6 border-b border-gray-200 flex justify-between items-center bg-[#003366] text-white rounded-t-lg">
        <div>
          <h2 class="text-xl font-bold">Configurar Nuevo Proyecto</h2>
          <p class="text-blue-200 text-sm mt-1">Define arquitectura y preguntas para el cliente.</p>
        </div>
        <button
          type="button"
          (click)="saveDocument()"
          [disabled]="!reqForm.valid"
          [class]="
            'px-6 py-2 rounded-md font-bold transition-colors shadow-sm ' +
            (reqForm.valid
              ? 'bg-yellow-500 text-[#003366] hover:bg-yellow-400'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed')
          "
        >
          Guardar Proyecto
        </button>
      </div>

      <form [formGroup]="reqForm" class="p-6 md:p-8 space-y-8">
        <section>
          <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 border-yellow-400">
            1. Información General
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto *</label>
              <input
                type="text"
                formControlName="projectName"
                class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#003366]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cliente / Área *</label>
              <input
                type="text"
                formControlName="clientName"
                class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#003366]"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Objetivo Principal *</label>
              <textarea
                formControlName="mainObjective"
                rows="2"
                class="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#003366]"
              ></textarea>
            </div>
          </div>
        </section>

        <section class="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 class="text-lg font-semibold text-[#003366] border-b pb-2 mb-4 border-blue-200">
            2. Parámetros Técnicos Internos
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Carga Concurrente (Usuarios)</label>
              <input
                type="text"
                formControlName="concurrentUsers"
                class="w-full border border-gray-300 rounded-md p-2 mt-1"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Retención de Datos (BD)</label>
              <input
                type="text"
                formControlName="dataRetention"
                class="w-full border border-gray-300 rounded-md p-2 mt-1"
              />
            </div>
          </div>
        </section>

        <section>
          <div class="flex justify-between items-center border-b pb-2 mb-4 border-yellow-400">
            <h3 class="text-lg font-semibold text-gray-800">3. Formulario Dinámico para Cliente</h3>
            <button
              type="button"
              (click)="addQuestion()"
              class="text-sm bg-blue-100 text-[#003366] px-3 py-1 rounded shadow-sm hover:bg-blue-200 font-medium"
            >
              + Añadir Pregunta
            </button>
          </div>

          <div formArrayName="customQuestions" class="space-y-3">
            @for (control of questionsArray.controls; track $index) {
              <div class="flex items-start gap-3 bg-gray-50 p-3 rounded border border-gray-200">
                <span class="font-bold text-gray-400 mt-2">{{ $index + 1 }}.</span>
                <input
                  [formControlName]="$index"
                  placeholder="Redacta la pregunta aquí..."
                  class="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#003366]"
                />
                <button type="button" (click)="removeQuestion($index)" class="text-red-500 hover:text-red-700 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            }
          </div>
        </section>
      </form>
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
export class AdminFormComponent {
  private readonly fb = inject(FormBuilder);
  readonly api = inject(ApiService);
  @Output() saved = new EventEmitter<void>();

  reqForm: FormGroup = this.fb.group({
    projectName: ['', Validators.required],
    clientName: ['', Validators.required],
    mainObjective: ['', Validators.required],
    userRoles: [''],
    mainActions: [''],
    integrations: [''],
    concurrentUsers: [''],
    latency: [''],
    security: [''],
    dataRetention: [''],
    customQuestions: this.fb.array([
      this.fb.control('¿Qué problema principal esperas resolver con este software?', Validators.required),
    ]),
  });

  get questionsArray(): FormArray {
    return this.reqForm.get('customQuestions') as FormArray;
  }

  addQuestion(): void {
    this.questionsArray.push(this.fb.control('', Validators.required));
  }

  removeQuestion(i: number): void {
    this.questionsArray.removeAt(i);
  }

  async saveDocument(): Promise<void> {
    if (!this.reqForm.valid) return;
    const formVal = this.reqForm.value;
    const questionsAsObjects: Question[] = formVal.customQuestions.map((text: string) => ({
      text,
      answer: '',
    }));

    const newDoc: RequirementDoc = {
      id: 'REQ-' + Math.random().toString(36).substring(2, 11).toUpperCase(),
      date: new Date().toLocaleDateString('es-ES'),
      status: 'Pendiente',
      ...formVal,
      customQuestions: questionsAsObjects,
    };

    await this.api.saveProject(newDoc);
    this.saved.emit();
  }
}
