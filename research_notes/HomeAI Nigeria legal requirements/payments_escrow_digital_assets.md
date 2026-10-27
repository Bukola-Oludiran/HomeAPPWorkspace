# Payments, Escrow, Fintech and Digital-Asset Regulation for HomeAI (Nigeria, as of October 2026)

Research date: 26 October 2026. Scope: Nigeria only. HomeAI flows covered: tenant rent and deposits; buyer escrow for purchases; landlord payouts; agent in-app wallet; optional blockchain wallet address (possible crypto or tokenisation later).

Source quality note: much of the licensing-capital detail comes from secondary sources (law-firm summaries, Techpoint, TechCabal, consultancy blogs) because the CBN circulars themselves could not be fetched in this session. Figures that conflict between sources are flagged. Treat any figure not traced to a CBN or SEC primary document as "verify before relying".

---

## 1. CBN licensing framework and whether HomeAI needs its own licence

### Takeaway
The CBN licence categories (Switching and Processing, MMO, PSSP, PTSP, Super-Agent, Payment Service Holding Company, PSB) still rest on the December 2020 categorisation and the May 2021 consolidated requirements. I found no 2025–2026 CBN circular that changes the capital figures. Holding customer funds or running a wallet needs an MMO, microfinance bank or bank licence; a switching or PSSP licence is not enough (the April 2025 Paystack/Zap fine shows this). A platform that only collects and passes on funds can avoid its own licence by routing money through a licensed PSP's split or subaccount product so that it never holds third-party balances. An in-app agent wallet and buyer escrow cannot be run that way: they need a licensed partner (MMO, MFB or bank wallet-as-a-service, or a bank or trustee escrow) holding the funds.

### Cited Findings
**Licence categories and capital (secondary sources; see conflicts):**
- Switching and Processing: ₦2 billion capital, ₦100,000 non-refundable application fee. Covers routing, clearing and settlement; Paystack, Flutterwave and Remita are given as examples — [Techpoint Africa, "CBN fintech regulations 2026" (5 May 2026)](https://techpoint.africa/guide/cbn-fintech-regulations/)
- Mobile Money Operator (MMO): same capital and fee as Switching (₦2 billion; ₦100,000). This is the payment licence that "can hold customer funds, run wallets, or issue e-money" — [Techpoint Africa 2026](https://techpoint.africa/guide/cbn-fintech-regulations/)
- Payment Solution Services (PSS: PSSP and PTSP): ₦100 million minimum for each authorisation. PSSP covers payment solutions and aggregators; PTSP covers POS terminal deployment — [Techpoint Africa 2026](https://techpoint.africa/guide/cbn-fintech-regulations/); [Legal500 summary of revised licence categorisation](https://www.legal500.com/intelligence/nigeria/technology/summary-of-the-revised-licence-categorisation-for-operators-in-the-nigerian-payments). **Conflict:** [CACRegister 2026 guide](https://cacregister.com.ng/blog/cac-registration-for-payment-service-providers-psps-in-nigeria-cbn-legal-compliance-2026) and [PaymentBrief](https://paymentbrief.com/articles/nigeria-payments-operator-guide/) give ₦250 million for the combined "PSS" licence, and [Goidara](https://www.goidara.com/blog/how-to-obtain-a-payment-solution-service-provider-pssp-license-in-nigeria) puts switching at ₦1 billion (an outlier). The likely explanation is that ₦250 million is the combined PSS licence and ₦100 million each is the standalone PSSP or PTSP; this needs checking against the CBN circular.
- Payment Service Bank (PSB): ₦5 billion — [Techpoint Africa 2026](https://techpoint.africa/guide/cbn-fintech-regulations/)
- Super-Agent and Payment Service Holding Company licences exist, but the 2026 Techpoint guide gives no figures for them. The CBN Regulatory Sandbox allows testing for up to six months — [Techpoint Africa 2026](https://techpoint.africa/guide/cbn-fintech-regulations/)
- The tiers come from the CBN's December 2020 circular on licence categorisation, consolidated by a May 2021 circular — [PaymentBrief](https://paymentbrief.com/articles/nigeria-payments-operator-guide/). The CBN consolidated requirements require "a refundable amount equal to the minimum issued share capital for respective licences be deposited into a CBN designated account" — [Lexsetters copy of CBN consolidated requirements (2021)](https://lexsetters.com/articles/wp-content/uploads/2021/07/NEW-REGIME-REGIME-REQUIREMENTS-FOR-FINTECHS.pdf); [Tetra Consultants](https://www.tetraconsultants.com/jurisdictions/nigeria-service-provider-license/) (₦2 billion deposit into the "CBN PSP Share Capital Deposit Account" for switching and MMO).
- Capital requirements are "subject to periodic review by the CBN" — [CACRegister 2026](https://cacregister.com.ng/blog/cac-registration-for-payment-service-providers-psps-in-nigeria-cbn-legal-compliance-2026). No 2025 or 2026 revision was found (search of the CBN-related press).

**Wallet and holding funds: who may do it:**
- April 2025: the CBN fined Paystack ₦250 million (about $190k) for running Zap, a peer-to-peer transfer and wallet app launched in March 2025, "without the appropriate licence". The report says a wallet needs a microfinance or banking licence, while Paystack's switching and processing licence lets it route transactions but not hold customer funds — [Techpoint Africa (30 Apr 2025)](https://techpoint.africa/news/paystack-fined-250m/)
- December 2023: NIBSS told banks to remove non-deposit-taking institutions, such as payment gateways, from the NIP Outwards system — [Techpoint Africa](https://techpoint.africa/news/paystack-fined-250m/)
- BOFIA 2020 ss. 57–58 make carrying on financial business without authorisation an offence. The framework allows fines of up to ₦500 million, licence suspension or revocation, and prosecution (law-firm summary; primary text not verified) — [Manifield Solicitors](https://manifieldsolicitors.com/licensing-in-nigerias-fintech-industry-understanding-the-cbns-framework/)

**Partnering with a licensed PSP (split payments and marketplace model):**
- Paystack "Transaction Splits" divide a transaction across subaccounts (bank accounts) under a split formula. The feature is aimed at marketplaces that sell on behalf of vendors, and vendor and platform shares are settled at the same time — [Paystack Support: Transaction splits](https://support.paystack.com/hc/en-us/articles/360009881460)
- Multi-split (for example 90/10 vendor/marketplace, per item for multi-vendor baskets) is enabled by default for all Paystack merchants in Nigeria and Ghana — [Paystack blog: Multiple Transaction Splits](https://paystack.com/blog/product/multisplits)
- Practitioner guidance (secondary, not legal advice): collecting into one account and paying vendors later "raises questions about holding funds on behalf of third parties without a license". Splits are presented as the way to avoid this — [Mctaba Paystack split guide](https://mctaba.com/learn/paystack/paystack-split-payments-and-marketplaces-complete-guide)
- CBN Consumer Protection Regulations 2019, s. 2: CBN-regulated institutions must make sure non-regulated entities they serve or contract with comply with the Regulations. Licensed PSPs will therefore push conduct obligations down to HomeAI by contract — [Mondaq / Pavestones Legal on escrow in e-commerce](https://www.mondaq.com/nigeria/financial-services/1474486/the-emergence-of-escrow-payments-in-e-commerce-transactions-in-nigeria)

**Other 2025–2026 CBN directives affecting a payments-enabled platform (third-party compilation):**
- **Data localisation (circular 15 June 2026):** customer and transaction data held by DMBs, MFBs, MMOs, switches, PTSPs, PSSPs and super-agents must be localised in Nigeria, with full compliance by 1 January 2027 — [BigCapital Intel list of CBN directives (June 2026)](https://www.bigcapitalintel.com/2026/06/list-of-cbn-directives-on-fintechs-banks.html)
- **AML real-time monitoring directive (March 2026):** banks have 18 months and fintechs 24 months to implement; roadmaps are due within 3 months; AI monitoring must be independently audited each year — [Techpoint 2026](https://techpoint.africa/guide/cbn-fintech-regulations/)
- ISO 20022 is mandatory for payment systems, and the National Payment Stack launched in November 2025 — [Techpoint 2026](https://techpoint.africa/guide/cbn-fintech-regulations/)
- **Exposure draft "Guide to Charges" 2026:** merchant card fee of 0.5% capped at ₦10,000; interbank EFT fee caps of ₦10, ₦25 and ₦50. This is a draft and may change — [BigCapital Intel](https://www.bigcapitalintel.com/2026/06/list-of-cbn-directives-on-fintechs-banks.html)

### Inferences
- **Rent and deposit collection to landlord:** the lowest-risk design is a split payment through Paystack, Flutterwave or Moniepoint, with the landlord as a subaccount and HomeAI's fee as the platform share, settled at the same time. HomeAI never holds the principal, so it likely needs no CBN licence of its own. It will still face PSP KYC and KYB requirements, contractual conduct obligations, and possibly the data localisation rule through its PSP.
- **Merchant-of-record design** (all funds land in HomeAI's own account, then HomeAI pays landlords out) means HomeAI is holding and transferring third-party funds. That looks like the activity the CBN treats as licensable (compare the Zap fine) and should be avoided without an MMO/MFB licence or a licensed partner holding the float.
- **Security deposits held for the length of a tenancy** are stored value or custody of third-party money. They should sit with a bank, MFB or trustee (in a named escrow or trust account), not on HomeAI's balance sheet.
- **Agent in-app wallet:** a stored-value balance needs to be issued by a licensed MMO, MFB or bank, for example through a wallet-as-a-service or BaaS partner, with HomeAI as the front-end only. Otherwise it would need an MMO licence: about ₦2 billion capital plus an equal refundable deposit at the CBN.
- If HomeAI ever wanted its own licence, a PSSP (about ₦100m–₦250m) would cover aggregation and solutions, but not holding funds.

### Gaps
- No primary CBN text was retrieved for the current Payment Service Holding Company, Super-Agent or PSSP figures. The ₦100m vs ₦250m PSSP conflict is unresolved. From memory of the 2020 circular (unverified in this session), Super-Agent was about ₦50m and the PSHC was set by reference to the licences held; confirm against the CBN Dec 2020 and May 2021 circulars.
- Paystack and Flutterwave merchant agreements (holding periods, reserve rights, escrow-like "delayed settlement" features, prohibited-business lists for real estate) were not reviewed.
- No 2025–2026 CBN guidance specifically on marketplace or aggregator models, or on "collection agents", was found.

---

## 2. Holding user funds: wallets, stored value and escrow

### Takeaway
Nigeria has no dedicated escrow statute or escrow licence. In practice escrow is provided by banks, SEC-registered trustee companies, and fintechs or ICT firms working with banks. Proptech precedent from July 2026 uses an SEC-regulated trustee (FCMB Trustees) as escrow agent. HomeAI should not act as escrow agent itself. It should orchestrate releases while a bank or trustee holds the funds.

### Cited Findings
- "There are no specific laws yet regulating escrow service providers in Nigeria". They operate under CBN consumer-protection and AML rules, and CBN guidance was "expected" (this source is about two years old) — [Mondaq / Pavestones Legal](https://www.mondaq.com/nigeria/financial-services/1474486/the-emergence-of-escrow-payments-in-e-commerce-transactions-in-nigeria); [Pavestones Legal](https://pavestoneslegal.com/the-emergence-of-escrow-payments-in-e-commerce-transactions-in-nigeria/)
- Escrow is offered by banks and fintechs; ICT companies offer escrow "through partnerships with banks" because they cannot hold customer funds directly — [Mondaq / Pavestones](https://www.mondaq.com/nigeria/financial-services/1474486/the-emergence-of-escrow-payments-in-e-commerce-transactions-in-nigeria)
- Bank escrow example: Stanbic IBTC holds funds "in an escrow account under the custody of Stanbic IBTC, serving as the escrow agent, until the conditions for remitting the funds ... are met" — [Stanbic IBTC escrow services](https://sponsorships.standardbank.com/nigeriabank/corporate-and-investment/transaction-banking/Escrow-services)
- **Proptech precedent (27 July 2026):** Rurblist appointed FCMB Trustees as escrow agent. FCMB Trustees holds eligible transaction funds and documents until verification and contract conditions are met, then releases them on instruction. The article describes FCMB Trustees as "licensed and regulated by the Securities and Exchange Commission (SEC)" — [BusinessDay (27 Jul 2026)](https://businessday.ng/?p=1168100)
- Banks, law firms and licensed financial institutions commonly act as escrow agents for high-value real estate deals (vendor source) — [Genie AI Nigeria escrow template](https://www.genieai.co/en-ng/template-type/escrow-agreement)
- Wallets and stored value need an MFB or banking licence, or an MMO licence. A switching licence does not allow holding customer funds — [Techpoint (Paystack fine)](https://techpoint.africa/news/paystack-fined-250m/); [Techpoint 2026 guide](https://techpoint.africa/guide/cbn-fintech-regulations/)
- **ISA 2025:** trustees are capital-market operators registered with the SEC. The SEC's January 2026 circular revised minimum capital for "all categories of regulated operators" with a 30 June 2027 deadline — [SEC Nigeria: Revised Minimum Capital circular](https://sec.gov.ng/revised-minimum-capital-mc-for-regulated-capital-market-entities)

### Inferences
- **Purchase escrow:** the recommended structure is a tri-partite escrow agreement (buyer, seller, and a bank or SEC-registered trustee as escrow agent), with HomeAI as a technical or verification agent sending release instructions. Funds sit in a designated escrow or trust account in the agent's name. This keeps HomeAI outside "holding customer funds" and gives buyers bankruptcy-remote protection.
- Lawyers' client accounts are another common route for property purchases. Their rules sit under the Rules of Professional Conduct, which were not verified here.
- Marketing language matters. Calling HomeAI's own ledger an "escrow" or "wallet" when no licensed custodian holds the funds is a regulatory and consumer-protection risk (FCCPC and CBN).

### Gaps
- No primary source was found confirming which SEC registration category, if any, covers escrow by trustees, or the capital figure for trustees in the January 2026 SEC schedule (not extracted).
- The Trustee Investments Act and state trust laws were not reviewed. No CBN escrow-specific guideline was found as of October 2026.
- No information was found on whether state land registries or Lagos real estate regulation (LASRERA) impose escrow requirements (another researcher may cover this).

---

## 3. KYC and AML/CFT obligations (CBN), and the link with SCUML

### Takeaway
CBN tiered KYC applies to any wallet or account HomeAI's partner issues. Since December 2023, BVN or NIN is mandatory even for Tier 1, and Tiers 2 and 3 need both. In 2026 the CBN added BVN watchlists and a real-time AML monitoring mandate. HomeAI as a real-estate business also has SCUML (DNFBP) obligations, covered separately.

### Cited Findings
- AML/CFT/CPF Regulations 2022, Reg. 26: a tiered KYC standard "shall be utilized", with caps "as may be specified by the CBN". The numbers come from circulars. The CBN (Customer Due Diligence) Regulations 2023 also apply — [Fraudspect: CBN 3-tier KYC](https://getfraudspect.com/blog/cbn-3-tier-kyc-requirements)
- Since December 2023, every Tier 1 account or wallet must carry a BVN or NIN, pulled electronically, and Tier 2 and 3 must have both BVN and NIN — [Youverify CBN KYC/AML 2026](https://youverify.co/en/blogs/cbn-kyc-aml-requirements-2026); [SRJ Legal](https://srjlegal.com/impact-of-cbns-new-tier-1-kyc-rules-on-financial-inclusion-in-nigeria/)
- **Tier limits (sources conflict):**
  - Tier 1: ₦50,000 daily and ₦300,000 balance in some sources, ₦30,000 daily in others. Fraudspect says the ₦30k figure cannot be traced to a CBN instrument.
  - Tier 2: ₦200,000 daily and ₦500,000 balance.
  - Tier 3: no regulatory cap.
  - Sources: [Fraudspect](https://getfraudspect.com/blog/cbn-3-tier-kyc-requirements); [MyPryme](https://www.mypryme.com/blog/kyc-tier-limits-nigeria)
- **BVN circular (13 Mar 2026, effective 1 May 2026):** the phone number linked to a BVN can be changed only "once in a lifetime". Institutions must keep a watchlist of flagged BVNs, and transactions on a flagged BVN may be held for up to 24 hours. BVN registration is limited to people aged 18+, and BVN database access to CBN-licensed institutions — [BigCapital Intel](https://www.bigcapitalintel.com/2026/06/list-of-cbn-directives-on-fintechs-banks.html); [Fraudspect](https://getfraudspect.com/blog/cbn-3-tier-kyc-requirements)
- March 2026 real-time AML monitoring directive: 24 months for fintechs — [Techpoint 2026](https://techpoint.africa/guide/cbn-fintech-regulations/)
- CBN–NCC MoU (20 Apr 2026): telecom identity-risk portal (TIRMS) for SIM-swap checks before authorising payments — [BigCapital Intel](https://www.bigcapitalintel.com/2026/06/list-of-cbn-directives-on-fintechs-banks.html)
- Sanctions screening and BVN/NIN verification are standard required infrastructure — [Techpoint 2026](https://techpoint.africa/guide/cbn-fintech-regulations/)

### Inferences
- Rent and purchase amounts quickly exceed Tier 1 and Tier 2 caps. Tenants paying rent from a wallet, and agents withdrawing earnings, will need Tier 3 KYC through the licensed partner. Card or bank-transfer payments avoid wallet-tier caps.
- BVN access is restricted to licensed institutions, so HomeAI must rely on its PSP or BaaS partner for BVN or NIN verification rather than querying NIBSS directly.
- **SCUML overlap (brief):** real estate is a designated non-financial business under the MLPPA 2022, so HomeAI may need SCUML registration and STR/CTR filing to the NFIU in its own right, separate from the PSP's AML duties. See the SCUML researcher's notes.

### Gaps
- The CBN tier circular text and current limits were not retrieved from cbn.gov.ng.
- The full March 2026 AML directive title and number were not confirmed (secondary source only).

---

## 4. Consumer protection, disputes and chargebacks, and open banking

### Takeaway
The CBN Consumer Protection Regulations 2019 still set the conduct baseline (fair treatment, disclosure, complaints, redress), and CBN enforcement was active in 2025. A 2026 APP-fraud regime sets fixed refund timelines. The FCCPC also claims consumer jurisdiction over financial services, and a court sided with it. Open banking (guidelines issued March 2023) had still not gone live as of late 2025, and I found no confirmed 2026 go-live date.

### Cited Findings
- The CBN Consumer Protection Regulations 2019 set minimum standards on "fair treatment of consumers, disclosure and transparency, business conduct, complaints handling and redress" for CBN-regulated institutions — [CBN Consumer Protection Regulations 2019 (PDF)](https://www.cbn.gov.ng/out/2019/ccd/cbn%20consumer%20protection%20regulations.pdf)
- Complaints go first to the institution. Consumers can escalate to the CBN Consumer Protection Department if it is not resolved within the 2-week timeline — [CBN Consumer Protection FAQs](https://www.cbn.gov.ng/OUT/2018/CPD/CONSUMER%20PROTECTION%20FAQs.PDF); [CBN Complaints Management](https://www.cbn.gov.ng/supervision/cpdcomgt.html)
- **2025 enforcement data (reported mid-2026):** 23,129 complaints (up 10.53% from 20,925), ₦19.12 billion refunds ordered, and ₦1.69 billion penalties on financial institutions — [Sahara Reporters (3 Aug 2026)](https://saharareporters.com/2026/08/03/cbn-secures-n1912billion-refunds-bank-customers-fines-financial-institutions-n169billion); [Vanguard (Jul 2026)](https://www.vanguardngr.com/2026/07/bank-customers-complaints-rise-11-as-cbn-orders-n19bn-refunds/)
- **Jurisdiction conflict:** a Federal High Court held that the FCCPC, not the CBN, is the proper body to investigate consumer complaints against banks — [FCCPC press release](https://fccpc.gov.ng/banks-answerable-to-fccpc-court-rules/)
- **APP (authorised push payment) fraud:**
  - Customers report within 24 hours, extendable to 72 hours with justification.
  - Inter-bank notification within 30 minutes.
  - Refund within 48 hours (single institution) or 16 working days (multi-institution).
  - Status conflict: Techpoint lists the regime as "Draft" — [Techpoint 2026](https://techpoint.africa/guide/cbn-fintech-regulations/) — while BigCapital Intel reports a 72-hour reporting window and 16 working days to refund as in force — [BigCapital Intel](https://www.bigcapitalintel.com/2026/06/list-of-cbn-directives-on-fintechs-banks.html)
- **Open banking:** the CBN Operational Guidelines for Open Banking were approved in March 2023 (building on the 2021 framework). They provide for a public Open Banking Registry and SLAs between participants — [CBN Operational Guidelines (2023)](https://www.cbn.gov.ng/Out/2023/CCD/Operational%20Guidelines%20for%20Open%20Banking%20in%20Nigeria.pdf). Implementation was still delayed as of October 2025, with no new launch timeline — [TechCabal (16 Oct 2025)](https://techcabal.com/2025/10/16/nigerias-open-banking-still-in-the-works/). Access is limited to licensed entities, and the status is still listed as "oncoming" in May 2026 — [Techpoint 2026](https://techpoint.africa/guide/cbn-fintech-regulations/)
- Data protection: NDPA 2023 and GAID 2025 are enforced, with 72-hour breach notification — [Techpoint 2026](https://techpoint.africa/guide/cbn-fintech-regulations/)

### Inferences
- HomeAI will inherit consumer-protection obligations contractually through its PSP (CPR 2019 s. 2 push-down) and directly from the FCCPC (FCCPA 2018). It needs:
  - clear fee disclosure;
  - refund and dispute rules for failed or cancelled rentals and purchases;
  - a complaints channel with timelines that match the PSP's.
- **Chargebacks:** card-funded rent or deposits can be charged back after payout to the landlord. Escrow or delayed-release windows reduce exposure. PSP merchant terms (not reviewed) will allocate chargeback liability to HomeAI as the merchant or platform.
- Open banking is not yet a dependable building block for 2026 product plans (for example, account-to-account rent mandates or affordability checks).

### Gaps
- No 2024–2026 amendment to the CPR 2019 was found. The APP fraud instrument's final status and citation are unconfirmed.
- Card-scheme or NIBSS dispute-resolution timelines were not researched.

---

## 5. Foreign exchange: diaspora tenants and buyers paying from abroad

### Takeaway
From 1 May 2026, diaspora remittances through IMTOs must pay out to Nigerian beneficiaries in naira only, via IMTO naira settlement accounts at authorised dealer banks. A 4th-edition FX Manual took effect on 1 June 2026. For HomeAI, cross-border collection should go through a PSP or IMTO that converts at NFEM rates and settles naira to the landlord or escrow agent. HomeAI should not take FX itself.

### Cited Findings
- **CBN circular, March 2026 (Trade and Exchange Dept):** from 1 May 2026 IMTOs must route all transactions through designated naira settlement accounts at authorised dealer banks, and foreign-currency payouts of remittances end. The accounts may only be credited with remittance inflows and FX conversion proceeds from the NFEM — [Nairametrics (25 Mar 2026)](https://nairametrics.com/2026/03/25/cbn-orders-imtos-to-open-naira-settlement-accounts-with-nigerian-banks/); [BusinessDay](https://businessday.ng/news/article/cbn-orders-imtos-to-route-remittances-via-naira-accounts-in-banks/); [Leadership](https://leadership.ng/cbn-bans-foreign-currency-payments-for-diaspora-remittances-from-may-1/)
- IMTOs may hold several settlement accounts across ADBs — [Nairametrics](https://nairametrics.com/2026/03/25/cbn-orders-imtos-to-open-naira-settlement-accounts-with-nigerian-banks/)
- IMTO inflows hit a record $1.29 billion in Q1 2026 (up 45% from $888.47 million in Q1 2025). Naira-only payouts expose recipients to NFEM rate volatility — [Fizen blog](https://blog.fizen.io/nigeria-diaspora-remittances-imto-2026/) (secondary)
- **4th Edition FX Manual (effective 1 June 2026):**
  - advance import payment limit raised to 30% from 15%;
  - "Form A has now been eliminated from the requirement for domiciliary remittance";
  - new provisions on service exports, PAPSS and remittances by tech firms.
  - Source: [BigCapital Intel](https://www.bigcapitalintel.com/2026/06/list-of-cbn-directives-on-fintechs-banks.html)
- Domiciliary-account arrangements are said to be separate from the IMTO naira-only rule and bank-dependent. This is unverified secondary information — [Asaba Metro](https://www.asabametro.com/cbn-imtos-naira-settlement-diaspora-remittances-2026/)

### Inferences
- **Diaspora rent or purchase payments:** collect with an international card or a cross-border PSP collection product (e.g., Paystack/Flutterwave international payments, or IMTO partners). Landlord or escrow settlement will be in naira. Quote naira prices, show the FX rate and who bears FX risk, and avoid holding foreign currency on HomeAI's books.
- **Foreign-currency purchase prices** (some high-end Lagos property is priced in USD) raise separate issues: domiciliary-account transfers between Nigerian residents, and the CBN preference for naira pricing. Get legal advice before accepting USD escrow.
- **Foreign buyers investing in property** may need a Certificate of Capital Importation (CCI) from an authorised dealer bank to repatriate funds later. This was not verified in this session.

### Gaps
- The circular text and number for the IMTO rule, and the full 4th FX Manual, were not retrieved.
- Treatment of non-resident BVN (NRBVN) and CCI requirements for diaspora property purchases were not found.
- Whether a domestic platform may receive foreign card payments for Nigerian rent without IMTO status depends on the PSP licence and contract (not researched).

---

## 6. Digital assets: ISA 2025, SEC rules, tokenisation, CBN VASP banking, and the 2026 Executive Order

### Takeaway
ISA 2025 treats virtual and digital assets as securities and requires SEC registration for VASPs, exchanges, custodians and offering platforms. Operating unregistered carries at least a ₦5m fine and/or at least 5 years' imprisonment. From January 2026 the SEC created a dedicated Real-World Asset Tokenisation and Offering Platform (RATOP) category at ₦1 billion capital, with a 30 June 2027 deadline. A July 2026 Executive Order created a CBN-chaired Virtual Asset Council, splitting securities-like activity (SEC) from payment, settlement and custody (CBN). HomeAI should not enable crypto payments, wallets or tokenised property except through registered partners, or after registration or ARIP admission.

### Cited Findings
**ISA 2025:**
- Signed in March 2025, repealing ISA 2007 — [Legal500 review of ISA 2025](https://www.legal500.com/intelligence/nigeria/corporate-commercial-law/review-of-the-investment-and-securities-act-of-2025); [TechCabal (9 May 2025)](https://techcabal.com/2025/05/09/investments-and-securities-act-nigeria-2025/)
- Key provisions:
  - s. 357 defines "securities" to include virtual and digital assets and investment contracts;
  - s. 3(3)(b) gives the SEC power to register and regulate digital asset exchanges;
  - s. 3(3)(i) covers VASPs, custodians and digital asset operators;
  - s. 355(1)(n) gives rule-making power;
  - s. 356 preserves earlier instruments consistent with the Act;
  - s. 61: unregistered operation carries a fine of at least ₦5 million, imprisonment of at least 5 years, or both.
  - Sources: [Licentium (Aug 2026)](https://www.licentium.io/post/virtual-and-digital-assets-in-nigeria-regulatory-perimeter-approval-status-and-market-entry-sequence); [Banwo & Ighodalo](https://www.banwo-ighodalo.com/resources/future-of-digital-virtual-assets-post-investments-and-securities-act-2025-and-the-nigeria-tax-administration-act-2025/); [Andersen Nigeria](https://ng.andersen.com/the-investment-and-securities-act-2025-a-new-era-for-digital-assets-and-financial-disclosure/)

**SEC rules:**
- The SEC Rules on Issuance, Offering Platforms and Custody of Digital Assets (11 May 2022) "remain material" under s. 356. A digital asset exchange needs SEC clearance before admitting a token, and VASPs must keep a Nigerian office. Foreign operators targeting Nigerians are covered — [Licentium](https://www.licentium.io/post/virtual-and-digital-assets-in-nigeria-regulatory-perimeter-approval-status-and-market-entry-sequence)
- The SEC has published *Proposed* Rules on Digital and Virtual Asset Operations, Custody and Markets, covering issuance, tokenisation, lifecycle, trading, custody, transfer and settlement. Their final status was not confirmed; treat them as a draft — [SEC Nigeria proposed rules (PDF)](https://sec.gov.ng/documents/1503/Proposed_Rules_on_Digital_and_Virtual_Asset_Operations_Custody_and_Markets.pdf)
- Tokenised securities follow the same rules as conventional securities. Issuers must register both the tokens and the offering with the SEC, and platforms facilitating offerings must be licensed as Digital Asset Offering Platforms (DAOPs) — [Chambers Blockchain 2025 – Nigeria](https://practiceguides.chambers.com/practice-guides/blockchain-2025/nigeria/trends-and-developments)

**SEC revised minimum capital (Circular 26-1, 16 January 2026; deadline 30 June 2027):**

| Category | Minimum capital |
|---|---|
| Digital Assets Exchange | ₦2 billion (up from ₦500m) |
| Digital Assets Custodian | ₦2 billion |
| Digital Assets Offering Platform (DAOP) | ₦1 billion (up from ₦500m) |
| Real-World Asset Tokenisation and Offering Platform (RATOP, new) | ₦1 billion |
| Digital Assets Intermediary | ₦500 million |
| Digital Assets Platform Operator (including token issuers) | ₦500 million |
| Ancillary VASP | ₦300 million |

Failing to meet the threshold risks suspension or withdrawal of registration. Sources: [SEC Nigeria circular](https://sec.gov.ng/revised-minimum-capital-mc-for-regulated-capital-market-entities); [Nairametrics (16 Jan 2026)](https://nairametrics.com/2026/01/16/sec-raises-capital-requirement-for-crypto-exchanges-in-nigeria/); [TechCabal (16 Jan 2026)](https://techcabal.com/2026/01/16/sec-2-billion-minimum-capital-for-exchanges/)

**ARIP (SEC Accelerated Regulatory Incubation Programme):**
- Launched in June 2024 — [search summary of Licentium and Chambers](https://www.licentium.io/post/virtual-and-digital-assets-in-nigeria-regulatory-perimeter-approval-status-and-market-entry-sequence)
- Checklist dated 25 May 2025: Nigerian incorporation, resident CEO or MD, AML/CFT/CPF controls, exit plan, ₦2 million processing fee.
- On 2 July 2026 the SEC named seven firms for conditional Approval-in-Principle: Bitbarter, Luno, GetEquity, Koinkoin, Wrapped CBDC, Trovotech and Blockvault. "AIP is not a final licence."
- Busha and Quidax are listed as ARIP participants performing exchange functions.
- Source for the last three points: [Licentium](https://www.licentium.io/post/virtual-and-digital-assets-in-nigeria-regulatory-perimeter-approval-status-and-market-entry-sequence)

**CBN:**
- Guidelines on Operations of Bank Accounts for Virtual Asset Service Providers were issued on 22 December 2023, per the CBN reform register. The full text was not retrieved — [Licentium](https://www.licentium.io/post/virtual-and-digital-assets-in-nigeria-regulatory-perimeter-approval-status-and-market-entry-sequence); [CBN Reforms page](https://www.cbn.gov.ng/AboutCBN/Reforms.html)
- CBN Regulatory Sandbox Cohort 2 (2026) has a VASP track: stablecoin payments, issuance, wallets, custody, on- and off-ramps, payment-token exchange. Admission "is not a permanent licence" — [Licentium](https://www.licentium.io/post/virtual-and-digital-assets-in-nigeria-regulatory-perimeter-approval-status-and-market-entry-sequence)

**Executive Order on Virtual Assets Coordination, 2026 (signed 17 July 2026):**
- Creates a CBN-chaired Virtual Asset Council (vice-chairs NRS and SEC; members include NFIU and ONSA) and a Virtual Asset Office in the CBN as secretariat (licensing applications, information sharing, reporting).
- Does not create a new regulator.
- Covers crypto, tokenised assets and stablecoins.
- Sources: [Nairametrics (17 Jul 2026)](http://nairametrics.com/2026/07/17/tinubu-signs-virtual-assets-executive-order-creates-cbn-led-council-to-harmonise-crypto-regulation/); [Sahara Reporters](https://saharareporters.com/2026/07/17/tinubu-signs-executive-order-virtual-assets-establishes-council-coordinate-regulation); [Sumsub](https://sumsub.com/media/news/nigeria-creates-council-to-coordinate-virtual-asset-regulation/)
- Allocates securities-like activity to the SEC and non-security payment, settlement and custody to the CBN. A Harmonised Implementation Framework was due within 30 days — [Licentium](https://www.licentium.io/post/virtual-and-digital-assets-in-nigeria-regulatory-perimeter-approval-status-and-market-entry-sequence)
- **Caveat:** the gazetted text, EO number and Gazette citation had not been located as of the commentator's cut-off — [Ogunyemi Solicitors](https://ogunyemisolicitors.org/nigeria-virtual-assets-executive-order-2026/); [Lexology](https://www.lexology.com/library/detail.aspx?g=277f220a-b3d7-45ac-a344-c3faf3f0d080)

**Tax:** NRS Information Circular No. 2026/21, *Guidelines on the Taxation of Virtual Assets*, was published on 31 July 2026; its content was not reviewed — [Licentium](https://www.licentium.io/post/virtual-and-digital-assets-in-nigeria-regulatory-perimeter-approval-status-and-market-entry-sequence)

### Inferences
- **Storing a user's external blockchain wallet address only** (no custody, no transfers, no token issuance) is low-risk on its own. But any feature that receives, holds, converts or transfers crypto for users is VASP or custody activity: SEC registration (and potentially the CBN under the EO split), with ₦300m–₦2bn capital.
- **Accepting crypto or stablecoin for rent:** use an SEC-registered or ARIP-admitted exchange or on-ramp partner that converts to naira and settles to the landlord, so HomeAI never touches the crypto. Stablecoin payment rails appear to be a CBN-sandbox matter in 2026.
- **Tokenised property (fractional ownership):** tokens are securities. The issuer needs SEC registration of the tokens and the offering; the platform needs RATOP or DAOP registration (₦1bn); custody needs a registered custodian (₦2bn). Land-law issues also arise (Land Use Act Governor's consent, title registration, SPV/REIT structuring), likely covered by another researcher. The realistic route for HomeAI is to partner with a registered RATOP or ARIP participant, or to apply to ARIP itself.
- No real-estate-specific tokenisation rulebook was found. Expect SEC scrutiny on investor protection (cf. CBEX).

### Gaps
- The final status of the SEC "Rules on Digital and Virtual Asset Operations, Custody and Markets" is unconfirmed.
- The CBN VASP bank-account guideline terms (designated settlement accounts, cash-withdrawal bans, and so on) were not retrieved.
- The text and status of the Harmonised Implementation Framework under the 2026 EO is unknown as of October 2026.
- No SEC rule specific to real-estate tokenisation, or registration fees per category (other than the ARIP ₦2m processing fee), was found.

---

## 7. Enforcement actions, 2023–2026

### Takeaway
Regulators have penalised both licensed firms acting outside their licence (Paystack/Zap ₦250m, 2025) and unregistered platforms (Binance, 2023; CBEX, 2025). They have also used blunt tools such as onboarding freezes and NIP access removal. For HomeAI the main risks are a wallet or "escrow" that outruns the partner's licence, and crypto features without SEC registration.

### Cited Findings
- **Paystack (April 2025):** ₦250 million fine for running the Zap wallet without the right licence — [Techpoint](https://techpoint.africa/news/paystack-fined-250m/)
- **2024 onboarding freeze:** the CBN stopped at least six fintechs, including Moniepoint and OPay, from opening new accounts — [Techpoint](https://techpoint.africa/news/paystack-fined-250m/). A ₦1 billion fine each on Moniepoint and OPay in Q2 2024 is reported by a single, less authoritative source — [SBM Intelligence Substack](https://sbmintelligence.substack.com/p/no-hiding-place)
- **NIBSS, December 2023:** payment gateways and other non-deposit-takers removed from NIP Outwards — [Techpoint](https://techpoint.africa/news/paystack-fined-250m/)
- **Binance (June 2023):** the SEC declared that Binance Nigeria Limited was "neither registered nor regulated" and its operations illegal, and ordered it to stop soliciting Nigerians. In July 2023 it clarified that this covered Binance's website and "all [crypto] platform providers" soliciting Nigerians without registration — [Kitco](https://www.kitco.com/news/article/2023-06-12/nigerias-sec-orders-binance-cease-illegal-operations-warns-further); [Finance Magnates](https://www.financemagnates.com/cryptocurrency/nigerian-sec-clarifies-warning-against-binance-labels-it-illegal/)
- **CBEX (April 2025):**
  - an unregistered "digital asset" platform promising 100% returns in 30 days collapsed;
  - the SEC sought a tribunal order freezing accounts of CBEX and 25 other defendants;
  - the SEC DG said CBEX was not registered;
  - the EFCC is pursuing recovery with Interpol.
  - Loss estimates conflict: about ₦1.3 trillion claimed, while TechCabal corrected its own figure of over ₦1 trillion to verified losses in the hundreds of thousands of dollars.
  - Sources: [TechCabal (15 Apr 2025)](https://techcabal.com/2025/04/15/cbex-ponzi-collapse-nigeria/); [Techeconomy](https://www.techeconomy.ng/cbex-sec-orders-freeze-of-accounts-over-n1-3-trillion-ponzi-scheme-probe); [Arise TV](https://www.arise.tv/we-cant-regulate-what-we-dont-know-sec-dg-agama-responds-to-cbex-collapse)
- **CBN consumer-protection enforcement (2025):** ₦1.69 billion in penalties and ₦19.12 billion in refunds — [Sahara Reporters](https://saharareporters.com/2026/08/03/cbn-secures-n1912billion-refunds-bank-customers-fines-financial-institutions-n169billion)
- **Statutory exposure:**
  - ISA 2025 s. 61: unregistered operation carries at least ₦5m and/or at least 5 years — [Licentium](https://www.licentium.io/post/virtual-and-digital-assets-in-nigeria-regulatory-perimeter-approval-status-and-market-entry-sequence)
  - BOFIA 2020 ss. 57–58: unauthorised financial business; fines up to ₦500m reported — [Manifield Solicitors](https://manifieldsolicitors.com/licensing-in-nigerias-fintech-industry-understanding-the-cbns-framework/)
- **Stakeholder survey:** a CBN report found 37.5% of stakeholders viewed non-compliance by licensed and unlicensed operators unfavourably, and warned that uneven enforcement distorts competition — [Techpoint](https://techpoint.africa/news/nigerias-fintech-regulators-seen-as-neutral-referees/)

### Inferences
- The Paystack case shows the CBN looks at product substance (a stored balance) rather than branding, even for a licensed, well-connected firm. An "agent wallet" HomeAI runs on its own ledger is the closest analogue and the highest regulatory risk in the current design.
- **Partner due diligence:** check the partner's licence category actually covers the specific product (wallet vs routing) before launch. Regulator actions against a partner (onboarding freezes, NIP removal) can disrupt HomeAI's flows, so plan a secondary PSP.

### Gaps
- The 2024 Binance executive detentions and the FIRS/EFCC tax and money-laundering charges (Gambaryan, Anjarwalla; Gambaryan released October 2024) are well known but were not verified with a source in this session. Verify before citing.
- No 2026 CBN sanction specifically against an unlicensed payment operator was found. The 2026 enforcement items found (POS geofencing deadline 1 Aug 2026) concern licensed operators.
