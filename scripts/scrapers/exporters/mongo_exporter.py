import logging

import pymongo

from scrapers.config import MONGO_URI, MONGO_DB, MONGO_COLLECTION
from scrapers.core.models import Product

logger = logging.getLogger(__name__)


def export_mongo(products: list[Product]) -> int:
    if not MONGO_URI:
        logger.error("MONGO_URI not set — skipping MongoDB export")
        return 0

    client = pymongo.MongoClient(MONGO_URI)
    try:
        collection = client[MONGO_DB][MONGO_COLLECTION]
        ops = [
            pymongo.UpdateOne(
                {"Shop Name": p.shop_name, "Product Name": p.name},
                {"$set": p.to_dict()},
                upsert=True,
            )
            for p in products
        ]
        result = collection.bulk_write(ops, ordered=False)
        count = result.upserted_count + result.modified_count
        logger.info("Upserted %d products into %s.%s", count, MONGO_DB, MONGO_COLLECTION)
        return count
    finally:
        client.close()
