import { useState, useEffect } from 'react'
import TimeSelect from '../components/TimeSelect'
import { apiFetch } from '../api'

type RuleItem = {
  id: number; uuid: string; name: string; flexibility: number
  start_time: string; end_time: string
  middle_rest: number; middle_start: string; middle_end: string
  vacation: number; comp: number
}

const blankRule = {
  uuid: '', name: '', flexibility: 0, start_time: '09:00', end_time: '18:00',
  middle_rest: 1, middle_start: '', middle_end: '', vacation: 1, comp: 1,
}

const toCamel = (f: any) => ({
  name: f.name,
  flexibility: f.flexibility,
  startTime: f.start_time || null,
  endTime: f.end_time || null,
  middleRest: f.middle_rest > 0 ? 1 : 0,
  middleStart: f.middle_start || null,
  middleEnd: f.middle_end || null,
  vacation: f.vacation,
  comp: f.comp,
  accuracy: 0.5,
})

const fromCamel = (b: any): RuleItem => ({
  id: b.id,
  uuid: b.uuid || '',
  name: b.name,
  flexibility: b.flexibility ?? 0,
  start_time: b.startTime || '',
  end_time: b.endTime || '',
  middle_rest: b.middleRest ?? 0,
  middle_start: b.middleStart || '',
  middle_end: b.middleEnd || '',
  vacation: b.vacation ?? 0,
  comp: b.comp ?? 0,
})

const fetchAll = async (): Promise<RuleItem[]> => {
  try {
    const res = await apiFetch('/api/rule')
    const d = await res.json()
    if (d.code === 200) return (d.data || []).map(fromCamel)
  } catch {}
  return []
}

const fetchOne = async (uuid: string): Promise<RuleItem | null> => {
  try {
    const res = await apiFetch(`/api/rule/${uuid}`)
    const d = await res.json()
    if (d.code === 200) return fromCamel(d.data)
  } catch {}
  return null
}

export default function Rules() {
  const [ruleList, setRuleList] = useState<RuleItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<RuleItem | null>(null)
  const [form, setForm] = useState({ ...blankRule })
  const [saving, setSaving] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const refresh = async () => setRuleList(await fetchAll())

  useEffect(() => { refresh() }, [])

  const openEdit = async (r: RuleItem) => {
    setLoadingEdit(true)
    setError('')
    setFieldErrors({})
    const data = await fetchOne(r.uuid)
    if (data) {
      setForm({
        uuid: data.uuid, name: data.name, flexibility: data.flexibility,
        start_time: data.start_time, end_time: data.end_time,
        middle_rest: data.middle_rest, middle_start: data.middle_start, middle_end: data.middle_end,
        vacation: data.vacation, comp: data.comp,
      })
      setEditing(data)
      setShowForm(true)
    } else {
      setEditing(null)
      setError('获取规则详情失败')
      setShowForm(false)
    }
    setLoadingEdit(false)
  }

  const set = (k: string, v: any) => {
    setForm(p => ({ ...p, [k]: v }))
    setFieldErrors(p => ({ ...p, [k]: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = '请输入规则名称'
    if (!form.start_time.trim()) errs.start_time = '请选择上班时间'
    if (!form.end_time.trim()) errs.end_time = '请选择下班时间'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const inputCls = (k: string) =>
    `flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition ${fieldErrors[k] ? 'border-red-400' : 'border-gray-200'}`

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    setError('')
    try {
      const body = editing ? { ...toCamel(form), uuid: editing.uuid } : toCamel(form)
      const res = await apiFetch('/api/rule', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const d = await res.json()
      if (d.code !== 200) throw new Error(d.msg || '保存失败')
      setShowForm(false)
      setEditing(null)
      setForm({ ...blankRule })
      setFieldErrors({})
      await refresh()
    } catch (e: any) {
      setError(e.message || '请求失败，请检查后端是否启动')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (uuid: string) => {
    if (!confirm('确认删除该考勤规则？')) return
    try {
      const res = await apiFetch(`/api/rule/${uuid}`, { method: 'DELETE' })
      const d = await res.json()
      if (d.code === 200) await refresh()
    } catch {}
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditing(null); setShowForm(true) }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">+ 新增规则</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {['规则名称', '上班时间', '下班时间', '弹性(小时)', '午休开始', '午休结束', '计入工时', '年假', '调休', '操作'].map(h => (
                  <th key={h} className={`px-4 py-3 text-gray-500 font-medium ${h === '操作' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ruleList.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400 text-sm">暂无考勤规则，点击上方按钮新增</td></tr>
              ) : (
                ruleList.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-700 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.start_time.slice(0, 5)}</td>
                    <td className="px-4 py-3 text-gray-600">{r.end_time.slice(0, 5)}</td>
                    <td className="px-4 py-3 text-gray-600">{r.flexibility > 0 ? r.flexibility : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.middle_start ? r.middle_start.slice(0, 5) : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.middle_end ? r.middle_end.slice(0, 5) : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.middle_rest ? '✓' : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.vacation ? '✓' : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{r.comp ? '✓' : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(r)} className="text-xs text-blue-600 hover:text-blue-800 transition">编辑</button>
                        <button onClick={() => handleDelete(r.uuid)} className="text-xs text-red-500 hover:text-red-700 transition">删除</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {loadingEdit ? '加载中...' : (editing ? '编辑考勤规则' : '新增考勤规则')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-24 shrink-0">规则名称</label>
                <div className="flex-1">
                  <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="如：标准工作制" className={inputCls('name')} />
                  {fieldErrors.name && <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-24 shrink-0">上班时间</label>
                <div className="flex-1">
                  <TimeSelect value={form.start_time} onChange={v => set('start_time', v)} className={inputCls('start_time')} />
                  {fieldErrors.start_time && <p className="text-xs text-red-400 mt-1">{fieldErrors.start_time}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-24 shrink-0">下班时间</label>
                <div className="flex-1">
                  <TimeSelect value={form.end_time} onChange={v => set('end_time', v)} className={inputCls('end_time')} />
                  {fieldErrors.end_time && <p className="text-xs text-red-400 mt-1">{fieldErrors.end_time}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-24 shrink-0">午休开始</label>
                <TimeSelect value={form.middle_start} onChange={v => set('middle_start', v)} className={inputCls('middle_start')} />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-24 shrink-0">午休结束</label>
                <TimeSelect value={form.middle_end} onChange={v => set('middle_end', v)} className={inputCls('middle_end')} />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-24 shrink-0">弹性(小时)</label>
                <input type="number" min="0" value={form.flexibility} onChange={e => set('flexibility', Number(e.target.value))} placeholder="0=非弹性" className={inputCls('flexibility')} />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-24 shrink-0">计入工时</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!form.middle_rest} onChange={e => set('middle_rest', e.target.checked ? 1 : 0)} className="w-4 h-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500/20" />
                  <span className="text-sm text-gray-500">午休不计入上班时间</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-24 shrink-0">年假</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!form.vacation} onChange={e => set('vacation', e.target.checked ? 1 : 0)} className="w-4 h-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500/20" />
                  <span className="text-sm text-gray-500">启用年假额度</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-24 shrink-0">调休</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!form.comp} onChange={e => set('comp', e.target.checked ? 1 : 0)} className="w-4 h-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500/20" />
                  <span className="text-sm text-gray-500">启用调休额度</span>
                </label>
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowForm(false)} disabled={saving} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">取消</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">{saving ? '保存中...' : (editing ? '保存' : '创建')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
