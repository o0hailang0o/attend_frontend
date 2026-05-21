import { useState, useEffect } from 'react'
import { apiFetch } from '../api'
import TimeSelect from '../components/TimeSelect'

const pageSize = 10

const typeNumToLabel: Record<number, string> = { 1: '年假', 2: '事假', 3: '病假', 4: '调休假', 5: '婚假', 6: '产假' }
const leaveTypeMap: Record<string, number> = {
  '年假': 1, '事假': 2, '病假': 3, '调休假': 4, '婚假': 5, '产假': 6,
}
const statusMap: Record<number, { label: string; cls: string }> = {
  1: { label: '待审批', cls: 'bg-amber-50 text-amber-700' },
  2: { label: '已驳回', cls: 'bg-red-50 text-red-700' },
  3: { label: '已撤销', cls: 'bg-gray-50 text-gray-500' },
  9: { label: '未通过', cls: 'bg-red-50 text-red-700' },
}

const blankForm = {
  type: '年假', startDate: '', endDate: '', startTime: '', endTime: '', reason: '',
}

function calcDuration(date: string, time: string, endDate: string, endTime: string): number {
  if (!date || !time || !endDate || !endTime) return 0
  const s = new Date(`${date}T${time}`)
  const e = new Date(`${endDate}T${endTime}`)
  if (e <= s) return 0
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60))
}

function canEdit(status: number) {
  return status === 0 || status === 1
}

export default function MyLeaves({
  myLeavePage, setMyLeavePage, userUuid, selectedMonth, daysInMonth,
}: {
  myLeavePage: number
  setMyLeavePage: (p: number | ((p: number) => number)) => void
  userUuid: string
  selectedMonth: string
  daysInMonth: number
}) {
  const [records, setRecords] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [editingUuid, setEditingUuid] = useState('')
  const [form, setForm] = useState({ ...blankForm })
  const [submitting, setSubmitting] = useState(false)

  const inputCls = 'flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'

  const fetchList = async (page: number) => {
    if (!userUuid) return
    setLoading(true)
    try {
      const qs = new URLSearchParams({ userUuid, month: selectedMonth + '-01', page: String(page), size: String(pageSize) })
      const res = await apiFetch(`/api/apply?${qs}`)
      const d = await res.json()
      if (d.code === 200) {
        setRecords(d.data?.records || [])
        setTotal(d.data?.total || 0)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchList(myLeavePage) }, [userUuid, myLeavePage, selectedMonth])

  const duration = calcDuration(form.startDate, form.startTime, form.endDate, form.endTime)

  const openCreate = () => {
    setEditingUuid('')
    setForm({ ...blankForm })
    setShowModal(true)
  }

  const openEdit = async (uuid: string) => {
    try {
      const res = await apiFetch(`/api/apply/${uuid}`)
      const d = await res.json()
      if (d.code !== 200) throw new Error(d.msg || '获取详情失败')
      const data = d.data
      const typeLabel = typeNumToLabel[data.type] || '年假'
      const sDate = data.startTime ? data.startTime.slice(0, 10) : ''
      const sTime = data.startTime ? data.startTime.slice(11, 16) : ''
      const eDate = data.endTime ? data.endTime.slice(0, 10) : ''
      const eTime = data.endTime ? data.endTime.slice(11, 16) : ''
      setForm({ type: typeLabel, startDate: sDate, startTime: sTime, endDate: eDate, endTime: eTime, reason: '' })
      setEditingUuid(uuid)
      setShowModal(true)
    } catch (err: any) {
      alert(err.message || '获取详情失败')
    }
  }

  const handleCancel = async (uuid: string) => {
    if (!confirm('确认撤销该申请？')) return
    try {
      const res = await apiFetch(`/api/apply/cancel/${uuid}`, { method: 'PUT' })
      const d = await res.json()
      if (d.code !== 200) throw new Error(d.msg || '撤销失败')
      fetchList(myLeavePage)
    } catch (err: any) {
      alert(err.message || '撤销失败')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userUuid) { alert('未获取到用户信息'); return }
    setSubmitting(true)
    try {
      const isEdit = !!editingUuid
      const body: any = {
        month: `${selectedMonth}-01T00:00:00`,
        type: leaveTypeMap[form.type] || 1,
        lengthType: 1,
        startTime: `${form.startDate}T${form.startTime}:00`,
        endTime: `${form.endDate}T${form.endTime}:00`,
        length: duration,
        userUuid,
      }
      if (isEdit) body.uuid = editingUuid
      const res = await apiFetch('/api/apply', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (d.code !== 200) throw new Error(d.msg || '提交失败')
      setShowModal(false)
      setEditingUuid('')
      setForm({ ...blankForm })
      setMyLeavePage(1)
      fetchList(1)
    } catch (err: any) {
      alert(err.message || '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize) || 1

  const fmtDT = (iso: string) => {
    if (!iso) return ''
    const [d, t] = iso.split('T')
    return `${d.slice(5)} ${t.slice(0, 5)}`
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openCreate}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">+ 考勤申请</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {['类型', '开始时间', '结束时间', '时长', '状态', '操作'].map(h => (
                  <th key={h} className={`text-left px-4 py-3 text-gray-500 font-medium ${h === '操作' ? 'text-center' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">加载中...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">暂无申请记录</td></tr>
              ) : (
                records.map((r: any) => {
                  const st = statusMap[r.status] || { label: '未知', cls: 'bg-gray-50 text-gray-500' }
                  const editable = canEdit(r.status)
                  return (
                    <tr key={r.uuid} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{typeNumToLabel[r.type] || r.type}</span></td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDT(r.startTime)}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDT(r.endTime)}</td>
                      <td className="px-4 py-3 text-gray-700">{r.length} 小时</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editable ? (
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEdit(r.uuid)} className="text-xs text-blue-600 hover:text-blue-800 transition">编辑</button>
                            <button onClick={() => handleCancel(r.uuid)} className="text-xs text-red-500 hover:text-red-700 transition">删除</button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">--</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-1.5">
        <p className="text-xs text-gray-500">共 {total} 条，第 {myLeavePage}/{totalPages} 页</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setMyLeavePage(p => Math.max(1, p - 1))} disabled={myLeavePage === 1} className="px-2 py-0.5 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition">上一页</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setMyLeavePage(p)} className={`w-6 h-6 text-xs rounded transition ${myLeavePage === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
          ))}
          <button onClick={() => setMyLeavePage(p => Math.min(totalPages, p + 1))} disabled={myLeavePage === totalPages} className="px-2 py-0.5 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition">下一页</button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-6 p-10 max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{editingUuid ? '编辑申请' : '考勤申请'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="w-24 text-sm font-medium text-gray-700 shrink-0">请假类型</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className={inputCls}>
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
                <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  min={`${selectedMonth}-01`} max={`${selectedMonth}-${String(daysInMonth).padStart(2, '0')}`}
                  className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                <TimeSelect value={form.startTime} onChange={v => setForm(p => ({ ...p, startTime: v }))}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                <label className="text-sm font-medium text-gray-700 shrink-0 ml-1">结束时间</label>
                <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                  min={`${selectedMonth}-01`} max={`${selectedMonth}-${String(daysInMonth).padStart(2, '0')}`}
                  className="w-36 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                <TimeSelect value={form.endTime} onChange={v => setForm(p => ({ ...p, endTime: v }))}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="flex items-center gap-3">
                <label className="w-24 text-sm font-medium text-gray-700 shrink-0">时长</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">{duration} 小时</div>
              </div>
              <div className="flex items-start gap-3">
                <label className="w-24 text-sm font-medium text-gray-700 shrink-0 mt-2.5">请假事由</label>
                <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} rows={3} placeholder="请输入请假事由..." className={`${inputCls} resize-none`} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditingUuid(''); setForm({ ...blankForm }) }} disabled={submitting}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">取消</button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">{submitting ? '提交中...' : (editingUuid ? '保存' : '提交申请')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
