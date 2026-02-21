# FitLowPrice - Python Selenium 스크래퍼 엔진

FastAPI + Selenium을 사용한 실시간 쇼핑몰 가격 수집 서버입니다.

## 개요

- **목적**: 쿠팡, 네이버, 11번가의 실제 가격 데이터를 수집
- **방식**: Selenium WebDriver + Headless Chrome
- **세션 관리**: 전용 Chrome 프로필 (로그인 세션 유지)
- **API**: FastAPI RESTful 엔드포인트

---

## 시스템 요구사항

### 필수 소프트웨어

1. **Python 3.9 이상**
   ```bash
   python --version
   # Python 3.9.0 이상
   ```

2. **Google Chrome 브라우저**
   - macOS: [chrome.google.com](https://www.google.com/chrome/)
   - 설치 후 버전 확인:
     ```bash
     /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version
     ```

3. **ChromeDriver** (자동 설치됨)
   - `webdriver-manager`가 자동으로 설치 및 관리

---

## 설치 가이드

### 1. Python 가상환경 생성

```bash
cd scraper_engine

# 가상환경 생성
python3 -m venv venv

# 가상환경 활성화 (macOS/Linux)
source venv/bin/activate

# 가상환경 활성화 (Windows)
# venv\Scripts\activate
```

### 2. 의존성 설치

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**설치되는 패키지:**
- `fastapi` - 웹 API 프레임워크
- `uvicorn` - ASGI 서버
- `selenium` - 브라우저 자동화
- `webdriver-manager` - ChromeDriver 자동 관리
- `beautifulsoup4` - HTML 파싱
- `lxml` - 고속 HTML 파서
- `pydantic` - 데이터 검증
- `python-dotenv` - 환경변수 관리

### 3. 환경변수 설정

`.env` 파일이 이미 생성되어 있습니다:

```env
# Python Server
HOST=0.0.0.0
PORT=8000
HEADLESS=true

# Chrome Profile (전용 프로필 경로)
CHROME_PROFILE_PATH=./chrome_profile
```

**설정 설명:**
- `HEADLESS=true`: 백그라운드 실행 (UI 없음)
- `HEADLESS=false`: GUI 모드 (디버깅용)
- `CHROME_PROFILE_PATH`: 로그인 세션 저장 경로

---

## 최초 설정: 쇼핑몰 로그인

로그인 세션을 유지하기 위해 최초 1회만 실행합니다.

### 실행 명령

```bash
source venv/bin/activate  # 가상환경 활성화
python setup_profile.py
```

### 진행 절차

1. **쿠팡 로그인**
   - 브라우저가 자동으로 열립니다
   - `https://www.coupang.com/np/login` 페이지에서 로그인
   - 완료 후 터미널에서 Enter 키

2. **네이버 로그인**
   - `https://nid.naver.com/nidlogin.login` 페이지에서 로그인
   - 완료 후 Enter 키

3. **11번가 로그인**
   - `https://login.11st.co.kr/login/Login.tmall` 페이지에서 로그인
   - 완료 후 Enter 키

4. **완료**
   - 로그인 정보가 `chrome_profile/` 디렉토리에 저장됩니다
   - 다음부터는 자동으로 로그인 상태 유지

**주의사항:**
- 로그인 세션은 약 2주~1달 유지됩니다
- 세션 만료 시 `setup_profile.py` 재실행 필요
- `chrome_profile/` 디렉토리는 `.gitignore`에 추가되어 있습니다

---

## 서버 실행

### 방법 1: 직접 실행

```bash
source venv/bin/activate
python main.py
```

### 방법 2: 실행 스크립트

```bash
chmod +x start.sh
./start.sh
```

### 서버 시작 확인

```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
FastAPI 서버 시작...
Headless 모드: True
Chrome 프로필: ./chrome_profile
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## API 엔드포인트

### 1. 헬스체크

```bash
curl http://localhost:8000/health
```

**응답:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

### 2. 쿠팡 검색

```bash
curl -X POST http://localhost:8000/search/coupang \
  -H "Content-Type: application/json" \
  -d '{"keyword": "아이폰 15"}'
```

**응답 예시:**
```json
[
  {
    "productId": "12345678",
    "name": "Apple 아이폰 15 Pro 128GB",
    "price": 1390000,
    "imageUrl": "https://image.coupang.com/...",
    "url": "https://www.coupang.com/vp/products/12345678",
    "mall": "coupang",
    "shippingFee": 0
  }
]
```

---

### 3. 네이버쇼핑 검색

```bash
curl -X POST http://localhost:8000/search/naver \
  -H "Content-Type: application/json" \
  -d '{"keyword": "아이폰 15"}'
```

---

### 4. 11번가 검색

```bash
curl -X POST http://localhost:8000/search/elevenst \
  -H "Content-Type: application/json" \
  -d '{"keyword": "아이폰 15"}'
```

---

## Next.js 연동

Next.js 프로젝트에서 자동으로 Python 서버를 호출합니다.

### 환경변수 설정

`.env.local` 파일에 추가:

```env
PYTHON_SCRAPER_URL=http://localhost:8000
```

### 동작 방식

1. **Python 서버 우선 호출** (실데이터)
2. 실패 시 기존 fetch 방식 (HTML 파싱)
3. 실패 시 Mock 데이터 (개발 환경)

### 테스트 방법

```bash
# 터미널 1: Python 서버 실행
cd scraper_engine
source venv/bin/activate
python main.py

# 터미널 2: Next.js 서버 실행
npm run dev

# 브라우저: http://localhost:3000
# "아이폰 15" 검색 → 실제 데이터 확인
```

---

## 트러블슈팅

### 1. ChromeDriver 오류

```
selenium.common.exceptions.WebDriverException: Message: 'chromedriver' executable needs to be in PATH.
```

**해결 방법:**
```bash
pip install --upgrade webdriver-manager
```

---

### 2. Chrome 프로필 오류

```
selenium.common.exceptions.InvalidArgumentException: Message: invalid argument: user data directory is already in use
```

**해결 방법:**
- 기존 Chrome 브라우저를 모두 종료
- 또는 다른 프로필 경로 사용:
  ```bash
  export CHROME_PROFILE_PATH=./chrome_profile_2
  ```

---

### 3. 로그인 세션 만료

**증상:** 빈 배열 반환 또는 로그인 페이지로 리다이렉트

**해결 방법:**
```bash
# 프로필 디렉토리 삭제
rm -rf chrome_profile/

# 로그인 재설정
python setup_profile.py
```

---

### 4. Headless 모드에서 로그인 필요

**해결 방법:**
1. `.env` 파일 수정:
   ```env
   HEADLESS=false
   ```
2. GUI 모드로 서버 실행
3. 로그인 확인 후 다시 `HEADLESS=true`로 변경

---

### 5. 포트 충돌

```
ERROR:    [Errno 48] Address already in use
```

**해결 방법:**
```bash
# 포트 사용 프로세스 확인
lsof -i :8000

# 프로세스 종료
kill -9 <PID>

# 또는 다른 포트 사용
export PORT=8001
python main.py
```

---

## 디버깅

### 로그 확인

서버 실행 시 콘솔에 출력됩니다:

```
INFO:     127.0.0.1:56789 - "POST /search/coupang HTTP/1.1" 200 OK
```

### GUI 모드 디버깅

```bash
# .env 파일 수정
HEADLESS=false

# 서버 실행
python main.py
```

브라우저가 실제로 열려서 동작 과정을 확인할 수 있습니다.

---

## 성능 최적화

### 1. 응답 시간

- 쿠팡: 5~10초
- 네이버: 3~7초
- 11번가: 5~10초

### 2. 동시 요청

- WebDriver는 싱글톤으로 관리됩니다
- 동시 요청 시 순차 처리됩니다
- 향후 멀티 드라이버 풀 구현 고려

### 3. 캐싱

- 현재 캐싱 미적용
- 향후 Redis 캐싱 고려 (TTL: 1시간)

---

## 보안 주의사항

1. **Chrome 프로필 보호**
   - `chrome_profile/` 디렉토리는 로그인 세션 포함
   - Git에 커밋하지 마세요 (`.gitignore` 확인)
   - 배포 시 서버에서 직접 로그인 설정

2. **환경변수 관리**
   - `.env` 파일은 Git에 커밋하지 마세요
   - 프로덕션 배포 시 환경변수로 설정

3. **Rate Limiting**
   - 과도한 요청 시 IP 차단 가능
   - 적절한 간격으로 요청 권장

---

## 라이선스

이 프로젝트는 개인 학습 및 비상업적 용도로만 사용해야 합니다.

쇼핑몰 웹사이트의 이용약관을 준수하세요:
- 쿠팡 이용약관: https://www.coupang.com/np/policies/terms
- 네이버 이용약관: https://policy.naver.com/rules/service.html
- 11번가 이용약관: https://www.11st.co.kr/html/policy/terms.html

---

## 문의 및 기여

이슈 및 개선 사항은 프로젝트 리포지토리에 제보해주세요.
