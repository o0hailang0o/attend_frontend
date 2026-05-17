import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type TabKey = 'overview' | 'attendance' | 'personal' | 'leave' | 'myLeaves' | 'approval' | 'users' | 'rules' | 'settings'

const menuItems: { key: TabKey; label: string; icon: string }[] = [
  { key: 'overview', label: '工作台', icon: '📊' },
  { key: 'attendance', label: '考勤记录', icon: '📋' },
  { key: 'leave', label: '请假申请', icon: '📝' },
  { key: 'approval', label: '审批列表', icon: '✅' },
  { key: 'personal', label: '个人考勤', icon: '👤' },
  { key: 'myLeaves', label: '个人申请', icon: '📄' },
  { key: 'users', label: '人员管理', icon: '👥' },
  { key: 'rules', label: '考勤规则', icon: '📏' },
  { key: 'settings', label: '个人设置', icon: '⚙️' },
]

const departmentStats = {
  totalEmployees: 128,
  present: 115,
  late: 6,
  absent: 3,
  onLeave: 4,
  attendanceRate: '96.7%',
}

const todayRecords = [
  { name: '张三', department: '产品研发部', checkIn: '08:55', checkOut: '18:02', status: '正常' },
  { name: '李四', department: '产品研发部', checkIn: '08:48', checkOut: '17:58', status: '正常' },
  { name: '王五', department: '市场部', checkIn: '09:12', checkOut: '18:30', status: '迟到' },
  { name: '赵六', department: '技术部', checkIn: '--:--', checkOut: '--:--', status: '缺勤' },
  { name: '孙七', department: '人事部', checkIn: '08:58', checkOut: '18:10', status: '正常' },
]

const allRecords = [
  { date: '2026-05-15', name: '张三', department: '产品研发部', checkIn: '08:55', checkOut: '18:02', status: '正常' },
  { date: '2026-05-15', name: '李四', department: '产品研发部', checkIn: '08:48', checkOut: '17:58', status: '正常' },
  { date: '2026-05-15', name: '王五', department: '市场部', checkIn: '09:12', checkOut: '18:30', status: '迟到' },
  { date: '2026-05-15', name: '赵六', department: '技术部', checkIn: '--:--', checkOut: '--:--', status: '缺勤' },
  { date: '2026-05-14', name: '张三', department: '产品研发部', checkIn: '08:50', checkOut: '18:05', status: '正常' },
  { date: '2026-05-14', name: '王五', department: '市场部', checkIn: '08:55', checkOut: '17:50', status: '正常' },
  { date: '2026-05-14', name: '孙七', department: '人事部', checkIn: '09:20', checkOut: '18:15', status: '迟到' },
]

const checkIns = ['08:48', '08:52', '08:55', '08:50', '08:58']
const checkOuts = ['18:02', '17:58', '18:05', '18:10', '17:55']

const monthlyRecords = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1
  const date = `2026-05-${String(day).padStart(2, '0')}`
  if (day % 7 === 0) return { date, day, checkIn: '--:--', checkOut: '--:--', status: '缺勤' as const }
  if (day % 5 === 0) return { date, day, checkIn: '09:15', checkOut: '18:30', status: '迟到' as const }
  return { date, day, checkIn: checkIns[i % 5], checkOut: checkOuts[i % 5], status: '正常' as const }
})

const mockApprovals = Array.from({ length: 23 }, (_, i) => {
  const names = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十']
  const depts = ['产品研发部', '市场部', '技术部', '人事部', '财务部']
  const types = ['年假', '事假', '病假', '调休假', '婚假']
  const approvers = ['李四', '王五', '赵六']
  const day = (i % 28) + 1
  const month = 5
  const startDay = day
  const endDay = Math.min(day + (i % 3) + 1, 28)
  return {
    id: i + 1,
    name: names[i % names.length],
    empId: `EMP-2024-${String(i + 1).padStart(3, '0')}`,
    department: depts[i % depts.length],
    type: types[i % types.length],
    startDate: `2026-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`,
    endDate: `2026-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`,
    startTime: '09:00',
    endTime: '18:00',
    duration: ((endDay - startDay + 1) * 9) + '小时',
    reason: '个人事务需要处理',
    approver: approvers[i % approvers.length],
    workflow: approvers.map((a, j) => ({
      name: a,
      approved: j <= i % 3,
    })),
  }
})

const myLeaveRecords = Array.from({ length: 15 }, (_, i) => {
  const types = ['年假', '事假', '病假', '调休假', '婚假']
  const approvers = ['李四', '王五', '赵六']
  const statuses = ['待审批', '已通过', '已驳回'] as const
  const day = (i % 25) + 1
  const month = 5
  const startDay = day
  const endDay = Math.min(day + (i % 2) + 1, 28)
  return {
    id: i + 1,
    type: types[i % types.length],
    startDate: `2026-${String(month).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`,
    endDate: `2026-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`,
    startTime: '09:00',
    endTime: '18:00',
    duration: ((endDay - startDay + 1) * 9) + '小时',
    reason: ['家中有事', '身体不适', '年假休息', '处理私事'][i % 4],
    approver: approvers[i % approvers.length],
    status: statuses[i % 3],
    workflow: approvers.map((a, j) => ({
      name: a,
      approved: j <= (i % 3) - 1,
    })),
  }
})

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [showDoorModal, setShowDoorModal] = useState(false)
  const [doorModalDate, setDoorModalDate] = useState('')
  const [leaveForm, setLeaveForm] = useState({
    type: '年假',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    approver: '',
    reason: '',
  })
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
  })
  const [showLeaveSuccess, setShowLeaveSuccess] = useState(false)
  const [approvalPage, setApprovalPage] = useState(1)
  const pageSize = 10
  const [myLeavePage, setMyLeavePage] = useState(1)
  const myLeavePageSize = 10
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [sortField, setSortField] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: '你好！我是考勤小助手，有什么可以帮你的吗？' },
  ])
  const [chatInput, setChatInput] = useState('')

  type RuleItem = {
    id: number
    name: string
    flexibility: number
    start_time: string
    end_time: string
    middle_rest: number
    middle_start: string
    middle_end: string
    vacation: number
    comp: number
  }
  const [ruleList, setRuleList] = useState<RuleItem[]>([])
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [editingRule, setEditingRule] = useState<RuleItem | null>(null)
  const blankRule = { name: '', flexibility: 0, start_time: '09:00', end_time: '18:00', middle_rest: 0, middle_start: '', middle_end: '', vacation: 1, comp: 1 }
  const [ruleForm, setRuleForm] = useState<Omit<RuleItem, 'id'>>({ ...blankRule })

  const handleSaveRule = () => {
    if (!ruleForm.name.trim()) return
    if (editingRule) {
      setRuleList(prev => prev.map(r => r.id === editingRule.id ? { ...r, ...ruleForm } : r))
    } else {
      setRuleList(prev => [...prev, { id: Date.now(), ...ruleForm }])
    }
    setShowRuleForm(false)
    setEditingRule(null)
    setRuleForm({ ...blankRule })
  }

  const handleDeleteRule = (id: number) => {
    setRuleList(prev => prev.filter(r => r.id !== id))
  }

  type UserItem = {
    id: number
    name: string
    workNum: string
    department: string
    position: string
    ruleId: number | null
  }
  const userList: UserItem[] = [
    { id: 1, name: '张三', workNum: 'EMP-2024-001', department: '技术部', position: '工程师', ruleId: null },
    { id: 2, name: '李四', workNum: 'EMP-2024-002', department: '产品研发部', position: '经理', ruleId: null },
    { id: 3, name: '王五', workNum: 'EMP-2024-003', department: '市场部', position: '主管', ruleId: null },
    { id: 4, name: '赵六', workNum: 'EMP-2024-004', department: '技术部', position: '专员', ruleId: null },
    { id: 5, name: '孙七', workNum: 'EMP-2024-005', department: '人事部', position: '经理', ruleId: null },
    { id: 6, name: '周八', workNum: 'EMP-2024-006', department: '财务部', position: '总监', ruleId: null },
    { id: 7, name: '吴九', workNum: 'EMP-2024-007', department: '市场部', position: '专员', ruleId: null },
    { id: 8, name: '郑十', workNum: 'EMP-2024-008', department: '产品研发部', position: '工程师', ruleId: null },
    { id: 9, name: '陈十一', workNum: 'EMP-2024-009', department: '技术部', position: '主管', ruleId: null },
    { id: 10, name: '林十二', workNum: 'EMP-2024-010', department: '人事部', position: '专员', ruleId: null },
    { id: 11, name: '黄十三', workNum: 'EMP-2024-011', department: '财务部', position: '工程师', ruleId: null },
    { id: 12, name: '刘十四', workNum: 'EMP-2024-012', department: '市场部', position: '主管', ruleId: null },
  ]
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const userPageSize = 10
  const [userRules, setUserRules] = useState<Record<number, number | null>>({})

  const handleUserRuleChange = (userId: number, ruleId: number) => {
    setUserRules(prev => ({ ...prev, [userId]: ruleId }))
  }

  const daysInMonth = new Date(
    parseInt(selectedMonth.split('-')[0]),
    parseInt(selectedMonth.split('-')[1]),
    0
  ).getDate()

  const calcDuration = (date: string, time: string, endDate: string, endTime: string): number => {
    if (!date || !time || !endDate || !endTime) return 0
    const s = new Date(`${date}T${time}`)
    const e = new Date(`${endDate}T${endTime}`)
    if (e <= s) return 0
    return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60))
  }
  const duration = calcDuration(leaveForm.startDate, leaveForm.startTime, leaveForm.endDate, leaveForm.endTime)

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setApprovalPage(1)
  }

  const filteredApprovals = mockApprovals
    .filter(r => {
      const matchSearch = !searchQuery || r.name.includes(searchQuery) || r.empId.includes(searchQuery)
      const matchStatus = statusFilter === '全部' || r.workflow.every(w => w.approved) === (statusFilter === '已通过')
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      if (!sortField) return 0
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortField === 'name') return a.name.localeCompare(b.name) * dir
      if (sortField === 'department') return a.department.localeCompare(b.department) * dir
      if (sortField === 'type') return a.type.localeCompare(b.type) * dir
      if (sortField === 'startDate') return a.startDate.localeCompare(b.startDate) * dir
      if (sortField === 'endDate') return a.endDate.localeCompare(b.endDate) * dir
      if (sortField === 'duration') return a.duration.localeCompare(b.duration) * dir
      return 0
    })

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowLeaveSuccess(true)
  }

  const handleLogout = () => navigate('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== 顶部导航栏 ===== */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 hidden sm:block">企业考勤管理系统</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-sm">
                张
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-gray-700 leading-tight">张三</p>
                <p className="text-gray-400 text-xs">人事部</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition ml-2"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4.1rem)] overflow-hidden">
        {/* ===== 侧边栏 (桌面端 lg+) ===== */}
        <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200 flex-shrink-0">
          <nav className="p-4 space-y-0.5 mt-4">
            {menuItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition
                  ${activeTab === item.key
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ===== 主内容区域 ===== */}
        <main className="flex-1 p-2 lg:p-4 pb-14 lg:pb-3 overflow-y-auto">
          <div className="mb-1">
            {(activeTab === 'approval' || activeTab === 'personal' || activeTab === 'leave' || activeTab === 'myLeaves') && (
              <input
                type="month"
                value={selectedMonth}
                onChange={e => {
                  setSelectedMonth(e.target.value)
                  if (activeTab === 'leave') setLeaveForm(prev => ({ ...prev, startDate: '', endDate: '' }))
                }}
                className="text-lg font-bold text-gray-800 border-0 p-0 bg-transparent focus:outline-none focus:ring-0 cursor-pointer mb-1 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            )}
            <h2 className="text-xl font-bold text-gray-800">
              {activeTab === 'overview' && '工作台'}
              {activeTab === 'attendance' && '考勤记录'}
              {activeTab === 'personal' && '个人考勤'}
              {activeTab === 'leave' && '请假申请'}
              {activeTab === 'myLeaves' && '个人申请'}
              {activeTab === 'approval' && '审批列表'}
              {activeTab === 'rules' && '考勤规则'}
              {activeTab === 'users' && '人员管理'}
              {activeTab === 'settings' && '个人设置'}
            </h2>
            <p className="text-sm text-gray-500 mt-0">
              {activeTab === 'overview' && '欢迎回来，以下是今日公司整体出勤情况。'}
              {activeTab === 'attendance' && '查看公司全体员工的考勤记录。'}
              {activeTab === 'personal' && '查看您的个人月度考勤记录和门禁记录。'}
              {activeTab === 'leave' && '提交您的请假申请。'}
              {activeTab === 'myLeaves' && '查看您提交的请假申请记录。'}
              {activeTab === 'approval' && '审批和处理员工的请假申请。'}
              {activeTab === 'rules' && '管理考勤规则，包括上下班时间、午休设置、假期额度等。'}
              {activeTab === 'users' && '管理员工信息和考勤规则分配。'}
            </p>
          </div>

          {/* ===== 工作台 — 整体出勤概览 ===== */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">总人数</p>
                  <p className="text-2xl font-bold text-gray-800">{departmentStats.totalEmployees}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">已出勤</p>
                  <p className="text-2xl font-bold text-green-600">{departmentStats.present}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">迟到</p>
                  <p className="text-2xl font-bold text-amber-600">{departmentStats.late}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">缺勤</p>
                  <p className="text-2xl font-bold text-red-600">{departmentStats.absent}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">请假</p>
                  <p className="text-2xl font-bold text-blue-600">{departmentStats.onLeave}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">今日出勤率</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">{departmentStats.attendanceRate}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-xl">📈</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">本月迟到总人次</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">23</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-xl">⏰</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">本月缺勤总人次</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">8</p>
                    </div>
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-xl">⚠️</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">今日考勤明细</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">姓名</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">部门</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">签到</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">签退</th>
                        <th className="text-left px-6 py-3 text-gray-500 font-medium">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayRecords.map((record, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-6 py-3 text-gray-700">{record.name}</td>
                          <td className="px-6 py-3 text-gray-700">{record.department}</td>
                          <td className="px-6 py-3 text-gray-700">{record.checkIn}</td>
                          <td className="px-6 py-3 text-gray-700">{record.checkOut}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              record.status === '正常'
                                ? 'bg-green-50 text-green-700'
                                : record.status === '迟到'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== 考勤记录 — 仅查看，无签到 ===== */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">考勤记录查询</h3>
                <p className="text-sm text-gray-500 mb-4">查看公司全体员工的考勤记录。</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">日期</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">姓名</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">部门</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">签到</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">签退</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allRecords.map((record, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-gray-700">{record.date}</td>
                          <td className="px-4 py-3 text-gray-700">{record.name}</td>
                          <td className="px-4 py-3 text-gray-700">{record.department}</td>
                          <td className="px-4 py-3 text-gray-700">{record.checkIn}</td>
                          <td className="px-4 py-3 text-gray-700">{record.checkOut}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              record.status === '正常'
                                ? 'bg-green-50 text-green-700'
                                : record.status === '迟到'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== 个人考勤 — 年假/调休假 + 门禁入口 ===== */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">年假余额</p>
                      <p className="text-3xl font-bold text-blue-600 mt-1">12<span className="text-lg text-gray-400 ml-0.5">小时</span></p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">🏖️</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">调休假余额</p>
                      <p className="text-3xl font-bold text-amber-600 mt-1">3<span className="text-lg text-gray-400 ml-0.5">小时</span></p>
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl">🔄</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">{parseInt(selectedMonth.split('-')[0])}年{parseInt(selectedMonth.split('-')[1])}月考勤记录</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">日期</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">签到</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">签退</th>
                        <th className="text-center px-4 py-3 text-gray-500 font-medium">单日工作时长</th>
                        <th className="text-center px-4 py-3 text-gray-500 font-medium">状态</th>
                        <th className="text-right px-4 py-3 text-gray-500 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyRecords.map(r => (
                        <tr key={r.day} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-4 py-3 text-gray-700">{r.date}</td>
                          <td className="px-4 py-3 text-gray-700">{r.checkIn}</td>
                          <td className="px-4 py-3 text-gray-700">{r.checkOut}</td>
                          <td className="px-4 py-3 text-center text-gray-700">{r.status === '缺勤' ? '--' : (() => {
                            const [h1, m1] = r.checkIn.split(':').map(Number)
                            const [h2, m2] = r.checkOut.split(':').map(Number)
                            const diff = (h2 * 60 + m2) - (h1 * 60 + m1)
                            return (diff / 60).toFixed(1) + '小时'
                          })()}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              r.status === '正常' ? 'bg-green-50 text-green-700' :
                              r.status === '迟到' ? 'bg-amber-50 text-amber-700' :
                              'bg-red-50 text-red-700'
                            }`}>{r.status}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => { setDoorModalDate(r.date); setShowDoorModal(true) }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition"
                            >
                              🚪 门禁
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== 请假申请 ===== */}
          {activeTab === 'leave' && (
            <div className="space-y-4">
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">剩余年假</p>
                         <p className="text-2xl font-bold text-blue-600 mt-1">12<span className="text-base text-gray-400 ml-0.5">小时</span></p>
                      </div>
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl">🏖️</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">剩余调休假</p>
                         <p className="text-2xl font-bold text-amber-600 mt-1">3<span className="text-base text-gray-400 ml-0.5">小时</span></p>
                      </div>
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-xl">🔄</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">请假申请</h3>
                <form onSubmit={handleLeaveSubmit} className="space-y-5">
                  <div className="flex items-center gap-3">
                    <label className="w-24 text-sm font-medium text-gray-700 shrink-0">请假类型</label>
                    <select
                      value={leaveForm.type}
                      onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="年假">年假</option>
                      <option value="事假">事假</option>
                      <option value="病假">病假</option>
                      <option value="调休假">调休假</option>
                      <option value="婚假">婚假</option>
                      <option value="产假">产假</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="w-24 text-sm font-medium text-gray-700 shrink-0">开始时间</label>
                    <input
                      type="date"
                      value={leaveForm.startDate}
                      onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      min={`${selectedMonth}-01`}
                      max={`${selectedMonth}-${String(daysInMonth).padStart(2, '0')}`}
                      className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    <input
                      type="time"
                      value={leaveForm.startTime}
                      onChange={e => setLeaveForm({ ...leaveForm, startTime: e.target.value })}
                      className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    <label className="text-sm font-medium text-gray-700 shrink-0 ml-1">结束时间</label>
                    <input
                      type="date"
                      value={leaveForm.endDate}
                      onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      min={`${selectedMonth}-01`}
                      max={`${selectedMonth}-${String(daysInMonth).padStart(2, '0')}`}
                      className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    <input
                      type="time"
                      value={leaveForm.endTime}
                      onChange={e => setLeaveForm({ ...leaveForm, endTime: e.target.value })}
                      className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-24 text-sm font-medium text-gray-700 shrink-0">时长</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
                      {duration} 小时
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <label className="w-24 text-sm font-medium text-gray-700 shrink-0 mt-2.5">请假事由</label>
                    <textarea
                      value={leaveForm.reason}
                      onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      rows={3}
                      placeholder="请输入请假事由..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-24 text-sm font-medium text-gray-700 shrink-0">审批人</label>
                    <select
                      value={leaveForm.approver}
                      onChange={e => setLeaveForm({ ...leaveForm, approver: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    >
                      <option value="" disabled>请选择审批人</option>
                      <option value="李四">李四</option>
                      <option value="王五">王五</option>
                      <option value="赵六">赵六</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    提交申请
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ===== 个人申请 ===== */}
          {activeTab === 'myLeaves' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">类型</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">开始时间</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">结束时间</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">时长</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">审批流程</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">事由</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const pageData = myLeaveRecords.slice((myLeavePage - 1) * myLeavePageSize, myLeavePage * myLeavePageSize)
                        return pageData.map(r => (
                          <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{r.type}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.startDate.slice(5)} {r.startTime}</td>
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.endDate.slice(5)} {r.endTime}</td>
                            <td className="px-4 py-3 text-gray-700">{r.duration}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {r.workflow.map((w, j) => (
                                  <div key={j} className="flex items-center">
                                    <div
                                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                                        w.approved ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                                      }`}
                                      title={w.name}
                                    >
                                      {w.name.slice(0, 1)}
                                    </div>
                                    {j < r.workflow.length - 1 && (
                                      <div className={`w-4 h-0.5 ${w.approved ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{r.reason}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                r.status === '已通过' ? 'bg-green-50 text-green-700' :
                                r.status === '已驳回' ? 'bg-red-50 text-red-700' :
                                'bg-amber-50 text-amber-700'
                              }`}>{r.status}</span>
                            </td>
                          </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-1.5">
                <p className="text-xs text-gray-500">
                  共 {myLeaveRecords.length} 条，第 {myLeavePage}/{Math.ceil(myLeaveRecords.length / myLeavePageSize) || 1} 页
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setMyLeavePage(p => Math.max(1, p - 1))}
                    disabled={myLeavePage === 1}
                    className="px-2 py-0.5 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    上一页
                  </button>
                  {Array.from({ length: Math.ceil(myLeaveRecords.length / myLeavePageSize) || 1 }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setMyLeavePage(p)}
                      className={`w-6 h-6 text-xs rounded transition ${
                        myLeavePage === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setMyLeavePage(p => Math.min(Math.ceil(myLeaveRecords.length / myLeavePageSize) || 1, p + 1))}
                    disabled={myLeavePage === (Math.ceil(myLeaveRecords.length / myLeavePageSize) || 1)}
                    className="px-2 py-0.5 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== 审批列表 ===== */}
          {activeTab === 'approval' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-800">请假申请列表</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-800">人事部</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setApprovalPage(1) }}
                      placeholder="姓名 / 工号..."
                      className="w-36 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <select
                      value={statusFilter}
                      onChange={e => { setStatusFilter(e.target.value); setApprovalPage(1) }}
                      className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="全部">全部状态</option>
                      <option value="已通过">已通过</option>
                      <option value="未通过">未通过</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50">
                        {['申请人', '部门', '类型', '开始时间', '结束时间', '时长', '审批状态', '审批流程', '操作'].map(col => (
                          <th
                            key={col}
                            className={`px-3 py-2.5 text-gray-500 font-medium select-none text-xs ${
                              col === '操作' ? 'text-center' : 'text-left'
                            } ${['申请人', '部门', '类型', '开始时间', '结束时间', '时长'].includes(col) ? 'cursor-pointer hover:text-gray-700' : ''}`}
                            onClick={() => {
                              const fieldMap: Record<string, string> = {
                                '申请人': 'name', '部门': 'department', '类型': 'type',
                                '开始时间': 'startDate', '结束时间': 'endDate', '时长': 'duration'
                              }
                              if (fieldMap[col]) toggleSort(fieldMap[col])
                            }}
                          >
                            <span className="inline-flex items-center gap-1">
                              {col}
                              {['申请人', '部门', '类型', '开始时间', '结束时间', '时长'].includes(col) && (
                                <svg className={`w-3 h-3 transition ${sortField === ({
                                  '申请人': 'name', '部门': 'department', '类型': 'type',
                                  '开始时间': 'startDate', '结束时间': 'endDate', '时长': 'duration'
                                }[col]) ? 'text-blue-600' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d={
                                    sortField === ({
                                      '申请人': 'name', '部门': 'department', '类型': 'type',
                                      '开始时间': 'startDate', '结束时间': 'endDate', '时长': 'duration'
                                    }[col]) && sortDir === 'desc'
                                      ? 'M19 9l-7 7-7-7'
                                      : 'M5 15l7-7 7 7'
                                  } />
                                </svg>
                              )}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApprovals.slice((approvalPage - 1) * pageSize, approvalPage * pageSize).map(r => {
                        const allApproved = r.workflow.every(w => w.approved)
                        return (
                        <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-xs">
                                {r.name[0]}
                              </div>
                              <div>
                                <div className="text-gray-700 text-xs">{r.name}</div>
                                <div className="text-gray-400 text-[10px]">{r.empId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 text-xs">{r.department}</td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                              {r.type}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-xs">
                            {r.startDate.slice(5)} {r.startTime}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-xs">
                            {r.endDate.slice(5)} {r.endTime}
                          </td>
                          <td className="px-3 py-2.5 text-gray-700 text-xs">{r.duration}</td>
                          <td className="px-3 py-2.5">
                            <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                              allApproved ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                            }`}>
                              {allApproved ? '已通过' : '待审批'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-0.5">
                              {r.workflow.map((w, j) => (
                                <div
                                  key={j}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium ${
                                    w.approved
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-200 text-gray-500'
                                  }`}
                                  title={w.name}
                                >
                                  {w.name.length > 2 ? w.name[0] : w.name.slice(-1)}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  if (confirm(`确定通过 ${r.name} 的请假申请？`)) {
                                    alert(`已通过 ${r.name} 的申请`)
                                  }
                                }}
                                className="px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-medium hover:bg-green-100 transition"
                              >
                                通过
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`确定驳回 ${r.name} 的请假申请？`)) {
                                    alert(`已驳回 ${r.name} 的申请`)
                                  }
                                }}
                                className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-medium hover:bg-red-100 transition"
                              >
                                驳回
                              </button>
                            </div>
                          </td>
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 分页 */}
              <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-1.5">
                <p className="text-xs text-gray-500">
                  共 {filteredApprovals.length} 条，第 {approvalPage}/{Math.ceil(filteredApprovals.length / pageSize) || 1} 页
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setApprovalPage(p => Math.max(1, p - 1))}
                    disabled={approvalPage === 1}
                    className="px-2 py-0.5 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    上一页
                  </button>
                  {Array.from({ length: Math.ceil(filteredApprovals.length / pageSize) || 1 }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setApprovalPage(p)}
                      className={`w-6 h-6 text-xs rounded transition ${
                        approvalPage === p
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setApprovalPage(p => Math.min(Math.ceil(filteredApprovals.length / pageSize) || 1, p + 1))}
                    disabled={approvalPage === (Math.ceil(filteredApprovals.length / pageSize) || 1)}
                    className="px-2 py-0.5 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== 人员管理 ===== */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => { setUserSearch(e.target.value); setUserPage(1) }}
                    placeholder="搜索姓名 / 工号..."
                    className="flex-1 max-w-xs px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">姓名</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">工号</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">部门</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">职位</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">考勤规则</th>
                        <th className="text-center px-4 py-3 text-gray-500 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = userList.filter(u =>
                          u.name.includes(userSearch) || u.workNum.includes(userSearch)
                        )
                        const pageData = filtered.slice((userPage - 1) * userPageSize, userPage * userPageSize)
                        return pageData.map(u => (
                          <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">{u.name[0]}</div>
                                <span className="text-gray-700 font-medium">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{u.workNum}</td>
                            <td className="px-4 py-3 text-gray-600">{u.department}</td>
                            <td className="px-4 py-3 text-gray-600">{u.position}</td>
                            <td className="px-4 py-3">
                              <select
                                value={userRules[u.id] ?? ''}
                                onChange={e => handleUserRuleChange(u.id, Number(e.target.value))}
                                className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                              >
                                <option value="">未分配</option>
                                {ruleList.map(r => (
                                  <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-xs text-gray-400">行内选择</span>
                            </td>
                          </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-1.5">
                <p className="text-xs text-gray-500">
                  共 {userList.length} 条，第 {userPage}/{Math.ceil(userList.length / userPageSize) || 1} 页
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setUserPage(p => Math.max(1, p - 1))}
                    disabled={userPage === 1}
                    className="px-2 py-0.5 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    上一页
                  </button>
                  {Array.from({ length: Math.ceil(userList.length / userPageSize) || 1 }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setUserPage(p)}
                      className={`w-6 h-6 text-xs rounded transition ${
                        userPage === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setUserPage(p => Math.min(Math.ceil(userList.length / userPageSize) || 1, p + 1))}
                    disabled={userPage === (Math.ceil(userList.length / userPageSize) || 1)}
                    className="px-2 py-0.5 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== 考勤规则 ===== */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setEditingRule(null)
                    setShowRuleForm(true)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  + 新增规则
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">规则名称</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">上班时间</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">下班时间</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">弹性(小时)</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">午休开始</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">午休结束</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">午休(分钟)</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">年假</th>
                        <th className="text-left px-4 py-3 text-gray-500 font-medium">调休</th>
                        <th className="text-center px-4 py-3 text-gray-500 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ruleList.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-gray-400 text-sm">
                            暂无考勤规则，点击上方按钮新增
                          </td>
                        </tr>
                      ) : (
                        ruleList.map(r => (
                          <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                            <td className="px-4 py-3 text-gray-700 font-medium">{r.name}</td>
                            <td className="px-4 py-3 text-gray-600">{r.start_time.slice(0, 5)}</td>
                            <td className="px-4 py-3 text-gray-600">{r.end_time.slice(0, 5)}</td>
                            <td className="px-4 py-3 text-gray-600">{r.flexibility > 0 ? r.flexibility : '—'}</td>
                            <td className="px-4 py-3 text-gray-600">{r.middle_start ? r.middle_start.slice(0, 5) : '—'}</td>
                            <td className="px-4 py-3 text-gray-600">{r.middle_end ? r.middle_end.slice(0, 5) : '—'}</td>
                            <td className="px-4 py-3 text-gray-600">{r.middle_rest > 0 ? r.middle_rest : '—'}</td>
                            <td className="px-4 py-3 text-gray-600">{r.vacation ? '✓' : '—'}</td>
                            <td className="px-4 py-3 text-gray-600">{r.comp ? '✓' : '—'}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => { setEditingRule(r); setShowRuleForm(true) }}
                                  className="text-xs text-blue-600 hover:text-blue-800 transition"
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={() => handleDeleteRule(r.id)}
                                  className="text-xs text-red-500 hover:text-red-700 transition"
                                >
                                  删除
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 新增/编辑弹窗 */}
              {showRuleForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowRuleForm(false)}>
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {editingRule ? '编辑考勤规则' : '新增考勤规则'}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 w-24 shrink-0">规则名称</label>
                        <input
                          type="text"
                          value={ruleForm.name}
                          onChange={e => setRuleForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="如：标准工作制"
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 w-24 shrink-0">上班时间</label>
                        <input
                          type="time"
                          value={ruleForm.start_time}
                          onChange={e => setRuleForm(p => ({ ...p, start_time: e.target.value }))}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 w-24 shrink-0">下班时间</label>
                        <input
                          type="time"
                          value={ruleForm.end_time}
                          onChange={e => setRuleForm(p => ({ ...p, end_time: e.target.value }))}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 w-24 shrink-0">弹性(小时)</label>
                        <input
                          type="number"
                          min="0"
                          value={ruleForm.flexibility}
                          onChange={e => setRuleForm(p => ({ ...p, flexibility: Number(e.target.value) }))}
                          placeholder="0=非弹性"
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 w-24 shrink-0">午休开始</label>
                        <input
                          type="time"
                          value={ruleForm.middle_start}
                          onChange={e => setRuleForm(p => ({ ...p, middle_start: e.target.value }))}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 w-24 shrink-0">午休结束</label>
                        <input
                          type="time"
                          value={ruleForm.middle_end}
                          onChange={e => setRuleForm(p => ({ ...p, middle_end: e.target.value }))}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 w-24 shrink-0">午休(分钟)</label>
                        <input
                          type="number"
                          min="0"
                          value={ruleForm.middle_rest}
                          onChange={e => setRuleForm(p => ({ ...p, middle_rest: Number(e.target.value) }))}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 w-24 shrink-0">年假</label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!ruleForm.vacation}
                            onChange={e => setRuleForm(p => ({ ...p, vacation: e.target.checked ? 1 : 0 }))}
                            className="w-4 h-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500/20"
                          />
                          <span className="text-sm text-gray-500">启用年假额度</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600 w-24 shrink-0">调休</label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!ruleForm.comp}
                            onChange={e => setRuleForm(p => ({ ...p, comp: e.target.checked ? 1 : 0 }))}
                            className="w-4 h-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500/20"
                          />
                          <span className="text-sm text-gray-500">启用调休额度</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        onClick={() => setShowRuleForm(false)}
                        className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleSaveRule}
                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                      >
                        {editingRule ? '保存' : '创建'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== 个人设置 ===== */}
          {activeTab === 'settings' && (
            <div className="max-w-xl space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">个人信息</h3>
            <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                      张
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">张三</p>
                      <p className="text-sm text-gray-500">人事部 · HR经理</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">工号</p>
                      <p className="text-gray-800 font-medium">EMP-2024-001</p>
                    </div>
                    <div>
                      <p className="text-gray-500">邮箱</p>
                      <p className="text-gray-800 font-medium">zhangsan@company.com</p>
                    </div>
                    <div>
                      <p className="text-gray-500">手机</p>
                      <p className="text-gray-800 font-medium">138****5678</p>
                    </div>
                    <div>
                      <p className="text-gray-500">入职日期</p>
                      <p className="text-gray-800 font-medium">2024-03-01</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===== 底部导航栏 (移动端 < lg) ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex items-center justify-around h-16">
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-w-0 transition-colors ${
                activeTab === item.key ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className={`text-[10px] font-medium ${
                activeTab === item.key ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* ===== 门禁记录弹窗 ===== */}
      {showDoorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowDoorModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">🚪 门禁记录 · {doorModalDate}</h3>
              <button onClick={() => setShowDoorModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {[
                { time: '08:32', door: '公司大门', location: '1F 正门', status: '正常' },
                { time: '12:05', door: '食堂大门', location: 'B1 食堂', status: '正常' },
                { time: '13:00', door: '公司大门', location: '1F 正门', status: '正常' },
                { time: '18:10', door: '公司大门', location: '1F 正门', status: '正常' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <p className="text-gray-800 font-medium">{r.time}</p>
                    <p className="text-gray-500 text-xs">{r.door} · {r.location}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    r.status === '正常' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>{r.status}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowDoorModal(false)}
              className="w-full mt-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* ===== 请假提交成功弹窗 ===== */}
      {showLeaveSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowLeaveSuccess(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-5" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">提交成功</h3>
              <p className="text-sm text-gray-500 mb-1">您的请假申请已提交，等待审批。</p>
              <p className="text-sm text-gray-400">类型：{leaveForm.type} | 时长：{duration} 小时</p>
            </div>
            <button
              onClick={() => { setShowLeaveSuccess(false); setLeaveForm({ type: '年假', startDate: '', endDate: '', startTime: '', endTime: '', approver: '', reason: '' }) }}
              className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              知道了
            </button>
          </div>
        </div>
      )}

      {/* ===== 聊天小助手 ===== */}
      {activeTab === 'overview' && (
        <>
          {showChat && (
            <div className="fixed bottom-24 right-6 z-40 w-80 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col" style={{ height: '420px' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">🤖</div>
                  <span className="text-sm font-semibold text-gray-800">考勤小助手</span>
                </div>
                <button onClick={() => setShowChat(false)} className="p-1 rounded hover:bg-gray-100">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 p-3 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && chatInput.trim()) {
                      const text = chatInput.trim()
                      setChatMessages(prev => [...prev, { role: 'user', text }])
                      setChatInput('')
                      setTimeout(() => {
                        const responses = [
                          '本月出勤率 96.7%，整体情况良好。',
                          '目前有 4 位同事正在休假。',
                          '您当前年假剩余 12 小时，调休假 3 小时。',
                          '需要我帮您查看具体的考勤记录吗？',
                          '请假申请可以在左侧"请假申请"页面提交。',
                        ]
                        setChatMessages(prev => [...prev, { role: 'assistant', text: responses[Math.floor(Math.random() * responses.length)] }])
                      }, 600)
                    }
                  }}
                  placeholder="输入消息..."
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (!chatInput.trim()) return
                    const text = chatInput.trim()
                    setChatMessages(prev => [...prev, { role: 'user', text }])
                    setChatInput('')
                    setTimeout(() => {
                      const responses = [
                        '本月出勤率 96.7%，整体情况良好。',
                        '目前有 4 位同事正在休假。',
                        '您当前年假剩余 12 小时，调休假 3 小时。',
                        '需要我帮您查看具体的考勤记录吗？',
                        '请假申请可以在左侧"请假申请"页面提交。',
                      ]
                      setChatMessages(prev => [...prev, { role: 'assistant', text: responses[Math.floor(Math.random() * responses.length)] }])
                    }, 600)
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  发送
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowChat(v => !v)}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center text-xl"
          >
            {showChat ? '✕' : '💬'}
          </button>
        </>
      )}
    </div>
  )
}
