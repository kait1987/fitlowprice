#!/bin/bash
# FastAPI 서버 실행 스크립트

echo "FitLowPrice Scraper Engine 시작..."

# 가상환경 활성화 (존재하는 경우)
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Uvicorn 서버 실행
python main.py
