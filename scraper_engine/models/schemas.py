"""
Pydantic 스키마 정의
"""
from typing import Optional
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """검색 요청 모델"""
    keyword: str = Field(..., min_length=1, description="검색 키워드")


class SearchResultItem(BaseModel):
    """검색 결과 아이템"""
    productId: str = Field(..., description="상품 ID")
    name: str = Field(..., description="상품명")
    price: int = Field(..., description="가격")
    imageUrl: Optional[str] = Field(None, description="이미지 URL")
    url: str = Field(..., description="상품 상세 URL")
    mall: str = Field(..., description="쇼핑몰 ID (coupang, naver, elevenst)")
    shippingFee: int = Field(default=0, description="배송비")


class HealthResponse(BaseModel):
    """헬스체크 응답"""
    status: str = Field(default="ok")
    version: str = Field(default="1.0.0")
