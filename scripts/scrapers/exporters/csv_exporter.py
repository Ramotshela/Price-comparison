import csv
import logging
from pathlib import Path

from scrapers.config import OUTPUT_DIR
from scrapers.core.models import Product

logger = logging.getLogger(__name__)

FIELDNAMES = ["Product Name", "Price", "Image URL", "Category", "Shop Name"]


def export_csv(products: list[Product], filename: str = "products.csv") -> Path:
    path = OUTPUT_DIR / filename
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        for p in products:
            writer.writerow(p.to_dict())
    logger.info("Exported %d products to %s", len(products), path)
    return path
