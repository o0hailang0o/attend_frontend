type TabKey = 'overview' | 'attendance' | 'myLeaves' | 'approval' | 'users' | 'rules'

const menuItems: { key: TabKey; label: string; icon: string }[] = [
  { key: 'overview', label: '工作台', icon: '📊' },
  { key: 'rules', label: '考勤规则', icon: '📏' },
  { key: 'users', label: '人员管理', icon: '👥' },
  { key: 'attendance', label: '考勤记录', icon: '📋' },
  { key: 'approval', label: '我的审批', icon: '✅' },
  { key: 'myLeaves', label: '个人申请', icon: '📄' },
]

export default function Sidebar({
  activeTab, setActiveTab,
}: {
  activeTab: TabKey
  setActiveTab: (t: TabKey) => void
}) {
  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200 flex-shrink-0">
        <nav className="p-4 space-y-0.5 mt-4">
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === item.key ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex items-center justify-around h-16">
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-w-0 transition-colors ${activeTab === item.key ? 'text-blue-600' : 'text-gray-500'}`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className={`text-[10px] font-medium ${activeTab === item.key ? 'text-blue-600' : 'text-gray-400'}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
