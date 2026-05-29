import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../api'

interface Session {
  id: string
  name: string
}

interface Message {
  role: 'user' | 'assistant'
  text?: string
  content?: string
}

const defaultGreeting: Message = { role: 'assistant', text: '你好！我是考勤小助手，有什么可以帮你的吗？' }

function normalizeMsg(m: Record<string, unknown>): Message {
  return { role: m.role === 'user' ? 'user' : 'assistant', text: String(m.text ?? m.content ?? '') }
}

function normalizeSession(s: Record<string, unknown>): Session {
  return { id: String(s.id ?? s.session_id ?? ''), name: String(s.name ?? s.title ?? '新对话') }
}

function extractSessions(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const arr = (data as Record<string, unknown>).sessions ?? (data as Record<string, unknown>).data
    if (Array.isArray(arr)) return arr
  }
  return []
}

function extractMessages(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const msgs = (data as Record<string, unknown>).messages
    if (Array.isArray(msgs)) return msgs
  }
  return []
}

export default function Overview() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const editRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setSessionsLoading(true)
      try {
        const res = await apiFetch('/agent-api/sessions')
        const data = await res.json()
        if (cancelled) return
        const list = extractSessions(data).map(normalizeSession)
        setSessions(list)
        if (list.length > 0) {
          setActiveId(list[0].id)
        }
      } catch {
        if (cancelled) return
        setSessions([{ id: 'local_default', name: '新对话' }])
        setActiveId('local_default')
      } finally {
        if (!cancelled) setSessionsLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!activeId) return
    if (activeId === 'local_default') {
      setMessages([defaultGreeting])
      return
    }
    let cancelled = false
    const load = async () => {
      setHistoryLoading(true)
      try {
        const res = await apiFetch(`/agent-api/chat/history?session_id=${encodeURIComponent(activeId)}`)
        const data = await res.json()
        if (!cancelled) {
          const msgs = extractMessages(data).map(normalizeMsg)
          setMessages(msgs.length > 0 ? msgs : [defaultGreeting])
        }
      } catch {
        if (!cancelled) setMessages([defaultGreeting])
      } finally {
        if (!cancelled) setHistoryLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [activeId])

  const sendMessage = async (text: string) => {
    if (!text.trim() || chatLoading) return
    const sid = activeId
    if (!sid) return

    const userMsg: Message = { role: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      const res = await apiFetch('/agent-api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, message: text.trim() }),
      })
      const data = await res.json() as { reply: string; tool_calls?: string[] }
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '连接服务失败，请稍后重试。' }])
    } finally {
      setChatLoading(false)
    }
  }

  const newSession = async () => {
    try {
      const res = await apiFetch('/agent-api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '新对话' }),
      })
      const obj = await res.json() as Record<string, unknown>
      const newSess: Session = { id: String(obj.id ?? obj.session_id ?? ''), name: String(obj.name ?? obj.title ?? '新对话') }
      if (!newSess.id) throw new Error('no id')
      setSessions(prev => [...prev, newSess])
      setActiveId(newSess.id)
    } catch {
      const fallback: Session = { id: `local_${Date.now()}`, name: '新对话' }
      setSessions(prev => [...prev, fallback])
      setActiveId(fallback.id)
    }
  }

  const startEdit = (s: Session) => {
    setEditingId(s.id)
    setEditName(s.name || '新对话')
  }

  const saveEdit = async () => {
    const id = editingId
    if (!id) return
    const name = editName.trim() || '新对话'
    setSessions(prev => prev.map(s => s.id === id ? { ...s, name } : s))
    setEditingId(null)
    try {
      await apiFetch(`/agent-api/sessions/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: name }),
      })
    } catch {
      // backend may not support rename
    }
  }

  const cancelEdit = () => setEditingId(null)

  const deleteSession = async (id: string) => {
    if (sessions.length <= 1) return
    try {
      await apiFetch(`/agent-api/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' })
    } catch {
      // continue even if backend delete fails
    }
    setSessions(prev => prev.filter(s => s.id !== id))
    if (activeId === id) {
      const remaining = sessions.filter(s => s.id !== id)
      const nextId = remaining[remaining.length - 1].id
      setActiveId(nextId)
    }
  }

  return (
    <div className="flex-1 flex min-h-0 gap-2">
      <div className="w-52 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-0">
        <div className="p-3 border-b border-gray-100">
          <button onClick={() => { newSession().catch(() => {}) }} disabled={sessionsLoading} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新建对话
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessionsLoading ? (
            <div className="text-center text-sm text-gray-400 py-4">加载中...</div>
          ) : (
            sessions.map(s => (
              <div
                key={s.id}
                onClick={() => {
                  setMessages([])
                  setActiveId(s.id)
                }}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition ${
                  s.id === activeId ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
                {editingId === s.id ? (
                  <input
                    ref={editRef}
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
                    onClick={e => e.stopPropagation()}
                    className="flex-1 min-w-0 px-1 py-0.5 border border-blue-400 rounded text-sm focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 truncate">{s.name || '新对话'}</span>
                )}
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={e => { e.stopPropagation(); startEdit(s) }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 transition"
                  >
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  {sessions.length > 1 && (
                    <button
                      onClick={e => { e.stopPropagation(); deleteSession(s.id) }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 transition"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-0">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">🤖</div>
          <div>
            <p className="text-sm font-semibold text-gray-800">考勤小助手</p>
            <p className="text-xs text-gray-400">AI 智能问答</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {historyLoading ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">加载历史记录...</div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  {msg.text || msg.content || ''}
                </div>
              </div>
            ))
          )}
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
