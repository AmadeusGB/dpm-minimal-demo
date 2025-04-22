import { create } from 'zustand'
import { format } from 'date-fns'

export interface Email {
  from: string
  to: string
  subject: string
  content: string
  timestamp: string
}

interface Store {
  currentUser: string | null
  inbox: Email[]
  sent: Email[]
  setCurrentUser: (email: string) => void
  addToInbox: (email: Email) => void
  addToSent: (email: Email) => void
  loadInbox: (emails: Email[]) => void
  loadSent: (emails: Email[]) => void
}

export const useStore = create<Store>((set) => ({
  currentUser: null,
  inbox: [],
  sent: [],
  setCurrentUser: (email) => set({ currentUser: email }),
  addToInbox: (email) => set((state) => ({ inbox: [...state.inbox, email] })),
  addToSent: (email) => set((state) => ({ sent: [...state.sent, email] })),
  loadInbox: (emails) => set({ inbox: emails }),
  loadSent: (emails) => set({ sent: emails }),
})) 