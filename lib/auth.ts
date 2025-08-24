export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin" | "researcher"
  credits: number
  subscription: "free" | "pro" | "enterprise"
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Mock JWT token handling (in real app, this would be actual JWT)
export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export const setStoredToken = (token: string): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("auth_token", token)
}

export const removeStoredToken = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
}

// Mock API calls (in real app, these would call FastAPI backend)
export const loginUser = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock user data
  const user: User = {
    id: "1",
    email,
    name: email.split("@")[0],
    role: email.includes("admin") ? "admin" : "researcher",
    credits: 100,
    subscription: "pro",
  }

  const token = `mock_jwt_token_${Date.now()}`

  return { user, token }
}

export const registerUser = async (
  email: string,
  password: string,
  name: string,
): Promise<{ user: User; token: string }> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const user: User = {
    id: Date.now().toString(),
    email,
    name,
    role: "user",
    credits: 50,
    subscription: "free",
  }

  const token = `mock_jwt_token_${Date.now()}`

  return { user, token }
}

export const getCurrentUser = async (token: string): Promise<User> => {
  // Simulate API call to validate token and get user
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    id: "1",
    email: "user@example.com",
    name: "Research User",
    role: "researcher",
    credits: 75,
    subscription: "pro",
  }
}
