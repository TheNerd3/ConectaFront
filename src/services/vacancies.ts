import type {
  EmployerVacancies,
  EmployerVacancyDetail,
  VacancyDetail,
  VacancyInput,
  VacancyPage,
  VacancySearchParams,
  VacancyStatus,
} from '../types/vacancy';
import { api } from './api';

function toQuery(params: VacancySearchParams): string {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.modality) qs.set('modality', params.modality);
  if (params.location) qs.set('location', params.location);
  if (params.skillIds?.length) qs.set('skillIds', params.skillIds.join(','));
  if (params.salaryMin !== undefined) qs.set('salaryMin', String(params.salaryMin));
  if (params.salaryMax !== undefined) qs.set('salaryMax', String(params.salaryMax));
  if (params.sort) qs.set('sort', params.sort);
  if (params.page) qs.set('page', String(params.page));
  const s = qs.toString();
  return s ? `?${s}` : '';
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

export const vacanciesService = {
  // Empleado
  search: (params: VacancySearchParams, signal?: AbortSignal) =>
    api<VacancyPage>(`/vacancies${toQuery(params)}`, { signal }),
  get: (id: number) => api<VacancyDetail>(`/vacancies/${id}`),

  // Empleador
  listMine: () => api<EmployerVacancies>('/employer/vacancies'),
  getMine: (id: number) => api<EmployerVacancyDetail>(`/employer/vacancies/${id}`),
  create: (input: VacancyInput) => api<EmployerVacancyDetail>('/employer/vacancies', json('POST', input)),
  update: (id: number, input: VacancyInput) =>
    api<EmployerVacancyDetail>(`/employer/vacancies/${id}`, json('PATCH', input)),
  setStatus: (id: number, status: VacancyStatus) =>
    api<EmployerVacancyDetail>(`/employer/vacancies/${id}/status`, json('PATCH', { status })),
};
