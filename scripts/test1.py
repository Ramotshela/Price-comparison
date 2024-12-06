from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException, TimeoutException, NoSuchElementException
import time

# Path to your chromedriver executable
chromedriver_path = "C:/Users/msngr/OneDrive/Desktop/chromedriver-win64/chromedriver.exe"

# Set up Chrome options
chrome_options = Options()
chrome_options.add_argument("--headless")  # Optional: Run in headless mode

# Initialize WebDriver
service = Service(chromedriver_path)
driver = webdriver.Chrome(service=service, options=chrome_options)

def scrape_product_info(url):
    try:
        # Navigate to the webpage
        driver.get(url)
        print(f"Scraping URL: {url}")

        # Increase timeout
        wait = WebDriverWait(driver, 20)  # Wait up to 20 seconds

        # Loop to handle StaleElementReferenceException
        products = []
        for _ in range(3):  # Retry up to 3 times
            try:
                # Find all product elements
                product_elements = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "ui-product-grid-item")))

                for product in product_elements:
                    try:
                        # Extract product details
                        name = product.get_attribute("data-cnstrc-item-name")
                        price = product.get_attribute("data-cnstrc-item-price")
                        image_url_element = product.find_element(By.CSS_SELECTOR, "cx-media img")
                        image_url = image_url_element.get_attribute("src")

                        products.append({
                            "name": name,
                            "price": price,
                            "image_url": image_url
                        })
                    except NoSuchElementException:
                        print("NoSuchElementException caught. Skipping this product.")
                        continue

                break  # Exit loop if successful
            except StaleElementReferenceException:
                print("StaleElementReferenceException caught. Retrying...")
                time.sleep(1)  # Wait a bit before retrying
            except TimeoutException:
                print("TimeoutException caught. Elements not found.")
                break  # Exit loop if not found

        return products

    finally:
        # Close the browser
        driver.quit()

# Replace with the actual URL you want to scrape
url = "https://www.pnp.co.za/c/pnpbase"
products = scrape_product_info(url)

# Print or save the product information
for product in products:
    print(f"Name: {product['name']}")
    print(f"Price: {product['price']}")
    print(f"Image URL: {product['image_url']}")
    print("-------------")
