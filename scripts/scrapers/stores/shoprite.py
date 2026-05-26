import logging
from urllib.parse import urljoin

from scrapers.config import MAX_PAGES
from scrapers.core.base_scraper import BaseScraper
from scrapers.core.models import Product

logger = logging.getLogger(__name__)

CATEGORIES = [
    {
        "url": (
            "https://www.shoprite.co.za/c-2423/All-Departments/Food/Fresh-Food/"
            "Fresh-Vagetables?q=%3Arelevance%3AallCategories%3Afood"
            "%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=1"
        ),
        "category": "Vegetables",
    },
    {
        "url": (
            "https://www.shoprite.co.za/c-66/All-Departments/Food/Fresh-Food/"
            "Fresh-Fruit?q=%3Arelevance%3AbrowseAllStoresFacet%3AbrowseAllStoresFacet"
            "%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=1"
        ),
        "category": "Fresh Fruits",
    },
]


class ShopriteScraper(BaseScraper):
    shop_name = "Shoprite"

    def scrape(self) -> list[Product]:
        all_products: list[Product] = []
        for entry in CATEGORIES:
            products = self._scrape_category(entry["url"], entry["category"])
            all_products.extend(products)
            logger.info("%s: scraped %d items", entry["category"], len(products))
        return all_products

    def _scrape_category(self, start_url: str, category: str) -> list[Product]:
        products: list[Product] = []
        url = start_url

        for page in range(1, MAX_PAGES + 1):
            logger.info("Page %d: %s", page, url)
            try:
                soup = self.fetch_html(url)
            except Exception:
                logger.exception("Failed to fetch page %d", page)
                break

            page_products = self._parse_page(soup, category)
            if not page_products:
                break
            products.extend(page_products)

            next_url = self._next_page_url(soup, start_url)
            if not next_url:
                break
            url = next_url

        return products

    def _parse_page(self, soup, category: str) -> list[Product]:
        items: list[Product] = []
        for fig in soup.find_all("figure", class_="item-product__content"):
            img = fig.find("img")
            name = self.safe_attr(img, "alt", default="")
            image_url = self.safe_attr(img, "data-original-src", default="")
            price = self.safe_text(fig.find("span", class_="now"))

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

    @staticmethod
    def _next_page_url(soup, base_url: str) -> str | None:
        li = soup.find("li", class_="pagination-next")
        if not li:
            return None
        a = li.find("a", href=True)
        return urljoin(base_url, a["href"]) if a else None
