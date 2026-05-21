const allRecords = [
  { date: '2026-05-15', name: '张三', department: '产品研发部', checkIn: '08:55', checkOut: '18:02', status: '正常' },
  { date: '2026-05-15', name: '李四', department: '产品研发部', checkIn: '08:48', checkOut: '17:58', status: '正常' },
  { date: '2026-05-15', name: '王五', department: '市场部', checkIn: '09:12', checkOut: '18:30', status: '迟到' },
  { date: '2026-05-15', name: '赵六', department: '技术部', checkIn: '--:--', checkOut: '--:--', status: '缺勤' },
  { date: '2026-05-14', name: '张三', department: '产品研发部', checkIn: '08:50', checkOut: '18:05', status: '正常' },
  { date: '2026-05-14', name: '王五', department: '市场部', checkIn: '08:55', checkOut: '17:50', status: '正常' },
  { date: '2026-05-14', name: '孙七', department: '人事部', checkIn: '09:20', checkOut: '18:15', status: '迟到' },
]

export default function Attendance() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-800 mb-4">考勤记录查询</h3>
      <p className="text-sm text-gray-500 mb-4">查看公司全体员工的考勤记录。</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              {['日期', '姓名', '部门', '签到', '签退', '状态'].map(h => <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {allRecords.map((r, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-gray-700">{r.date}</td>
                <td className="px-4 py-3 text-gray-700">{r.name}</td>
                <td className="px-4 py-3 text-gray-700">{r.department}</td>
                <td className="px-4 py-3 text-gray-700">{r.checkIn}</td>
                <td className="px-4 py-3 text-gray-700">{r.checkOut}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.status === '正常' ? 'bg-green-50 text-green-700' : r.status === '迟到' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
