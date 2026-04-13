# 📏 Coding Convention

## 1. Naming

### 변수 / 함수

- camelCase를 사용한다.
  - 예: `fetchUserData`, `isLoggedIn`

### 컴포넌트

- PascalCase를 사용한다.
  - 예: `UserCard`, `LoginForm`

### 파일명

- 컴포넌트: PascalCase
  - 예: `UserCard.tsx`

- 그 외 파일: kebab-case
  - 예: `use-auth.ts`, `api-client.ts`

### boolean 변수

- `is`, `has`, `can`, `should` prefix를 사용한다.
  - 예: `isOpen`, `hasError`, `canEdit`

### 함수명

- 동사로 시작한다.
  - 예: `fetchUser`, `createPost`, `updateProfile`

---

## 2. Import

### 경로

- 절대경로(`@/`)를 사용한다.
  - 예: `@/components/UserCard`

### 정렬

- import 순서는 별도로 강제하지 않는다.

---

## 3. Function & Code Style

### 함수 선언

- function 선언문을 사용한다.

```ts
function fetchUser() {}
```

### Early Return

- 조건문에서 early return을 적극적으로 사용한다.

```ts
if (!user) return null;
```

### 매직 넘버 / 문자열

- 상황에 따라 상수로 분리한다.
- 반복되거나 의미 있는 값은 상수로 관리한다.

---

## 4. React

### export 방식

- default export를 사용한다.

```ts
export default Component;
```

### 컴포넌트 크기

- 별도의 줄 수 제한을 두지 않는다.
- 단, 가독성이 떨어질 경우 적절히 분리한다.

### API 호출

- 컴포넌트에서 직접 API를 호출하지 않는다.
- 별도의 api 파일에서 관리한다.

```ts
// api/user.ts
export async function fetchUser() {}
```

---

## 5. Styling (Tailwind CSS)

### spacing

- Tailwind scale(`mt-4`, `px-2` 등)을 기본으로 사용한다.
- arbitrary value(`mt-[13px]`)는 최소화한다.
- 불가피한 경우에만 예외적으로 사용한다.

---

## 6. State Management

### 서버 상태

- TanStack Query를 사용한다.

### 전역 상태

- 최소화하여 사용한다.
- 꼭 필요한 경우에만 전역 상태를 도입한다.

---

## 7. Project Structure

### 기본 구조

```bash
src/
├── components/         # 공통 컴포넌트
├── hooks/              # 공통 hooks
├── lib/                # 외부 라이브러리 설정
├── utils/              # 순수 함수
├── types/              # 공통 타입
├── constants/          # 상수 관리
├── features/           # 기능 단위 구조
│   ├── auth/
│   │   ├── components/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── types.ts
```

### 규칙

- 기능 단위(feature 기반)로 폴더를 구성한다.
- 공통 로직은 `src/` 하위에 분리한다.
- 각 feature는 독립적으로 관리 가능하도록 구성한다.

---

## 8. Comment

- “무엇을 하는 코드인지”가 아닌 “왜 이렇게 작성했는지”를 중심으로 작성한다.

```ts
// ❌ 나쁜 예
// 버튼 클릭 이벤트

// ✅ 좋은 예
// 중복 제출을 방지하기 위해 버튼을 비활성화한다.
```

---

## 9. Git Convention

### Commit Message

- prefix를 사용한다.

#### 예시

- `feat: 로그인 기능 추가`
- `fix: 토큰 갱신 오류 수정`
- `docs: README 수정`
- `refactor: 코드 구조 개선`
- `chore: 설정 변경`
