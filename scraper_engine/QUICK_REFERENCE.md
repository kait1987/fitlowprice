# Python 스크래퍼 - 빠른 참조 카드

## 일일 명령어

### 서버 시작

```bash
cd scraper_engine
source venv/bin/activate
python main.py
```

### 서버 종료

```bash
# Ctrl + C
```

---

## 환경 설정

### 가상환경 활성화

```bash
# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 가상환경 비활성화

```bash
deactivate
```

---

## API 테스트

### 헬스체크

```bash
curl http://localhost:8000/health
```

### 쿠팡 검색

```bash
curl -X POST http://localhost:8000/search/coupang \
  -H "Content-Type: application/json" \
  -d '{"keyword": "아이폰"}'
```

### 네이버 검색

```bash
curl -X POST http://localhost:8000/search/naver \
  -H "Content-Type: application/json" \
  -d '{"keyword": "아이폰"}'
```

### 11번가 검색

```bash
curl -X POST http://localhost:8000/search/elevenst \
  -H "Content-Type: application/json" \
  -d '{"keyword": "아이폰"}'
```

---

## 트러블슈팅

### 로그인 세션 만료

```bash
rm -rf chrome_profile/
python setup_profile.py
```

### 포트 충돌

```bash
# 프로세스 확인
lsof -i :8000

# 프로세스 종료
kill -9 <PID>
```

### ChromeDriver 업데이트

```bash
pip install --upgrade webdriver-manager
```

### 패키지 재설치

```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

---

## 환경변수 (.env)

```env
# 서버 설정
HOST=0.0.0.0
PORT=8000
HEADLESS=true           # false로 변경하면 GUI 모드

# Chrome 프로필
CHROME_PROFILE_PATH=./chrome_profile
```

---

## 디버깅

### GUI 모드로 실행

```bash
# .env 파일 수정
HEADLESS=false

# 서버 실행
python main.py
```

### 로그 확인

서버 실행 중인 터미널에서 실시간 로그 확인

---

## 파일 구조

```
scraper_engine/
├── main.py              # 서버 실행
├── config.py            # 설정
├── setup_profile.py     # 로그인 설정
├── models/schemas.py    # 데이터 모델
├── driver/manager.py    # 드라이버 관리
└── scrapers/            # 스크래퍼들
    ├── base.py
    ├── coupang.py
    ├── naver.py
    └── elevenst.py
```

---

## 주요 URL

| 서비스 | URL |
|--------|-----|
| Python 서버 | http://localhost:8000 |
| API 문서 | http://localhost:8000/docs (Swagger) |
| Next.js 서버 | http://localhost:3000 |

---

## 자주 사용하는 명령어 모음

```bash
# 전체 프로세스 (서버 시작부터 테스트까지)
cd scraper_engine
source venv/bin/activate
python main.py &
curl http://localhost:8000/health
curl -X POST http://localhost:8000/search/coupang \
  -H "Content-Type: application/json" \
  -d '{"keyword": "아이폰"}'
```

---

## 긴급 복구

### 전체 재설정

```bash
cd scraper_engine

# 가상환경 삭제
rm -rf venv/

# Chrome 프로필 삭제
rm -rf chrome_profile/

# 가상환경 재생성
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 로그인 재설정
python setup_profile.py

# 서버 시작
python main.py
```

---

## 상태 확인

### Python 버전

```bash
python --version
```

### 설치된 패키지

```bash
pip list
```

### Chrome 버전

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version
```

### 포트 사용 확인

```bash
lsof -i :8000
```

---

## 도움말

| 문서 | 내용 |
|------|------|
| README.md | 전체 상세 문서 |
| SETUP_GUIDE.md | 단계별 설치 가이드 |
| QUICK_REFERENCE.md | 이 파일 (빠른 참조) |

---

**필요한 명령어를 찾으셨나요?** 더 자세한 내용은 README.md를 참조하세요.
