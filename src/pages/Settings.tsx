export default function Settings() {
  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">个人信息</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">张</div>
            <div><p className="font-medium text-gray-800">张三</p><p className="text-sm text-gray-500">人事部 · HR经理</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['工号', 'EMP-2024-001'],
              ['邮箱', 'zhangsan@company.com'],
              ['手机', '138****5678'],
              ['入职日期', '2024-03-01'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-gray-500">{label}</p>
                <p className="text-gray-800 font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
