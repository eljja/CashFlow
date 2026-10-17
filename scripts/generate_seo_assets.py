import json
from datetime import datetime, timezone, timedelta

def generate_seo():
    with open('src/data/companies.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    companies = data['companies']
    kst = timezone(timedelta(hours=9))
    today_str = datetime.now(kst).strftime("%Y-%m-%d")

    # 1. Generate Sitemap XML
    sitemap_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    # Root URL
    sitemap_lines.append(f"""  <url>
    <loc>https://eljja.github.io/CashFlow/</loc>
    <lastmod>{today_str}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>""")

    # Main Tabs
    tabs = [
        ("overview", "0.9"),
        ("matrix", "0.85"),
        ("comparison", "0.85"),
        ("table", "0.8")
    ]
    for tab, prio in tabs:
        sitemap_lines.append(f"""  <url>
    <loc>https://eljja.github.io/CashFlow/?tab={tab}</loc>
    <lastmod>{today_str}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>{prio}</priority>
  </url>""")

    # Categories
    cats = ["Domestic", "US", "Global", "Additional"]
    for cat in cats:
        sitemap_lines.append(f"""  <url>
    <loc>https://eljja.github.io/CashFlow/?category={cat}</loc>
    <lastmod>{today_str}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")

    # High Priority Core Companies
    core_ids = {"samsung-electronics", "sk-hynix", "nvidia", "micron", "kioxia", "tsmc", "intel", "apple", "microsoft", "alphabet", "tesla"}

    # All 80 Companies
    for comp in companies:
        cid = comp['id']
        prio = "0.9" if cid in core_ids else "0.75"
        sitemap_lines.append(f"""  <url>
    <loc>https://eljja.github.io/CashFlow/?company={cid}</loc>
    <lastmod>{today_str}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>{prio}</priority>
  </url>""")

    sitemap_lines.append('</urlset>\n')

    sitemap_content = '\n'.join(sitemap_lines)
    with open('public/sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap_content)
    print(f"Generated public/sitemap.xml with {1 + len(tabs) + len(cats) + len(companies)} URLs.")

    # 2. Build Pre-rendered Semantic HTML for index.html inside <div id="root">
    companies_html_parts = []
    for cat_name, cat_title in [("Domestic", "국내 대표 기업 (20개사)"), ("US", "미국 빅테크 & 혁신 기업 (20개사)"), ("Global", "글로벌 대표 선도 기업 (20개사)"), ("Additional", "추가 혁신 & 고성장 기업 (20개사)")]:
        cat_comps = [c for c in companies if c['category'] == cat_name]
        items_html = "".join([
            f'<li class="py-1"><a href="?company={c["id"]}" class="text-blue-400 hover:underline font-medium">{c["nameKo"]} ({c["name"]} - {c["ticker"]})</a> <span class="text-xs text-slate-400">[{c["sector"]}]</span></li>'
            for c in cat_comps
        ])
        companies_html_parts.append(f"""
        <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <h3 class="text-base font-semibold text-blue-400 mb-2">{cat_title}</h3>
          <ul class="text-sm space-y-1 text-slate-300">
            {items_html}
          </ul>
        </div>
        """)

    all_companies_grid = "\n".join(companies_html_parts)

    prerender_html = f"""
      <!-- Googlebot / SEO Pre-rendered Semantic Content (Hydrated & Replaced on React Mount) -->
      <div id="seo-prerender-content" class="max-w-7xl mx-auto px-4 py-8">
        <header class="mb-8 border-b border-slate-800 pb-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs font-semibold mb-3">
            <span>기관투자자급 현금흐름 인텔리전스</span> • <span>최종 갱신: {today_str}</span>
          </div>
          <h1 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            글로벌 80대 기업 6개년(2020~2025) 현금흐름 &amp; 대주주 지분 분석 대시보드
          </h1>
          <p class="text-slate-300 text-base sm:text-lg max-w-4xl leading-relaxed">
            국내, 미국, 글로벌 80개 대기업(삼성전자, SK하이닉스, 엔비디아, 마이크론, 키옥시아, TSMC, 애플 등)의 6개년 
            <strong>잉여현금흐름(FCF = OCF - CapEx)</strong>, <strong>순현금(Net Cash = 가용현금 - 총차입금)</strong>, 
            설비투자(CapEx), 주주환원(배당/자사주) 및 대주주 지분 변동 시계열을 전수 분석하는 전문 금융 인텔리전스 플랫폼입니다.
          </p>
        </header>

        <!-- Financial Core Formulas -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="bg-slate-900/80 p-5 rounded-xl border border-blue-500/20">
            <h2 class="text-sm font-semibold text-blue-400 mb-1">핵심 지표 #1: 잉여현금흐름 (FCF)</h2>
            <div class="text-xl font-bold text-white mb-2 font-mono">FCF = OCF - CapEx</div>
            <p class="text-xs text-slate-400 leading-relaxed">
              영업활동 현금흐름에서 설비투자(CapEx)를 차감한 순수 잉여현금으로, 기업의 진정한 이익 창출력과 배당/자사주 매입 여력을 나타냅니다.
            </p>
          </div>
          <div class="bg-slate-900/80 p-5 rounded-xl border border-emerald-500/20">
            <h2 class="text-sm font-semibold text-emerald-400 mb-1">핵심 지표 #2: 순현금 (Net Cash)</h2>
            <div class="text-xl font-bold text-white mb-2 font-mono">Net Cash = 가용현금 - 총차입금</div>
            <p class="text-xs text-slate-400 leading-relaxed">
              총 현금성자산에서 총 차입금을 뺀 실질 무차입 완충력으로, 금융위기 및 불황기 방어 능력과 전략적 M&A 여력을 대변합니다.
            </p>
          </div>
          <div class="bg-slate-900/80 p-5 rounded-xl border border-purple-500/20">
            <h2 class="text-sm font-semibold text-purple-400 mb-1">핵심 지표 #3: 총 주주환원 (TSR)</h2>
            <div class="text-xl font-bold text-white mb-2 font-mono">TSR = 배당금 + 자사주 매입</div>
            <p class="text-xs text-slate-400 leading-relaxed">
              기업이 벌어들인 FCF를 주주에게 직접 환원하는 총액으로, 주주가치 제고와 자본 배치(Capital Allocation) 효율성을 평가합니다.
            </p>
          </div>
        </section>

        <!-- Company Directory Grid -->
        <section class="mb-10">
          <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>글로벌 80대 기업 전체 분석 디렉토리</span>
            <span class="text-xs font-normal text-slate-400">(클릭 시 개별 심층 분석 바로가기)</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {all_companies_grid}
          </div>
        </section>

        <!-- FAQ Section for Search Engine Snippets -->
        <section class="bg-slate-900/70 p-6 rounded-2xl border border-slate-800">
          <h2 class="text-xl font-bold text-white mb-4">자주 묻는 질문 (FAQ)</h2>
          <div class="space-y-4 text-sm">
            <div>
              <h3 class="font-semibold text-blue-300 mb-1">Q. 잉여현금흐름(FCF)이란 무엇이며 왜 당기순이익보다 중요한가요?</h3>
              <p class="text-slate-400 leading-relaxed">
                A. FCF(Free Cash Flow)는 영업활동을 통해 창출한 현금(OCF)에서 설비투자(CapEx)를 뺀 순수 현금입니다. 회계적 발생주의 손익계산서상의 순이익과 달리 분식회계나 장부상 왜곡이 불가능하며, 실제 배당과 부채 상환에 쓸 수 있는 진짜 현금 창출력을 보여주는 가장 신뢰할 수 있는 지표입니다.
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-blue-300 mb-1">Q. 글로벌 반도체 4사(삼성전자, SK하이닉스, 마이크론, 키옥시아)의 현금흐름 비교는 어떻게 확인하나요?</h3>
              <p class="text-slate-400 leading-relaxed">
                A. 대시보드의 '동종업계 비교 (Peer Comparison)' 및 '현금흐름 매트릭스' 탭에서 HBM과 메모리 반도체 4사의 6개년(2020~2025) FCF 마진율, 매출 대비 CapEx 재투자율, 순현금 보유액 및 주주환원 규모를 1:1로 직접 교차 비교분석할 수 있습니다.
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-blue-300 mb-1">Q. 키옥시아(Kioxia)와 대형 상장사의 대주주 지분 구조와 변동 추이를 볼 수 있나요?</h3>
              <p class="text-slate-400 leading-relaxed">
                A. 네, 기업별 심층 분석(Company Deep-Dive)에서 베인캐피탈, 도시바, 버크셔 해서웨이, 블랙록, 뱅가드, 국민연금 등 주요 대주주의 6개년(2020~2025) 지분율 변화를 대화형 차트 및 연도별 상세 추이 표로 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    """

    # 3. Read index.html and update <head> (JSON-LD, Meta, Canonical) and <div id="root">
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Create Comprehensive JSON-LD Graph
    json_ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": "https://eljja.github.io/CashFlow/#website",
                "url": "https://eljja.github.io/CashFlow/",
                "name": "CashFlow Analytics",
                "alternateName": ["글로벌 80대 기업 현금흐름 대시보드", "CashFlow Analytics 2026"],
                "description": "국내, 미국, 글로벌 80대 기업의 6개년(2020-2025) 잉여현금흐름(FCF), 순현금(Net Cash), CapEx 및 대주주 지분 변동 시계열 대시보드",
                "inLanguage": "ko-KR",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://eljja.github.io/CashFlow/?company={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                }
            },
            {
                "@type": "WebApplication",
                "@id": "https://eljja.github.io/CashFlow/#webapp",
                "name": "CashFlow Analytics",
                "url": "https://eljja.github.io/CashFlow/",
                "applicationCategory": "FinanceApplication",
                "operatingSystem": "All",
                "browserRequirements": "Requires JavaScript. Requires HTML5.",
                "softwareVersion": "2.5.0",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                },
                "author": {
                    "@type": "Organization",
                    "name": "CashFlow Analytics"
                }
            },
            {
                "@type": "Dataset",
                "@id": "https://eljja.github.io/CashFlow/#dataset",
                "name": "글로벌 80대 기업 6개년(2020-2025) 현금흐름 및 대주주 지분 데이터셋",
                "description": "삼성전자, SK하이닉스, 엔비디아, 마이크론, 키옥시아, TSMC 등 80개 대기업의 6개년 FCF, OCF, CapEx, 순현금, 배당금, 자사주 매입액 및 대주주 지분율 시계열 데이터",
                "url": "https://eljja.github.io/CashFlow/",
                "temporalCoverage": "2020-01-01/2025-12-31",
                "spatialCoverage": "Global",
                "variableMeasured": [
                    "Free Cash Flow (FCF)",
                    "Operating Cash Flow (OCF)",
                    "Capital Expenditures (CapEx)",
                    "Net Cash (Total Cash - Total Debt)",
                    "Dividends Paid",
                    "Share Repurchases",
                    "Major Shareholder Equity Ratio"
                ],
                "creator": {
                    "@type": "Organization",
                    "name": "CashFlow Analytics"
                }
            },
            {
                "@type": "BreadcrumbList",
                "@id": "https://eljja.github.io/CashFlow/#breadcrumb",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://eljja.github.io/CashFlow/"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "기업 심층 분석",
                        "item": "https://eljja.github.io/CashFlow/?tab=overview"
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": "현금흐름 매트릭스",
                        "item": "https://eljja.github.io/CashFlow/?tab=matrix"
                    },
                    {
                        "@type": "ListItem",
                        "position": 4,
                        "name": "반도체 4사 비교",
                        "item": "https://eljja.github.io/CashFlow/?tab=comparison"
                    }
                ]
            },
            {
                "@type": "FAQPage",
                "@id": "https://eljja.github.io/CashFlow/#faq",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "잉여현금흐름(FCF, Free Cash Flow)이란 무엇이며 왜 당기순이익보다 중요한가요?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "잉여현금흐름(FCF)은 기업이 영업활동을 통해 창출한 영업현금흐름(OCF)에서 미래 사업 유지를 위한 설비투자(CapEx)를 차감한 순수 가용 현금(FCF = OCF - CapEx)입니다. 장부상 발생주의 회계이익인 당기순이익과 달리 실제 기업 금고에 유입된 실질 현금을 보여주며, 차입금 상환, 배당 지급, 자사주 매입 등 주주환원 여력을 결정하는 1순위 핵심 지표입니다."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "반도체 4사(삼성전자, SK하이닉스, 마이크론, 키옥시아)의 현금흐름과 CapEx는 어떻게 비교하나요?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "CashFlow Analytics의 '동종업계 비교 (Peer Comparison)' 및 '현금흐름 매트릭스' 탭에서 HBM과 첨단 메모리 시장을 주도하는 반도체 주요 기업들의 6개년(2020~2025) FCF 마진율, 매출 대비 CapEx 재투자율, 순현금(Net Cash) 잔액 및 주주환원율을 1:1로 직접 교차 비교분석할 수 있습니다."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "순현금(Net Cash) 지표가 왜 기업 안정성 평가에 결정적인가요?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "순현금(Net Cash)은 현금및현금성자산과 단기금융상품의 합계에서 총차입금(단기/장기차입금 및 회사채)을 뺀 금액입니다. 순현금이 플러스(+)인 기업은 외부 금융시장 경색이나 고금리 위기 상황에서도 무차입 경영에 가까운 안정성을 유지하며 대규모 전략적 투자를 지속할 수 있습니다."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "키옥시아(Kioxia)와 글로벌 대기업의 대주주 지분 변동 추이를 볼 수 있나요?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "네, 각 기업별 심층 분석(Company Deep-Dive)에서 베인캐피탈, 도시바, 버크셔 해서웨이, 블랙록, 뱅가드, 국민연금 등 주요 대주주의 6개년(2020~2025) 지분율 변화를 대화형 도넛 차트 및 연도별 상세 추이 표로 확인할 수 있습니다."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "80대 기업의 현금흐름 퀄리티 스코어(A+ ~ D)는 어떤 기준으로 산출되나요?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "영업현금흐름 창출력(OCF Margin), FCF 전환율(FCF/OCF), 순현금 완충력(Net Cash/Assets), 주주환원율(TSR/FCF), 설비투자 효율성을 종합하여 100점 만점 척도로 평가하며, '초우량형', '투자확대형', '구조조정형' 등 8대 현금흐름 아키타입으로 진단합니다."
                        }
                    }
                ]
            }
        ]
    }

    # Inject into index.html
    import re
    json_ld_str = json.dumps(json_ld, ensure_ascii=False, indent=4)
    script_replacement = f'<script type="application/ld+json">\n{json_ld_str}\n    </script>'
    
    html = re.sub(r'<script type="application/ld\+json">.*?</script>', script_replacement, html, flags=re.DOTALL)

    # Replace <div id="root">...</div> with <div id="root">{prerender_html}</div>
    html = re.sub(r'<div id="root">.*?</div>', f'<div id="root">\n{prerender_html}\n    </div>', html, flags=re.DOTALL)

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated index.html with Rich JSON-LD and pre-rendered semantic HTML.")

if __name__ == '__main__':
    generate_seo()
