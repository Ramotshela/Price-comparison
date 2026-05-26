import logging

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    StaleElementReferenceException,
    TimeoutException,
    NoSuchElementException,
)

from scrapers.config import SELENIUM_TIMEOUT
from scrapers.core.base_scraper import BaseScraper
from scrapers.core.browser import get_driver, close_driver
from scrapers.core.models import Product

logger = logging.getLogger(__name__)

URL = "https://www.pnp.co.za/c/pnpbase"
MAX_RETRIES = 3


class PnPScraper(BaseScraper):
    shop_name = "Pick n Pay"

    def scrape(self) -> list[Product]:
        try:
            products = self._scrape_with_selenium()
            logger.info("PnP: scraped %d items", len(products))
            return products
        finally:
            close_driver()

    def _scrape_with_selenium(self) -> list[Product]:
        driver = get_driver(headless=True)
        driver.get(URL)
        wait = WebDriverWait(driver, SELENIUM_TIMEOUT)

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                elements = wait.until(
                    EC.presence_of_all_elements_located(
                        (By.CSS_SELECTOR, "ui-product-grid-item")
                    )
                )
                return self._parse_elements(elements)
            except StaleElementReferenceException:
                logger.warning("Stale element (attempt %d/%d)", attempt, MAX_RETRIES)
            except TimeoutException:
                logger.warning("Timeout waiting for products")
                break

        return []

    def _parse_elements(self, elements) -> list[Product]:
        items: list[Product] = []
        for el in elements:
            try:
                name = el.get_attribute("data-cnstrc-item-name") or ""
                price = el.get_attribute("data-cnstrc-item-price") or ""
                try:
                    img = el.find_element(By.CSS_SELECTOR, "cx-media img")
                    image_url = img.get_attribute("src") or ""
                except NoSuchElementException:
                    image_url = ""

                if not name:
                    continue

                items.append(Product(
                    name=name,
                    price=price,
                    image_url=image_url,
                    category="Groceries",
                    shop_name=self.shop_name,
                ))
            except NoSuchElementException:
                continue
        return items
