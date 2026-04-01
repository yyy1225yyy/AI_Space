/**
 * UserCard 组件测试
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import UserCard from '../../frontend/src/components/UserCard'
import type { User } from '../../frontend/src/types'

const mockUser: User = {
  id: 1,
  username: 'zhangsan',
  avatar: '',
  email: 'zhangsan@test.com',
  phone: '13800138000',
  department: '研发部',
  jobRole: 'rd',
  roleName: '用户',
  level: 3,
  levelName: '中级工程师',
  points: 500,
  bio: '全栈开发者',
  skillTags: '["Java","React"]',
  createdAt: '2026-03-28T12:00:00',
}

describe('UserCard 组件', () => {
  it('应显示用户名', () => {
    render(<UserCard user={mockUser} />)
    expect(screen.getByText('zhangsan')).toBeInTheDocument()
  })

  it('应显示用户名首字母作为头像', () => {
    render(<UserCard user={mockUser} />)
    expect(screen.getByText('Z')).toBeInTheDocument()
  })

  it('应显示等级名称', () => {
    render(<UserCard user={mockUser} />)
    expect(screen.getByText('中级工程师')).toBeInTheDocument()
  })

  it('应显示岗位信息', () => {
    render(<UserCard user={mockUser} />)
    expect(screen.getByText(/研发岗位/)).toBeInTheDocument()
  })

  it('默认应显示积分', () => {
    render(<UserCard user={mockUser} />)
    expect(screen.getByText(/500 pts/)).toBeInTheDocument()
  })

  it('showPoints=false 时不应显示积分', () => {
    render(<UserCard user={mockUser} showPoints={false} />)
    expect(screen.queryByText(/积分/)).not.toBeInTheDocument()
  })

  it('应支持不同岗位角色', () => {
    const pmUser = { ...mockUser, jobRole: 'pm_ops' as const, username: 'lisi' }
    render(<UserCard user={pmUser} />)
    expect(screen.getByText(/产品和运营岗位/)).toBeInTheDocument()
  })

  it('用户名首字母应大写', () => {
    const lowerUser = { ...mockUser, username: 'alice' }
    render(<UserCard user={lowerUser} />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })
})
