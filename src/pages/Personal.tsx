import { useState, useEffect } from 'react'
import { apiFetch } from '../api'

export default function Personal({ selectedMonth, userUuid }: { selectedMonth: string; userUuid: string }) {
  const [records, setRecords] = useState<any[]>([])
  const [vacationBalance, setVacationBalance] = useState(0)
  const [overtimeBalance, setOvertimeBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  const [showDoorModal, setShowDoorModal] = useState(false)
  const [doorModalDate, setDoorModalDate] = useState('')
  const [doorRecords, setDoorRecords] = useState<any[]>([])
  const [doorLoading, setDoorLoading] = useState(false)

  useEffect(() => {
    if (!userUuid) return
    const fetchAttendance = async () => {
      setLoading(true)
      try {
        const qs = new URLSearchParams({ userUuid, month: selectedMonth + '-01' })
        const res = await apiFetch(`/api/attendance/personal?${qs}`)
        const d = await res.json()
        if (d.code === 200) {
          setRecords(d.data?.records || d.data || [])
          if (d.data?.vacationBalance !== undefined) setVacationBalance(d.data.vacationBalance)
          if (d.data?.overtimeBalance !== undefined) setOvertimeBalance(d.data.overtimeBalance)
        } else { setRecords([]) }
      } catch { setRecords([]) }
      setLoading(false)
    }
    fetchAttendance()
  }, [userUuid, selectedMonth])

  const openDoorModal = async (date: string) => {
    setDoorModalDate(date)
    setShowDoorModal(true)
    setDoorLoading(true)
    try {
      const qs = new URLSearchParams({ userUuid, date })
      const res = await apiFetch(`/api/door/record?${qs}`)
      const d = await res.json()
      setDoorRecords(d.code === 200 ? (d.data || []) : [])
    } catch { setDoorRecords([]) }
    setDoorLoading(false)
  }

  const fmtStatus = (s: any) => {
    if (s === 0 || s === '正常') return '正常'
    if (s === 1 || s === '迟到') return '迟到'
    if (s === 2 || s === '缺勤') return '缺勤'
    return '--'
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">年假余额</p><p className="text-3xl font-bold text-blue-600 mt-1">{vacationBalance}<span className="text-lg text-gray-400 ml-0.5">小时</span></p></div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">🏖️</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">调休假余额</p><p className="text-3xl font-bold text-amber-600 mt-1">{overtimeBalance}<span className="text-lg text-gray-400 ml-0.5">小时</span></p></div>
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
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">加载中...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">暂无考勤记录</td></tr>
              ) : (
                records.map((r: any, i: number) => {
                  const st = fmtStatus(r.status)
                  return (
                    <tr key={r.date || i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-700">{r.date}</td>
                      <td className="px-4 py-3 text-gray-700">{r.checkIn || '--:--'}</td>
                      <td className="px-4 py-3 text-gray-700">{r.checkOut || '--:--'}</td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {r.workHours != null ? `${r.workHours}小时` : (
                          st === '缺勤' || !r.checkIn || r.checkIn === '--:--' ? '--' : (() => {
                            const [h1, m1] = r.checkIn.split(':').map(Number)
                            const [h2, m2] = r.checkOut.split(':').map(Number)
                            return ((h2 * 60 + m2 - h1 * 60 - m1) / 60).toFixed(1) + '小时'
                          })()
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${st === '正常' ? 'bg-green-50 text-green-700' : st === '迟到' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{st}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openDoorModal(r.date)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition">🚪 门禁</button>
                      </td>
                    </tr>
                  )
                })
              )}
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
              {doorLoading ? (
                <p className="text-center text-gray-400 text-sm py-4">加载中...</p>
              ) : doorRecords.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">暂无门禁记录</p>
              ) : (
                doorRecords.map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                    <div><p className="text-gray-800 font-medium">{r.time || r.recordTime || '--:--'}</p><p className="text-gray-500 text-xs">{r.door || r.doorName || '--'} · {r.location || '--'}</p></div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${(r.status === 0 || r.status === '正常') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{r.status === 0 || r.status === '正常' ? '正常' : '异常'}</span>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setShowDoorModal(false)} className="w-full mt-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition">关闭</button>
          </div>
        </div>
      )}
    </div>
  )
}
