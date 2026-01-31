import { Controller } from "@hotwired/stimulus"

// Password visibility toggle controller
// Usage: <div data-controller="password-visibility">
//          <input type="password" data-password-visibility-target="input">
//          <button type="button" data-action="click->password-visibility#toggle">
//            <span data-password-visibility-target="icon">👁</span>
//          </button>
//        </div>
export default class extends Controller {
  static targets = ["input", "icon"]

  toggle() {
    if (this.inputTarget.type === "password") {
      this.inputTarget.type = "text"
      if (this.hasIconTarget) {
        this.iconTarget.textContent = "🙈"
      }
    } else {
      this.inputTarget.type = "password"
      if (this.hasIconTarget) {
        this.iconTarget.textContent = "👁"
      }
    }
  }
}
