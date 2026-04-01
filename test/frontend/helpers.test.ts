/**
 * 工具函数测试
 */
import { describe, it, expect } from 'vitest'
import { formatDate, formatNumber, calculateLevel, getJobRoleName, getQuestionLevelInfo } from '../../frontend/src/utils/helpers'

describe('formatDate', () => {
  it('应显示"刚刚"对于1分钟内', () => {
    const now = new Date().toISOString()
    expect(formatDate(now)).toBe('刚刚')
  })

  it('应显示"X分钟前"', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(formatDate(fiveMinutesAgo)).toBe('5分钟前')
  })

  it('应显示"X小时前"', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000).toISOString()
    expect(formatDate(threeHoursAgo)).toBe('3小时前')
  })

  it('应显示"X天前"', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400 * 1000).toISOString()
    expect(formatDate(twoDaysAgo)).toBe('2天前')
  })

  it('超过7天应显示日期格式', () => {
    const date = new Date('2026-01-15T10:00:00')
    const result = formatDate(date.toISOString())
    expect(result).toMatch(/2026-01-15/)
  })
})

describe('formatNumber', () => {
  it('小于1000应返回原数字', () => {
    expect(formatNumber(999)).toBe('999')
  })

  it('1000+ 应显示 k', () => {
    expect(formatNumber(1500)).toBe('1.5k')
  })

  it('10000+ 应显示 w', () => {
    expect(formatNumber(25000)).toBe('2.5w')
  })

  it('0 应返回 "0"', () => {
    expect(formatNumber(0)).toBe('0')
  })
})

describe('calculateLevel', () => {
  it('0 积分应为1级', () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it('99 积分应为1级', () => {
    expect(calculateLevel(99)).toBe(1)
  })

  it('100 积分应为2级', () => {
    expect(calculateLevel(100)).toBe(2)
  })

  it('500 积分应为3级', () => {
    expect(calculateLevel(500)).toBe(3)
  })

  it('20000 积分应为8级', () => {
    expect(calculateLevel(20000)).toBe(8)
  })
})

describe('getJobRoleName', () => {
  it('rd 应返回"研发岗位"', () => {
    expect(getJobRoleName('rd')).toBe('研发岗位')
  })

  it('pm_ops 应返回"产品和运营岗位"', () => {
    expect(getJobRoleName('pm_ops')).toBe('产品和运营岗位')
  })

  it('qa 应返回"测试岗位"', () => {
    expect(getJobRoleName('qa')).toBe('测试岗位')
  })
})

describe('getQuestionLevelInfo', () => {
  it('easy 应返回简单等级', () => {
    const info = getQuestionLevelInfo('easy')
    expect(info.name).toBe('简单')
    expect(info.key).toBe('easy')
  })

  it('medium 应返回中等等级', () => {
    const info = getQuestionLevelInfo('medium')
    expect(info.name).toBe('中等')
  })

  it('hard 应返回困难等级', () => {
    const info = getQuestionLevelInfo('hard')
    expect(info.name).toBe('困难')
  })

  it('expert 应返回专家级', () => {
    const info = getQuestionLevelInfo('expert')
    expect(info.name).toBe('专家级')
  })
})
