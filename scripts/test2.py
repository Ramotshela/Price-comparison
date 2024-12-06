from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time

# Set up Selenium WebDriver
options = Options()
options.add_argument('--headless')  # Run in headless mode
service = Service('C:/Users/msngr/OneDrive/Desktop/chromedriver-win64/chromedriver.exe')  # Path to your chromedriver
driver = webdriver.Chrome(service=service, options=options)

# Open the webpage
driver.get('https://www.pnp.co.za/c/pnpbase')

# Allow time for JavaScript to load
time.sleep(5)

# Find all product items
products = driver.find_elements(By.CSS_SELECTOR, 'ui-product-grid-item')

# List to store product data
product_list = []

for product in products:
    name = product.find_element(By.CSS_SELECTOR, 'a.product-grid-item__info-container__name').text.strip()
    price = product.find_element(By.CSS_SELECTOR, 'cms-price').text.strip()
    image = product.find_element(By.CSS_SELECTOR, 'img').get_attribute('src')
    link = product.find_element(By.CSS_SELECTOR, 'a.product-grid-item__image-container').get_attribute('href')
    
    product_list.append({
        'name': name,
        'price': price,
        'image': image,
        'link': link
    })

# Print the extracted data
for product in product_list:
    print(product)

# Close the WebDriver
driver.quit()
