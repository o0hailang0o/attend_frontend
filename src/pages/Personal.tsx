import { useState } from 'react'

const checkIns = ['08:48', '08:52', '08:55', '08:50', '08:58']
const checkOuts = ['18:02', '17:58', '18:05', '18:10', '17:55']

const monthlyRecords = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1
  const date = `2026-05-${String(day).padStart(2, '0')}`
  if (day % 7 === 0) return { date, day, checkIn: '--:--', checkOut: '--:--', status: '缺勤' as const }
  if (day % 5 === 0) return { date, day, checkIn: '09:15', checkOut: '18:30', status: '迟到' as const }
  return { date, day, checkIn: checkIns[i % 5], checkOut: checkOuts[i % 5], status: '正常' as const }
})

export default function Personal({ selectedMonth }: { selectedMonth: string }) {
  const [showDoorModal, setShowDoorModal] = useState(false)
  const [doorModalDate, setDoorModalDate] = useState('')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">年假余额</p><p className="text-3xl font-bold text-blue-600 mt-1">12<span className="text-lg text-gray-400 ml-0.5">小时</span></p></div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">🏖️</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">调休假余额</p><p className="text-3xl font-bold text-amber-600 mt-1">3<span className="text-lg text-gray-400 ml-0.5">小时</span></p></div>
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
                {['日期', '签到', '签退', '单日工作时长', '状态', '操作'].map(h => (
                  <th key={h} className={`px-4 py-3 text-gray-500 font-medium ${h === '单日工作时长' || h === '状态' ? 'text-center' : 'text-left'} ${h === '操作' ? 'text-right' : ''}`}>{h}</th>
                ))}
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
                    return ((h2 * 60 + m2 - h1 * 60 - m1) / 60).toFixed(1) + '小时'
                  })()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.status === '正常' ? 'bg-green-50 text-green-700' : r.status === '迟到' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setDoorModalDate(r.date); setShowDoorModal(true) }} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition">🚪 门禁</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDoorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowDoorModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">🚪 门禁记录 · {doorModalDate}</h3>
              <button onClick={() => setShowDoorModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
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
                  <div><p className="text-gray-800 font-medium">{r.time}</p><p className="text-gray-500 text-xs">{r.door} · {r.location}</p></div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.status === '正常' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{r.status}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowDoorModal(false)} className="w-full mt-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition">关闭</button>
          </div>
        </div>
      )}
    </div>
  )
}
