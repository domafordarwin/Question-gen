# Plan: Authentication (인증)

> 작성일: 2026-01-31
> 상태: Draft

## 1. 개요

### 1.1 기능 설명
Question-gen-App의 사용자 인증 시스템. 학생과 교사가 안전하게 로그인하고 역할에 따른 접근 권한을 관리합니다.

### 1.2 목적
- 사용자 식별 및 인증
- 역할 기반 접근 제어 (학생/교사/관리자)
- 학습 진도 및 데이터의 개인화

### 1.3 대상 사용자
| 역할 | 설명 |
|------|------|
| 학생 (Student) | 질문 생성 연습, 피드백 확인 |
| 교사 (Teacher) | 콘텐츠 등록, 학생 관리, 리포트 조회 |
| 관리자 (Admin) | 전체 시스템 관리 |

## 2. 요구사항

### 2.1 기능 요구사항

#### 필수 (Must Have)
- [ ] 이메일/비밀번호 회원가입
- [ ] 이메일/비밀번호 로그인
- [ ] 로그아웃
- [ ] 비밀번호 재설정 (이메일)
- [ ] 역할(role) 기반 접근 제어
- [ ] 세션 관리

#### 선택 (Nice to Have)
- [ ] 소셜 로그인 (Google, Kakao)
- [ ] 이메일 인증
- [ ] 2단계 인증 (2FA)
- [ ] 로그인 기록 조회

### 2.2 비기능 요구사항
- 비밀번호는 bcrypt로 암호화
- 세션 타임아웃: 7일
- 로그인 실패 5회 시 계정 잠금 (15분)
- HTTPS 필수 (production)

## 3. 사용자 스토리

### US-1: 회원가입
```
As a 학생/교사
I want to 이메일과 비밀번호로 회원가입
So that 서비스를 이용할 수 있다
```

**인수 조건:**
- 이메일 형식 검증
- 비밀번호 최소 8자, 영문+숫자 조합
- 이메일 중복 확인
- 역할 선택 (학생/교사)

### US-2: 로그인
```
As a 가입된 사용자
I want to 이메일과 비밀번호로 로그인
So that 내 계정에 접근할 수 있다
```

**인수 조건:**
- 잘못된 정보 시 에러 메시지
- 로그인 성공 시 대시보드로 이동
- "로그인 상태 유지" 옵션

### US-3: 비밀번호 재설정
```
As a 비밀번호를 잊은 사용자
I want to 이메일로 재설정 링크를 받고 싶다
So that 새 비밀번호를 설정할 수 있다
```

**인수 조건:**
- 재설정 링크 24시간 유효
- 새 비밀번호 확인 입력
- 재설정 완료 시 자동 로그인

### US-4: 역할별 접근 제어
```
As a 관리자
I want to 역할에 따른 페이지 접근을 제한
So that 권한에 맞는 기능만 사용하게 한다
```

**인수 조건:**
- 학생: 질문 생성, 내 기록 조회
- 교사: 콘텐츠 관리, 학생 관리, 리포트
- 관리자: 전체 사용자 및 시스템 관리

## 4. 화면 목록

| ID | 화면명 | 설명 | 접근 권한 |
|----|--------|------|-----------|
| A-1 | 로그인 | 이메일/비밀번호 입력 | 비로그인 |
| A-2 | 회원가입 | 정보 입력 폼 | 비로그인 |
| A-3 | 비밀번호 찾기 | 이메일 입력 | 비로그인 |
| A-4 | 비밀번호 재설정 | 새 비밀번호 입력 | 토큰 보유자 |
| A-5 | 프로필 설정 | 내 정보 수정 | 로그인 |

## 5. 기술 스택

| 구성요소 | 기술 |
|----------|------|
| 인증 라이브러리 | Devise |
| 비밀번호 암호화 | bcrypt (Devise 기본) |
| 세션 관리 | Rails Session (Cookie-based) |
| 이메일 발송 | Action Mailer + SMTP |
| 프론트엔드 | Hotwire (Turbo + Stimulus) |

## 6. 데이터 모델 (개요)

```ruby
# User 모델
- id: bigint (PK)
- email: string (unique, not null)
- encrypted_password: string (not null)
- name: string (not null)
- role: integer (enum: student=0, teacher=1, admin=2)
- reset_password_token: string
- reset_password_sent_at: datetime
- remember_created_at: datetime
- sign_in_count: integer
- current_sign_in_at: datetime
- last_sign_in_at: datetime
- current_sign_in_ip: string
- last_sign_in_ip: string
- failed_attempts: integer
- unlock_token: string
- locked_at: datetime
- created_at: datetime
- updated_at: datetime
```

## 7. API 엔드포인트 (개요)

| Method | Path | 설명 |
|--------|------|------|
| GET | /users/sign_in | 로그인 페이지 |
| POST | /users/sign_in | 로그인 처리 |
| DELETE | /users/sign_out | 로그아웃 |
| GET | /users/sign_up | 회원가입 페이지 |
| POST | /users | 회원가입 처리 |
| GET | /users/password/new | 비밀번호 찾기 |
| POST | /users/password | 재설정 이메일 발송 |
| GET | /users/password/edit | 비밀번호 재설정 |
| PUT | /users/password | 새 비밀번호 저장 |

## 8. 의존성

### 외부 의존성
- SMTP 서버 (이메일 발송용)

### 내부 의존성
- 없음 (첫 번째 기능)

## 9. 위험 요소 및 대응

| 위험 | 영향 | 대응 |
|------|------|------|
| 브루트포스 공격 | 높음 | Devise Lockable 모듈 적용 |
| 세션 탈취 | 높음 | HTTPS, secure cookie |
| 비밀번호 유출 | 높음 | bcrypt 암호화, 정책 강화 |

## 10. 일정 (예상)

| 단계 | 작업 | 예상 |
|------|------|------|
| Design | 상세 설계 | - |
| Do | Devise 설정 + User 모델 | - |
| Do | 회원가입/로그인 UI | - |
| Do | 역할 기반 접근 제어 | - |
| Check | 테스트 및 검증 | - |

## 11. 참고 자료

- [Devise GitHub](https://github.com/heartcombo/devise)
- [Rails 8 Authentication Guide](https://guides.rubyonrails.org/security.html)

---

## Approval

- [ ] 기획 검토 완료
- [ ] 기술 검토 완료
- [ ] 착수 승인
