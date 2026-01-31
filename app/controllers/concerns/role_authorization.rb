# frozen_string_literal: true

module RoleAuthorization
  extend ActiveSupport::Concern

  included do
    helper_method :current_user_admin?, :current_user_teacher?, :current_user_student?
  end

  def current_user_admin?
    current_user&.admin?
  end

  def current_user_teacher?
    current_user&.teacher?
  end

  def current_user_student?
    current_user&.student?
  end

  def require_admin!
    return if current_user_admin?

    redirect_to root_path, alert: "접근 권한이 없습니다."
  end

  def require_teacher!
    return if current_user_teacher? || current_user_admin?

    redirect_to root_path, alert: "접근 권한이 없습니다."
  end

  def require_teacher_or_student!
    return if current_user_teacher? || current_user_student? || current_user_admin?

    redirect_to root_path, alert: "접근 권한이 없습니다."
  end
end
