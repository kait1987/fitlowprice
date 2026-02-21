/**
 * Python Selenium 스크래퍼 서버 클라이언트
 */

export interface PythonScraperResult {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  url: string;
  mall: string;
  shippingFee: number;
}

const PYTHON_SCRAPER_URL =
  process.env.PYTHON_SCRAPER_URL || "http://localhost:8000";

/**
 * Python 스크래퍼 서버 헬스체크
 */
export async function checkPythonScraperHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${PYTHON_SCRAPER_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Python 스크래퍼로 쿠팡 검색
 */
export async function searchCoupangPython(
  keyword: string,
): Promise<PythonScraperResult[]> {
  try {
    const response = await fetch(`${PYTHON_SCRAPER_URL}/search/coupang`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
      signal: AbortSignal.timeout(30000), // 30초 타임아웃
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("쿠팡 Python 스크래퍼 오류:", error);
    throw error;
  }
}

/**
 * Python 스크래퍼로 네이버 검색
 */
export async function searchNaverPython(
  keyword: string,
): Promise<PythonScraperResult[]> {
  try {
    const response = await fetch(`${PYTHON_SCRAPER_URL}/search/naver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("네이버 Python 스크래퍼 오류:", error);
    throw error;
  }
}

/**
 * Python 스크래퍼로 11번가 검색
 */
export async function searchElevenstPython(
  keyword: string,
): Promise<PythonScraperResult[]> {
  try {
    const response = await fetch(`${PYTHON_SCRAPER_URL}/search/elevenst`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("11번가 Python 스크래퍼 오류:", error);
    throw error;
  }
}
