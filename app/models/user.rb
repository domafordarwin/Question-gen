# frozen_string_literal: true

class User < ApplicationRecord
  # Devise modules
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :trackable, :lockable

  # Enums
  enum :role, { student: 0, teacher: 1, admin: 2 }, default: :student

  # Validations
  validates :name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :password, format: {
    with: /\A(?=.*[a-zA-Z])(?=.*\d).{8,}\z/,
    message: "must be at least 8 characters with letters and numbers"
  }, if: :password_required?

  # Scopes
  scope :students, -> { where(role: :student) }
  scope :teachers, -> { where(role: :teacher) }
  scope :admins, -> { where(role: :admin) }

  # Methods
  def display_name
    name.presence || email.split("@").first
  end

  private

  def password_required?
    !persisted? || password.present? || password_confirmation.present?
  end
end
