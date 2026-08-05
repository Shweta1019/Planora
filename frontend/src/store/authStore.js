import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * "Remember Me" logic:
 *   - remembered === true  → persist in localStorage  (survives browser restarts)
 *   - remembered === false → persist in sessionStorage (cleared when tab/browser closes)
 *
 * On first load we check localStorage first, then sessionStorage, so both paths
 * restore correctly after a page refresh.
 */

// Read back "was the user remembered?" from whichever storage has the token.
function getInitialRemembered() {
  try {
    const ls = localStorage.getItem('planora-auth')
    if (ls) return true
    const ss = sessionStorage.getItem('planora-auth')
    if (ss) return false
  } catch {}
  return false
}

// Build a storage object that delegates to the right backend at call-time.
// We read `planora-auth-remember` (a tiny flag) to decide which store to use.
const dynamicStorage = {
  getItem: (key) => {
    try {
      // Try localStorage first (remembered users)
      const ls = localStorage.getItem(key)
      if (ls !== null) return ls
      // Fall back to sessionStorage (non-remembered users)
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key, value) => {
    try {
      const remembered = localStorage.getItem('planora-remember-me') === 'true'
      if (remembered) {
        localStorage.setItem(key, value)
        sessionStorage.removeItem(key)
      } else {
        sessionStorage.setItem(key, value)
        localStorage.removeItem(key)
      }
    } catch {}
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    } catch {}
  },
}

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user:  null,

      /**
       * @param {string}  token
       * @param {object}  user
       * @param {boolean} remember - true = localStorage, false = sessionStorage
       */
      setAuth: (token, user, remember = false) => {
        // Write the flag BEFORE zustand writes the state so dynamicStorage
        // already knows which backend to use when it is called.
        try {
          if (remember) {
            localStorage.setItem('planora-remember-me', 'true')
          } else {
            localStorage.removeItem('planora-remember-me')
            // Also clear any previously-remembered session from localStorage
            localStorage.removeItem('planora-auth')
          }
        } catch {}
        set({ token, user })
      },

      // Persist the profile photo URL inside the user object so it survives
      // page refreshes and is available in any tab that shares the same session.
      setPhoto: (photoUrl) => set((state) => ({
        user: state.user ? { ...state.user, photoUrl } : state.user,
      })),

      logout: () => {
        try {
          localStorage.removeItem('planora-remember-me')
          localStorage.removeItem('planora-auth')
          sessionStorage.removeItem('planora-auth')
        } catch {}
        set({ token: null, user: null })
      },
    }),
    {
      name: 'planora-auth',
      storage: createJSONStorage(() => dynamicStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
