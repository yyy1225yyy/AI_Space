import request from '../utils/request';
import type { JobRoleConfig, Tag, ApiResponse } from '../types';

export const jobRoleService = {
  getAllJobRoles: () =>
    request.get<ApiResponse<JobRoleConfig[]>>('/job-roles'),

  getJobRole: (key: string) =>
    request.get<ApiResponse<JobRoleConfig>>(`/job-roles/${key}`),

  getJobRoleTags: (key: string) =>
    request.get<ApiResponse<Tag[]>>(`/job-roles/${key}/tags`),

  getJobRoleStats: (key: string) =>
    request.get<ApiResponse<Record<string, unknown>>>(`/job-roles/${key}/stats`),
};
