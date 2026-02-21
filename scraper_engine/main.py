"""
FastAPI 엔트리포인트
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List

import config
from models.schemas import SearchRequest, SearchResultItem, HealthResponse
from driver.manager import DriverManager
from scrapers.coupang import CoupangScraper
from scrapers.naver import NaverScraper
from scrapers.elevenst import ElevenstScraper


# 드라이버 매니저 인스턴스
driver_manager = DriverManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 라이프사이클 관리"""
    # 시작 시
    print("FastAPI 서버 시작...")
    print(f"Headless 모드: {config.HEADLESS}")
    print(f"Chrome 프로필: {config.CHROME_PROFILE_PATH}")

    yield

    # 종료 시
    print("WebDriver 종료...")
    driver_manager.quit()


app = FastAPI(
    title="FitLowPrice Scraper Engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8888"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """헬스체크"""
    return HealthResponse(status="ok", version="1.0.0")


@app.post("/search/coupang", response_model=List[SearchResultItem])
async def search_coupang(request: SearchRequest):
    """쿠팡 검색"""
    try:
        driver = driver_manager.get_driver()
        scraper = CoupangScraper(driver)
        results = await scraper.search(request.keyword)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"쿠팡 검색 실패: {str(e)}")


@app.post("/search/naver", response_model=List[SearchResultItem])
async def search_naver(request: SearchRequest):
    """네이버쇼핑 검색"""
    try:
        driver = driver_manager.get_driver()
        scraper = NaverScraper(driver)
        results = await scraper.search(request.keyword)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"네이버 검색 실패: {str(e)}")


@app.post("/search/elevenst", response_model=List[SearchResultItem])
async def search_elevenst(request: SearchRequest):
    """11번가 검색"""
    try:
        driver = driver_manager.get_driver()
        scraper = ElevenstScraper(driver)
        results = await scraper.search(request.keyword)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"11번가 검색 실패: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True
    )
