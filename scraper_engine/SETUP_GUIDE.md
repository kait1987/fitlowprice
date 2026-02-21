# Python Selenium 스크래퍼 - 빠른 시작 가이드

이 가이드는 Python + Selenium 기반 스크래퍼를 처음 설정하는 분들을 위한 단계별 안내입니다.

---

## 사전 준비

### 1. Python 설치 확인

```bash
python3 --version
```

**예상 출력:**
```
Python 3.9.0 (또는 이상)
```

**Python이 설치되어 있지 않다면:**
- macOS: `brew install python3`
- Windows: [python.org](https://www.python.org/downloads/)에서 다운로드

---

### 2. Google Chrome 설치 확인

```bash
# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version

# Windows (PowerShell)
# (Get-Item 'C:\Program Files\Google\Chrome\Application\chrome.exe').VersionInfo.ProductVersion
```

**Chrome이 설치되어 있지 않다면:**
- [chrome.google.com](https://www.google.com/chrome/)에서 다운로드

---

## 5분 설치 가이드

### Step 1: 디렉토리 이동

```bash
cd /Users/user/Desktop/coding/fitlowprice-main/scraper_engine
```

---

### Step 2: 가상환경 생성 및 활성화

```bash
# 가상환경 생성
python3 -m venv venv

# 가상환경 활성화 (macOS/Linux)
source venv/bin/activate

# 프롬프트가 (venv)로 시작하면 성공
# 예: (venv) user@macbook scraper_engine %
```

**Windows 사용자:**
```cmd
venv\Scripts\activate
```

---

### Step 3: 패키지 설치

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**설치 시간:** 약 1~2분

**예상 출력 (마지막 부분):**
```
Successfully installed fastapi-0.109.0 uvicorn-0.27.0 selenium-4.17.2 ...
```

---

### Step 4: 설치 확인

```bash
python -c "import fastapi, selenium; print('설치 완료!')"
```

**예상 출력:**
```
설치 완료!
```

---

## 로그인 설정 (최초 1회)

### Step 5: 로그인 스크립트 실행

```bash
python setup_profile.py
```

**예상 출력:**
```
============================================================
Chrome 프로필 설정 시작
============================================================

[1/3] 쿠팡 로그인
브라우저에서 https://www.coupang.com 로그인을 진행하세요.
```

---

### Step 6: 쇼핑몰 로그인

1. **브라우저가 자동으로 열립니다**
2. **쿠팡 로그인 페이지에서 직접 로그인**
   - 이메일/비밀번호 입력
   - 로그인 버튼 클릭
3. **로그인 완료 후 터미널로 돌아와서 Enter 키**

4. **네이버 로그인 (동일한 방식)**
   - 브라우저에서 로그인
   - Enter 키

5. **11번가 로그인 (동일한 방식)**
   - 브라우저에서 로그인
   - Enter 키

---

### Step 7: 완료 확인

```
============================================================
프로필 설정 완료!
프로필 위치: ./chrome_profile
이제 main.py를 실행하면 로그인 세션이 유지됩니다.
============================================================
```

---

## 서버 실행

### Step 8: FastAPI 서버 시작

```bash
# 가상환경이 활성화된 상태에서
python main.py
```

**예상 출력:**
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

### Step 9: API 테스트

**새 터미널 창을 열어서:**

```bash
# 헬스체크
curl http://localhost:8000/health
```

**예상 응답:**
```json
{"status":"ok","version":"1.0.0"}
```

---

```bash
# 쿠팡 검색 테스트
curl -X POST http://localhost:8000/search/coupang \
  -H "Content-Type: application/json" \
  -d '{"keyword": "아이폰"}'
```

**예상 응답:**
```json
[
  {
    "productId": "...",
    "name": "Apple 아이폰 15 ...",
    "price": 1390000,
    "imageUrl": "https://...",
    "url": "https://...",
    "mall": "coupang",
    "shippingFee": 0
  },
  ...
]
```

---

## Next.js 연동

### Step 10: Next.js 환경변수 설정

프로젝트 루트의 `.env.local` 파일에 추가:

```bash
cd /Users/user/Desktop/coding/fitlowprice-main
echo "PYTHON_SCRAPER_URL=http://localhost:8000" >> .env.local
```

---

### Step 11: Next.js 서버 실행

```bash
# Python 서버는 계속 실행 중인 상태에서
npm run dev
```

---

### Step 12: 브라우저 테스트

1. **http://localhost:3000** 접속
2. **검색창에 "아이폰 15" 입력**
3. **검색 버튼 클릭**
4. **실제 쇼핑몰 데이터 표시 확인**

---

## 체크리스트

완료한 항목에 체크하세요:

- [ ] Python 3.9 이상 설치 확인
- [ ] Google Chrome 설치 확인
- [ ] 가상환경 생성 및 활성화
- [ ] pip 패키지 설치 완료
- [ ] 쿠팡 로그인 완료
- [ ] 네이버 로그인 완료
- [ ] 11번가 로그인 완료
- [ ] FastAPI 서버 실행 성공
- [ ] `/health` 엔드포인트 응답 확인
- [ ] 쿠팡 검색 API 테스트 성공
- [ ] Next.js 환경변수 설정
- [ ] Next.js 서버에서 실데이터 확인

---

## 자주 묻는 질문 (FAQ)

### Q1. 가상환경 활성화가 안 돼요

**증상:**
```bash
source venv/bin/activate
bash: venv/bin/activate: No such file or directory
```

**해결:**
```bash
# 가상환경이 생성되지 않은 경우
python3 -m venv venv

# 디렉토리 확인
ls -la venv/
```

---

### Q2. pip 설치가 느려요

**해결:**
```bash
# 국내 미러 사용 (카카오)
pip install -r requirements.txt -i https://mirror.kakao.com/pypi/simple
```

---

### Q3. ChromeDriver 오류가 나요

**증상:**
```
selenium.common.exceptions.WebDriverException: 'chromedriver' executable needs to be in PATH
```

**해결:**
```bash
# webdriver-manager 재설치
pip install --upgrade webdriver-manager

# 또는 수동 설치
python -c "from webdriver_manager.chrome import ChromeDriverManager; ChromeDriverManager().install()"
```

---

### Q4. 로그인이 유지되지 않아요

**해결:**
1. `chrome_profile/` 디렉토리 확인
   ```bash
   ls -la chrome_profile/
   ```

2. 디렉토리가 비어있으면 재설정
   ```bash
   python setup_profile.py
   ```

---

### Q5. Headless 모드에서 로그인이 안 돼요

**해결:**
1. `.env` 파일 수정
   ```env
   HEADLESS=false
   ```

2. GUI 모드로 서버 실행
   ```bash
   python main.py
   ```

3. 로그인 확인 후 다시 `HEADLESS=true`로 변경

---

### Q6. Next.js에서 Python 서버를 못 찾아요

**증상:**
브라우저 콘솔에 "Python scraper failed" 메시지

**해결:**
1. Python 서버 실행 확인
   ```bash
   curl http://localhost:8000/health
   ```

2. `.env.local` 파일 확인
   ```bash
   cat .env.local | grep PYTHON
   # PYTHON_SCRAPER_URL=http://localhost:8000
   ```

3. Next.js 서버 재시작
   ```bash
   npm run dev
   ```

---

## 다음 단계

설정이 완료되었으면:

1. **README.md** - 전체 문서 읽기
2. **API 엔드포인트 테스트** - 각 쇼핑몰 검색
3. **Next.js 통합 테스트** - 브라우저에서 실데이터 확인
4. **성능 모니터링** - 응답 시간 및 오류율 확인

---

## 문제 해결이 안 되면

1. **Python 서버 로그 확인**
   - 터미널 출력에서 에러 메시지 확인

2. **Next.js 개발자 도구 확인**
   - 브라우저 Console 탭에서 네트워크 요청 확인

3. **이슈 리포트**
   - 에러 메시지, 환경 정보 (OS, Python 버전) 포함

---

**설정 완료를 축하합니다!** 🎉
