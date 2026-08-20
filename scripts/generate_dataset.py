import json
import os

# Complete data generator for 80 companies with 5-year Cash Flow & Shareholder Time Series

# Exchange rates relative to USD (approximate base rates)
EXCHANGE_RATES = {
    "USD": 1.0,
    "KRW": 1440.0,
    "JPY": 152.0,
    "EUR": 0.95,
    "TWD": 32.5,
    "HKD": 7.80,
    "GBP": 0.79,
    "CHF": 0.90,
    "SEK": 10.80
}

# We define the complete curated dataset for 80 companies
# To ensure rapid execution and robust reliability on GitHub Pages, we build the comprehensive dataset directly into JSON.

def build_data():
    from dataset_source import get_all_companies_data
    companies = get_all_companies_data()
    
    dataset = {
        "metadata": {
            "title": "Global 80 Companies 5-Year Cash Flow & Shareholder Analytics",
            "lastUpdated": "2025-Q1",
            "years": [2020, 2021, 2022, 2023, 2024],
            "totalCompanies": len(companies),
            "exchangeRates": EXCHANGE_RATES
        },
        "companies": companies
    }
    
    os.makedirs("src/data", exist_ok=True)
    with open("src/data/companies.json", "w", encoding="utf-8") as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully generated dataset with {len(companies)} companies into src/data/companies.json")

if __name__ == "__main__":
    build_data()
