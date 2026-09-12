import React, { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const PwaContext = createContext(null)

export const PwaProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    // Check if the app is currently running in standalone (already installed) mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')

    if (isStandaloneMode) {
      setIsInstalled(true)
    }

    // Capture the PWA install prompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent browser's mini-infobar on mobile so our custom button has full control
      e.preventDefault()
      setDeferredPrompt(e)
    }

    // Capture successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      toast.success('MeatbyAlvi App installed successfully!')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (isInstalled) {
      toast('MeatbyAlvi App is already installed and running!', { icon: '✨' })
      return
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
          toast.success('Installing MeatbyAlvi shortcut…')
          setIsInstalled(true)
          setDeferredPrompt(null)
        } else {
          toast('Installation dismissed', { icon: 'ℹ️' })
        }
      } catch (err) {
        console.error('PWA prompt error:', err)
        setShowInstructions(true)
      }
    } else {
      // If prompt is not available (e.g. iOS, Safari, or Chrome before prompt trigger)
      setShowInstructions(true)
    }
  }

  return (
    <PwaContext.Provider
      value={{
        isInstallable: Boolean(deferredPrompt),
        isInstalled,
        installApp,
        showInstructions,
        setShowInstructions
      }}
    >
      {children}
    </PwaContext.Provider>
  )
}

export const usePwa = () => {
  const ctx = useContext(PwaContext)
  if (!ctx) throw new Error('usePwa must be used inside a PwaProvider')
  return ctx
}
