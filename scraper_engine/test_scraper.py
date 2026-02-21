#!/usr/bin/env python3
"""
Test scraper directly
"""
from driver.manager import DriverManager
from scrapers.coupang import CoupangScraper
import asyncio

async def test_scraper():
    print("Testing Coupang scraper...")
    manager = DriverManager()
    driver = manager.get_driver()

    try:
        scraper = CoupangScraper(driver)
        results = await scraper.search("iPhone")

        print(f"\nFound {len(results)} products:")
        for i, item in enumerate(results, 1):
            print(f"\n{i}. {item.name}")
            print(f"   Price: {item.price:,}원")
            print(f"   ID: {item.productId}")
            print(f"   URL: {item.url[:80]}...")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("\nCleaning up...")
        manager.quit()

if __name__ == "__main__":
    asyncio.run(test_scraper())
