# Design System - Question-gen App

> PDCA Design Document | Phase 5: Design System
> Created: 2026-02-01
> Status: Active

---

## 1. 개요 (Overview)

### 1.1 목적
Question-gen 앱의 일관된 UI/UX를 위한 디자인 시스템을 정의합니다.
재사용 가능한 컴포넌트와 디자인 토큰을 통해 개발 효율성과 사용자 경험을 향상시킵니다.

### 1.2 기술 스택
| 항목 | 선택 |
|------|------|
| Framework | Ruby on Rails 8.1.2 |
| CSS 방식 | Tailwind CSS (Utility-first) |
| JS Framework | Hotwire (Turbo + Stimulus) |
| Asset Pipeline | Propshaft |
| Component 방식 | ERB Partials + ViewComponent (선택) |

### 1.3 현재 상태 분석

#### 사용 중인 패턴
- **레이아웃**: `min-h-screen`, `max-w-7xl mx-auto`, `px-4 sm:px-6 lg:px-8`
- **카드**: `bg-white shadow rounded-lg p-6`
- **버튼 (Primary)**: `bg-blue-600 hover:bg-blue-700 text-white rounded-md`
- **입력 필드**: `border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`
- **색상 테마**: Blue 계열 (Primary), Gray 계열 (Neutral)

#### 기존 Stimulus Controllers
- `password_visibility_controller.js` - 비밀번호 표시/숨김 토글
- `form_validation_controller.js` - 실시간 폼 유효성 검사

---

## 2. 디자인 토큰 (Design Tokens)

### 2.1 색상 (Colors)

```css
/* app/assets/stylesheets/tokens.css */
:root {
  /* ===== Brand Colors ===== */
  --color-primary-50: 239 246 255;   /* #EFF6FF - bg-blue-50 */
  --color-primary-100: 219 234 254;  /* #DBEAFE - bg-blue-100 */
  --color-primary-500: 59 130 246;   /* #3B82F6 - bg-blue-500 */
  --color-primary-600: 37 99 235;    /* #2563EB - bg-blue-600 */
  --color-primary-700: 29 78 216;    /* #1D4ED8 - bg-blue-700 */

  /* ===== Neutral Colors ===== */
  --color-gray-50: 249 250 251;      /* #F9FAFB */
  --color-gray-100: 243 244 246;     /* #F3F4F6 */
  --color-gray-300: 209 213 219;     /* #D1D5DB */
  --color-gray-500: 107 114 128;     /* #6B7280 */
  --color-gray-700: 55 65 81;        /* #374151 */
  --color-gray-900: 17 24 39;        /* #111827 */

  /* ===== Semantic Colors ===== */
  --color-success: 34 197 94;        /* #22C55E - green-500 */
  --color-warning: 234 179 8;        /* #EAB308 - yellow-500 */
  --color-error: 239 68 68;          /* #EF4444 - red-500 */
  --color-info: 59 130 246;          /* #3B82F6 - blue-500 */

  /* ===== Role-based Colors ===== */
  --color-student: 59 130 246;       /* Blue */
  --color-teacher: 34 197 94;        /* Green */
  --color-admin: 239 68 68;          /* Red */
}
```

### 2.2 타이포그래피 (Typography)

| 용도 | Tailwind Class | 크기 |
|------|---------------|------|
| Hero Title | `text-4xl sm:text-5xl md:text-6xl font-bold` | 36px ~ 60px |
| Page Title | `text-2xl font-bold` | 24px |
| Section Title | `text-lg font-medium` | 18px |
| Body | `text-base` | 16px |
| Small | `text-sm` | 14px |
| Extra Small | `text-xs` | 12px |

**폰트 패밀리**: System UI (기본)
```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### 2.3 간격 (Spacing)

| 토큰 | 값 | Tailwind | 사용 예시 |
|------|-----|----------|----------|
| xs | 4px | `p-1`, `m-1` | 아이콘 내부 |
| sm | 8px | `p-2`, `m-2` | 버튼 패딩 |
| md | 16px | `p-4`, `m-4` | 카드 내부 |
| lg | 24px | `p-6`, `m-6` | 섹션 간격 |
| xl | 32px | `p-8`, `m-8` | 페이지 패딩 |
| 2xl | 48px | `py-12` | 대형 섹션 |

### 2.4 테두리 (Border)

| 용도 | Tailwind Class |
|------|---------------|
| 기본 테두리 | `border border-gray-300` |
| 포커스 | `focus:border-blue-500 focus:ring-blue-500` |
| 에러 | `border-red-500` |
| 둥글기 (sm) | `rounded-md` (6px) |
| 둥글기 (lg) | `rounded-lg` (8px) |
| 완전 둥글기 | `rounded-full` |

### 2.5 그림자 (Shadow)

| 용도 | Tailwind Class |
|------|---------------|
| 카드 | `shadow` |
| 버튼 | `shadow-sm` |
| 모달 | `shadow-lg` |
| 드롭다운 | `shadow-md` |

---

## 3. 컴포넌트 명세 (Component Specifications)

### 3.1 버튼 (Button)

#### Variants

| Variant | 용도 | Tailwind Classes |
|---------|------|-----------------|
| **Primary** | 주요 액션 | `bg-blue-600 hover:bg-blue-700 text-white` |
| **Secondary** | 보조 액션 | `bg-white border border-gray-300 text-gray-700 hover:bg-gray-50` |
| **Destructive** | 삭제/위험 | `bg-red-600 hover:bg-red-700 text-white` |
| **Ghost** | 최소 강조 | `text-blue-600 hover:text-blue-500 hover:bg-blue-50` |

#### Sizes

| Size | Tailwind Classes |
|------|-----------------|
| sm | `px-3 py-1.5 text-sm` |
| md | `px-4 py-2 text-sm` |
| lg | `px-8 py-3 text-base md:py-4 md:px-10 md:text-lg` |

#### 공통 스타일
```erb
class="inline-flex items-center justify-center font-medium rounded-md 
       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
       disabled:opacity-50 disabled:cursor-not-allowed"
```

#### ERB Partial 예시
```erb
<%# app/views/shared/_button.html.erb %>
<%# locals: (text:, variant: :primary, size: :md, **options) %>
<%
  base_classes = "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  variant_classes = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    destructive: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    ghost: "text-blue-600 hover:bg-blue-50"
  }
  
  size_classes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-8 py-3 text-base"
  }
  
  classes = [base_classes, variant_classes[variant], size_classes[size], options.delete(:class)].compact.join(" ")
%>
<%= tag.button text, class: classes, **options %>
```

### 3.2 입력 필드 (Input)

#### 기본 스타일
```erb
class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
       placeholder-gray-500 text-gray-900 
       focus:outline-none focus:ring-blue-500 focus:border-blue-500 
       sm:text-sm"
```

#### States

| State | 추가 Classes |
|-------|-------------|
| Default | `border-gray-300` |
| Focus | `focus:ring-blue-500 focus:border-blue-500` |
| Error | `border-red-500 focus:ring-red-500 focus:border-red-500` |
| Disabled | `bg-gray-100 cursor-not-allowed` |

#### ERB Partial 예시
```erb
<%# app/views/shared/_input.html.erb %>
<%# locals: (form:, field:, label:, type: :text, placeholder: nil, required: false, **options) %>
<div class="<%= options.delete(:wrapper_class) %>">
  <%= form.label field, label, class: "block text-sm font-medium text-gray-700" %>
  <%= form.send(:"#{type}_field", field,
      placeholder: placeholder,
      required: required,
      class: "mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm #{options.delete(:class)}",
      **options) %>
</div>
```

### 3.3 카드 (Card)

#### 기본 카드
```erb
<div class="bg-white shadow rounded-lg p-6">
  <!-- content -->
</div>
```

#### 색상 카드 (역할별)
```erb
<%# 학생용 - Blue %>
<div class="bg-blue-50 rounded-lg p-6">
  <h3 class="text-lg font-medium text-blue-900">제목</h3>
  <p class="mt-2 text-sm text-blue-700">설명</p>
</div>

<%# 교사용 - Green %>
<div class="bg-green-50 rounded-lg p-6">
  <h3 class="text-lg font-medium text-green-900">제목</h3>
  <p class="mt-2 text-sm text-green-700">설명</p>
</div>

<%# 관리자용 - Red %>
<div class="bg-red-50 rounded-lg p-6">
  <h3 class="text-lg font-medium text-red-900">제목</h3>
  <p class="mt-2 text-sm text-red-700">설명</p>
</div>
```

### 3.4 배지 (Badge)

#### 역할 배지
```erb
<%# app/views/shared/_role_badge.html.erb %>
<%# locals: (role:) %>
<%
  badge_classes = {
    student: "bg-blue-100 text-blue-800",
    teacher: "bg-green-100 text-green-800",
    admin: "bg-red-100 text-red-800"
  }
%>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium <%= badge_classes[role.to_sym] %>">
  <%= I18n.t("roles.#{role}") %>
</span>
```

### 3.5 레이아웃 (Layout)

#### 페이지 컨테이너
```erb
<div class="min-h-screen bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- content -->
  </div>
</div>
```

#### 중앙 정렬 폼 (로그인/회원가입)
```erb
<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- form content -->
  </div>
</div>
```

#### 그리드 레이아웃
```erb
<%# 3열 그리드 %>
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
  <!-- cards -->
</div>

<%# 2열 그리드 %>
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
  <!-- cards -->
</div>
```

---

## 4. Stimulus Controllers

### 4.1 기존 컨트롤러

| Controller | 용도 | 파일 |
|------------|------|------|
| `password-visibility` | 비밀번호 표시/숨김 | `password_visibility_controller.js` |
| `form-validation` | 실시간 폼 유효성 검사 | `form_validation_controller.js` |

### 4.2 추가 예정 컨트롤러

| Controller | 용도 | 우선순위 |
|------------|------|---------|
| `dropdown` | 드롭다운 메뉴 | 높음 |
| `modal` | 모달 다이얼로그 | 높음 |
| `toast` | 알림 메시지 | 중간 |
| `tabs` | 탭 네비게이션 | 중간 |
| `loading` | 로딩 상태 표시 | 낮음 |

### 4.3 Dropdown Controller 예시
```javascript
// app/javascript/controllers/dropdown_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["menu"]
  
  toggle() {
    this.menuTarget.classList.toggle("hidden")
  }
  
  hide(event) {
    if (!this.element.contains(event.target)) {
      this.menuTarget.classList.add("hidden")
    }
  }
  
  connect() {
    document.addEventListener("click", this.hide.bind(this))
  }
  
  disconnect() {
    document.removeEventListener("click", this.hide.bind(this))
  }
}
```

---

## 5. 아이콘 (Icons)

### 5.1 아이콘 시스템
현재 인라인 SVG를 사용 중. 향후 [Heroicons](https://heroicons.com/) 통합 권장.

### 5.2 사용 중인 아이콘

| 아이콘 | 용도 | 위치 |
|-------|------|------|
| Question Mark Circle | 질문 생성 | 홈페이지 Feature |
| Light Bulb | AI 피드백 | 홈페이지 Feature |
| Chart Bar | 성장 기록 | 홈페이지 Feature |
| Eye / Eye Slash | 비밀번호 토글 | 로그인/회원가입 |

### 5.3 Heroicons 통합 (권장)
```erb
<%# app/views/shared/_icon.html.erb %>
<%# locals: (name:, size: 6, **options) %>
<svg class="h-<%= size %> w-<%= size %> <%= options[:class] %>" 
     fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <%= render "icons/#{name}" %>
</svg>
```

---

## 6. 반응형 디자인 (Responsive Design)

### 6.1 Breakpoints

| Breakpoint | Prefix | Min Width |
|------------|--------|-----------|
| Mobile | (default) | 0px |
| Small | `sm:` | 640px |
| Medium | `md:` | 768px |
| Large | `lg:` | 1024px |
| Extra Large | `xl:` | 1280px |

### 6.2 반응형 패턴

```erb
<%# 텍스트 크기 %>
<h1 class="text-2xl sm:text-3xl md:text-4xl">제목</h1>

<%# 패딩 %>
<div class="px-4 sm:px-6 lg:px-8">콘텐츠</div>

<%# 그리드 %>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">카드들</div>

<%# 버튼 배열 %>
<div class="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
  버튼들
</div>
```

---

## 7. 접근성 (Accessibility)

### 7.1 필수 요소

- [ ] 모든 이미지에 `alt` 속성
- [ ] 폼 필드에 `label` 연결
- [ ] 충분한 색상 대비 (WCAG AA)
- [ ] 키보드 네비게이션 지원
- [ ] `focus` 상태 명확히 표시

### 7.2 권장 패턴

```erb
<%# 스크린 리더 전용 텍스트 %>
<span class="sr-only">숨겨진 설명</span>

<%# 포커스 링 %>
<button class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
  버튼
</button>

<%# ARIA 레이블 %>
<button aria-label="메뉴 열기" aria-expanded="false">
  <svg>...</svg>
</button>
```

---

## 8. 다크 모드 (Dark Mode)

### 8.1 현재 상태
다크 모드 미구현 (향후 추가 예정)

### 8.2 구현 계획

```css
/* 다크 모드 토큰 (미래) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: 17 24 39;      /* gray-900 */
    --color-foreground: 249 250 251;   /* gray-50 */
    --color-card: 31 41 55;            /* gray-800 */
    --color-border: 75 85 99;          /* gray-600 */
  }
}
```

```erb
<%# Tailwind 다크 모드 클래스 %>
<div class="bg-white dark:bg-gray-800">
  <p class="text-gray-900 dark:text-gray-100">텍스트</p>
</div>
```

---

## 9. 컴포넌트 체크리스트

### 9.1 Core Components

| 컴포넌트 | 상태 | 파일 |
|---------|------|------|
| Button | ✅ 정의됨 | ERB inline |
| Input | ✅ 정의됨 | ERB inline |
| Card | ✅ 정의됨 | ERB inline |
| Badge | ✅ 정의됨 | ERB inline |
| Layout | ✅ 정의됨 | `application.html.erb` |

### 9.2 To-Do (Phase 6에서 구현)

| 컴포넌트 | 우선순위 | 용도 |
|---------|---------|------|
| Modal | 높음 | 확인 다이얼로그, 상세 보기 |
| Dropdown | 높음 | 네비게이션, 설정 메뉴 |
| Toast/Alert | 높음 | 성공/에러 알림 |
| Tabs | 중간 | 대시보드 섹션 구분 |
| Pagination | 중간 | 목록 페이지네이션 |
| Table | 중간 | 데이터 표시 |
| Progress | 낮음 | 학습 진도 표시 |
| Avatar | 낮음 | 사용자 프로필 |

---

## 10. 파일 구조

```
app/
├── assets/
│   └── stylesheets/
│       ├── application.css      # 메인 스타일시트
│       └── tokens.css           # 디자인 토큰 (생성 필요)
├── javascript/
│   └── controllers/
│       ├── password_visibility_controller.js  ✅
│       ├── form_validation_controller.js      ✅
│       ├── dropdown_controller.js             (예정)
│       ├── modal_controller.js                (예정)
│       └── toast_controller.js                (예정)
└── views/
    └── shared/
        ├── _button.html.erb     (예정)
        ├── _input.html.erb      (예정)
        ├── _card.html.erb       (예정)
        ├── _badge.html.erb      (예정)
        ├── _modal.html.erb      (예정)
        └── _toast.html.erb      (예정)
```

---

## 11. 참고 자료

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Hotwire/Stimulus](https://stimulus.hotwired.dev/)
- [Heroicons](https://heroicons.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2026-02-01 | 1.0.0 | 초기 문서 작성 |
