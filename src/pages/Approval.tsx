import { useState, useEffect } from 'react'
import { apiFetch } from '../api'

const pageSize = 10

const typeMap: Record<number, string> = { 1: '年假', 2: '事假', 3: '病假', 4: '调休假', 5: '婚假', 6: '产假' }

export default function Approval({
  searchQuery, setSearchQuery,
  approvalPage, setApprovalPage, userUuid,
}: {
  searchQuery: string
  setSearchQuery: (v: string) => void
  approvalPage: number
  setApprovalPage: (p: number | ((p: number) => number)) => void
  userUuid: string
}) {
  const [records, setRecords] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (!userUuid) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const qs = new URLSearchParams({ leaderId: userUuid, page: String(approvalPage), size: String(pageSize) })
        const res = await apiFetch(`/api/approve?${qs}`)
        const d = await res.json()
        if (d.code === 200) {
          const approveList: any[] = d.data?.records || []
          setTotal(d.data?.total || 0)
          const details = await Promise.all(
            approveList.map(a =>
              apiFetch(`/api/apply/${a.applyUuid}`).then(r => r.json()).catch(() => null)
            )
          )
          setRecords(approveList.map((a, i) => ({
            ...a,
            apply: details[i]?.code === 200 ? details[i]?.data : null,
          })))
        } else {
          setRecords([])
          setTotal(0)
        }
      } catch { setRecords([]); setTotal(0) }
      setLoading(false)
    }
    fetchData()
  }, [userUuid, approvalPage])

  const handlePass = async (approveUuid: string) => {
    if (!confirm('确定通过该请假申请？')) return
    setProcessing(approveUuid)
    try {
      const res = await apiFetch('/api/approve/pass', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: approveUuid }),
      })
      const d = await res.json()
      if (d.code !== 200) throw new Error(d.msg || '操作失败')
      setRecords(prev => prev.filter(r => r.uuid !== approveUuid))
      setTotal(prev => Math.max(0, prev - 1))
    } catch (e: any) {
      alert(e.message || '操作失败')
    }
    setProcessing(null)
  }

  const handleReject = async (approveUuid: string) => {
    const reason = prompt('请输入驳回原因：')
    if (reason === null) return
    setProcessing(approveUuid)
    try {
      const res = await apiFetch('/api/approve/reject', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: approveUuid, reject: reason || '' }),
      })
      const d = await res.json()
      if (d.code !== 200) throw new Error(d.msg || '操作失败')
      setRecords(prev => prev.filter(r => r.uuid !== approveUuid))
      setTotal(prev => Math.max(0, prev - 1))
    } catch (e: any) {
      alert(e.message || '操作失败')
    }
    setProcessing(null)
  }

  const totalPages = Math.ceil(total / pageSize) || 1

  const filtered = records.filter(r => {
    const name = r.apply?.name || ''
    const matchSearch = !searchQuery || name.includes(searchQuery)
    return matchSearch
  })

  const fmtDT = (iso: string) => {
    if (!iso) return ''
    const [d, t] = iso.split('T')
    return `${d.slice(5)} ${t.slice(0, 5)}`
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-800">待审批列表</h3>
          <div className="flex items-center gap-2">
            <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setApprovalPage(1) }} placeholder="姓名..." className="w-36 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {['申请人', '类型', '开始时间', '结束时间', '时长', '操作'].map(h => (
                  <th key={h} className={`px-3 py-2.5 text-gray-500 font-medium select-none text-xs ${h === '操作' ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">加载中...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">暂无待审批申请</td></tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.uuid} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-xs">{(r.apply?.name || '?')[0]}</div>
                        <div className="text-gray-700 text-xs">{r.apply?.name || '未知'}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><span className="inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">{typeMap[r.apply?.type] || r.apply?.type || '-'}</span></td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-xs">{fmtDT(r.apply?.startTime)}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap text-xs">{fmtDT(r.apply?.endTime)}</td>
                    <td className="px-3 py-2.5 text-gray-700 text-xs">{r.apply?.length ?? '-'} 小时</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handlePass(r.uuid)} disabled={processing === r.uuid}
                          className="px-2 py-1 bg-green-50 text-green-600 rounded text-[10px] font-medium hover:bg-green-100 transition disabled:opacity-50">通过</button>
                        <button onClick={() => handleReject(r.uuid)} disabled={processing === r.uuid}
                          className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-medium hover:bg-red-100 transition disabled:opacity-50">驳回</button>
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
        <p className="text-xs text-gray-500">共 {total} 条，第 {approvalPage}/{totalPages} 页</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setApprovalPage(p => Math.max(1, p - 1))} disabled={approvalPage === 1} className="px-2 py-0.5 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition">上一页</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setApprovalPage(p)} className={`w-6 h-6 text-xs rounded transition ${approvalPage === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{p}</button>
          ))}
          <button onClick={() => setApprovalPage(p => Math.min(totalPages, p + 1))} disabled={approvalPage === totalPages} className="px-2 py-0.5 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50 transition">下一页</button>
        </div>
      </div>
    </div>
  )
}
