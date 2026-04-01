import type { JobRole, QuestionLevel } from '../types';
import { LEVEL_CONFIG, QUESTION_LEVELS } from '../constants';

/**
 * 格式化日期
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 根据积分计算等级
 */
export function calculateLevel(points: number): number {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (points >= LEVEL_CONFIG[i].minPoints) {
      return LEVEL_CONFIG[i].level;
    }
  }
  return 1;
}

/**
 * 获取岗位名称
 */
export function getJobRoleName(role: JobRole): string {
  const names: Record<JobRole, string> = {
    rd: '研发岗位',
    pm_ops: '产品和运营岗位',
    qa: '测试岗位',
  };
  return names[role];
}

/**
 * 获取问题等级信息
 */
export function getQuestionLevelInfo(level: QuestionLevel) {
  return QUESTION_LEVELS.find((l) => l.key === level) || QUESTION_LEVELS[1];
}

/**
 * 数字格式化（如 1000 -> 1k）
 */
export function formatNumber(num: number): string {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}w`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
}
