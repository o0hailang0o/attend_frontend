import { useState } from 'react'

const departmentStats = {
  totalEmployees: 128, present: 115, late: 6, absent: 3, onLeave: 4, attendanceRate: '96.7%',
}

const todayRecords = [
  { name: '张三', department: '产品研发部', checkIn: '08:55', checkOut: '18:02', status: '正常' },
  { name: '李四', department: '产品研发部', checkIn: '08:48', checkOut: '17:58', status: '正常' },
  { name: '王五', department: '市场部', checkIn: '09:12', checkOut: '18:30', status: '迟到' },
  { name: '赵六', department: '技术部', checkIn: '--:--', checkOut: '--:--', status: '缺勤' },
  { name: '孙七', department: '人事部', checkIn: '08:58', checkOut: '18:10', status: '正常' },
]

export default function Overview() {
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: '你好！我是考勤小助手，有什么可以帮你的吗？' },
  ])
  const [chatInput, setChatInput] = useState('')

  const addResponse = () => {
    const responses = [
      '本月出勤率 96.7%，整体情况良好。',
      '目前有 4 位同事正在休假。',
      '您当前年假剩余 12 小时，调休假 3 小时。',
      '需要我帮您查看具体的考勤记录吗？',
      '请假申请可以在左侧"请假申请"页面提交。',
    ]
    setChatMessages(prev => [...prev, { role: 'assistant', text: responses[Math.floor(Math.random() * responses.length)] }])
  }

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    setChatMessages(prev => [...prev, { role: 'user', text: text.trim() }])
    setChatInput('')
    setTimeout(addResponse, 600)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['总人数', '已出勤', '迟到', '缺勤', '请假'] as const).map((label, i) => {
          const vals = [departmentStats.totalEmployees, departmentStats.present, departmentStats.late, departmentStats.absent, departmentStats.onLeave]
          const colors = ['text-gray-800', 'text-green-600', 'text-amber-600', 'text-red-600', 'text-blue-600']
          return (
            <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${colors[i]}`}>{vals[i]}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">今日出勤率</p><p className="text-2xl font-bold text-green-600 mt-1">{departmentStats.attendanceRate}</p></div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-xl">📈</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">本月迟到总人次</p><p className="text-2xl font-bold text-gray-800 mt-1">23</p></div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-xl">⏰</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">本月缺勤总人次</p><p className="text-2xl font-bold text-red-600 mt-1">8</p></div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-xl">⚠️</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-semibold text-gray-800">今日考勤明细</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {['姓名', '部门', '签到', '签退', '状态'].map(h => <th key={h} className="text-left px-6 py-3 text-gray-500 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {todayRecords.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-gray-700">{r.name}</td>
                  <td className="px-6 py-3 text-gray-700">{r.department}</td>
                  <td className="px-6 py-3 text-gray-700">{r.checkIn}</td>
                  <td className="px-6 py-3 text-gray-700">{r.checkOut}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.status === '正常' ? 'bg-green-50 text-green-700' : r.status === '迟到' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showChat && (
        <div className="fixed bottom-24 right-6 z-40 w-80 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col" style={{ height: '420px' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">🤖</div>
              <span className="text-sm font-semibold text-gray-800">考勤小助手</span>
            </div>
            <button onClick={() => setShowChat(false)} className="p-1 rounded hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{msg.text}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 p-3 flex gap-2">
            <input
              type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(chatInput) }}
              placeholder="输入消息..." className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button onClick={() => sendMessage(chatInput)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">发送</button>
          </div>
        </div>
      )}
      <button
        onClick={() => setShowChat(v => !v)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center text-xl"
      >
        {showChat ? '✕' : '💬'}
      </button>
    </div>
  )
}
