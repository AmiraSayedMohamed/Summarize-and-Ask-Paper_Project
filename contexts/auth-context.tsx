"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type AuthState,
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  getCurrentUser,
  loginUser,
  registerUser,
} from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken()
      if (token) {
        try {
          const user = await getCurrentUser(token)
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
          })
        } catch (error) {
          removeStoredToken()
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const { user, token } = await loginUser(email, password)
      setStoredToken(token)
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const { user, token } = await registerUser(email, password, name)
      setStoredToken(token)
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = () => {
    removeStoredToken()
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  return <AuthContext.Provider value={{ ...state, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
