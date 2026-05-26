from dataclasses import dataclass, asdict


@dataclass
class Product:
    name: str
    price: str
    image_url: str
    category: str = ""
    shop_name: str = ""

    def to_dict(self) -> dict:
        return {
            "Product Name": self.name,
            "Price": self.price,
            "Image URL": self.image_url,
            "Category": self.category,
            "Shop Name": self.shop_name,
        }
