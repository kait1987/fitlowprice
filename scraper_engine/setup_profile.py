#!/usr/bin/env python3
"""
최초 Chrome 프로필 설정 및 로그인 스크립트
"""
import time
from driver.manager import DriverManager


def setup_profile():
    """Chrome 프로필 생성 및 로그인"""
    print("=" * 60)
    print("Chrome 프로필 설정 시작")
    print("=" * 60)

    # 헤드리스 모드 비활성화 (수동 로그인용)
    import config
    config.HEADLESS = False

    driver_manager = DriverManager()
    driver = driver_manager.get_driver()

    try:
        # 1. 쿠팡 로그인
        print("\n[1/3] 쿠팡 로그인")
        print("브라우저에서 https://login.coupang.com 로그인을 진행하세요.")
        print("페이지 로딩 시도 중...")
        driver.get("https://login.coupang.com/login/login.pang")
        print("페이지 로딩 완료. 로그인이 끝나면 Enter를 누르세요.")
        input("이미 로그인을 마쳤다면 Enter를 누르세요...")

        # 2. 네이버 로그인
        print("\n[2/3] 네이버 로그인")
        print("브라우저에서 https://nid.naver.com 로그인을 진행하세요.")
        driver.get("https://nid.naver.com/nidlogin.login")
        input("로그인 완료 후 Enter를 누르세요...")

        # 3. 11번가 로그인
        print("\n[3/3] 11번가 로그인")
        print("브라우저에서 https://www.11st.co.kr 로그인을 진행하세요.")
        driver.get("https://login.11st.co.kr/login/Login.tmall")
        input("로그인 완료 후 Enter를 누르세요...")

        print("\n" + "=" * 60)
        print("프로필 설정 완료!")
        print(f"프로필 위치: {config.CHROME_PROFILE_PATH}")
        print("이제 main.py를 실행하면 로그인 세션이 유지됩니다.")
        print("=" * 60)

    except KeyboardInterrupt:
        print("\n설정이 중단되었습니다.")
    finally:
        time.sleep(2)
        driver_manager.quit()


if __name__ == "__main__":
    setup_profile()
