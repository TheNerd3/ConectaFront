// Tipos de vacantes y skills, espejo de los DTOs de la API (ConectaBack/src/vacancies/dto).

export type Modality = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type VacancyStatus = 'ACTIVE' | 'PAUSED';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type VacancySort = 'recent' | 'salary';

export interface Skill {
  id: number;
  name: string;
}

/** Rango salarial visible. La API solo lo manda si la empresa eligió mostrarlo. */
export interface SalaryRange {
  min: number | null;
  max: number | null;
  currency: 'ARS';
}

export interface VacancyCompany {
  id: number;
  name: string;
  logoUrl: string | null;
  verified: boolean;
  transparentSeal: boolean;
  /** null: todavía no hay datos de tiempo de respuesta. */
  avgResponseHours: number | null;
}

export interface VacancyListItem {
  id: number;
  title: string;
  modality: Modality;
  location: string;
  salary: SalaryRange | null;
  featured: boolean;
  createdAt: string;
  company: VacancyCompany;
  skills: Skill[];
}

export interface VacancyDetail extends VacancyListItem {
  description: string;
}

export interface VacancyPage {
  items: VacancyListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VacancySearchParams {
  q?: string;
  modality?: Modality;
  location?: string;
  skillIds?: number[];
  salaryMin?: number;
  salaryMax?: number;
  sort?: VacancySort;
  page?: number;
}

// ── Empleador ──

export interface ApplicationCounts {
  total: number;
  review: number;
  interview: number;
}

export interface EmployerVacancy {
  id: number;
  title: string;
  modality: Modality;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  showSalary: boolean;
  status: VacancyStatus;
  featured: boolean;
  createdAt: string;
  skills: Skill[];
  applications: ApplicationCounts;
}

export interface EmployerVacancyDetail extends EmployerVacancy {
  description: string;
}

export interface EmployerCompany {
  id: number;
  name: string;
  verificationStatus: VerificationStatus;
  transparentSeal: boolean;
  canPublish: boolean;
}

export interface EmployerVacancies {
  company: EmployerCompany;
  stats: { activeVacancies: number; inReview: number; inInterview: number; avgResponseHours: number | null };
  items: EmployerVacancy[];
}

export interface VacancyInput {
  title: string;
  modality: Modality;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  showSalary: boolean;
  description: string;
  skillIds: number[];
}
