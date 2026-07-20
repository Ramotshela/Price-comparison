import asyncio
import logging

from bs4 import BeautifulSoup

from scrapers.core.base_scraper import BaseScraper
from scrapers.core.models import Product

logger = logging.getLogger(__name__)

BASE_URL = "https://www.shoprite.co.za"

CATEGORIES = [
    {"url": f"{BASE_URL}/department/bakery/baked-and-ready-made-confectionary-2-670437ef7a8738098af92e2c", "category": "Bakery"},
    {"url": f"{BASE_URL}/department/bakery/bread-rolls-wraps-and-bagels-2-670437dc7a8738098af92e28", "category": "Bakery"},
    {"url": f"{BASE_URL}/department/bakery/cakes-cupcakes-and-tarts-2-670437e57a8738098af92e2a", "category": "Bakery"},
    {"url": f"{BASE_URL}/department/bakery/croissants-scones-and-muffins-2-670437e27a8738098af92e29", "category": "Bakery"},
    {"url": f"{BASE_URL}/department/bakery/pies-2-670437ec7a8738098af92e2b", "category": "Bakery"},
    {"url": f"{BASE_URL}/department/beverages-juices-and-cordials/cordials-concentrates-and-squashes-2-6704323e7a8738098af92e19", "category": "Beverages"},
    {"url": f"{BASE_URL}/department/beverages-juices-and-cordials/dairy-blends-2-670432407a8738098af92e1d", "category": "Beverages"},
    {"url": f"{BASE_URL}/department/beverages-juices-and-cordials/energy-drinks-2-6704323f7a8738098af92e1a", "category": "Beverages"},
    {"url": f"{BASE_URL}/department/beverages-juices-and-cordials/flavoured-milk-2-6704323f7a8738098af92e1b", "category": "Beverages"},
    {"url": f"{BASE_URL}/department/beverages-juices-and-cordials/fresh-juice-2-670432417a8738098af92e21", "category": "Beverages"},
    {"url": f"{BASE_URL}/department/beverages-juices-and-cordials/health-drinks-2-674dc0b9a25001645bf43834", "category": "Beverages"},
    {"url": f"{BASE_URL}/department/beverages-juices-and-cordials/ice-teas-and-ice-coffees-2-6704323f7a8738098af92e1c", "category": "Beverages"},
    {"url": f"{BASE_URL}/department/beverages-juices-and-cordials/juices-2-670432407a8738098af92e1e", "category": "Beverages"},
    {"url": f"{BASE_URL}/department/beverages-juices-and-cordials/soda-mixers-2-670432417a8738098af92e22", "category": "Beverages"},
    {"url": f"{BASE_URL}/department/beverages-juices-and-cordials/soft-drinks-2-670432427a8738098af92e23", "category": "Beverages"},
    {"url": f"{BASE_URL}/department/beverages-juices-and-cordials/waters-2-670432447a8738098af92e26", "category": "Beverages"},
    {"url": f"{BASE_URL}/department/coffee-tea-and-hot-drinks/beans-ground-and-capsules-2-67075defff98781136400779", "category": "Coffee & Tea"},
    {"url": f"{BASE_URL}/department/coffee-tea-and-hot-drinks/coffee-creamer-and-milk-powders-2-67075df1ff9878113640077b", "category": "Coffee & Tea"},
    {"url": f"{BASE_URL}/department/coffee-tea-and-hot-drinks/coffee-syrups-2-67075df5ff9878113640077f", "category": "Coffee & Tea"},
    {"url": f"{BASE_URL}/department/coffee-tea-and-hot-drinks/creamers-and-milk-powders-2-67075df4ff9878113640077e", "category": "Coffee & Tea"},
    {"url": f"{BASE_URL}/department/coffee-tea-and-hot-drinks/instant-coffees-2-67075df0ff9878113640077a", "category": "Coffee & Tea"},
    {"url": f"{BASE_URL}/department/coffee-tea-and-hot-drinks/powdered-drinks-2-67075df3ff9878113640077d", "category": "Coffee & Tea"},
    {"url": f"{BASE_URL}/department/coffee-tea-and-hot-drinks/teas-2-67075df2ff9878113640077c", "category": "Coffee & Tea"},
    {"url": f"{BASE_URL}/department/deli-and-chilled-meats/bacon-2-6707a564c927aad4bab8dbcc", "category": "Deli & Chilled Meats"},
    {"url": f"{BASE_URL}/department/deli-and-chilled-meats/deli-meat-and-charcuterie-2-6707a569c927aad4bab8dbd1", "category": "Deli & Chilled Meats"},
    {"url": f"{BASE_URL}/department/deli-and-chilled-meats/ham-2-6707a56ac927aad4bab8dbd2", "category": "Deli & Chilled Meats"},
    {"url": f"{BASE_URL}/department/deli-and-chilled-meats/meze-dips-spreads-and-pate-2-6707a562c927aad4bab8dbcb", "category": "Deli & Chilled Meats"},
    {"url": f"{BASE_URL}/department/deli-and-chilled-meats/olives-and-pickles-2-6707a565c927aad4bab8dbcd", "category": "Deli & Chilled Meats"},
    {"url": f"{BASE_URL}/department/deli-and-chilled-meats/polonies-and-meat-loaves-2-6707a566c927aad4bab8dbce", "category": "Deli & Chilled Meats"},
    {"url": f"{BASE_URL}/department/deli-and-chilled-meats/russians-grillers-and-frankfurters-2-6707a568c927aad4bab8dbd0", "category": "Deli & Chilled Meats"},
    {"url": f"{BASE_URL}/department/deli-and-chilled-meats/seafood-2-6707a562c927aad4bab8dbca", "category": "Deli & Chilled Meats"},
    {"url": f"{BASE_URL}/department/deli-and-chilled-meats/viennas-and-sausages-2-6707a567c927aad4bab8dbcf", "category": "Deli & Chilled Meats"},
    {"url": f"{BASE_URL}/department/fish-and-seafood/crumbed-fish-2-67075df6ff98781136400781", "category": "Fish & Seafood"},
    {"url": f"{BASE_URL}/department/fish-and-seafood/fish-2-67075df7ff98781136400782", "category": "Fish & Seafood"},
    {"url": f"{BASE_URL}/department/fish-and-seafood/seafood-2-67075dfaff98781136400784", "category": "Fish & Seafood"},
    {"url": f"{BASE_URL}/department/food-cupboard/breakfast-cereals-porridge-and-pap-2-67075db7ff98781136400739", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/cans-tins-and-jars-2-67075dbaff9878113640073d", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/condiments-sauces-and-marinades-2-67075dbfff98781136400743", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/cook-in-sauces-and-kits-2-67075dc1ff98781136400748", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/crackers-and-crispbreads-2-67075dc2ff98781136400749", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/custard-jellies-and-puddings-2-67075dc2ff9878113640074a", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/flour-and-baking-2-67075dc3ff9878113640074b", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/health-foods-and-drinks-2-67075dc9ff98781136400752", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/herbs-spices-and-seasoning-2-67075dcaff98781136400753", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/jams-honey-and-spreads-2-67075dd2ff98781136400758", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/long-life-milk-and-dairy-alternatives-2-67075dd9ff98781136400760", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/meal-kits-2-67fe00a4abd0b1abcd96ef89", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/oils-salad-dressing-and-vinegars-2-67075dddff98781136400764", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/packed-soup-stocks-and-gravy-2-67075de2ff9878113640076a", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/pasta-rice-grains-and-legumes-2-67075de5ff9878113640076e", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/food-cupboard/sugar-and-sweeteners-2-67075deaff98781136400773", "category": "Food Cupboard"},
    {"url": f"{BASE_URL}/department/frozen-foods/frozen-burgers-2-67075db6ff98781136400736", "category": "Frozen Foods"},
    {"url": f"{BASE_URL}/department/frozen-foods/frozen-chips-and-potatoes-2-67075db3ff98781136400731", "category": "Frozen Foods"},
    {"url": f"{BASE_URL}/department/frozen-foods/frozen-desserts-and-ice-cream-2-67075db4ff98781136400734", "category": "Frozen Foods"},
    {"url": f"{BASE_URL}/department/frozen-foods/frozen-fruit-and-ice-2-67075db4ff98781136400733", "category": "Frozen Foods"},
    {"url": f"{BASE_URL}/department/frozen-foods/frozen-health-foods-2-67075db7ff98781136400737", "category": "Frozen Foods"},
    {"url": f"{BASE_URL}/department/frozen-foods/frozen-meat-and-poultry-2-67075db0ff9878113640072c", "category": "Frozen Foods"},
    {"url": f"{BASE_URL}/department/frozen-foods/frozen-pizza-pies-and-pastries-2-67075db5ff98781136400735", "category": "Frozen Foods"},
    {"url": f"{BASE_URL}/department/frozen-foods/frozen-ready-meals-2-67075db3ff98781136400730", "category": "Frozen Foods"},
    {"url": f"{BASE_URL}/department/frozen-foods/frozen-vegetables-2-67075db2ff9878113640072f", "category": "Frozen Foods"},
    {"url": f"{BASE_URL}/department/frozen-foods/frozen-vegetarian-2-67075db4ff98781136400732", "category": "Frozen Foods"},
    {"url": f"{BASE_URL}/department/fruit-veg-and-salads/fruits-2-67075da3ff9878113640070c", "category": "Fresh Fruits"},
    {"url": f"{BASE_URL}/department/fruit-veg-and-salads/herbs-2-67075dafff98781136400729", "category": "Vegetables"},
    {"url": f"{BASE_URL}/department/fruit-veg-and-salads/salad-vegetables-2-67075dafff9878113640072a", "category": "Vegetables"},
    {"url": f"{BASE_URL}/department/fruit-veg-and-salads/vegetables-2-67075da8ff98781136400718", "category": "Vegetables"},
    {"url": f"{BASE_URL}/department/meat-and-poultry/beef-2-6707a56dc927aad4bab8dbd7", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/department/meat-and-poultry/biltong-and-droewors-2-6707a577c927aad4bab8dbe3", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/department/meat-and-poultry/boerewors-and-sausages-2-6707a56cc927aad4bab8dbd6", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/department/meat-and-poultry/burgers-and-meatballs-2-6707a56bc927aad4bab8dbd5", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/department/meat-and-poultry/crumbed-chicken-2-6707a576c927aad4bab8dbe2", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/department/meat-and-poultry/fresh-poultry-2-6707a572c927aad4bab8dbe1", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/department/meat-and-poultry/lamb-2-6707a56fc927aad4bab8dbdb", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/department/meat-and-poultry/livers-and-offal-2-6707a578c927aad4bab8dbe6", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/department/meat-and-poultry/mince-2-6707a56bc927aad4bab8dbd4", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/department/meat-and-poultry/pork-2-6707a571c927aad4bab8dbde", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/department/meat-and-poultry/ready-to-braai-2-6707a57dc927aad4bab8dbee", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/department/meat-and-poultry/ribs-2-6707a57ac927aad4bab8dbeb", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/department/meat-and-poultry/sosaties-and-espetadas-2-6707a57cc927aad4bab8dbed", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/department/meat-and-poultry/venison-and-game-2-6707a579c927aad4bab8dbe8", "category": "Meat & Poultry"},
    {"url": f"{BASE_URL}/department/milk-dairy-and-eggs/butter-and-margarine-2-67075e2bff987811364007ae", "category": "Dairy & Eggs"},
    {"url": f"{BASE_URL}/department/milk-dairy-and-eggs/cheese-2-67075e2eff987811364007b1", "category": "Dairy & Eggs"},
    {"url": f"{BASE_URL}/department/milk-dairy-and-eggs/eggs-2-67075e27ff987811364007aa", "category": "Dairy & Eggs"},
    {"url": f"{BASE_URL}/department/milk-dairy-and-eggs/milk-and-cream-2-67075e29ff987811364007ab", "category": "Dairy & Eggs"},
    {"url": f"{BASE_URL}/department/milk-dairy-and-eggs/yoghurts-2-67075e34ff987811364007b6", "category": "Dairy & Eggs"},
    {"url": f"{BASE_URL}/department/ready-meals-and-desserts/desserts-and-puddings-2-6707a55ac927aad4bab8dbc3", "category": "Ready Meals"},
    {"url": f"{BASE_URL}/department/ready-meals-and-desserts/entertaining-2-6707a55cc927aad4bab8dbc5", "category": "Ready Meals"},
    {"url": f"{BASE_URL}/department/ready-meals-and-desserts/food-to-go-2-6707a55dc927aad4bab8dbc8", "category": "Ready Meals"},
    {"url": f"{BASE_URL}/department/ready-meals-and-desserts/fresh-sauce-and-pastes-2-6707a55dc927aad4bab8dbc7", "category": "Ready Meals"},
    {"url": f"{BASE_URL}/department/ready-meals-and-desserts/heat-and-eat-meals-2-6707a559c927aad4bab8dbc0", "category": "Ready Meals"},
    {"url": f"{BASE_URL}/department/ready-meals-and-desserts/pies-and-quiches-2-6707a55cc927aad4bab8dbc6", "category": "Ready Meals"},
    {"url": f"{BASE_URL}/department/ready-meals-and-desserts/pizzas-and-pizza-bases-2-6707a558c927aad4bab8dbbe", "category": "Ready Meals"},
    {"url": f"{BASE_URL}/department/ready-meals-and-desserts/ready-to-cook-2-6707a55bc927aad4bab8dbc4", "category": "Ready Meals"},
    {"url": f"{BASE_URL}/department/ready-meals-and-desserts/salads-2-6707a55ac927aad4bab8dbc2", "category": "Ready Meals"},
    {"url": f"{BASE_URL}/department/ready-meals-and-desserts/soups-2-6707a559c927aad4bab8dbc1", "category": "Ready Meals"},
    {"url": f"{BASE_URL}/department/ready-meals-and-desserts/subs-sandwiches-and-wraps-2-6707a558c927aad4bab8dbbf", "category": "Ready Meals"},
    {"url": f"{BASE_URL}/department/sweets-and-snacks/biltong-dried-fruit-nuts-and-snacks-2-67075e1cff987811364007a1", "category": "Sweets & Snacks"},
    {"url": f"{BASE_URL}/department/sweets-and-snacks/biscuits-rusks-and-crackers-2-67075e23ff987811364007a5", "category": "Sweets & Snacks"},
    {"url": f"{BASE_URL}/department/sweets-and-snacks/chewing-gum-and-mints-2-67075e1fff987811364007a2", "category": "Sweets & Snacks"},
    {"url": f"{BASE_URL}/department/sweets-and-snacks/chips-popcorn-and-pretzels-2-67075e1bff987811364007a0", "category": "Sweets & Snacks"},
    {"url": f"{BASE_URL}/department/sweets-and-snacks/chocolates-2-67075e21ff987811364007a4", "category": "Sweets & Snacks"},
    {"url": f"{BASE_URL}/department/sweets-and-snacks/sweets-2-67075e20ff987811364007a3", "category": "Sweets & Snacks"},
    {"url": f"{BASE_URL}/department/wine-beers-and-spirits/beer-2-67075e16ff9878113640079b", "category": "Wine, Beers & Spirits"},
    {"url": f"{BASE_URL}/department/wine-beers-and-spirits/ciders-and-coolers-2-67075e17ff9878113640079c", "category": "Wine, Beers & Spirits"},
    {"url": f"{BASE_URL}/department/wine-beers-and-spirits/liqueur-and-shooters-2-67075e0cff9878113640078e", "category": "Wine, Beers & Spirits"},
    {"url": f"{BASE_URL}/department/wine-beers-and-spirits/spirits-2-67075e0fff98781136400792", "category": "Wine, Beers & Spirits"},
    {"url": f"{BASE_URL}/department/wine-beers-and-spirits/wines-2-67075dfdff98781136400786", "category": "Wine, Beers & Spirits"},
]


class ShopriteScraper(BaseScraper):
    shop_name = "Shoprite"

    def scrape(self) -> list[Product]:
        all_products: list[Product] = []
        for entry in CATEGORIES:
            products = asyncio.run(self._scrape_category(entry["url"], entry["category"]))
            all_products.extend(products)
            logger.info("%s: scraped %d items", entry["category"], len(products))
        return all_products

    async def _scrape_category(self, url: str, category: str) -> list[Product]:
        try:
            from playwright.async_api import async_playwright  # pylint: disable=import-outside-toplevel

            async with async_playwright() as p:
                browser = await p.chromium.launch(
                    headless=True,
                    args=["--disable-blink-features=AutomationControlled"],
                )
                context = await browser.new_context(
                    user_agent=(
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/125.0.0.0 Safari/537.36"
                    ),
                    locale="en-ZA",
                    extra_http_headers={
                        "Accept-Language": "en-ZA,en;q=0.9",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    },
                )
                await context.add_init_script(
                    "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
                )
                page = await context.new_page()
                products = await self._scrape_page(page, url, category)
                await browser.close()
                return products
        except Exception as exc:
            logger.error("Shoprite scrape failed for %s: %s", url, exc)
            return []

    async def _scrape_page(self, page, url: str, category: str) -> list[Product]:
        try:
            await page.goto(url, timeout=60000, wait_until="domcontentloaded")
            await page.wait_for_selector("div[class*='product-card_card__']", timeout=20000)
            await self._scroll_to_bottom(page)
            html = await page.content()
            return self._parse(BeautifulSoup(html, "html.parser"), category)
        except Exception as exc:
            logger.warning("Failed to scrape %s: %s", url, exc)
            return []

    @staticmethod
    async def _scroll_to_bottom(page) -> None:
        prev_height = 0
        for _ in range(20):
            await page.evaluate("window.scrollBy(0, window.innerHeight)")
            await page.wait_for_timeout(500)
            height = await page.evaluate("document.body.scrollHeight")
            if height == prev_height:
                break
            prev_height = height

    def _parse(self, soup: BeautifulSoup, category: str) -> list[Product]:
        items: list[Product] = []
        for card in soup.find_all("div", class_=lambda c: c and "product-card_card__" in c):
            name_tag = card.find("p", class_=lambda c: c and "product-card_product-name__" in c)
            name = self.safe_text(name_tag)

            full = self.safe_text(card.find("span", class_=lambda c: c and "price-display_full__" in c))
            half = self.safe_text(card.find("span", class_=lambda c: c and "price-display_half__" in c))
            price = f"{full}{half}" if full else ""

            img_tag = card.find("img")
            image_url = self.safe_attr(img_tag, "src")

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
