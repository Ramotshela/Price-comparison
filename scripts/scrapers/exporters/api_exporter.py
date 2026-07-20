import logging
import os
from collections import defaultdict

import requests

from scrapers.core.models import Product

logger = logging.getLogger(__name__)

API_URL = os.getenv("API_URL", "http://localhost:3000")
SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY", "")


def export_api(products: list[Product]) -> int:
    # Group by shop so each store gets its own sync request
    by_shop: dict[str, list[dict]] = defaultdict(list)
    for p in products:
        by_shop[p.shop_name].append(p.to_dict())

    total = 0
    for shop_name, docs in by_shop.items():
        try:
            resp = requests.post(
                f"{API_URL}/sync-products",
                json={"shopName": shop_name, "products": docs},
                headers={"x-api-key": SCRAPER_API_KEY},
                timeout=60,
            )
            resp.raise_for_status()
            data = resp.json().get("data", {})
            logger.info(
                "%s — %d new, %d updated, %d removed",
                shop_name,
                data.get("upsertedCount", 0),
                data.get("modifiedCount", 0),
                data.get("deletedCount", 0),
            )
            total += data.get("upsertedCount", 0) + data.get("modifiedCount", 0)
        except Exception:
            logger.exception("API sync failed for %s", shop_name)

    return total
