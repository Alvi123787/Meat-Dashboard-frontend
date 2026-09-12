import React from 'react'
import { MdClose, MdLaptop, MdPhoneAndroid, MdPhoneIphone, MdGetApp } from 'react-icons/md'
import { usePwa } from '../context/PwaContext'

const PwaInstallModal = () => {
  const { showInstructions, setShowInstructions } = usePwa()

  if (!showInstructions) return null

  return (
    <div className="pwa-modal-backdrop" onClick={() => setShowInstructions(false)}>
      <div className="pwa-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="pwa-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pwa-modal-icon-badge">
              <MdGetApp size={22} />
            </div>
            <div>
              <h3 className="pwa-modal-title">Install MeatbyAlvi App</h3>
              <p className="pwa-modal-subtitle">Fast 1-click desktop or mobile shortcut</p>
            </div>
          </div>
          <button
            type="button"
            className="pwa-modal-close"
            onClick={() => setShowInstructions(false)}
            aria-label="Close"
          >
            <MdClose size={20} />
          </button>
        </div>

        <div className="pwa-modal-body">
          <div className="pwa-instruction-step">
            <div className="pwa-step-icon">
              <MdLaptop size={20} />
            </div>
            <div className="pwa-step-text">
              <strong>On Desktop (Chrome / Edge / Brave):</strong>
              <p>Look at the right side of your browser's address/URL bar and click the <strong>Install</strong> icon (a computer monitor with a down arrow).</p>
            </div>
          </div>

          <div className="pwa-instruction-step">
            <div className="pwa-step-icon">
              <MdPhoneAndroid size={20} />
            </div>
            <div className="pwa-step-text">
              <strong>On Android (Chrome):</strong>
              <p>Tap the three dots <strong>(⋮)</strong> in the top-right corner, then tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
            </div>
          </div>

          <div className="pwa-instruction-step">
            <div className="pwa-step-icon">
              <MdPhoneIphone size={20} />
            </div>
            <div className="pwa-step-text">
              <strong>On iPhone / iPad (Safari):</strong>
              <p>Tap the <strong>Share</strong> button at the bottom, scroll down, and tap <strong>"Add to Home Screen"</strong>.</p>
            </div>
          </div>
        </div>

        <div className="pwa-modal-footer">
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setShowInstructions(false)}
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  )
}

export default PwaInstallModal
