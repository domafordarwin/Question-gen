import { Controller } from "@hotwired/stimulus"

/**
 * Modal Controller
 *
 * A flexible modal/dialog controller with accessibility support.
 *
 * Usage (inline modal):
 * <div data-controller="modal">
 *   <button data-action="click->modal#open">모달 열기</button>
 *
 *   <div data-modal-target="container" class="hidden">
 *     <div data-modal-target="backdrop"
 *          data-action="click->modal#closeOnBackdrop"
 *          class="fixed inset-0 bg-black bg-opacity-50 z-[100]"></div>
 *     <div data-modal-target="dialog"
 *          role="dialog"
 *          aria-modal="true"
 *          class="fixed inset-0 z-[110] flex items-center justify-center p-4">
 *       <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
 *         <h2>모달 제목</h2>
 *         <p>모달 내용</p>
 *         <button data-action="click->modal#close">닫기</button>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 *
 * Usage (remote trigger - modal defined elsewhere):
 * <button data-controller="modal"
 *         data-modal-remote-value="#my-modal"
 *         data-action="click->modal#open">
 *   모달 열기
 * </button>
 *
 * Options:
 * - data-modal-backdrop-close-value: "true" | "false" (default: true)
 * - data-modal-escape-close-value: "true" | "false" (default: true)
 * - data-modal-remote-value: CSS selector for remote modal
 */
export default class extends Controller {
  static targets = ["container", "backdrop", "dialog"]
  static values = {
    backdropClose: { type: Boolean, default: true },
    escapeClose: { type: Boolean, default: true },
    remote: { type: String, default: "" }
  }

  connect() {
    this.handleKeydown = this.handleKeydown.bind(this)
    this.previouslyFocusedElement = null
    this.focusableElements = []
  }

  disconnect() {
    this.removeEventListeners()
    this.unlockScroll()
  }

  open(event) {
    event?.preventDefault()

    const container = this.getContainer()
    if (!container) return

    // Store the currently focused element
    this.previouslyFocusedElement = document.activeElement

    // Show the modal
    container.classList.remove("hidden")

    // Add animation classes
    const backdrop = this.getBackdrop()
    const dialog = this.getDialog()

    if (backdrop) {
      backdrop.classList.add("animate-fade-in")
    }
    if (dialog) {
      dialog.classList.add("animate-fade-in")
    }

    // Lock body scroll
    this.lockScroll()

    // Add keyboard listener
    document.addEventListener("keydown", this.handleKeydown)

    // Setup focus trap
    this.setupFocusTrap()

    // Focus the first focusable element or the dialog itself
    requestAnimationFrame(() => {
      const firstFocusable = this.focusableElements[0]
      if (firstFocusable) {
        firstFocusable.focus()
      } else {
        dialog?.focus()
      }
    })

    // Dispatch event
    this.dispatch("opened")
  }

  close(event) {
    event?.preventDefault()

    const container = this.getContainer()
    if (!container) return

    // Add closing animation
    const backdrop = this.getBackdrop()
    const dialog = this.getDialog()

    if (backdrop) {
      backdrop.classList.remove("animate-fade-in")
      backdrop.classList.add("animate-fade-out")
    }
    if (dialog) {
      dialog.classList.remove("animate-fade-in")
      dialog.classList.add("animate-fade-out")
    }

    // Wait for animation then hide
    setTimeout(() => {
      container.classList.add("hidden")

      // Remove animation classes
      backdrop?.classList.remove("animate-fade-out")
      dialog?.classList.remove("animate-fade-out")

      // Unlock body scroll
      this.unlockScroll()

      // Remove keyboard listener
      this.removeEventListeners()

      // Return focus to previously focused element
      this.previouslyFocusedElement?.focus()

      // Dispatch event
      this.dispatch("closed")
    }, 200) // Match animation duration
  }

  closeOnBackdrop(event) {
    if (this.backdropCloseValue && event.target === event.currentTarget) {
      this.close(event)
    }
  }

  handleKeydown(event) {
    if (event.key === "Escape" && this.escapeCloseValue) {
      event.preventDefault()
      this.close(event)
      return
    }

    // Handle tab key for focus trap
    if (event.key === "Tab") {
      this.handleTabKey(event)
    }
  }

  handleTabKey(event) {
    if (this.focusableElements.length === 0) return

    const firstElement = this.focusableElements[0]
    const lastElement = this.focusableElements[this.focusableElements.length - 1]

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  setupFocusTrap() {
    const dialog = this.getDialog()
    if (!dialog) return

    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')

    this.focusableElements = Array.from(dialog.querySelectorAll(focusableSelectors))
  }

  getContainer() {
    if (this.remoteValue) {
      return document.querySelector(this.remoteValue)
    }
    return this.hasContainerTarget ? this.containerTarget : null
  }

  getBackdrop() {
    if (this.remoteValue) {
      return document.querySelector(this.remoteValue)?.querySelector('[data-modal-target="backdrop"]')
    }
    return this.hasBackdropTarget ? this.backdropTarget : null
  }

  getDialog() {
    if (this.remoteValue) {
      return document.querySelector(this.remoteValue)?.querySelector('[data-modal-target="dialog"]')
    }
    return this.hasDialogTarget ? this.dialogTarget : null
  }

  lockScroll() {
    document.body.style.overflow = "hidden"
    document.body.style.paddingRight = `${this.getScrollbarWidth()}px`
  }

  unlockScroll() {
    document.body.style.overflow = ""
    document.body.style.paddingRight = ""
  }

  getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth
  }

  removeEventListeners() {
    document.removeEventListener("keydown", this.handleKeydown)
  }

  // Convenience method for confirmation dialogs
  confirm(event) {
    this.dispatch("confirmed")
    this.close(event)
  }

  // Convenience method for cancel action
  cancel(event) {
    this.dispatch("cancelled")
    this.close(event)
  }
}
