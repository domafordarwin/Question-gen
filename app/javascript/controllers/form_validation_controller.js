import { Controller } from "@hotwired/stimulus"

// Form validation controller for real-time validation feedback
// Usage: <form data-controller="form-validation" data-action="submit->form-validation#validate">
//          <input data-action="blur->form-validation#validateField input->form-validation#clearError"
//                 data-form-validation-target="field"
//                 data-validation-rules="required,minLength:2">
//          <span data-form-validation-target="error"></span>
//        </form>
export default class extends Controller {
  static targets = ["field", "error", "submit"]

  connect() {
    this.validateAllFields()
  }

  validateField(event) {
    const field = event.target
    const rules = field.dataset.validationRules?.split(",") || []
    const errorElement = this.findErrorElement(field)

    let errorMessage = ""

    for (const rule of rules) {
      const [ruleName, ruleValue] = rule.split(":")
      const value = field.value.trim()

      switch (ruleName) {
        case "required":
          if (!value) {
            errorMessage = "필수 입력 항목입니다."
          }
          break
        case "minLength":
          if (value && value.length < parseInt(ruleValue)) {
            errorMessage = `최소 ${ruleValue}자 이상 입력해주세요.`
          }
          break
        case "maxLength":
          if (value && value.length > parseInt(ruleValue)) {
            errorMessage = `최대 ${ruleValue}자까지 입력 가능합니다.`
          }
          break
        case "email":
          if (value && !this.isValidEmail(value)) {
            errorMessage = "올바른 이메일 형식이 아닙니다."
          }
          break
        case "password":
          if (value && !this.isValidPassword(value)) {
            errorMessage = "비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다."
          }
          break
        case "passwordConfirm":
          const passwordField = this.element.querySelector('[data-validation-match="password"]')
          if (passwordField && value !== passwordField.value) {
            errorMessage = "비밀번호가 일치하지 않습니다."
          }
          break
      }

      if (errorMessage) break
    }

    if (errorElement) {
      errorElement.textContent = errorMessage
      errorElement.classList.toggle("hidden", !errorMessage)
    }

    field.classList.toggle("border-red-500", !!errorMessage)
    field.classList.toggle("border-gray-300", !errorMessage)

    this.updateSubmitButton()

    return !errorMessage
  }

  clearError(event) {
    const field = event.target
    const errorElement = this.findErrorElement(field)

    if (errorElement) {
      errorElement.textContent = ""
      errorElement.classList.add("hidden")
    }

    field.classList.remove("border-red-500")
    field.classList.add("border-gray-300")
  }

  validate(event) {
    let isValid = true

    this.fieldTargets.forEach((field) => {
      const fakeEvent = { target: field }
      if (!this.validateField(fakeEvent)) {
        isValid = false
      }
    })

    if (!isValid) {
      event.preventDefault()
    }

    return isValid
  }

  validateAllFields() {
    this.updateSubmitButton()
  }

  updateSubmitButton() {
    if (!this.hasSubmitTarget) return

    let allValid = true
    this.fieldTargets.forEach((field) => {
      const rules = field.dataset.validationRules?.split(",") || []
      if (rules.includes("required") && !field.value.trim()) {
        allValid = false
      }
    })

    this.submitTarget.disabled = !allValid
    this.submitTarget.classList.toggle("opacity-50", !allValid)
    this.submitTarget.classList.toggle("cursor-not-allowed", !allValid)
  }

  findErrorElement(field) {
    const fieldId = field.id || field.name
    return this.element.querySelector(`[data-error-for="${fieldId}"]`) ||
           field.parentElement?.querySelector('[data-form-validation-target="error"]')
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  isValidPassword(password) {
    // At least 8 characters, with letters and numbers
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/
    return passwordRegex.test(password)
  }
}
