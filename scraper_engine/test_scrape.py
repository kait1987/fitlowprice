from driver.manager import DriverManager
import time

driver = DriverManager().get_driver()

print("Fetching Coupang...")
driver.get("https://www.coupang.com/np/search?q=%EB%AA%A8%EB%8B%88%ED%84%B0")
time.sleep(5)
print("COUPANG TITLE:", driver.title)
with open("coupang_debug.html", "w", encoding="utf-8") as f:
    f.write(driver.page_source)

print("Fetching 11st...")
driver.get("https://search.11st.co.kr/Search.tmall?kwd=%EB%AA%A8%EB%8B%88%ED%84%B0")
time.sleep(5)
print("11ST TITLE:", driver.title)
with open("elevenst_debug.html", "w", encoding="utf-8") as f:
    f.write(driver.page_source)

driver.quit()
