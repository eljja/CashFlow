# -*- coding: utf-8 -*-
import json
import os
from datetime import datetime, timezone, timedelta

# Script to build complete 80 companies financial & shareholder dataset for CashFlow dashboard
os.makedirs("src/data", exist_ok=True)
os.makedirs("public/data", exist_ok=True)

# Run the python data generation logic
import generate_companies_data

companies = generate_companies_data.build_all_80_companies()

# Current time in KST (UTC+9)
kst = timezone(timedelta(hours=9))
now = datetime.now(kst)

dataset = {
    "metadata": {
        "title": "Global 80 Companies 5-Year Cash Flow & Shareholder Analytics",
        "lastUpdated": now.strftime("%Y-%m-%d"),
        "lastUpdatedISO": now.isoformat(),
        "updateIntervalDays": 30, # 1-month update recommendation cycle
        "years": [2020, 2021, 2022, 2023, 2024],
        "totalCompanies": len(companies),
        "exchangeRates": {
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
    },
    "companies": companies
}

with open("src/data/companies.json", "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

with open("public/data/companies.json", "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {len(companies)} companies into src/data/companies.json and public/data/companies.json (Updated: {now.strftime('%Y-%m-%d %H:%M:%S KST')})")
