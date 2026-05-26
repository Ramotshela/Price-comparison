import asyncio
import logging

from bs4 import BeautifulSoup

from scrapers.core.base_scraper import BaseScraper
from scrapers.core.models import Product

logger = logging.getLogger(__name__)

URL = "https://www.woolworths.co.za/cat/Food/Fruit-Vegetables-Salads/_/N-lllnam"


class WoolworthsScraper(BaseScraper):
    shop_name = "Woolworths"

    def scrape(self) -> list[Product]:
        products = self._scrape_static()
        if not products:
            logger.info("Static scrape empty, falling back to browser render")
            products = asyncio.run(self._scrape_dynamic())
        logger.info("Woolworths: scraped %d items", len(products))
        return products

    def _scrape_static(self) -> list[Product]:
        try:
            soup = self.fetch_html(URL)
            return self._parse(soup)
        except (ConnectionError, TimeoutError, ValueError, OSError) as exc:
            logger.error("Static scrape failed: %s", exc)
            return []

    async def _scrape_dynamic(self) -> list[Product]:
        try:
            from pyppeteer import launch  # pylint: disable=import-outside-toplevel

            browser = await launch(headless=True)
            page = await browser.newPage()
            await page.goto(URL, timeout=60000, waitUntil="networkidle2")
            await page.waitForSelector(".product-list__item")
            html = await page.content()
            await browser.close()
            return self._parse(BeautifulSoup(html, "html.parser"))
        except (ImportError, ConnectionError, TimeoutError, OSError) as exc:
            logger.error("Dynamic scrape failed: %s", exc)
            return []

    def _parse(self, soup: BeautifulSoup) -> list[Product]:
        items: list[Product] = []
        for div in soup.find_all("div", class_="product-list__item"):
            name = self.safe_text(div.find("a", class_="range--title"))
            img_tag = div.find("img", class_="product-card__img")
            image_url = self.safe_attr(img_tag, "src", "data-src")
            price = self.safe_text(div.find("strong", class_="price"))

            if not name:
                continue

            items.append(Product(
                name=name,
                price=price,
                image_url=image_url,
                category="Fruit & Vegetables",
                shop_name=self.shop_name,
            ))
        return items
