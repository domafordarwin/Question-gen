# Design: Authentication (인증)

> 작성일: 2026-01-31
> Plan 문서: `docs/01-plan/features/authentication.plan.md`
> 상태: Draft

## 1. 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Login Form  │  │ Signup Form │  │ Password Reset Form │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Rails Application                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Devise Controllers                      │    │
│  │  Sessions | Registrations | Passwords | Unlocks     │    │
│  └─────────────────────────┬───────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────▼───────────────────────────┐    │
│  │                   User Model                         │    │
│  │  - Validations                                       │    │
│  │  - Role Management                                   │    │
│  │  - Devise Modules                                    │    │
│  └─────────────────────────┬───────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────▼───────────────────────────┐    │
│  │              Authorization Layer                     │    │
│  │  - before_action :authenticate_user!                 │    │
│  │  - Role-based access control                         │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                              │
│                     users table                              │
└─────────────────────────────────────────────────────────────┘
```

## 2. 데이터베이스 설계

### 2.1 users 테이블

```ruby
# db/migrate/XXXXXX_devise_create_users.rb
class DeviseCreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      ## Database authenticatable
      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""

      ## User info
      t.string :name,               null: false
      t.integer :role,              null: false, default: 0

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      ## Trackable
      t.integer  :sign_in_count, default: 0, null: false
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at
      t.string   :current_sign_in_ip
      t.string   :last_sign_in_ip

      ## Lockable
      t.integer  :failed_attempts, default: 0, null: false
      t.string   :unlock_token
      t.datetime :locked_at

      t.timestamps null: false
    end

    add_index :users, :email,                unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, :unlock_token,         unique: true
  end
end
```

### 2.2 Role Enum

```ruby
# app/models/user.rb
class User < ApplicationRecord
  enum :role, {
    student: 0,
    teacher: 1,
    admin: 2
  }, default: :student
end
```

## 3. 모델 설계

### 3.1 User 모델

```ruby
# app/models/user.rb
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
    name.presence || email.split('@').first
  end
end
```

### 3.2 Devise 설정

```ruby
# config/initializers/devise.rb (주요 설정)
Devise.setup do |config|
  config.mailer_sender = 'noreply@question-gen.com'
  
  # Password
  config.password_length = 8..128
  config.reset_password_within = 24.hours
  
  # Lockable
  config.lock_strategy = :failed_attempts
  config.unlock_strategy = :time
  config.maximum_attempts = 5
  config.unlock_in = 15.minutes
  
  # Rememberable
  config.remember_for = 7.days
  
  # Session timeout (via Timeoutable - optional)
  # config.timeout_in = 7.days
end
```

## 4. 컨트롤러 설계

### 4.1 Application Controller

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name, :role])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name])
  end

  def after_sign_in_path_for(resource)
    dashboard_path
  end

  def after_sign_out_path_for(resource_or_scope)
    root_path
  end
end
```

### 4.2 역할 기반 접근 제어

```ruby
# app/controllers/concerns/role_authorization.rb
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
    unless current_user_admin?
      redirect_to root_path, alert: "접근 권한이 없습니다."
    end
  end

  def require_teacher!
    unless current_user_teacher? || current_user_admin?
      redirect_to root_path, alert: "접근 권한이 없습니다."
    end
  end
end
```

### 4.3 Dashboard Controller (예시)

```ruby
# app/controllers/dashboard_controller.rb
class DashboardController < ApplicationController
  include RoleAuthorization
  before_action :authenticate_user!

  def show
    @user = current_user
  end
end
```

## 5. 라우팅 설계

```ruby
# config/routes.rb
Rails.application.routes.draw do
  # Devise routes
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations',
    passwords: 'users/passwords'
  }

  # Dashboard (requires login)
  resource :dashboard, only: [:show], controller: 'dashboard'

  # Profile
  resource :profile, only: [:show, :edit, :update]

  # Admin namespace
  namespace :admin do
    resources :users, only: [:index, :show, :edit, :update, :destroy]
  end

  # Teacher namespace
  namespace :teacher do
    resources :students, only: [:index, :show]
  end

  # Root
  root "home#index"
end
```

## 6. 뷰 설계

### 6.1 레이아웃 구조

```
app/views/
├── layouts/
│   ├── application.html.erb      # 메인 레이아웃
│   └── _navbar.html.erb          # 네비게이션 (로그인 상태별)
├── devise/
│   ├── sessions/
│   │   └── new.html.erb          # 로그인 폼
│   ├── registrations/
│   │   ├── new.html.erb          # 회원가입 폼
│   │   └── edit.html.erb         # 프로필 수정
│   ├── passwords/
│   │   ├── new.html.erb          # 비밀번호 찾기
│   │   └── edit.html.erb         # 비밀번호 재설정
│   └── shared/
│       ├── _links.html.erb       # 공통 링크
│       └── _error_messages.html.erb
├── dashboard/
│   └── show.html.erb             # 대시보드
└── profiles/
    ├── show.html.erb             # 프로필 보기
    └── edit.html.erb             # 프로필 수정
```

### 6.2 로그인 폼 (Wireframe)

```
┌────────────────────────────────────────┐
│            Question-gen                 │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │           로그인                  │  │
│  ├──────────────────────────────────┤  │
│  │                                  │  │
│  │  이메일                          │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │ email@example.com          │  │  │
│  │  └────────────────────────────┘  │  │
│  │                                  │  │
│  │  비밀번호                        │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │ ••••••••                   │  │  │
│  │  └────────────────────────────┘  │  │
│  │                                  │  │
│  │  ☐ 로그인 상태 유지              │  │
│  │                                  │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │         로그인             │  │  │
│  │  └────────────────────────────┘  │  │
│  │                                  │  │
│  │  비밀번호를 잊으셨나요?          │  │
│  │  계정이 없으신가요? 회원가입     │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

### 6.3 회원가입 폼 (Wireframe)

```
┌────────────────────────────────────────┐
│            Question-gen                 │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │          회원가입                 │  │
│  ├──────────────────────────────────┤  │
│  │                                  │  │
│  │  이름                            │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │ 홍길동                      │  │  │
│  │  └────────────────────────────┘  │  │
│  │                                  │  │
│  │  이메일                          │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │ email@example.com          │  │  │
│  │  └────────────────────────────┘  │  │
│  │                                  │  │
│  │  역할 선택                       │  │
│  │  ○ 학생   ○ 교사                │  │
│  │                                  │  │
│  │  비밀번호 (8자 이상, 영문+숫자)   │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │ ••••••••                   │  │  │
│  │  └────────────────────────────┘  │  │
│  │                                  │  │
│  │  비밀번호 확인                   │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │ ••••••••                   │  │  │
│  │  └────────────────────────────┘  │  │
│  │                                  │  │
│  │  ┌────────────────────────────┐  │  │
│  │  │        회원가입            │  │  │
│  │  └────────────────────────────┘  │  │
│  │                                  │  │
│  │  이미 계정이 있으신가요? 로그인  │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

## 7. Stimulus 컨트롤러

### 7.1 비밀번호 표시/숨김

```javascript
// app/javascript/controllers/password_visibility_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "icon"]

  toggle() {
    if (this.inputTarget.type === "password") {
      this.inputTarget.type = "text"
      this.iconTarget.textContent = "🙈"
    } else {
      this.inputTarget.type = "password"
      this.iconTarget.textContent = "👁"
    }
  }
}
```

### 7.2 폼 유효성 검사

```javascript
// app/javascript/controllers/form_validation_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["email", "password", "submit"]

  validate() {
    const emailValid = this.validateEmail(this.emailTarget.value)
    const passwordValid = this.passwordTarget.value.length >= 8

    this.submitTarget.disabled = !(emailValid && passwordValid)
  }

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}
```

## 8. 이메일 템플릿

### 8.1 비밀번호 재설정 이메일

```erb
<!-- app/views/devise/mailer/reset_password_instructions.html.erb -->
<h2>비밀번호 재설정 안내</h2>

<p>안녕하세요, <%= @resource.name %>님!</p>

<p>비밀번호 재설정을 요청하셨습니다. 아래 링크를 클릭하여 새 비밀번호를 설정해주세요.</p>

<p><%= link_to '비밀번호 재설정', edit_password_url(@resource, reset_password_token: @token) %></p>

<p>이 링크는 24시간 동안 유효합니다.</p>

<p>비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시해주세요.</p>
```

## 9. 테스트 설계

### 9.1 Model Tests

```ruby
# test/models/user_test.rb
class UserTest < ActiveSupport::TestCase
  test "should not save user without email" do
    user = User.new(name: "Test", password: "password123")
    assert_not user.save
  end

  test "should not save user with invalid email" do
    user = User.new(name: "Test", email: "invalid", password: "password123")
    assert_not user.save
  end

  test "should not save user with weak password" do
    user = User.new(name: "Test", email: "test@example.com", password: "12345678")
    assert_not user.save
  end

  test "should save valid user" do
    user = User.new(name: "Test", email: "test@example.com", password: "password123")
    assert user.save
  end

  test "default role should be student" do
    user = User.create!(name: "Test", email: "test@example.com", password: "password123")
    assert user.student?
  end
end
```

### 9.2 Integration Tests

```ruby
# test/integration/authentication_flow_test.rb
class AuthenticationFlowTest < ActionDispatch::IntegrationTest
  test "user can sign up" do
    get new_user_registration_path
    assert_response :success

    post user_registration_path, params: {
      user: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        password_confirmation: "password123",
        role: "student"
      }
    }
    assert_redirected_to dashboard_path
  end

  test "user can sign in and out" do
    user = users(:student)
    
    post user_session_path, params: {
      user: { email: user.email, password: "password123" }
    }
    assert_redirected_to dashboard_path

    delete destroy_user_session_path
    assert_redirected_to root_path
  end
end
```

## 10. 구현 순서

| 순서 | 작업 | 파일 |
|------|------|------|
| 1 | Devise gem 추가 및 설치 | Gemfile, `rails g devise:install` |
| 2 | User 모델 생성 | `rails g devise User` |
| 3 | 마이그레이션 수정 (role, name 추가) | db/migrate/xxx_devise_create_users.rb |
| 4 | User 모델 설정 (enum, validations) | app/models/user.rb |
| 5 | Devise 설정 | config/initializers/devise.rb |
| 6 | 뷰 생성 | `rails g devise:views` |
| 7 | 뷰 커스터마이징 | app/views/devise/* |
| 8 | 라우트 설정 | config/routes.rb |
| 9 | RoleAuthorization concern | app/controllers/concerns/ |
| 10 | Dashboard 컨트롤러 | app/controllers/dashboard_controller.rb |
| 11 | Stimulus 컨트롤러 | app/javascript/controllers/ |
| 12 | 테스트 작성 | test/ |

## 11. 환경 변수

```bash
# .env.example에 추가
SMTP_ADDRESS=smtp.gmail.com
SMTP_PORT=587
SMTP_DOMAIN=question-gen.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 12. 보안 체크리스트

- [ ] HTTPS 강제 (production)
- [ ] CSRF 토큰 활성화
- [ ] Secure cookies 설정
- [ ] 비밀번호 정책 적용 (8자+영문+숫자)
- [ ] 로그인 실패 잠금 (5회, 15분)
- [ ] 세션 타임아웃 설정
- [ ] SQL Injection 방지 (ActiveRecord)
- [ ] XSS 방지 (Rails 기본)

---

## Checklist

- [ ] 아키텍처 검토 완료
- [ ] DB 스키마 검토 완료
- [ ] API 설계 검토 완료
- [ ] 보안 검토 완료
- [ ] Design 승인
