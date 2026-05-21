export const getToken = (): string | null => localStorage.getItem('auth_token')

const goLogin = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  window.location.href = '/login'
}

export const apiFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  const token = getToken()
  if (!token) {
    goLogin()
    throw new Error('未登录')
  }
  const res = await fetch(url, {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${token}` } as HeadersInit,
  })
  if (res.status === 401) {
    goLogin()
    throw new Error('登录已过期')
  }
  return res
}
