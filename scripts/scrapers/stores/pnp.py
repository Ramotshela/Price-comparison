import asyncio
import logging

from bs4 import BeautifulSoup

from scrapers.core.base_scraper import BaseScraper
from scrapers.core.models import Product

logger = logging.getLogger(__name__)

URL = "https://www.pnp.co.za/c/pnpbase"


class PnPScraper(BaseScraper):
    shop_name = "Pick n Pay"

    def scrape(self) -> list[Product]:
        products = asyncio.run(self._scrape_dynamic())
        logger.info("PnP: scraped %d items", len(products))
        return products

    async def _scrape_dynamic(self) -> list[Product]:
        try:
            from playwright.async_api import async_playwright  # pylint: disable=import-outside-toplevel

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                await page.goto(URL, timeout=60000, wait_until="domcontentloaded")
                await page.wait_for_selector("ui-product-grid-item", timeout=30000)
                html = await page.content()
                await browser.close()
            return self._parse(BeautifulSoup(html, "html.parser"))
        except Exception as exc:
            logger.error("PnP scrape failed: %s", exc)
            return []

    def _parse(self, soup: BeautifulSoup) -> list[Product]:
        items: list[Product] = []
        for el in soup.find_all("ui-product-grid-item"):
            name_tag = el.select_one("a.product-grid-item__info-container__name span")
            price_tag = el.select_one("div.price")
            img_tag = el.select_one("cx-media img")

            name = name_tag.get_text(strip=True) if name_tag else ""
            price = price_tag.get_text(strip=True).replace("R", "").split()[0] if price_tag else ""
            image_url = img_tag["src"] if img_tag and img_tag.get("src") else ""

            if not name:
                continue

            items.append(Product(
                name=name,
                price=price,
                image_url=image_url,
                category="Groceries",
                shop_name=self.shop_name,
            ))
        return items
