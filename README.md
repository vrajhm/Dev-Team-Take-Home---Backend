# Stock Exchange - SCE’s Financial Advising App (Backend Only)

## Overview

SCE is starting a new finance team to combine the world of computing and stocks together. The team is really sad because they didn’t know that the stock market was crashing until it was too late. They lost THOUSANDS of dollars! To make sure this never happens again, we need to build an API service that keeps track of stock prices. That way you can get quotes on any stock at any time!

---

## Your Task

Develop a backend service using Node.js/Express (or any language/framework of your choice) that provides an API for retrieving and monitoring stock data.

The service will have the following endpoints:

---

## 1. Start Stock Monitoring

**Endpoint:**  
`POST /start-monitoring`

**Input:**  
Accepts a JSON payload with:

- `symbol` (string): the stock symbol (e.g., "AAPL")
- `minutes` (number): the minutes interval for refresh
- `seconds` (number): the seconds interval for refresh

**Behavior:**

- Validate the input:
  - Ensure the symbol is a non-empty string.
  - Ensure the time values are valid non-negative integers.
- Calculate the total refresh interval based on the minutes and seconds provided.
- Start a scheduled job (using `setInterval` or a similar mechanism) that fetches stock data from Finnhub’s Stock API for the given symbol at the specified interval.
- Each time the job runs, fetch the following data:
  - Open price of the day
  - High price of the day
  - Low price of the day
  - Current price
  - Previous close price
  - Time of the entry (timestamp when the data was fetched)
- Append each fetched record to an in-memory history for that symbol.

---

## 2. Retrieve Stock History

**Endpoint:**  
`GET /history?symbol=<stockSymbol>`

**Behavior:**

- Return the entire history of fetched stock data for the provided symbol as a JSON array.

---

## 3. Immediate Refresh (Optional Bonus)

**Endpoint:**  
`POST /refresh`

**Input:**  
Accepts a JSON payload with:

- `symbol` (string)

**Behavior:**

- Immediately fetch the latest stock data for the given symbol using the same data points as above.
- Append the new record to the history.
- Return the new record in the response.

---

## Helpful Links

- Finnhub’s Stock APIs: https://finnhub.io/docs/api
- JavaScript Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- Express Documentation: https://expressjs.com/

---

## Considerations

- Use JavaScript’s `fetch` (or an equivalent HTTP client like axios or node-fetch) to call Finnhub’s API.
- Implement proper error handling and input validation for robustness.
- Store the stock history in an in-memory data structure (e.g., an object or `Map`) keyed by stock symbol.
- Document how to run your service locally, including any necessary setup for environment variables (like the Finnhub API key).
- Optionally, add an endpoint to stop the monitoring job for a given stock.
- Feel free to add any additional features or improvements if time allows!