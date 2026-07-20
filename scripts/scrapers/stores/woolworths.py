import asyncio
import logging

from bs4 import BeautifulSoup

from scrapers.core.base_scraper import BaseScraper
from scrapers.core.models import Product

logger = logging.getLogger(__name__)

BASE_URL = "https://www.woolworths.co.za/cat/Food"

CATEGORIES = [
    {"url": f"{BASE_URL}/Fruit-Vegetables-Salads/_/N-lllnam", "category": "Fruit & Vegetables"},
    {"url": f"{BASE_URL}/Meat-Poultry-Fish/_/N-lllnaq", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/Dairy-Eggs-Deli/_/N-lllnai", "category": "Dairy & Eggs"},
    {"url": f"{BASE_URL}/Bakery/_/N-lllnaf", "category": "Bakery"},
    {"url": f"{BASE_URL}/Frozen-Foods/_/N-lllnak", "category": "Frozen Foods"},
    {"url": f"{BASE_URL}/Beverages/_/N-lllnag", "category": "Beverages"},
    {"url": f"{BASE_URL}/Snacks-Confectionery/_/N-lllnat", "category": "Snacks & Confectionery"},
    {"url": f"{BASE_URL}/Pantry/_/N-lllnar", "category": "Pantry"},
    {"url": f"{BASE_URL}/Ready-Meals/_/N-lllnas", "category": "Ready Meals"},
    {"url": f"{BASE_URL}/Organic/_/N-lllnap", "category": "Organic"},
]

SELECTOR = "article[data-testid='product-card']"


class WoolworthsScraper(BaseScraper):
    shop_name = "Woolworths"

    def scrape(self) -> list[Product]:
        all_products: list[Product] = []
        for entry in CATEGORIES:
            products = asyncio.run(self._scrape_category(entry["url"], entry["category"]))
            all_products.extend(products)
            logger.info("Woolworths %s: scraped %d items", entry["category"], len(products))
        return all_products

    async def _scrape_category(self, url: str, category: str) -> list[Product]:
        products = self._scrape_static(url, category)
        if not products:
            logger.info("Static scrape empty for %s, falling back to browser render", category)
            products = await self._scrape_dynamic(url, category)
        return products

    def _scrape_static(self, url: str, category: str) -> list[Product]:
        try:
            soup = self.fetch_html(url)
            return self._parse(soup, category)
        except (ConnectionError, TimeoutError, ValueError, OSError) as exc:
            logger.error("Static scrape failed for %s: %s", category, exc)
            return []

    async def _scrape_dynamic(self, url: str, category: str) -> list[Product]:
        try:
            from playwright.async_api import async_playwright  # pylint: disable=import-outside-toplevel

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                await page.goto(url, timeout=60000, wait_until="domcontentloaded")
                try:
                    await page.wait_for_selector(SELECTOR, timeout=30000)
                except Exception:
                    logger.warning("Selector not found for %s — page may be empty or URL invalid", category)
                html = await page.content()
                await browser.close()
            return self._parse(BeautifulSoup(html, "html.parser"), category)
        except Exception as exc:
            logger.error("Dynamic scrape failed for %s: %s", category, exc)
            return []

    def _parse(self, soup: BeautifulSoup, category: str) -> list[Product]:
        items: list[Product] = []
        for article in soup.find_all("article", attrs={"data-testid": "product-card"}):
            name = article.get("data-cnstrc-item-name", "").strip()
            price = article.get("data-cnstrc-item-price", "").strip()
            img_tag = article.find("img")
            image_url = img_tag["src"] if img_tag and img_tag.get("src") else ""

            if not name:
                continue

            items.append(Product(
                name=name,
                price=price,
                image_url=image_url,
                category=category,
                shop_name=self.shop_name,
            ))
        return items
