# Data Model Design

> Question-gen-App 데이터베이스 스키마

## ERD Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────<│   Question  │────<│  Feedback   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │            ┌──────┴──────┐
       │            │             │
       ▼            ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Profile   │ │   Content   │ │    Tag      │
└─────────────┘ └─────────────┘ └─────────────┘
```

## Models

### User (사용자)

```ruby
# db/migrate/xxx_create_users.rb
create_table :users do |t|
  t.string :email, null: false
  t.string :encrypted_password, null: false
  t.string :name, null: false
  t.integer :role, default: 0  # 0: student, 1: teacher, 2: admin
  
  t.timestamps
end
```

| Column | Type | Description |
|--------|------|-------------|
| email | string | 이메일 (로그인 ID) |
| encrypted_password | string | 암호화된 비밀번호 |
| name | string | 사용자 이름 |
| role | integer | 역할 (student/teacher/admin) |

### Content (학습 콘텐츠)

```ruby
create_table :contents do |t|
  t.references :user, foreign_key: true  # 작성자 (교사)
  t.string :title, null: false
  t.text :body, null: false
  t.integer :difficulty, default: 1  # 1-5
  t.string :subject  # 과목
  t.integer :status, default: 0  # draft/published
  
  t.timestamps
end
```

| Column | Type | Description |
|--------|------|-------------|
| user_id | reference | 작성 교사 |
| title | string | 제목 |
| body | text | 본문 내용 |
| difficulty | integer | 난이도 (1-5) |
| subject | string | 과목 |
| status | integer | 상태 (초안/게시) |

### Question (학생이 생성한 질문)

```ruby
create_table :questions do |t|
  t.references :user, foreign_key: true      # 작성 학생
  t.references :content, foreign_key: true   # 관련 콘텐츠
  t.text :body, null: false                  # 질문 내용
  t.integer :question_type, default: 0       # 질문 유형
  t.integer :quality_score                   # AI 평가 점수 (1-100)
  
  t.timestamps
end
```

| Column | Type | Description |
|--------|------|-------------|
| user_id | reference | 작성 학생 |
| content_id | reference | 관련 콘텐츠 |
| body | text | 질문 내용 |
| question_type | integer | 유형 (사실/추론/평가/창의) |
| quality_score | integer | AI 품질 점수 |

### Feedback (AI 피드백)

```ruby
create_table :feedbacks do |t|
  t.references :question, foreign_key: true
  t.text :content, null: false       # 피드백 내용
  t.json :analysis                   # 상세 분석 데이터
  t.string :strengths, array: true   # 강점
  t.string :improvements, array: true # 개선점
  
  t.timestamps
end
```

## Enums

```ruby
# app/models/user.rb
enum role: { student: 0, teacher: 1, admin: 2 }

# app/models/content.rb
enum status: { draft: 0, published: 1, archived: 2 }
enum difficulty: { very_easy: 1, easy: 2, medium: 3, hard: 4, very_hard: 5 }

# app/models/question.rb
enum question_type: { 
  factual: 0,      # 사실 확인
  inferential: 1,  # 추론
  evaluative: 2,   # 평가
  creative: 3      # 창의
}
```

## Indexes

```ruby
add_index :users, :email, unique: true
add_index :questions, [:user_id, :created_at]
add_index :questions, [:content_id, :quality_score]
add_index :contents, [:subject, :difficulty]
```

## Future Considerations

- [ ] Classroom 모델 (학급 관리)
- [ ] Assignment 모델 (과제)
- [ ] Progress 모델 (학습 진도)
- [ ] Badge 모델 (성취 배지)
