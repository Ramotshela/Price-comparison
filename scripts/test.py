from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import pandas as pd

# Set up Selenium WebDriver
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run in headless mode
service = Service('C:/Users/msngr/OneDrive/Desktop/chromedriver-win64/chromedriver.exe')  # Update with the path to your chromedriver
driver = webdriver.Chrome(service=service, options=chrome_options)

# Open the URL
driver.get('https://www.pnp.co.za')

# Wait for the page to load
driver.implicitly_wait(10)

# Extract product details (update the selectors according to the website structure)
products = driver.find_elements(By.CSS_SELECTOR, 'div.product-grid-item')

product_data = []
for product in products:
    name = product.get_attribute('data-cnstrc-item-name')  # Adjust the attribute or method to get the name
    price = product.find_element(By.CSS_SELECTOR, 'div.price_promo').text.strip()  # Adjust the selector
    image_tag = product.find_element(By.CSS_SELECTOR, 'cx-media img')
    image_url = image_tag.get_attribute('src') if image_tag else 'No image'
    product_data.append([name, price, image_url])

# Create a DataFrame from the product data
df = pd.DataFrame(product_data, columns=['Product Name', 'Price', 'Image URL'])

# Save the DataFrame to a CSV file
df.to_csv('products.csv', index=False)

print('Data saved to products.csv')

# Close the browser
driver.quit()
