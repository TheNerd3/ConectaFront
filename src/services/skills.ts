import type { Skill } from '../types/vacancy';
import { api } from './api';

export const skillsService = {
  search: (q: string, signal?: AbortSignal) =>
    api<Skill[]>(`/skills?${new URLSearchParams({ q, limit: '8' })}`, { signal }),
};
