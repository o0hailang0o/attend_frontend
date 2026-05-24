import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Overview from './Overview'
import Attendance from './Attendance'
import MyLeaves from './MyLeaves'
import Approval from './Approval'
import Users from './Users'
import Rules from './Rules'

type TabKey = 'overview' | 'attendance' | 'myLeaves' | 'approval' | 'users' | 'rules'

const tabsWithMonth: TabKey[] = ['approval', 'myLeaves', 'attendance']

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
  })

  const authUser = (() => {
    try { const u = localStorage.getItem('auth_user'); return u ? JSON.parse(u) : null } catch { return null }
  })()
  const userUuid = authUser?.uuid || ''
  const userName = authUser?.name || authUser?.account || '未知'
  const userDept = authUser?.department || authUser?.deptName || ''

  // Approval
  const [approvalPage, setApprovalPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  // MyLeaves
  const [myLeavePage, setMyLeavePage] = useState(1)

  // Users
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [userRules, setUserRules] = useState<Record<number, string | null>>({})

  const handleLogout = () => {
    localStorage.removeItem('auth_user')
    navigate('/login')
  }

  const handleUserRuleChange = (userId: number, ruleUuid: string) => {
    setUserRules(prev => ({ ...prev, [userId]: ruleUuid }))
  }

  const daysInMonth = new Date(
    parseInt(selectedMonth.split('-')[0]),
    parseInt(selectedMonth.split('-')[1]),
    0
  ).getDate()

  const pageTitles: Record<TabKey, [string, string]> = {
    overview: ['工作台', '欢迎回来，以下是今日公司整体出勤情况。'],
    attendance: ['考勤记录', '查看公司全体员工的考勤记录。'],
    myLeaves: ['个人申请', '查看您提交的请假申请记录。'],
    approval: ['审批列表', '审批和处理员工的请假申请。'],
    users: ['人员管理', '管理员工信息和考勤规则分配。'],
    rules: ['考勤规则', '管理考勤规则，包括上下班时间、午休设置、假期额度等。'],
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-sm">{userName.charAt(0)}</div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-gray-700 leading-tight">{userName}</p>
                {userDept && <p className="text-gray-400 text-xs">{userDept}</p>}
              </div>
            </div>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition ml-2">退出</button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4.1rem)] overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-2 lg:p-4 pb-14 lg:pb-3 overflow-y-auto flex flex-col">
          <div className="mb-1">
            {tabsWithMonth.includes(activeTab) && (
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="text-lg font-bold text-gray-800 border-0 p-0 bg-transparent focus:outline-none focus:ring-0 cursor-pointer mb-1 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            )}
            <h2 className="text-xl font-bold text-gray-800">{pageTitles[activeTab][0]}</h2>
            {pageTitles[activeTab][1] && <p className="text-sm text-gray-500 mt-0">{pageTitles[activeTab][1]}</p>}
          </div>

          {activeTab === 'overview' && <Overview />}
          {activeTab === 'attendance' && <Attendance selectedMonth={selectedMonth} daysInMonth={daysInMonth} />}
          {activeTab === 'myLeaves' && <MyLeaves myLeavePage={myLeavePage} setMyLeavePage={setMyLeavePage} userUuid={userUuid} selectedMonth={selectedMonth} daysInMonth={daysInMonth} />}
          {activeTab === 'approval' && (
            <Approval
              searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              approvalPage={approvalPage} setApprovalPage={setApprovalPage}
            />
          )}
          {activeTab === 'users' && (
            <Users
              userSearch={userSearch} setUserSearch={setUserSearch}
              userPage={userPage} setUserPage={setUserPage}
              userRules={userRules} setUserRules={setUserRules}
              handleUserRuleChange={handleUserRuleChange}
            />
          )}
          {activeTab === 'rules' && <Rules />}
        </main>
      </div>
    </div>
  )
}
