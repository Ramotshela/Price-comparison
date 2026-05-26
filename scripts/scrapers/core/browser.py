import logging

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

from scrapers.config import CHROME_DRIVER_PATH, SELENIUM_TIMEOUT

logger = logging.getLogger(__name__)

_driver: webdriver.Chrome | None = None


def get_driver(headless: bool = True) -> webdriver.Chrome:
    global _driver
    if _driver:
        return _driver

    opts = Options()
    if headless:
        opts.add_argument("--headless")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")

    service_args = {"executable_path": CHROME_DRIVER_PATH} if CHROME_DRIVER_PATH else {}
    service = Service(**service_args)

    _driver = webdriver.Chrome(service=service, options=opts)
    _driver.implicitly_wait(SELENIUM_TIMEOUT)
    logger.info("Chrome driver initialised (headless=%s)", headless)
    return _driver


def close_driver() -> None:
    global _driver
    if _driver:
        _driver.quit()
        _driver = None
        logger.info("Chrome driver closed")
