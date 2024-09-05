import requests
from bs4 import BeautifulSoup
import pandas as pd
import asyncio
from pyppeteer import launch

def scrape_with_requests(url):
    response = requests.get(url)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')

    product_names = []
    product_images = []
    product_prices = []

    products = soup.find_all('div', class_='product-list__item')
    print(f"Number of products found: {len(products)}")

    for product in products:
        name_tag = product.find('a', class_='range--title')
        image_tag = product.find('img', class_='product-card__img')
        price_tag = product.find('strong', class_='price')

        if name_tag:
            name = name_tag.get_text(strip=True)
        else:
            print("Warning: Name tag not found!")
            name = "N/A"

        if image_tag:
            image = image_tag.get('src') or image_tag.get('data-src', "N/A")
        else:
            print("Warning: Image tag not found!")
            image = "N/A"

        if price_tag:
            price = price_tag.get_text(strip=True)
        else:
            print("Warning: Price tag not found!")
            price = "N/A"

        product_names.append(name)
        product_images.append(image)
        product_prices.append(price)

    data = pd.DataFrame({
        'Product Name': product_names,
        'Image URL': product_images,
        'Price': product_prices
    })

    return data

async def scrape_with_pyppeteer(url):
    browser = await launch(headless=False)
    page = await browser.newPage()

    await page.goto(url, timeout=60000, waitUntil='networkidle2')
    await page.waitForSelector('.product-list__item')

    content = await page.content()
    soup = BeautifulSoup(content, 'html.parser')

    product_names = []
    product_images = []
    product_prices = []

    products = soup.find_all('div', class_='product-list__item')
    print(f"Number of products found: {len(products)}")

    for product in products:
        name_tag = product.find('a', class_='range--title')
        image_tag = product.find('img', class_='product-card__img')
        price_tag = product.find('strong', class_='price')

        if name_tag:
            name = name_tag.get_text(strip=True)
        else:
            print("Warning: Name tag not found!")
            name = "N/A"

        if image_tag:
            image = image_tag.get('src') or image_tag.get('data-src', "N/A")
        else:
            print("Warning: Image tag not found!")
            image = "N/A"

        if price_tag:
            price = price_tag.get_text(strip=True)
        else:
            print("Warning: Price tag not found!")
            price = "N/A"

        product_names.append(name)
        product_images.append(image)
        product_prices.append(price)

    await browser.close()

    data = pd.DataFrame({
        'Product Name': product_names,
        'Image URL': product_images,
        'Price': product_prices
    })

    return data

def main():
    url = 'https://www.woolworths.co.za/cat/Food/Fruit-Vegetables-Salads/_/N-lllnam'

    data = scrape_with_requests(url)

    if data is None or data.empty:
        print("Attempting to scrape using pyppeteer...")
        data = asyncio.run(scrape_with_pyppeteer(url))

    if data is not None and not data.empty:
        data.to_csv('woolworths_products.csv', index=False)
        print("Scraping completed. Data saved to woolworths_products.csv")
    else:
        print("No data was scraped.")

if __name__ == '__main__':
    main()
