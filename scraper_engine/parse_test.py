from bs4 import BeautifulSoup
import io

with open('elevenst_debug.html', 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'lxml')
items = soup.select('li.c-search-list__item')

if items:
    with open('11st_item_debug.html', 'w', encoding='utf-8') as out:
        out.write(items[0].prettify())
    print("Saved 11st_item_debug.html")
else:
    print("No items found.")
