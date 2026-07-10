import { createContext, useContext, useState, ReactNode } from 'react'

export type RoundType = 'round1' | 'round2'

interface RoundContextType {
    selectedRound: RoundType
    setRound: (round: RoundType) => void
    getRoundLabel: () => string
}

const RoundContext = createContext<RoundContextType | null>(null)

export function RoundProvider({ children }: { children: ReactNode }) {
    const [selectedRound, setSelectedRound] = useState<RoundType>(() => {
        const saved = localStorage.getItem('selected_round')
        if (saved === 'round1' || saved === 'round2') return saved
        localStorage.setItem('selected_round', 'round2')
        return 'round2'
    })

    const setRound = (round: RoundType) => {
        setSelectedRound(round)
        localStorage.setItem('selected_round', round)
    }

    const getRoundLabel = () => {
        return selectedRound === 'round1' ? 'ครั้งที่ 1' : 'ครั้งที่ 2'
    }

    return (
        <RoundContext.Provider value={{ selectedRound, setRound, getRoundLabel }}>
            {children}
        </RoundContext.Provider>
    )
}

export function useRound() {
    const context = useContext(RoundContext)
    if (!context) {
        throw new Error('useRound must be used within a RoundProvider')
    }
    return context
}
