import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import pandas as pd

# Define the base URL for resolving relative URLs
base_url = "https://www.shoprite.co.za"

# Define headers to mimic a real browser request
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br'
}

# Define the base URL for resolving relative URLs
base_url = "https://www.shoprite.co.za/c-2256/All-Departments?q=%3Arelevance%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff%3AallCategories%3Afood#"

# Function to extract product data from HTML content
def extract_product_data(html):
    soup = BeautifulSoup(html, 'html.parser')
    products = []

    # Find all product containers
    for product_div in soup.find_all('figure', class_='item-product__content'):
        try:
            # Extract product details
            img_tag = product_div.find('img')
            product_name = img_tag['alt'] if img_tag else 'No Name'
            
            # Convert relative URL to absolute URL
            product_image_url = urljoin(base_url, img_tag['data-original-src']) if img_tag else 'No Image URL'
            
            # Extract price
            price_tag = product_div.find('span', class_='now')
            product_price = price_tag.get_text(strip=True) if price_tag else 'No Price'
            
            # Extract category
            name_tag = product_div.find('h3', class_='item-product__name')
            product_category = name_tag.get_text(strip=True) if name_tag else 'No Category'
            
            products.append({
                "Product Name": product_name,
                "Price": product_price,
                "Category": product_category,
                "Image URL": product_image_url
            })
        except AttributeError:
            continue

    return products

# Function to scrape all pages for a given start URL
def scrape_all_pages(start_url, max_pages=5):
    all_products = []
    current_page = 1
    while current_page <= max_pages:
        print(f"Scraping page {current_page} from {start_url}...")
        # Fetch the HTML content from the page
        response = requests.get(start_url, headers=headers)
        if response.status_code == 403:
            print("403 Forbidden: Access Denied. Check the URL or headers.")
            break

        html_content = response.text
        product_data = extract_product_data(html_content)
        all_products.extend(product_data)

        # Find the next page URL
        soup = BeautifulSoup(html_content, 'html.parser')
        next_page_li = soup.find('li', class_='pagination-next')
        if next_page_li:
            next_page_a = next_page_li.find('a')
            if next_page_a and next_page_a.get('href'):
                start_url = urljoin(base_url, next_page_a.get('href'))
                current_page += 1
            else:
                break
        else:
            break

    return all_products

# URL of the first page to scrape
start_url = 'https://www.shoprite.co.za/c-2256/All-Departments?q=%3Arelevance%3AbrowseAllStoresFacetOff%3AbrowseAllStoresFacetOff&page=1'

# Scrape data from all pages
all_product_data = scrape_all_pages(start_url, max_pages=10)  # Adjust max_pages as needed

# Create a DataFrame to store the scraped data
df = pd.DataFrame(all_product_data)

# Save the DataFrame to a CSV file
df.to_csv("shoprite_products.csv", index=False)

print("Data extraction completed. Data saved to shoprite_products.csv")
