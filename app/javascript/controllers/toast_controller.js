import { Controller } from "@hotwired/stimulus"

/**
 * Toast Controller
 *
 * A notification toast controller for displaying temporary messages.
 *
 * Usage (container - place once in layout):
 * <div data-controller="toast" data-toast-target="container"
 *      class="fixed top-4 right-4 z-[120] flex flex-col gap-2">
 * </div>
 *
 * Usage (trigger from anywhere):
 * <button data-action="click->toast#show"
 *         data-toast-message="저장되었습니다"
 *         data-toast-type="success">
 *   저장
 * </button>
 *
 * Usage (programmatic via custom event):
 * window.dispatchEvent(new CustomEvent("toast:show", {
 *   detail: { message: "성공!", type: "success", duration: 3000 }
 * }))
 *
 * Types: success, error, warning, info (default)
 *
 * Options:
 * - data-toast-duration-value: milliseconds (default: 5000)
 * - data-toast-position-value: "top-right" | "top-left" | "bottom-right" | "bottom-left"
 */
export default class extends Controller {
  static targets = ["container"]
  static values = {
    duration: { type: Number, default: 5000 },
    position: { type: String, default: "top-right" }
  }

  connect() {
    // Listen for custom toast events
    this.handleToastEvent = this.handleToastEvent.bind(this)
    window.addEventListener("toast:show", this.handleToastEvent)

    // Position the container
    this.positionContainer()
  }

  disconnect() {
    window.removeEventListener("toast:show", this.handleToastEvent)
  }

  show(event) {
    const message = event.currentTarget?.dataset.toastMessage || event.detail?.message
    const type = event.currentTarget?.dataset.toastType || event.detail?.type || "info"
    const duration = event.currentTarget?.dataset.toastDuration || event.detail?.duration || this.durationValue

    if (!message) return

    this.createToast(message, type, parseInt(duration))
  }

  handleToastEvent(event) {
    const { message, type, duration } = event.detail
    this.createToast(message, type || "info", duration || this.durationValue)
  }

  createToast(message, type, duration) {
    const toast = document.createElement("div")
    toast.className = this.getToastClasses(type)
    toast.setAttribute("role", "alert")
    toast.setAttribute("aria-live", "polite")

    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          ${this.getIcon(type)}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">${this.escapeHtml(message)}</p>
        </div>
        <button type="button"
                class="flex-shrink-0 ml-2 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                onclick="this.closest('[role=alert]').remove()">
          <span class="sr-only">닫기</span>
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `

    // Add entrance animation
    toast.classList.add("animate-slide-in-down")

    // Add to container
    this.getContainer().appendChild(toast)

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast)
      }, duration)
    }

    // Dispatch event
    this.dispatch("shown", { detail: { message, type } })
  }

  removeToast(toast) {
    if (!toast || !toast.parentNode) return

    // Add exit animation
    toast.classList.remove("animate-slide-in-down")
    toast.classList.add("animate-fade-out")

    setTimeout(() => {
      toast.remove()
    }, 200)
  }

  getContainer() {
    if (this.hasContainerTarget) {
      return this.containerTarget
    }

    // Create container if it doesn't exist
    let container = document.getElementById("toast-container")
    if (!container) {
      container = document.createElement("div")
      container.id = "toast-container"
      container.className = this.getContainerClasses()
      document.body.appendChild(container)
    }
    return container
  }

  getContainerClasses() {
    const positions = {
      "top-right": "fixed top-4 right-4",
      "top-left": "fixed top-4 left-4",
      "bottom-right": "fixed bottom-4 right-4",
      "bottom-left": "fixed bottom-4 left-4",
      "top-center": "fixed top-4 left-1/2 -translate-x-1/2",
      "bottom-center": "fixed bottom-4 left-1/2 -translate-x-1/2"
    }

    return `${positions[this.positionValue] || positions["top-right"]} z-[120] flex flex-col gap-2 pointer-events-none`
  }

  positionContainer() {
    if (this.hasContainerTarget) {
      this.containerTarget.className = this.getContainerClasses()
    }
  }

  getToastClasses(type) {
    const baseClasses = "max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto p-4"

    const typeClasses = {
      success: "border-l-4 border-green-500",
      error: "border-l-4 border-red-500",
      warning: "border-l-4 border-yellow-500",
      info: "border-l-4 border-blue-500"
    }

    return `${baseClasses} ${typeClasses[type] || typeClasses.info}`
  }

  getIcon(type) {
    const icons = {
      success: `
        <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      `,
      error: `
        <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      `,
      warning: `
        <svg class="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      `,
      info: `
        <svg class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      `
    }

    return icons[type] || icons.info
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  // Convenience methods for programmatic use
  success(message, duration = this.durationValue) {
    this.createToast(message, "success", duration)
  }

  error(message, duration = this.durationValue) {
    this.createToast(message, "error", duration)
  }

  warning(message, duration = this.durationValue) {
    this.createToast(message, "warning", duration)
  }

  info(message, duration = this.durationValue) {
    this.createToast(message, "info", duration)
  }
}
