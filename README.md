# Price Comparison

A fullstack app that scrapes retailer product pages, stores the results, and serves them to a web client for price comparison — with email notifications for price changes.

## Structure
- **`scripts/`** — Python scrapers (`requests` + `BeautifulSoup`, with `pyppeteer` for JS-rendered pages) that collect product names, images, and prices from retailer sites (e.g. Shoprite) into `products.csv`
- **`backend/`** — Express API backed by MongoDB (`mongodb`/`mongoose`), exposing product data via `routes/product.js`
- **`client/`** — React + Vite frontend for browsing and comparing prices
- Root-level `nodemailer` dependency for sending notifications (e.g. price-drop alerts)

## Running locally

**Backend**
```
cd backend
npm install
node server/server.js
```
Requires a MongoDB connection configured in `backend/database/mongoClient.js`. Runs on `http://localhost:3000`.

**Client**
```
cd client
npm install
npm run dev
```

**Scrapers**
```
cd scripts
pip install requests beautifulsoup4 pandas pyppeteer
python main.py
```
