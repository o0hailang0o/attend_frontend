import { useState, useEffect } from 'react'
import { apiFetch } from '../api'

type UserItem = {
  id: number; uuid: string; name: string; workNum: string; deptName: string; deptUuid: string; position: string; positionUuid: string; ruleUuid?: string
}

const blankForm = {
  uuid: '', name: '', account: '', password: '', workNum: '',
  deptName: '', deptUuid: '', level: '',
  position: '', positionUuid: '', gender: 1, ruleUuid: '',
}

const userPageSize = 10

export default function Users({
  userSearch, setUserSearch, userPage, setUserPage,
  userRules, setUserRules, handleUserRuleChange,
}: {
  userSearch: string
  setUserSearch: (v: string) => void
  userPage: number
  setUserPage: (p: number | ((p: number) => number)) => void
  userRules: Record<number, string | null>
  setUserRules: React.Dispatch<React.SetStateAction<Record<number, string | null>>>
  handleUserRuleChange: (userId: number, ruleUuid: string) => void
}) {
  const [rules, setRules] = useState<{ id: number; uuid: string; name: string }[]>([])
  const [deptList, setDeptList] = useState<{ uuid: string; name: string }[]>([])
  const [posList, setPosList] = useState<{ uuid: string; name: string }[]>([])
  const [allUsers, setAllUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)
  const [deptFilter, setDeptFilter] = useState('')
  const [posFilter, setPosFilter] = useState('')
  const [ruleFilter, setRuleFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [batchRuleVal, setBatchRuleVal] = useState('')
  const [batchMsg, setBatchMsg] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<UserItem | null>(null)
  const [form, setForm] = useState({ ...blankForm })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/api/rule')
      .then(r => r.json())
      .then(d => { if (d.code === 200) setRules(d.data || []) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    apiFetch('/api/dept')
      .then(r => r.json())
      .then(d => { if (d.code === 200) setDeptList(d.data || []) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    apiFetch('/api/position')
      .then(r => r.json())
      .then(d => { if (d.code === 200) setPosList(d.data || []) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (allUsers.length && rules.length) {
      setUserRules(prev => {
        const next = { ...prev }
        allUsers.forEach(u => {
          if (u.ruleUuid && !(u.id in prev)) {
            next[u.id] = u.ruleUuid
          }
        })
        return next
      })
    }
  }, [allUsers, rules])

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const qs = new URLSearchParams()
        if (userSearch) qs.set('name', userSearch)
        if (deptFilter) qs.set('deptUuid', deptFilter)
        if (posFilter) qs.set('positionUuid', posFilter)
        if (ruleFilter) qs.set('ruleUuid', ruleFilter)
        const res = await apiFetch(`/api/sysuser?${qs}`)
        const d = await res.json()
        if (d.code === 200) {
          setAllUsers(d.data?.records || d.data || [])
        } else { setAllUsers([]) }
      } catch { setAllUsers([]) }
      setLoading(false)
    }
    fetchUsers()
  }, [userSearch, deptFilter, posFilter, ruleFilter])

  const totalPages = Math.ceil(allUsers.length / userPageSize) || 1
  const currentPageUsers = allUsers.slice((userPage - 1) * userPageSize, userPage * userPageSize)

  const allSelected = allUsers.length > 0 && allUsers.every(u => selectedIds.has(u.id))
  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(allUsers.map(u => u.id)))
  }
  const toggleOne = (id: number) => {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }

  const handleBatchApply = async () => {
    console.log('handleBatchApply called', { batchRuleVal, selectedIds: [...selectedIds], allUsers })
    if (!batchRuleVal) return
    const uuids = allUsers.filter(u => selectedIds.has(u.id)).map(u => u.uuid)
    if (!uuids.length) return
    const rule = rules.find(r => r.uuid === batchRuleVal)
    try {
      const res = await apiFetch('/api/sysuser/batch/rule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuids, ruleUuid: batchRuleVal, ruleName: rule?.name || '' }),
      })
      const d = await res.json()
      if (d.code !== 200) throw new Error(d.msg || '批量修改失败')
      uuids.forEach(uuid => {
        const user = allUsers.find(u => u.uuid === uuid)
        if (user) handleUserRuleChange(user.id, batchRuleVal)
      })
      setBatchMsg(`已为 ${selectedIds.size} 人分配规则`)
      setSelectedIds(new Set())
      setBatchRuleVal('')
    } catch (e: any) {
      setBatchMsg(e.message || '请求失败')
    }
    setTimeout(() => setBatchMsg(''), 2500)
  }

  const resetFilters = () => {
    setUserSearch('')
    setDeptFilter('')
    setPosFilter('')
    setRuleFilter('')
    setUserPage(1)
  }

  const openEdit = async (u: UserItem) => {
    setError('')
    try {
      const res = await apiFetch(`/api/sysuser/${u.uuid}`)
      const d = await res.json()
      if (d.code === 200) {
        const data = d.data
        setForm({
          uuid: data.uuid || '', name: data.name || '', account: data.account || '',
          password: '', workNum: data.workNum || '',
          deptName: data.deptName || '', deptUuid: data.deptUuid || '',
          level: data.level || '',
          position: data.position || '', positionUuid: data.positionUuid || '',
          gender: data.gender ?? 1,
          ruleUuid: data.ruleUuid ?? '',
        })
        setEditing(u)
        setShowForm(true)
      } else {
        setError('获取用户详情失败')
      }
    } catch {
      setError('获取用户详情失败')
    }
  }

  const handleDeptChange = (deptUuid: string) => {
    const dept = deptList.find(d => d.uuid === deptUuid)
    setForm(p => ({ ...p, deptUuid, deptName: dept?.name || '' }))
  }

  const handlePosChange = (positionUuid: string) => {
    const pos = posList.find(d => d.uuid === positionUuid)
    setForm(p => ({ ...p, positionUuid, position: pos?.name || '' }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('请输入姓名'); return }
    if (!form.account.trim()) { setError('请输入账号'); return }
    setSaving(true)
    setError('')
    try {
      const { ruleUuid, ...rest } = form
      let body: any = editing
        ? { id: editing.id, ...rest, ruleUuid }
        : { ...rest, ruleUuid }
      if (!body.password) delete body.password
      const res = await apiFetch('/api/sysuser', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const d = await res.json()
      if (d.code !== 200) throw new Error(d.msg || '保存失败')
      setShowForm(false)
      setEditing(null)
      setForm({ ...blankForm })
      if (editing && ruleUuid) {
        handleUserRuleChange(editing.id, ruleUuid)
      }
      setUserPage(1)
      const qs = new URLSearchParams()
      if (userSearch) qs.set('name', userSearch)
      if (deptFilter) qs.set('deptUuid', deptFilter)
      if (posFilter) qs.set('positionUuid', posFilter)
      if (ruleFilter) qs.set('ruleUuid', ruleFilter)
      const ref = await apiFetch(`/api/sysuser?${qs}`)
      const rd = await ref.json()
      if (rd.code === 200) {
        setAllUsers(rd.data?.records || rd.data || [])
      }
    } catch (e: any) {
      setError(e.message || '请求失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (u: UserItem) => {
    if (!confirm(`确认删除用户「${u.name}」？`)) return
    try {
      const res = await apiFetch(`/api/sysuser/${u.uuid}`, { method: 'DELETE' })
      const d = await res.json()
      if (d.code === 200) {
        setUserPage(1)
        const qs = new URLSearchParams()
        if (userSearch) qs.set('name', userSearch)
        if (deptFilter) qs.set('deptUuid', deptFilter)
        if (posFilter) qs.set('positionUuid', posFilter)
        if (ruleFilter) qs.set('ruleUuid', ruleFilter)
        const ref = await apiFetch(`/api/sysuser?${qs}`)
        const rd = await ref.json()
        if (rd.code === 200) {
          setAllUsers(rd.data?.records || rd.data || [])
        }
      }
    } catch {}
  }

  const inputCls = 'flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition'
  const selectCls = 'px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400'

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditing(null); setForm({ ...blankForm }); setError(''); setShowForm(true) }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">+ 新增人员</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <input type="text" value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1) }}
            placeholder="搜索姓名..." className="flex-1 min-w-[160px] max-w-xs px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />

          <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setUserPage(1) }} className={selectCls}>
            <option value="">全部部门</option>
            {deptList.map(d => <option key={d.uuid} value={d.uuid}>{d.name}</option>)}
          </select>

          <select value={posFilter} onChange={e => { setPosFilter(e.target.value); setUserPage(1) }} className={selectCls}>
            <option value="">全部职位</option>
            {posList.map(p => <option key={p.uuid} value={p.uuid}>{p.name}</option>)}
          </select>

          <select value={ruleFilter} onChange={e => { setRuleFilter(e.target.value); setUserPage(1) }} className={selectCls}>
            <option value="">全部规则</option>
            {rules.map(r => <option key={r.id} value={r.uuid}>{r.name}</option>)}
          </select>

          {(userSearch || deptFilter || posFilter || ruleFilter) && (
            <button onClick={resetFilters} className="text-xs text-blue-600 hover:text-blue-800 transition whitespace-nowrap">清除筛选</button>
          )}

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-gray-500">已选 {selectedIds.size} 人</span>
              <select value={batchRuleVal} onChange={e => setBatchRuleVal(e.target.value)} className={selectCls}>
                <option value="">批量修改规则</option>
                {rules.map(r => <option key={r.id} value={r.uuid}>{r.name}</option>)}
              </select>
              <button onClick={handleBatchApply} disabled={!batchRuleVal} className={`text-xs px-2 py-1 rounded-lg transition ${batchRuleVal ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-400 bg-gray-100'}`}>应用</button>
              {batchMsg && <span className="text-xs text-green-600">{batchMsg}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20" />
                </th>
                {['姓名', '工号', '部门', '职位', '考勤规则', '操作'].map(h => (
                  <th key={h} className={`px-4 py-3 text-gray-500 font-medium ${h === '操作' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">加载中...</td></tr>
              ) : allUsers.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">无匹配人员</td></tr>
              ) : (
                currentPageUsers.map(u => (
                  <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50 transition ${selectedIds.has(u.id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleOne(u.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">{u.name?.[0]}</div>
                        <span className="text-gray-700 font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.workNum}</td>
                    <td className="px-4 py-3 text-gray-600">{u.deptName}</td>
                    <td className="px-4 py-3 text-gray-600">{u.position}</td>
                    <td className="px-4 py-3">
                      <select value={userRules[u.id] ?? ''} onChange={e => handleUserRuleChange(u.id, e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400">
                        <option value="">未分配</option>
            {rules.map(r => <option key={r.id} value={r.uuid}>{r.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(u)} className="text-xs text-blue-600 hover:text-blue-800 transition">编辑</button>
                        <button onClick={() => handleDelete(u)} className="text-xs text-red-500 hover:text-red-700 transition">删除</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 px-3 py-1.5">
        <p className="text-xs text-gray-500">共 {allUsers.length} 条，第 {userPage}/{totalPages} 页</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="px-2 py-0.5 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition">上一页</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setUserPage(p)} className={`w-6 h-6 text-xs rounded transition ${userPage === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
          ))}
          <button onClick={() => setUserPage(p => Math.min(totalPages, p + 1))} disabled={userPage === totalPages} className="px-2 py-0.5 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition">下一页</button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{editing ? '编辑人员' : '新增人员'}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-20 shrink-0">姓名</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="请输入姓名" className={inputCls} />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-20 shrink-0">账号</label>
                <input type="text" value={form.account} onChange={e => setForm(p => ({ ...p, account: e.target.value }))} placeholder="登录账号" className={inputCls} />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-20 shrink-0">工号</label>
                <input type="text" value={form.workNum} onChange={e => setForm(p => ({ ...p, workNum: e.target.value }))} placeholder="如 EMP-2024-001" className={inputCls} />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-20 shrink-0">部门</label>
                <select value={form.deptUuid} onChange={e => handleDeptChange(e.target.value)} className={inputCls}>
                  <option value="">请选择部门</option>
                  {deptList.map(d => <option key={d.uuid} value={d.uuid}>{d.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-20 shrink-0">职位</label>
                <select value={form.positionUuid} onChange={e => handlePosChange(e.target.value)} className={inputCls}>
                  <option value="">请选择职位</option>
                  {posList.map(p => <option key={p.uuid} value={p.uuid}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-20 shrink-0">密码</label>
                <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder={editing ? '留空则不修改' : '请输入密码'} className={inputCls} />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-20 shrink-0">考勤规则</label>
                <select value={form.ruleUuid} onChange={e => setForm(p => ({ ...p, ruleUuid: e.target.value }))} className={inputCls}>
                  <option value="">未分配</option>
                  {rules.map(r => <option key={r.uuid} value={r.uuid}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 w-20 shrink-0">性别</label>
                <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: Number(e.target.value) }))} className={inputCls}>
                  <option value={1}>男</option>
                  <option value={0}>女</option>
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
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
