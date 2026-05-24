import { useState, useEffect, useRef } from 'react'

export default function Overview() {
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: '你好！我是考勤小助手，有什么可以帮你的吗？' },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || chatLoading) return
    setChatMessages(prev => [...prev, { role: 'user', text: text.trim() }])
    setChatInput('')
    setChatLoading(true)
    try {
      const res = await fetch('/agent-api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      })
      const data = await res.json() as { reply: string; tool_calls?: string[] }
      setChatMessages(prev => [...prev, { role: 'assistant', text: data.reply }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: '连接服务失败，请稍后重试。' }])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-0">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">🤖</div>
          <div>
            <p className="text-sm font-semibold text-gray-800">考勤小助手</p>
            <p className="text-xs text-gray-400">AI 智能问答</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2.5 text-sm text-gray-500">正在输入...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="border-t border-gray-100 p-4 flex gap-2">
          <input
            type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(chatInput) }}
            placeholder="输入消息..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button onClick={() => sendMessage(chatInput)} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">发送</button>
        </div>
      </div>
    </div>
  )
}
