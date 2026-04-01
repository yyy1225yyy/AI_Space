/**
 * JobRoleTab 组件测试
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import JobRoleTab from '../../frontend/src/components/JobRoleTab'
import { useAppStore } from '../../frontend/src/stores/appStore'

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('JobRoleTab 组件', () => {
  it('应渲染所有岗位选项', () => {
    renderWithRouter(<JobRoleTab />)
    expect(screen.getByText('全部')).toBeInTheDocument()
    expect(screen.getByText(/研发岗位/)).toBeInTheDocument()
    expect(screen.getByText(/产品和运营岗位/)).toBeInTheDocument()
    expect(screen.getByText(/测试岗位/)).toBeInTheDocument()
  })

  it('默认应选中"全部岗位"', () => {
    // 重置 store 状态
    useAppStore.setState({ currentJobRole: 'all' })
    renderWithRouter(<JobRoleTab />)
    const allTab = screen.getByText('全部')
    expect(allTab).toHaveStyle({ color: 'var(--accent)' })
  })

  it('点击岗位标签应触发 onChange', async () => {
    const onChange = vi.fn()
    useAppStore.setState({ currentJobRole: 'all' })
    const user = userEvent.setup()
    renderWithRouter(<JobRoleTab onChange={onChange} />)

    await user.click(screen.getByText(/研发岗位/))
    expect(onChange).toHaveBeenCalledWith('rd')
  })

  it('切换后选中的标签样式应变化', async () => {
    useAppStore.setState({ currentJobRole: 'all' })
    const user = userEvent.setup()
    renderWithRouter(<JobRoleTab />)

    const rdTab = screen.getByText(/研发岗位/)
    await user.click(rdTab)

    // 验证 store 状态已更新
    expect(useAppStore.getState().currentJobRole).toBe('rd')
  })
})
