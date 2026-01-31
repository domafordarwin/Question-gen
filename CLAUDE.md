# Question-gen-App

> 학생의 발문(질문) 생성 능력을 키워주는 학습 도우미 SaaS

## Project Info

- **Level**: Dynamic
- **Framework**: Ruby on Rails 8.1.2
- **Ruby Version**: 3.4.8
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
- Ruby on Rails 8.1.2 (Full-stack with Hotwire)
- PostgreSQL (Railway Postgres)
- Solid Cache/Queue/Cable (Rails 8 built-in)
- Devise (인증)

Frontend:
- Hotwire (Turbo + Stimulus)
- Tailwind CSS (선택사항)

AI Integration:
- OpenAI API (질문 품질 평가)
- Claude API (대안)

Deployment:
- Railway (앱 + DB)
- Kamal (Docker 배포, 선택사항)
```

## Project Structure

```
question-gen-app/
├── app/
│   ├── controllers/
│   ├── models/
│   ├── views/
│   ├── services/          # 비즈니스 로직
│   └── jobs/              # 백그라운드 작업 (Solid Queue)
├── config/
├── db/
│   ├── migrate/
│   ├── cache_schema.rb    # Solid Cache
│   ├── queue_schema.rb    # Solid Queue
│   └── cable_schema.rb    # Solid Cable
├── docs/                  # PDCA 문서
│   ├── 01-plan/
│   ├── 02-design/
│   ├── 03-analysis/
│   └── 04-report/
├── rawData/               # 학습 데이터 (git 제외)
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
bin/rails test

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

현재 단계: **Plan** (프로젝트 초기화 완료)

## Conventions

- Ruby Style Guide 준수 (RuboCop)
- Rails 8 conventions
- Service Object 패턴 사용
- RESTful API 설계
- Hotwire for interactive UI
