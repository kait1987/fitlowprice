"""
Selenium WebDriver 싱글톤 매니저 (안정 버전 131 격리 버전)
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from pathlib import Path
import config


class DriverManager:
    """WebDriver 싱글톤 관리자"""

    _instance = None
    _driver = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def get_driver(self) -> webdriver.Chrome:
        """WebDriver 인스턴스 반환 (재사용)"""
        if self._driver is None:
            self._driver = self._create_driver()
        return self._driver

    def _create_driver(self) -> webdriver.Chrome:
        """WebDriver 생성 (크래시가 없는 131 버전 강제 격리 실행)"""
        options = Options()

        # [핵심] 현재 Google이 배포 중인 최신 133/145 mac-arm64 버전은 
        # 드라이버 바인딩 코드(cxxbridge)가 심각하게 깨져 있습니다.
        # 이를 완벽히 피하기 위해, 크래시가 없었던 131의 브라우저와 드라이버를 
        # Selenium Manager가 자체적으로 받아 격리된 공간에서 실행하도록 합니다.
        options.browser_version = "131"

        # Headless 모드
        if config.HEADLESS:
            options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")

        # 윈도우 환경 크래시 방지 필수 옵션
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--remote-debugging-port=9222")

        # 전용 프로필 경로 생성
        profile_path = Path(config.CHROME_PROFILE_PATH).resolve()
        profile_path.mkdir(parents=True, exist_ok=True)
        options.add_argument(f"--user-data-dir={profile_path}")

        # 기본 옵션 (창 크기 등)
        options.add_argument("--window-size=1920,1080")

        # 봇 탐지 회피 필수 옵션
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option("useAutomationExtension", False)

        # User-Agent 설정
        ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        options.add_argument(f"user-agent={ua}")

        # 드라이버 실행 (외부 매니저 전혀 안 씀)
        try:
            driver = webdriver.Chrome(options=options)
        except Exception as e:
            print(f"드라이버 초기화 실패: {e}")
            raise e

        # 추가 봇 탐지 방지 (Navigator 숨기기)
        driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
            "source": """
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                })
            """
        })

        driver.implicitly_wait(config.IMPLICIT_WAIT)
        driver.set_page_load_timeout(config.PAGE_LOAD_TIMEOUT)

        return driver

    def quit(self):
        """WebDriver 종료"""
        if self._driver:
            try:
                self._driver.quit()
            except:
                pass
            self._driver = None
