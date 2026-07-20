"""
Price Comparison Scraper CLI

Usage:
    python -m scrapers.cli --stores shoprite woolworths pnp --export csv mongo api
    python -m scrapers.cli --stores shoprite --export csv
    python -m scrapers.cli                                   # all stores, csv + mongo
"""

import argparse
import logging
import sys

from scrapers.core.models import Product
from scrapers.stores.shoprite import ShopriteScraper
from scrapers.stores.woolworths import WoolworthsScraper
from scrapers.stores.pnp import PnPScraper
from scrapers.exporters.csv_exporter import export_csv
from scrapers.exporters.mongo_exporter import export_mongo
from scrapers.exporters.api_exporter import export_api

STORE_MAP = {
    "shoprite": ShopriteScraper,
    "woolworths": WoolworthsScraper,
    "pnp": PnPScraper,
}

EXPORT_MAP = {
    "csv": export_csv,
    "mongo": export_mongo,
    "api": export_api,
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("scrapers")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Price Comparison Scraper")
    parser.add_argument(
        "--stores",
        nargs="+",
        choices=list(STORE_MAP.keys()),
        default=list(STORE_MAP.keys()),
        help="Stores to scrape (default: all)",
    )
    parser.add_argument(
        "--export",
        nargs="+",
        choices=list(EXPORT_MAP.keys()),
        default=["csv", "mongo"],
        help="Export targets (default: csv mongo)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    all_products: list[Product] = []

    for store_name in args.stores:
        logger.info("Scraping %s...", store_name)
        scraper = STORE_MAP[store_name]()
        try:
            products = scraper.scrape()
            all_products.extend(products)
            logger.info("%s: %d products", store_name, len(products))
        except Exception:
            logger.exception("Failed to scrape %s", store_name)

    if not all_products:
        logger.warning("No products scraped — nothing to export")
        sys.exit(1)

    # Deduplicate by (shop_name, name) — last occurrence wins
    seen: dict[tuple[str, str], Product] = {}
    for p in all_products:
        seen[(p.shop_name, p.name)] = p
    unique_products = list(seen.values())

    if len(unique_products) < len(all_products):
        logger.info("Deduplicated %d -> %d products", len(all_products), len(unique_products))

    logger.info("Total: %d products scraped", len(unique_products))

    for target in args.export:
        logger.info("Exporting to %s...", target)
        try:
            EXPORT_MAP[target](unique_products)
        except Exception:
            logger.exception("Failed to export to %s", target)


if __name__ == "__main__":
    main()
