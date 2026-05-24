import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../api'

type UserItem = { uuid: string; name: string; workNum: string; deptName: string }
type DoorAccessItem = { uuid: string; employeeUuid: string; employeeName: string; workNum: string; doorNo: string; direction: number; accessTime: string; accessDate: string }

const getCurrentUserUuid = () => {
  try { const u = localStorage.getItem('auth_user'); return u ? (JSON.parse(u).uuid || '') : '' } catch { return '' }
}

export default function Attendance({ selectedMonth, daysInMonth }: { selectedMonth: string; daysInMonth: number }) {
  const [users, setUsers] = useState<UserItem[]>([])
  const [selectedUser, setSelectedUser] = useState(getCurrentUserUuid)
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [leaveBalance, setLeaveBalance] = useState<{ annualRemainingHours: number; compRemainingHours: number } | null>(null)

  const [searchText, setSearchText] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  const [showDoorModal, setShowDoorModal] = useState(false)
  const [doorRecords, setDoorRecords] = useState<DoorAccessItem[]>([])
  const [doorModalLoading, setDoorModalLoading] = useState(false)
  const [doorModalTitle, setDoorModalTitle] = useState('')

  const userMap = new Map(users.map(u => [u.uuid, u]))

  const filteredUsers = users.filter(u => u.name.includes(searchText) || u.workNum.includes(searchText))

  const closeUserDropdown = () => setTimeout(() => setShowUserDropdown(false), 150)

  useEffect(() => {
    apiFetch('/api/sysuser')
      .then(r => r.json())
      .then(d => {
        if (d.code === 200) {
          const list = d.data?.records || d.data || []
          setUsers(list)
          if (selectedUser) {
            const u = list.find((x: any) => x.uuid === selectedUser)
            if (u) setSearchText(u.name)
          }
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedUser) { setLeaveBalance(null); return }
    apiFetch(`/api/leaveBalance/byUser?userUuid=${selectedUser}`)
      .then(r => r.json())
      .then(d => { if (d.code === 200) setLeaveBalance(d.data) })
      .catch(() => setLeaveBalance(null))
  }, [selectedUser])

  const startDate = `${selectedMonth}-01`
  const endDate = `${selectedMonth}-${String(daysInMonth).padStart(2, '0')}`

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true)
      try {
        const qs = new URLSearchParams({ startDate, endDate })
        if (selectedUser) qs.set('employeeUuid', selectedUser)
        const res = await apiFetch(`/api/dailyAttendance?${qs}`)
        const d = await res.json()
        if (d.code === 200) setRecords(d.data || [])
      } catch {}
      setLoading(false)
    }
    fetchRecords()
  }, [selectedUser, selectedMonth])

  const statusMap: Record<number, { label: string; cls: string }> = {
    1: { label: '正常', cls: 'bg-green-50 text-green-700' },
    2: { label: '迟到', cls: 'bg-amber-50 text-amber-700' },
    3: { label: '早退', cls: 'bg-orange-50 text-orange-700' },
    4: { label: '缺勤', cls: 'bg-red-50 text-red-700' },
    5: { label: '补正', cls: 'bg-purple-50 text-purple-700' },
  }
  const getStatus = (r: any) => r.statusName ? { label: r.statusName, cls: statusMap[r.status]?.cls || 'bg-gray-50 text-gray-500' } : (statusMap[r.status] || statusMap[1])

  const [calculating, setCalculating] = useState(false)

  const handleRecalculate = async () => {
    if (!confirm(`确认重新计算 ${selectedMonth} 的考勤数据？`)) return
    setCalculating(true)
    try {
      await apiFetch(`/api/dailyAttendance/calculate?startDate=${startDate}&endDate=${endDate}${selectedUser ? `&userUuid=${selectedUser}` : ''}`, { method: 'POST' })
      setCalculating(false)
      const qs = new URLSearchParams({ startDate, endDate })
      if (selectedUser) qs.set('employeeUuid', selectedUser)
      const res = await apiFetch(`/api/dailyAttendance?${qs}`)
      const d = await res.json()
      if (d.code === 200) setRecords(d.data || [])
    } catch { setCalculating(false) }
  }

  const fmtTime = (t: string | null) => {
    if (!t) return '--:--'
    return t.slice(0, 5)
  }

  const openDoorAccess = async (employeeUuid: string, employeeName: string, date: string) => {
    setDoorModalTitle(`${employeeName} - ${date}`)
    setDoorModalLoading(true)
    setShowDoorModal(true)
    try {
      const res = await apiFetch(`/api/doorAccess?employeeUuid=${employeeUuid}&date=${date}`)
      const d = await res.json()
      if (d.code === 200) setDoorRecords(d.data || [])
      else setDoorRecords([])
    } catch { setDoorRecords([]) }
    setDoorModalLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">剩余年假</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {leaveBalance !== null ? leaveBalance.annualRemainingHours : '...'}
                <span className="text-base text-gray-400 ml-0.5">小时</span>
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">剩余调休假</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {leaveBalance !== null ? leaveBalance.compRemainingHours : '...'}
                <span className="text-base text-gray-400 ml-0.5">小时</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1" ref={searchRef}>
            <input
              type="text"
              value={searchText}
              onChange={e => {
                setSearchText(e.target.value)
                setShowUserDropdown(true)
                if (searchRef.current) {
                  const r = searchRef.current.getBoundingClientRect()
                  setDropdownStyle({ position: 'fixed', left: r.left, top: r.bottom + 4, width: r.width, zIndex: 9999 })
                }
              }}
              onFocus={() => {
                setShowUserDropdown(true)
                if (searchRef.current) {
                  const r = searchRef.current.getBoundingClientRect()
                  setDropdownStyle({ position: 'fixed', left: r.left, top: r.bottom + 4, width: r.width, zIndex: 9999 })
                }
              }}
              onBlur={closeUserDropdown}
              placeholder="搜索姓名或工号..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            {selectedUser && (
              <button
                type="button"
                onClick={() => { setSelectedUser(''); setSearchText('') }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              >&times;</button>
            )}
          </div>
          <button
            disabled={calculating}
            onClick={handleRecalculate}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap transition"
          >{calculating ? '计算中...' : '重新计算'}</button>
        </div>
      </div>

      {showUserDropdown && (
        <div style={dropdownStyle} className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          <button
            type="button"
            className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition ${!selectedUser ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
            onMouseDown={() => { setSelectedUser(''); setSearchText(''); setShowUserDropdown(false) }}
          >全部人员</button>
          {filteredUsers.map(u => (
            <button
              key={u.uuid}
              type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition ${selectedUser === u.uuid ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
              onMouseDown={() => { setSelectedUser(u.uuid); setSearchText(u.name); setShowUserDropdown(false) }}
            >{u.name} ({u.workNum})</button>
          ))}
          {filteredUsers.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">无匹配结果</div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {['日期', '日类型', '姓名', '工号', '上班', '下班', '状态', '操作'].map(h => (
                  <th key={h} className={`text-left px-4 py-3 text-gray-500 font-medium ${h === '操作' ? 'text-center' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">加载中...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">暂无考勤记录</td></tr>
              ) : (
                records.map((r: any) => {
                  const user = userMap.get(r.employeeUuid)
                  const st = getStatus(r)
                  return (
                    <tr key={r.uuid} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{r.date}</td>
                      <td className="px-4 py-3">
                        {r.dayTypeName ? (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.dayType === 1 ? 'bg-blue-50 text-blue-700' : r.dayType === 2 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{r.dayTypeName}</span>
                        ) : (
                          <span className="text-gray-300 text-xs">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{r.employeeName}</td>
                      <td className="px-4 py-3 text-gray-600">{user?.workNum || '--'}</td>
                      <td className="px-4 py-3 text-gray-700">{fmtTime(r.clockIn)}</td>
                      <td className="px-4 py-3 text-gray-700">{fmtTime(r.clockOut)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openDoorAccess(r.employeeUuid, r.employeeName, r.date)}
                          className="text-xs text-blue-600 hover:text-blue-800 transition"
                        >查看门禁</button>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">门禁记录 - {doorModalTitle}</h3>
              <button onClick={() => setShowDoorModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            {doorModalLoading ? (
              <p className="text-sm text-gray-400 text-center py-4">加载中...</p>
            ) : doorRecords.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">暂无门禁记录</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50">
                      {['时间', '门号', '方向'].map(h => (
                        <th key={h} className="text-left px-4 py-2 text-gray-500 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {doorRecords.map((d: DoorAccessItem) => (
                      <tr key={d.uuid} className="border-b border-gray-50">
                        <td className="px-4 py-2 text-gray-700">{d.accessTime?.slice(0, 5)}</td>
                        <td className="px-4 py-2 text-gray-600">{d.doorNo}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${d.direction === 0 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                            {d.direction === 0 ? '进入' : '外出'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
