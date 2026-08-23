# CashFlow Analytics 📊

> **글로벌 80대 기업 6개년(2020~2025) 현금흐름(Cash Flow) & 대주주 지분 변동 시계열 대시보드**  
> 🌐 **Live Demo (GitHub Pages):** [https://eljja.github.io/CashFlow/](https://eljja.github.io/CashFlow/)

---

## 📌 프로젝트 소개 (Overview)

본 프로젝트는 국내, 미국, 전세계 글로벌 및 추가 유망 기업 등 **총 80개 주요 기업**의 6개년(2020~2025) 현금흐름과 대주주 지분 변동을 시계열로 분석할 수 있는 인터랙티브 금융 대시보드입니다.

- **100% 무서버(Serverless) 정적 웹 애플리케이션**: 로컬 서버나 별도 백엔드 없이 **GitHub Pages(`github.io`)** 환경에서 완벽하게 구동됩니다.
- **차트 중심의 비주얼 분석**: ECharts 기반 6개년 현금흐름(OCF, CapEx, FCF, 재무CF), 순현금(Net Cash Cushion), 주주환원(배당/자사주), 대주주 지분 도넛 및 시계열 추이.
- **경쟁사 직접 비교 (Peer Comparison Battle)**: 메모리 4사(삼성전자 vs SK하이닉스 vs 마이크론 vs 키옥시아), AI 빅테크(엔비디아 vs MS vs 구글 vs 메타 vs 애플) 등 다중 기업 비교.
- **통화 전환 (Currency Switcher)**: USD($), KRW(₩), 기업 원천통화 간 실시간 환산 지원.
- **전체 데이터 테이블 & Excel 다운로드**: 80개사 전 지표 검색, 정렬 및 엑셀(XLSX) 내보내기 지원.

---

## 🏢 분석 대상 기업 풀 (총 80개사)

### 1. 국내 기업 (Domestic 20)
**삼성전자**, **SK하이닉스**, LG에너지솔루션, 현대자동차, 기아, NAVER, 카카오, POSCO홀딩스, 삼성바이오로직스, 셀트리온, LG화학, 삼성SDI, KB금융, 신한지주, 한화에어로스페이스, HD현대중공업, 크래프톤, SK이노베이션, KT&G, 두산에너빌리티

### 2. 미국 기업 (US 20)
**엔비디아 (NVIDIA)**, **마이크론 (Micron)**, **인텔 (Intel)**, 애플 (Apple), 마이크로소프트 (Microsoft), 알파벳 (Google), 아마존 (Amazon), 메타 (Meta), 테슬라 (Tesla), AMD, 퀄컴 (Qualcomm), 브로드컴 (Broadcom), 버크셔 해서웨이 (Berkshire Hathaway), JP모건 체이스 (JPMorgan), 엑슨모빌 (ExxonMobil), 존슨앤존슨 (J&J), 일라이 릴리 (Eli Lilly), 월마트 (Walmart), 넷플릭스 (Netflix), 오라클 (Oracle)

### 3. 글로벌 기업 (Global 20)
**키옥시아 (Kioxia - 일본/베인캐피탈)**, TSMC, ASML, 도쿄일렉트론 (Tokyo Electron), 도요타 (Toyota), 소니 (Sony), LVMH (루이비통), 노보 노디스크 (Novo Nordisk), SAP, 아스트라제네카 (AstraZeneca), 에르메스 (Hermes), 소프트뱅크그룹 (SoftBank), 텐센트 (Tencent), 알리바바 (Alibaba), BYD (비야디), 셸 (Shell), 토탈에너지스 (TotalEnergies), 네슬레 (Nestle), 로슈 (Roche), ARM Holdings

### 4. 추가 유명/혁신 기업 (Additional 20)
팔란티어 (Palantir), 스노우플레이크 (Snowflake), 크라우드스트라이크 (CrowdStrike), 세일즈포스 (Salesforce), 어도비 (Adobe), 어플라이드 머티어리얼즈 (AMAT), 램리서치 (Lam Research), 시스코 (Cisco), 우버 (Uber), 에어비앤비 (Airbnb), 스포티파이 (Spotify), 코인베이스 (Coinbase), 블록 (Block), 메르카도리브레 (MELI), 씨 (Sea Limited), 닌텐도 (Nintendo), 혼다 (Honda), 에어버스 (Airbus), 페라리 (Ferrari), 리오틴토 (Rio Tinto)

---

## 📈 수록 재무 및 현금 심층 지표

- **영업활동 현금흐름 (Operating Cash Flow, OCF)**: 본업 현금 창출력
- **자본적 지출 (Capital Expenditure, CapEx)**: 설비/공장 투자 규모
- **잉여현금흐름 (Free Cash Flow, FCF = OCF - CapEx)**: 기업의 순수 잉여현금
- **FCF 마진 (FCF Margin = FCF / Revenue %)**: 매출 대비 FCF 창출 효율
- **재무활동 현금흐름 (Financing Cash Flow)**: 차입, 상환, 배당 등
- **현금 배당금 지급액 (Dividends Paid)** & **자사주 매입/소각액 (Share Buybacks)**: 주주환원 총액
- **기말 현금 및 단기금융상품 (Cash & Short-Term Investments)**: 총 가용현금 보유고
- **총차입금 (Total Debt)** 및 **순현금 (Net Cash = Total Cash - Total Debt)**: 재무적 안전 완충력
- **대주주 구성 및 5개년 지분 변동**: 사모펀드(베인캐피탈, 버크셔), 자산운용사(블랙록, 뱅가드), 연기금(국민연금, 사우디PIF), 창업자 지분

---

## 🚀 GitHub Pages 배포 설정 안내

본 리포지토리에는 GitHub Actions 자동 배포 워크플로우(`.github/workflows/deploy.yml`)가 내장되어 있습니다.

1. GitHub 저장소 설정(`Settings`)으로 이동합니다.
2. 좌측 메뉴의 **Pages** 탭을 클릭합니다.
3. **Build and deployment > Source** 옵션을 **`GitHub Actions`**로 선택합니다.
4. 코드가 `main` 브랜치에 푸시되면 자동으로 빌드되어 **`https://eljja.github.io/CashFlow/`** 에 배포됩니다.

---

## 🛠️ 로컬 개발 및 빌드 명령어

```bash
# 의존성 패키지 설치
npm install

# 로컬 개발 서버 실행
npm run dev

# 프로덕션 번들 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```
