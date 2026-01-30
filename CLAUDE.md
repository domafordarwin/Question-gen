# Question-gen-App

> 학생의 발문(질문) 생성 능력을 키워주는 학습 도우미 SaaS

## Project Info

- **Level**: Dynamic
- **Framework**: Ruby on Rails 7+
- **Database**: PostgreSQL
- **Deployment**: Railway
- **Language**: Ruby (Tier 2)

## Project Description

학생들이 주어진 텍스트나 주제에 대해 좋은 질문을 생성하는 능력을 훈련하는 교육용 SaaS 애플리케이션입니다.

### Core Features (예정)

1. **질문 생성 연습**: 텍스트를 읽고 질문 작성
2. **AI 피드백**: 생성된 질문의 품질 평가
3. **학습 진도 추적**: 학생별 성장 기록
4. **교사 대시보드**: 학급/학생 관리

## Tech Stack

```
Backend:
- Ruby on Rails 7.x (API mode or full-stack)
- PostgreSQL (Railway Postgres)
- Redis (세션/캐시, 선택사항)
- Devise (인증)
- Sidekiq (백그라운드 작업, 선택사항)

Frontend:
- Hotwire (Turbo + Stimulus) 또는
- React/Vue (API 분리 시)

AI Integration:
- OpenAI API (질문 품질 평가)
- Claude API (대안)

Deployment:
- Railway (앱 + DB)
```

## Project Structure

```
question-gen-app/
├── app/
│   ├── controllers/
│   ├── models/
│   ├── views/
│   ├── services/          # 비즈니스 로직
│   └── jobs/              # 백그라운드 작업
├── config/
├── db/
│   └── migrate/
├── docs/                  # PDCA 문서
│   ├── 01-plan/
│   ├── 02-design/
│   ├── 03-analysis/
│   └── 04-report/
├── spec/                  # RSpec 테스트
└── Procfile              # Railway 배포용
```

## Development Commands

```bash
# 서버 실행
bin/rails server

# 콘솔
bin/rails console

# DB 마이그레이션
bin/rails db:migrate

# 테스트
bundle exec rspec

# Railway 배포
railway up
```

## Environment Variables

```
DATABASE_URL=           # Railway가 자동 설정
RAILS_MASTER_KEY=       # credentials 복호화 키
OPENAI_API_KEY=         # AI 기능용
SECRET_KEY_BASE=        # 세션 암호화
```

## PDCA Status

현재 단계: **Plan** (프로젝트 초기화)

## Conventions

- Ruby Style Guide 준수 (RuboCop)
- RSpec for testing
- Service Object 패턴 사용
- RESTful API 설계
