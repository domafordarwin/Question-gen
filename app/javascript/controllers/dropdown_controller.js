import { Controller } from "@hotwired/stimulus"

/**
 * Dropdown Controller
 *
 * A flexible dropdown menu controller with keyboard navigation support.
 *
 * Usage:
 * <div data-controller="dropdown">
 *   <button data-action="click->dropdown#toggle" data-dropdown-target="trigger">
 *     메뉴
 *   </button>
 *   <div data-dropdown-target="menu" class="hidden">
 *     <a href="#">옵션 1</a>
 *     <a href="#">옵션 2</a>
 *   </div>
 * </div>
 *
 * Options (data attributes):
 * - data-dropdown-placement-value: "bottom-start" | "bottom-end" | "top-start" | "top-end"
 * - data-dropdown-close-on-select-value: "true" | "false" (default: true)
 */
export default class extends Controller {
  static targets = ["trigger", "menu"]
  static values = {
    placement: { type: String, default: "bottom-start" },
    closeOnSelect: { type: Boolean, default: true }
  }

  connect() {
    // Bind methods to preserve context
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
    this.handleEscape = this.handleEscape.bind(this)

    // Set initial ARIA attributes
    if (this.hasTriggerTarget) {
      this.triggerTarget.setAttribute("aria-expanded", "false")
      this.triggerTarget.setAttribute("aria-haspopup", "true")
    }

    if (this.hasMenuTarget) {
      this.menuTarget.setAttribute("role", "menu")
      // Set role on menu items
      this.menuTarget.querySelectorAll("a, button").forEach(item => {
        item.setAttribute("role", "menuitem")
      })
    }
  }

  disconnect() {
    this.removeEventListeners()
  }

  toggle(event) {
    event.preventDefault()
    event.stopPropagation()

    if (this.isOpen()) {
      this.close()
    } else {
      this.open()
    }
  }

  open() {
    if (!this.hasMenuTarget) return

    this.menuTarget.classList.remove("hidden")
    this.triggerTarget?.setAttribute("aria-expanded", "true")

    // Position the menu
    this.positionMenu()

    // Add event listeners
    document.addEventListener("click", this.handleClickOutside)
    document.addEventListener("keydown", this.handleKeydown)

    // Focus first menu item
    requestAnimationFrame(() => {
      const firstItem = this.menuTarget.querySelector("a, button")
      firstItem?.focus()
    })

    // Dispatch custom event
    this.dispatch("opened")
  }

  close() {
    if (!this.hasMenuTarget) return

    this.menuTarget.classList.add("hidden")
    this.triggerTarget?.setAttribute("aria-expanded", "false")

    // Remove event listeners
    this.removeEventListeners()

    // Return focus to trigger
    this.triggerTarget?.focus()

    // Dispatch custom event
    this.dispatch("closed")
  }

  isOpen() {
    return this.hasMenuTarget && !this.menuTarget.classList.contains("hidden")
  }

  handleClickOutside(event) {
    if (!this.element.contains(event.target)) {
      this.close()
    }
  }

  handleKeydown(event) {
    switch (event.key) {
      case "Escape":
        this.handleEscape(event)
        break
      case "ArrowDown":
        event.preventDefault()
        this.focusNextItem()
        break
      case "ArrowUp":
        event.preventDefault()
        this.focusPreviousItem()
        break
      case "Tab":
        this.close()
        break
      case "Enter":
      case " ":
        if (this.closeOnSelectValue) {
          // Let the default action happen, then close
          requestAnimationFrame(() => this.close())
        }
        break
    }
  }

  handleEscape(event) {
    event.preventDefault()
    this.close()
  }

  focusNextItem() {
    const items = this.getMenuItems()
    const currentIndex = items.indexOf(document.activeElement)
    const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
    items[nextIndex]?.focus()
  }

  focusPreviousItem() {
    const items = this.getMenuItems()
    const currentIndex = items.indexOf(document.activeElement)
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
    items[previousIndex]?.focus()
  }

  getMenuItems() {
    return Array.from(this.menuTarget.querySelectorAll("a:not([disabled]), button:not([disabled])"))
  }

  positionMenu() {
    // Basic positioning - can be enhanced with Floating UI if needed
    const placement = this.placementValue

    this.menuTarget.classList.remove("left-0", "right-0", "bottom-full", "top-full")

    if (placement.includes("end")) {
      this.menuTarget.classList.add("right-0")
    } else {
      this.menuTarget.classList.add("left-0")
    }

    if (placement.includes("top")) {
      this.menuTarget.classList.add("bottom-full", "mb-1")
    } else {
      this.menuTarget.classList.add("top-full", "mt-1")
    }
  }

  removeEventListeners() {
    document.removeEventListener("click", this.handleClickOutside)
    document.removeEventListener("keydown", this.handleKeydown)
  }

  // Action to select an item and close
  select(event) {
    if (this.closeOnSelectValue) {
      this.close()
    }
  }
}
