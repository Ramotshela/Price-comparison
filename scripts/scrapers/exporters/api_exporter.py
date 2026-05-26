import logging
import os

import requests

from scrapers.core.models import Product

logger = logging.getLogger(__name__)

API_URL = os.getenv("API_URL", "http://localhost:3000")


def export_api(products: list[Product]) -> int:
    url = f"{API_URL}/insert-products"
    docs = [p.to_dict() for p in products]
    try:
        resp = requests.post(url, json=docs, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        count = data.get("data", {}).get("insertedCount", 0)
        logger.info("Inserted %d products via API", count)
        return count
    except Exception:
        logger.exception("API export failed")
        return 0
