import logging
from abc import ABC, abstractmethod

import requests
from bs4 import BeautifulSoup

from scrapers.config import REQUEST_HEADERS, REQUEST_TIMEOUT
from scrapers.core.models import Product

logger = logging.getLogger(__name__)


class BaseScraper(ABC):
    """Base class every store scraper must extend."""

    shop_name: str = ""

    @abstractmethod
    def scrape(self) -> list[Product]:
        """Run the full scrape and return a list of Products."""

    # ── shared helpers ──

    def fetch_html(self, url: str) -> BeautifulSoup:
        logger.info("GET %s", url)
        resp = requests.get(url, headers=REQUEST_HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "html.parser")

    @staticmethod
    def safe_text(tag, default: str = "") -> str:
        return tag.get_text(strip=True) if tag else default

    @staticmethod
    def safe_attr(tag, attr: str, fallback_attr: str = "", default: str = "") -> str:
        if not tag:
            return default
        return tag.get(attr) or tag.get(fallback_attr, default)
