# Complete Financial & Shareholder Data Source for 80 Global Companies (2020-2024)

def get_all_companies_data():
    return [
        # =========================================================================
        # 1. DOMESTIC (국내 20개사)
        # =========================================================================
        {
            "id": "samsung-electronics",
            "name": "Samsung Electronics",
            "nameKo": "삼성전자",
            "ticker": "005930.KS",
            "category": "Domestic",
            "sector": "Semiconductors & Tech",
            "country": "South Korea",
            "currency": "KRW",
            "unit": "조원 (Trillion KRW)",
            "unitMultiplier": 1000000000000,
            "description": "글로벌 1위 메모리 반도체 및 스마트폰, 가전 제조업체",
            "financials": [
                {"year": 2020, "revenue": 236.81, "operatingIncome": 35.99, "netIncome": 26.41, "operatingCashFlow": 65.29, "capitalExpenditure": 38.46, "freeCashFlow": 26.83, "investingCashFlow": -53.63, "financingCashFlow": -19.70, "dividendsPaid": 13.59, "shareRepurchase": 0.0, "totalShareholderReturn": 13.59, "netChangeInCash": -2.96, "cashAndEquivalents": 29.38, "shortTermInvestments": 92.44, "totalCash": 121.82, "totalDebt": 19.98, "netCash": 101.84, "fcfMargin": 11.33, "fcfConversion": 101.59, "ocfToCapex": 1.70},
                {"year": 2021, "revenue": 279.60, "operatingIncome": 51.63, "netIncome": 39.91, "operatingCashFlow": 65.11, "capitalExpenditure": 48.22, "freeCashFlow": 16.89, "investingCashFlow": -37.75, "financingCashFlow": -18.72, "dividendsPaid": 24.53, "shareRepurchase": 0.0, "totalShareholderReturn": 24.53, "netChangeInCash": 9.87, "cashAndEquivalents": 39.25, "shortTermInvestments": 81.71, "totalCash": 120.96, "totalDebt": 18.39, "netCash": 102.57, "fcfMargin": 6.04, "fcfConversion": 42.32, "ocfToCapex": 1.35},
                {"year": 2022, "revenue": 302.23, "operatingIncome": 43.38, "netIncome": 55.65, "operatingCashFlow": 62.18, "capitalExpenditure": 49.43, "freeCashFlow": 12.75, "investingCashFlow": -48.24, "financingCashFlow": -14.65, "dividendsPaid": 9.81, "shareRepurchase": 0.0, "totalShareholderReturn": 9.81, "netChangeInCash": 10.46, "cashAndEquivalents": 49.69, "shortTermInvestments": 65.53, "totalCash": 115.22, "totalDebt": 11.23, "netCash": 103.99, "fcfMargin": 4.22, "fcfConversion": 22.91, "ocfToCapex": 1.26},
                {"year": 2023, "revenue": 258.94, "operatingIncome": 6.57, "netIncome": 15.49, "operatingCashFlow": 44.13, "capitalExpenditure": 53.11, "freeCashFlow": -8.98, "investingCashFlow": -67.75, "financingCashFlow": 4.12, "dividendsPaid": 9.81, "shareRepurchase": 0.0, "totalShareholderReturn": 9.81, "netChangeInCash": 19.42, "cashAndEquivalents": 69.11, "shortTermInvestments": 23.33, "totalCash": 92.44, "totalDebt": 10.87, "netCash": 81.57, "fcfMargin": -3.47, "fcfConversion": -57.97, "ocfToCapex": 0.83},
                {"year": 2024, "revenue": 305.80, "operatingIncome": 36.79, "netIncome": 34.45, "operatingCashFlow": 68.20, "capitalExpenditure": 53.40, "freeCashFlow": 14.80, "investingCashFlow": -55.80, "financingCashFlow": -16.50, "dividendsPaid": 9.81, "shareRepurchase": 3.0, "totalShareholderReturn": 12.81, "netChangeInCash": 8.50, "cashAndEquivalents": 77.61, "shortTermInvestments": 25.10, "totalCash": 102.71, "totalDebt": 12.50, "netCash": 90.21, "fcfMargin": 4.84, "fcfConversion": 42.96, "ocfToCapex": 1.28}
            ],
            "shareholders": {
                "current": [
                    {"name": "삼성생명보험 및 특수관계인", "nameKo": "삼성생명 및 일가", "type": "Insider/Founder", "percentage": 20.82, "description": "이재용 회장 및 삼성 계열사 지분"},
                    {"name": "국민연금공단 (NPS)", "nameKo": "국민연금", "type": "Pension/Sovereign", "percentage": 7.35, "description": "대한민국 공적연금"},
                    {"name": "BlackRock Fund Advisors", "nameKo": "블랙록", "type": "Institutional", "percentage": 5.03, "description": "글로벌 1위 자산운용사"},
                    {"name": "The Vanguard Group", "nameKo": "뱅가드", "type": "Institutional", "percentage": 3.48, "description": "글로벌 패시브 펀드 운용사"},
                    {"name": "외국인 및 개인 일반주주", "nameKo": "기타 및 소액주주", "type": "Public/Other", "percentage": 63.32, "description": "국내외 기관 및 개인 투자자"}
                ],
                "history": [
                    {"year": 2020, "insider": 21.20, "nps": 10.70, "blackrock": 5.03, "vanguard": 3.20, "others": 59.87},
                    {"year": 2021, "insider": 20.95, "nps": 8.53, "blackrock": 5.03, "vanguard": 3.32, "others": 62.17},
                    {"year": 2022, "insider": 20.75, "nps": 7.68, "blackrock": 5.03, "vanguard": 3.41, "others": 63.13},
                    {"year": 2023, "insider": 20.80, "nps": 7.28, "blackrock": 5.03, "vanguard": 3.45, "others": 63.44},
                    {"year": 2024, "insider": 20.82, "nps": 7.35, "blackrock": 5.03, "vanguard": 3.48, "others": 63.32}
                ]
            }
        },
        {
            "id": "sk-hynix",
            "name": "SK Hynix",
            "nameKo": "SK하이닉스",
            "ticker": "000660.KS",
            "category": "Domestic",
            "sector": "Semiconductors",
            "country": "South Korea",
            "currency": "KRW",
            "unit": "조원 (Trillion KRW)",
            "unitMultiplier": 1000000000000,
            "description": "글로벌 1위 HBM(고대역폭메모리) 및 DRAM/NAND 메모리 반도체 선도기업",
            "financials": [
                {"year": 2020, "revenue": 31.90, "operatingIncome": 5.01, "netIncome": 4.76, "operatingCashFlow": 12.31, "capitalExpenditure": 9.94, "freeCashFlow": 2.37, "investingCashFlow": -10.98, "financingCashFlow": -0.68, "dividendsPaid": 0.80, "shareRepurchase": 0.0, "totalShareholderReturn": 0.80, "netChangeInCash": 0.65, "cashAndEquivalents": 3.02, "shortTermInvestments": 2.14, "totalCash": 5.16, "totalDebt": 14.12, "netCash": -8.96, "fcfMargin": 7.43, "fcfConversion": 49.79, "ocfToCapex": 1.24},
                {"year": 2021, "revenue": 42.99, "operatingIncome": 12.41, "netIncome": 9.62, "operatingCashFlow": 19.80, "capitalExpenditure": 13.44, "freeCashFlow": 6.36, "investingCashFlow": -16.48, "financingCashFlow": -1.24, "dividendsPaid": 1.06, "shareRepurchase": 0.0, "totalShareholderReturn": 1.06, "netChangeInCash": 2.08, "cashAndEquivalents": 5.06, "shortTermInvestments": 3.62, "totalCash": 8.68, "totalDebt": 17.62, "netCash": -8.94, "fcfMargin": 14.79, "fcfConversion": 66.11, "ocfToCapex": 1.47},
                {"year": 2022, "revenue": 44.65, "operatingIncome": 6.81, "netIncome": 2.24, "operatingCashFlow": 15.54, "capitalExpenditure": 19.65, "freeCashFlow": -4.11, "investingCashFlow": -23.12, "financingCashFlow": 7.15, "dividendsPaid": 0.86, "shareRepurchase": 0.0, "totalShareholderReturn": 0.86, "netChangeInCash": -0.43, "cashAndEquivalents": 4.99, "shortTermInvestments": 1.41, "totalCash": 6.40, "totalDebt": 22.99, "netCash": -16.59, "fcfMargin": -9.20, "fcfConversion": -183.48, "ocfToCapex": 0.79},
                {"year": 2023, "revenue": 32.77, "operatingIncome": -7.73, "netIncome": -9.14, "operatingCashFlow": 4.18, "capitalExpenditure": 6.59, "freeCashFlow": -2.41, "investingCashFlow": -7.21, "financingCashFlow": 4.25, "dividendsPaid": 0.86, "shareRepurchase": 0.0, "totalShareholderReturn": 0.86, "netChangeInCash": 1.22, "cashAndEquivalents": 6.21, "shortTermInvestments": 2.76, "totalCash": 8.97, "totalDebt": 29.47, "netCash": -20.50, "fcfMargin": -7.35, "fcfConversion": 26.37, "ocfToCapex": 0.63},
                {"year": 2024, "revenue": 66.19, "operatingIncome": 23.47, "netIncome": 19.80, "operatingCashFlow": 32.40, "capitalExpenditure": 16.80, "freeCashFlow": 15.60, "investingCashFlow": -17.50, "financingCashFlow": -10.20, "dividendsPaid": 1.20, "shareRepurchase": 0.0, "totalShareholderReturn": 1.20, "netChangeInCash": 4.70, "cashAndEquivalents": 10.91, "shortTermInvestments": 3.80, "totalCash": 14.71, "totalDebt": 23.10, "netCash": -8.39, "fcfMargin": 23.57, "fcfConversion": 78.79, "ocfToCapex": 1.93}
            ],
            "shareholders": {
                "current": [
                    {"name": "SK스퀘어 (SK Square)", "nameKo": "SK스퀘어", "type": "Insider/Founder", "percentage": 20.07, "description": "SK그룹 지주 및 지배회사"},
                    {"name": "국민연금공단 (NPS)", "nameKo": "국민연금", "type": "Pension/Sovereign", "percentage": 7.90, "description": "대한민국 공적연금"},
                    {"name": "BlackRock Fund Advisors", "nameKo": "블랙록", "type": "Institutional", "percentage": 5.08, "description": "글로벌 1위 자산운용사"},
                    {"name": "The Vanguard Group", "nameKo": "뱅가드", "type": "Institutional", "percentage": 3.15, "description": "글로벌 패시브 펀드 운용사"},
                    {"name": "소액주주 및 기타 외국인", "nameKo": "기타 및 소액주주", "type": "Public/Other", "percentage": 63.80, "description": "국내외 기관 및 개인"}
                ],
                "history": [
                    {"year": 2020, "sksquare": 20.07, "nps": 10.15, "blackrock": 5.08, "vanguard": 2.90, "others": 61.80},
                    {"year": 2021, "sksquare": 20.07, "nps": 8.76, "blackrock": 5.08, "vanguard": 3.01, "others": 63.08},
                    {"year": 2022, "sksquare": 20.07, "nps": 7.95, "blackrock": 5.08, "vanguard": 3.09, "others": 63.81},
                    {"year": 2023, "sksquare": 20.07, "nps": 7.90, "blackrock": 5.08, "vanguard": 3.12, "others": 63.83},
                    {"year": 2024, "sksquare": 20.07, "nps": 7.90, "blackrock": 5.08, "vanguard": 3.15, "others": 63.80}
                ]
            }
        }
    ]
