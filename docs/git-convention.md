# 🔧 Git Convention

## 1. Branch Strategy

- 다음과 같은 브랜치 구조를 사용한다.

```bash
main        # 배포
develop     # 개발
feature/*   # 기능 개발
```

---

## 2. Branch Naming

- prefix를 사용한다.
- 브랜치는 **기능(도메인) 기준으로 생성한다.**

```bash
feature/login
feature/signup
feature/post
```

### 규칙

- 브랜치는 “무엇을 하는지(기능)” 기준으로 작성한다.
- 수정/버그 여부는 브랜치가 아닌 **커밋 메시지에서 표현한다.**

---

## 3. Commit Convention

### 커밋 단위

- 작업 단위별로 작게 나누어 커밋한다.

```bash
feat: 로그인 UI 구현
feat: 로그인 API 연결
fix: 로그인 에러 처리
```

---

### 커밋 메시지 형식

- prefix를 사용한다.

#### prefix 종류

- `feat`: 기능 추가
- `fix`: 버그 수정
- `refactor`: 코드 구조 개선
- `docs`: 문서 수정
- `chore`: 설정/기타 작업

---

## 4. Pull Request

### PR 단위

- 작은 단위로 나누어 자주 생성한다.

#### 예시

- 로그인 UI PR
- 로그인 API PR
- 로그인 에러 처리 PR

---

### PR 리뷰

- 최소 1명 이상의 승인 후 merge한다.

---

### Merge 방식

- squash merge를 사용한다.

✔ 여러 커밋 → 하나의 커밋으로 정리
✔ 히스토리 가독성 유지

---

## 5. Issue Convention

- 작업 전 반드시 이슈를 생성한다.

```bash
# 이슈
#12 로그인 기능 구현

# PR
close #12
```

- PR에서 `close #이슈번호`를 사용하여 자동으로 이슈를 닫는다.

---

## 6. PR Template

- PR 템플릿을 사용한다.

### 예시

```md
## 📌 작업 내용

- 로그인 UI 구현

## 🔗 관련 이슈

close #12

## 🧪 테스트 방법

- 로그인 정상 동작 확인
```
