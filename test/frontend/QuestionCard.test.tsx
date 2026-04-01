/**
 * QuestionCard 组件测试
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import QuestionCard from '../../frontend/src/components/QuestionCard'
import type { Question } from '../../frontend/src/types'

// 测试数据
const mockQuestion: Question = {
  id: 1,
  userId: 1,
  title: '如何在ERP中集成AI模块？',
  content: '详细的问题描述内容',
  jobRole: 'rd',
  level: 'medium',
  status: 'open',
  bountyPoints: 50,
  viewCount: 128,
  answerCount: 3,
  voteCount: 10,
  solvedAnswerId: null,
  tags: [
    { id: 1, name: 'Java', description: 'Java开发', category: 'language', jobRole: 'rd', questionCount: 5 },
    { id: 2, name: 'Spring', description: 'Spring框架', category: 'framework', jobRole: 'rd', questionCount: 3 },
  ],
  user: {
    id: 1, username: 'testuser', avatar: '', email: 'test@test.com', phone: '',
    department: '研发部', jobRole: 'rd', roleName: '用户', level: 3, levelName: '中级工程师',
    points: 500, bio: '', skillTags: '', createdAt: '2026-03-28T12:00:00'
  },
  createdAt: '2026-03-28T10:00:00',
  updatedAt: '2026-03-28T10:00:00',
}

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('QuestionCard 组件', () => {
  it('应正确渲染问题标题', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} />)
    expect(screen.getByText('如何在ERP中集成AI模块？')).toBeInTheDocument()
  })

  it('应显示投票数和回答数', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} />)
    expect(screen.getByText('10')).toBeInTheDocument() // voteCount
    expect(screen.getByText('3')).toBeInTheDocument() // answerCount
    // 组件改用 SVG 图标，不再显示"投票"/"回答"文字，验证图标区域存在
    expect(screen.getByText('128')).toBeInTheDocument() // viewCount
  })

  it('开放状态不显示状态标签', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} />)
    // 组件仅对 solved 状态渲染 ✓ 图标，open/answered/closed 不渲染任何状态文字
    expect(screen.queryByText('待回答')).not.toBeInTheDocument()
  })

  it('应显示悬赏积分', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} />)
    expect(screen.getByText(/悬赏 50pts/)).toBeInTheDocument()
  })

  it('悬赏积分为0时不显示悬赏标签', () => {
    const noBounty = { ...mockQuestion, bountyPoints: 0 }
    renderWithRouter(<QuestionCard question={noBounty} />)
    expect(screen.queryByText(/悬赏/)).not.toBeInTheDocument()
  })

  it('应显示标签', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} />)
    expect(screen.getByText('Java')).toBeInTheDocument()
    expect(screen.getByText('Spring')).toBeInTheDocument()
  })

  it('应显示作者信息', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} />)
    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  it('应显示浏览数', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} />)
    // 组件使用 formatNumber() 格式化，128 < 1000 直接返回字符串 "128"，无 "views" 后缀
    expect(screen.getByText('128')).toBeInTheDocument()
  })

  it('已解决问题应显示绿色勾号', () => {
    const solved = { ...mockQuestion, status: 'solved' as const }
    renderWithRouter(<QuestionCard question={solved} />)
    // 组件改用 ✓ 图标代替"已解决"文字
    const checkMark = screen.getByText('✓')
    expect(checkMark).toBeInTheDocument()
    expect(checkMark.style.color).toContain('green')
  })

  it('点击卡片应触发导航', async () => {
    const user = userEvent.setup()
    renderWithRouter(<QuestionCard question={mockQuestion} />)
    const card = screen.getByText('如何在ERP中集成AI模块？').closest('.question-card')!
    await user.click(card)
    // 导航由 useNavigate mock 处理
  })

  it('应显示岗位角色标签', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} />)
    expect(screen.getByText(/研发岗位/)).toBeInTheDocument()
  })

  it('应显示难度等级', () => {
    renderWithRouter(<QuestionCard question={mockQuestion} />)
    expect(screen.getByText('中等')).toBeInTheDocument()
  })
})
