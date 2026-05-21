import TimeSelect from '../components/TimeSelect'

export default function LeaveApply({
  selectedMonth, leaveForm, setLeaveForm, showLeaveSuccess, setShowLeaveSuccess,
  duration, daysInMonth, handleLeaveSubmit, submitting,
}: {
  selectedMonth: string
  leaveForm: { type: string; startDate: string; endDate: string; startTime: string; endTime: string; approver: string; reason: string }
  setLeaveForm: (f: any) => void
  showLeaveSuccess: boolean
  setShowLeaveSuccess: (v: boolean) => void
  duration: number
  daysInMonth: number
  handleLeaveSubmit: (e: React.FormEvent) => void
  submitting?: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">剩余年假</p><p className="text-2xl font-bold text-blue-600 mt-1">12<span className="text-base text-gray-400 ml-0.5">小时</span></p></div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl">🏖️</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">剩余调休假</p><p className="text-2xl font-bold text-amber-600 mt-1">3<span className="text-base text-gray-400 ml-0.5">小时</span></p></div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-xl">🔄</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">请假申请</h3>
        <form onSubmit={handleLeaveSubmit} className="space-y-5">
          <div className="flex items-center gap-3">
            <label className="w-24 text-sm font-medium text-gray-700 shrink-0">请假类型</label>
            <select value={leaveForm.type} onChange={e => setLeaveForm({ ...leaveForm, type: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
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
            <input type="date" value={leaveForm.startDate} onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
              min={`${selectedMonth}-01`} max={`${selectedMonth}-${String(daysInMonth).padStart(2, '0')}`}
              className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            <TimeSelect value={leaveForm.startTime} onChange={v => setLeaveForm({ ...leaveForm, startTime: v })}
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            <label className="text-sm font-medium text-gray-700 shrink-0 ml-1">结束时间</label>
            <input type="date" value={leaveForm.endDate} onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              min={`${selectedMonth}-01`} max={`${selectedMonth}-${String(daysInMonth).padStart(2, '0')}`}
              className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
            <TimeSelect value={leaveForm.endTime} onChange={v => setLeaveForm({ ...leaveForm, endTime: v })}
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-24 text-sm font-medium text-gray-700 shrink-0">时长</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">{duration} 小时</div>
          </div>
          <div className="flex items-start gap-3">
            <label className="w-24 text-sm font-medium text-gray-700 shrink-0 mt-2.5">请假事由</label>
            <textarea value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} rows={3} placeholder="请输入请假事由..." className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" required />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-24 text-sm font-medium text-gray-700 shrink-0">审批人</label>
            <select value={leaveForm.approver} onChange={e => setLeaveForm({ ...leaveForm, approver: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required>
              <option value="" disabled>请选择审批人</option>
              <option value="李四">李四</option>
              <option value="王五">王五</option>
              <option value="赵六">赵六</option>
            </select>
          </div>
          <button type="submit" disabled={submitting} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">{submitting ? '提交中...' : '提交申请'}</button>
        </form>
      </div>

      {showLeaveSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowLeaveSuccess(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-5" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">提交成功</h3>
              <p className="text-sm text-gray-500 mb-1">您的请假申请已提交，等待审批。</p>
              <p className="text-sm text-gray-400">类型：{leaveForm.type} | 时长：{duration} 小时</p>
            </div>
            <button onClick={() => { setShowLeaveSuccess(false); setLeaveForm({ type: '年假', startDate: '', endDate: '', startTime: '', endTime: '', approver: '', reason: '' }) }} className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">知道了</button>
          </div>
        </div>
      )}
    </div>
  )
}
