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
        docs = [p.to_dict() for p in products]
        result = collection.insert_many(docs)
        count = len(result.inserted_ids)
        logger.info("Inserted %d products into %s.%s", count, MONGO_DB, MONGO_COLLECTION)
        return count
    finally:
        client.close()
