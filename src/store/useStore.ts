import { create } from 'zustand'
import { WebSocketClient } from '../services/websocket'
import { WebSocketMessage, EmailMessage, EmailReceivedMessage, EmailDeliveredMessage } from '../../discovery-service/src/types/message'
import { Node } from '../../discovery-service/src/types/node'

// 安全地获取 localStorage
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage
  }
  return null
}

// 安全地获取存储的数据
const getSavedState = () => {
  const storage = getLocalStorage()
  if (!storage) return null
  
  try {
    const savedState = storage.getItem('email-storage')
    return savedState ? JSON.parse(savedState) : null
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return null
  }
}

// 安全地保存数据
const saveState = (state: any) => {
  const storage = getLocalStorage()
  if (!storage) return

  try {
    storage.setItem('email-storage', JSON.stringify({
      currentUser: state.currentUser,
      inbox: state.inbox,
      sent: state.sent
    }))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export interface Email {
  id: string
  from: string
  to: string
  subject: string
  content: string
  timestamp: string
  status: 'sending' | 'delivered' | 'failed'
}

interface Store {
  currentUser: string | null
  inbox: Email[]
  sent: Email[]
  wsClient: WebSocketClient | null
  setCurrentUser: (email: string) => void
  addToInbox: (email: Email) => void
  addToSent: (email: Email) => void
  updateEmailStatus: (emailId: string, status: Email['status']) => void
  loadInbox: (emails: Email[]) => void
  loadSent: (emails: Email[]) => void
  initializeWebSocket: (url: string) => void
  sendEmail: (email: Omit<Email, 'id' | 'status'>) => void
}

export const useStore = create<Store>((set, get) => {
  // 初始化状态
  const savedState = getSavedState()
  const initialState = savedState || {
    currentUser: null,
    inbox: [],
    sent: []
  }

  return {
    ...initialState,
    wsClient: null,

    setCurrentUser: (email) => {
      set({ currentUser: email })
      get().wsClient?.setCurrentUser(email)
      saveState({ ...get(), currentUser: email })
    },

    addToInbox: (email) => set((state) => {
      const newState = { 
        ...state,
        inbox: [...state.inbox, email] 
      }
      saveState(newState)
      return newState
    }),

    addToSent: (email) => set((state) => {
      const newState = { 
        ...state,
        sent: [...state.sent, email] 
      }
      saveState(newState)
      return newState
    }),

    updateEmailStatus: (emailId, status) => set((state) => {
      const newState = {
        ...state,
        sent: state.sent.map(email => 
          email.id === emailId ? { ...email, status } : email
        )
      }
      saveState(newState)
      return newState
    }),

    loadInbox: (emails) => set((state) => {
      const newState = { ...state, inbox: emails }
      saveState(newState)
      return newState
    }),

    loadSent: (emails) => set((state) => {
      const newState = { ...state, sent: emails }
      saveState(newState)
      return newState
    }),

    initializeWebSocket: (url: string) => {
      const wsClient = new WebSocketClient(url)
      
      wsClient.onMessage('EMAIL_SEND', (message: WebSocketMessage) => {
        if (message.type === 'EMAIL_SEND') {
          const emailMessage = message as EmailMessage
          const email: Email = {
            ...emailMessage.data.email,
            status: 'delivered'
          }
          get().addToInbox(email)
          
          wsClient.sendEmailReceived(email.id, get().currentUser!)
        }
      })

      wsClient.onMessage('EMAIL_RECEIVED', (message: WebSocketMessage) => {
        if (message.type === 'EMAIL_RECEIVED') {
          const { emailId } = (message as EmailReceivedMessage).data
          get().updateEmailStatus(emailId, 'delivered')
        }
      })

      wsClient.onMessage('EMAIL_DELIVERED', (message: WebSocketMessage) => {
        if (message.type === 'EMAIL_DELIVERED') {
          const { emailId } = (message as EmailDeliveredMessage).data
          get().updateEmailStatus(emailId, 'delivered')
        }
      })

      set({ wsClient })
    },

    sendEmail: (emailData) => {
      const wsClient = get().wsClient
      if (wsClient) {
        const email: Email = {
          ...emailData,
          id: Math.random().toString(36).substr(2, 9),
          status: 'sending'
        }
        wsClient.sendEmail(email)
        get().addToSent(email)
      }
    }
  }
}) 