import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
    isLoggedIn: boolean
    login: (username: string, password: string) => boolean
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

// Credentials (ในการใช้งานจริงควรเก็บใน environment variables หรือ backend)
const ADMIN_USERNAME = 'adminadmin'
const ADMIN_PASSWORD = '123456'


export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // Check for existing session on mount
    useEffect(() => {
        const session = localStorage.getItem('admin_session')
        if (session === 'logged_in') {
            setIsLoggedIn(true)
        }
    }, [])

    const login = (username: string, password: string): boolean => {
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            setIsLoggedIn(true)
            localStorage.setItem('admin_session', 'logged_in')
            return true
        }
        return false
    }

    const logout = () => {
        setIsLoggedIn(false)
        localStorage.removeItem('admin_session')
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
