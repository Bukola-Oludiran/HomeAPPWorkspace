# Product Architecture Decides HomeAI's Nigerian Regulatory Burden

HomeAI can launch legally in Nigeria in October 2026 as a **private company limited by shares** with a modest set of registrations: CAC, a Nigeria Revenue Service Tax ID, SCUML registration as a real-estate business, NDPC data-protection registration with a DPO, payroll registrations, and a trademark filing. Its heavier exposure does not come from the act of setting up. It comes from four design choices. The first is whether any foreigner sits on the cap table, which brings in a de facto ₦100m capital rule, a Business Permit and the loss of small-company concessions. The second is whether HomeAI ever holds customer money, which decides whether it needs CBN or SEC licences costing ₦100m to ₦2bn, LASRERA client-account duties and full AML reporting. The third is how the verification tiers are worded, because only courts and land registries can settle title and only registered surveyors can value property. The fourth is how field agents on the job board are engaged, which carries reclassification risk under the Labour Act. The 2026 tax reset helps an early-stage HomeAI: it pays 0% company income tax, no development levy and no VAT registration while turnover stays under ₦50m–₦100m. Residential rent is VAT-exempt, and most tenancies under ₦10m a year are now outside stamp duty. In return HomeAI must withhold tax on every agent payout and collect agents' Tax IDs, or face a ₦5m penalty per contract. Several rules are still moving and will change parts of this plan: the Lagos Tenancy Bill with its 5% agency-fee cap, final FCCPC consumer regulations covering AI chatbots, the Digital Economy Bill that would make NITDA an AI regulator, NIMC regulations under the new NIMC Act 2026, and the CBN–SEC split on virtual assets. The practical answer is to launch as a marketplace that orchestrates money but never holds it. Each fintech or crypto feature should wait until a named, licensed partner holds the funds or assets. This report synthesises the research notes; it is not legal advice, and several points are flagged for confirmation by Nigerian counsel.

## The cap table decides whether HomeAI faces a ₦100m foreign-capital regime

### A private limited company is the only sensible vehicle

CAMA 2020 sets a **minimum issued share capital of ₦100,000** for private companies. It allows single-shareholder companies, and a "small company" may have a single director and no company secretary ([Mondaq](https://www.mondaq.com/nigeria/shareholders/1023802/the-companies-and-allied-matters-act-2020-what-you-need-to-know-part-5-share-capital); [Mondaq Part 1](https://mondaq.com/nigeria/shareholders/1023656/the-companies-and-allied-matters-act-2020-what-you-need-to-know-part-1-small-companies-single-director-and-single-member-companies)). A business name gives no limited liability. It cannot receive a Startup Act label, which s.13 restricts to limited liability companies. Escrow banks, payment partners and regulators would also be reluctant to deal with one. An LLP is legally possible but unusual for a venture-backed platform. HomeAI should therefore be an Ltd.

CAC fees were re-gazetted with effect from **1 August 2025**. Incorporating a private company costs **₦10,000 per ₦1m of share capital**, plus name reservation (₦1,000–₦5,000; sources conflict), stamp duty and agent fees ([TheNigeriaLawyer](https://thenigerialawyer.com/full-list-fg-releases-official-gazette-on-new-cac-service-fees-effective-august-1/)). With clean documents, incorporation takes about **3–14 working days**, and digital certificates are the original legal documents ([EBC Consults](https://www.ebconsults.ng/cac-registration-nigeria/)). A Nigerian-founded HomeAI at ₦1m issued capital pays about ₦10,000 in CAC filing fees.

### One foreign shareholder changes the cost and the paperwork

Nigeria allows **100% foreign ownership** in tech and real-estate services. NIPC keeps only a short negative list, such as arms and narcotics ([Resolution Law Firm/Mondaq](https://www.mondaq.com/nigeria/shareholders/1672318/setting-up-a-company-in-nigeria-as-a-foreigner-a-brief-guide)). Foreign participation still triggers a separate chain of requirements. CAC has not published a rule, but since July 2024 it has been **strictly enforcing a ₦100m issued-capital floor** for companies with foreign shareholders or directors, whatever their percentage ([Techpoint Africa](https://techpoint.africa/guide/share-capital-foreign-companies-nigeria/)). The Ministry of Interior's handbook requires **₦100m paid-up capital** before it issues the Business Permit that a foreign-owned company needs before it starts operating ([Ministry of Interior Handbook](https://candb.interior.gov.ng/wp-content/uploads/2025/05/CB-Business-HANDBOOK.pdf)). At the gazetted rate, that capital implies roughly ₦1m in CAC filing fees alone. This is our own arithmetic and should be checked against the CAC portal.

Foreign equity should also arrive through an authorised-dealer bank that issues a **Certificate of Capital Importation**. Without a CCI, the NIPC Act s.24 guarantee that profits and exit proceeds can be repatriated is "effectively unenforceable in practice" ([Adeola Oyinlade & Co](https://adeolaoyinlade.com/en/?p=1615)). Sources disagree on whether NIPC registration is mandatory, so the safe course is to register.

A foreign shareholder also disqualifies HomeAI from CAMA's "small company" category. That category requires turnover of ₦120m or less, net assets of ₦60m or less, **no foreign shareholders**, and directors holding at least 51% ([Mondaq Part 1](https://mondaq.com/nigeria/shareholders/1023656/the-companies-and-allied-matters-act-2020-what-you-need-to-know-part-1-small-companies-single-director-and-single-member-companies)). Losing it means losing the audit exemption, the single-director and no-secretary concessions, and the lowest annual-return fees.

The Startup Act adds a mirror-image constraint. To receive a label, a company must be a CAMA limited company under ten years old with digital-innovation objects. Commentators add a requirement of **at least one-third shareholding by Nigerian founders** ([PwC Nigeria](https://www.pwc.com/ng/en/assets/pdf/nigeria-startup-act-positioning-the-country-for-the-fourth-revolution.pdf)). The cap table therefore needs to be designed before the first angel cheque, not after.

### CAC now removes companies that do not file

CAC's enforcement has moved from fines to removal from the register. It **struck off more than 400,000 companies in 2025**. In July 2026 it gave a sixth batch of 100,000 companies 90 days to file outstanding annual returns and beneficial-ownership data ([Premium Times](https://www.premiumtimesng.com/business/business-news/895765-cac-begins-sixth-batch-of-company-strike-off-targets-100000-companies.html)). A struck-off company can be restored only by petition to the Federal High Court ([Olaniwun Ajayi LP](https://www.olaniwunajayi.net/blog/cacs-renewed-strike-off-campaign-ensuring-corporate-compliance-in-nigeria/)).

Every natural person holding **5% or more** of shares or votes, or exercising significant influence, must be disclosed on the public register of persons with significant control. Offshore holding companies are looked through ([PwC Nigeria](https://pwc.com/ng/en/assets/pdf/persons-with-significant-control-regulations-2022.pdf)). One 2026 agent site cites a 25% threshold; that is wrong. Since **1 August 2026**, CAC has also enforced CAMA ss.304 and 729. These require business letters to show every director's name, the nationality of any non-Nigerian director, the RC number and the registered office ([Legit.ng](https://www.legit.ng/business-economy/industry/1718745-cac-companies-fresh-deadline-business-letter-disclosure-rules/)). HomeAI should apply the same particulars to its invoices, email footers and website footer.

### Foreign hires, brand protection and local levies

Any foreign director or engineer working in Nigeria needs an expatriate quota slot and an e-CERPAC. Since **1 May 2025**, both run on the Ministry of Interior's digital Expatriate Administration System, and quota fees have risen by **35% to over 500%**. CERPAC costs **US$2,000**, plus US$1,000 of mandatory expatriate insurance for long-term permits ([KPMG/Mondaq](https://www.mondaq.com/nigeria/work-visas/1764986/modernising-mobility-assessing-nigerias-2025-immigration-reforms-and-the-road-ahead)). The US$10,000–15,000 Expatriate Employment Levy "remains suspended" in 2026 ([US State Dept](https://www.state.gov/reports/2026-investment-climate-statements/nigeria)). It is still a contingent cost worth budgeting for.

On brand protection, Nigeria **does not accept Paris Convention priority claims** for trademarks. A registration lasts seven years from filing and renews in 14-year periods ([IP-Coster](https://ip-coster.com/IPGuides/trademark-nigeria)). "HomeAI" should be filed early on the IPO Nigeria portal, as a word mark and a logo mark, probably in Classes 36, 42 and 9. Because the name is descriptive, a distinctiveness objection is likely, so a clearance search should come before any brand spend.

At local level, Abuja's AMAC has required all levies to be paid through its cashless Smart Tax platform since **1 January 2026** ([Gazette NGR](https://gazettengr.com/?p=494369)). In Lagos, outdoor signage needs LASAA registration ([LSETF](https://www.lsetf.ng/node/151)).

## The 2026 tax reset gives early-stage HomeAI 0% tax but heavy withholding duties

### Four new Acts replaced the old system from January 2026

Four Acts signed on 26 June 2025 replaced CITA, PITA, the VAT Act, the Capital Gains Tax Act and the Stamp Duties Act. They also turned FIRS into the **Nigeria Revenue Service (NRS)**. The Nigeria Tax Act (NTA) and Nigeria Tax Administration Act (NTAA) apply from **1 January 2026** ([FMINO transition guidelines](https://fmino.gov.ng/?p=52409); [KPMG](https://kpmg.com/ng/en/home/insights/2025/07/the-nigeria-revenue-service-establishment-act-2025.html)).

Every taxable person must hold a Tax ID (NTAA s.4), and banks must require one to operate accounts. Failing to register costs ₦50,000 for the first month and ₦25,000 for each month after. More significant for a marketplace, **a company that awards a contract to an unregistered person faces a ₦5,000,000 penalty** under s.100(2) ([NTAA certified copy](https://media.premiumtimesng.com/wp-content/files/2026/01/Approved-Copy-to-Print-NIGERIA-TAX-ADMINISTRATION-ACT-2025.pdf.pdf)). HomeAI should therefore treat **collecting and verifying a Tax ID as a hard step in agent and contractor onboarding**, not an afterthought.

### Small-company status removes most tax, but a definitional conflict and a carve-out remain

The NTA taxes a "small company" at **0%** and every other company at **30%** (s.56). It adds a **4% development levy** on non-small companies (s.59), which replaces TETFund, NITDA, NASENI and the other earmarked levies ([NTA gazette copy](https://irs.gm.gov.ng/docs/national/NIGERIA_TAX_ACT_2025.pdf)).

The definition of a small company is contested. The gazetted NTA sets the turnover limit at **₦50m**. The National Assembly-certified text, and the NTAA's definition of "small business", set it at **₦100m**. Both require fixed assets of ₦250m or less ([Arbiterz](https://arbiterz.com/gazetted-vs-national-assembly-versions-why-9-key-differences-in-new-tax-law-dont-really-matter/)). NRS's June 2026 minimum-tax circular uses the "final version" figures, which suggests the ₦100m figure will prevail, but this is unconfirmed ([KPMG](https://kpmg.com/us/en/taxnewsflash/news/2026/10/nigeria-corporate-income-tax-15-percent-minimum-tax.html)). Until it is settled, HomeAI should plan around the lower ₦50m figure.

The bigger risk is the carve-out: **"any business providing professional services shall not be classified as a small company."** The term is undefined. If NRS characterised HomeAI's brokerage or advisory income as professional services, the 0% rate would be lost however small HomeAI is. Before HomeAI starts earning sale commissions, it should get written tax advice on this point.

The 15% minimum effective tax rate reaches only multinational group members and companies with turnover of **₦50bn** or more. Company returns are due six months after year end, or within 18 months of incorporation for a new company. Small companies may file self-attested accounts instead of audited ones ([NTAA](https://media.premiumtimesng.com/wp-content/files/2026/01/Approved-Copy-to-Print-NIGERIA-TAX-ADMINISTRATION-ACT-2025.pdf.pdf)).

### Rent is VAT-exempt, but HomeAI's own fees are not

VAT stays at **7.5%**. "Land or building including interest in land or building" is an exempt supply under s.186(1)(l), so **rent itself carries no VAT** ([NTA](https://irs.gm.gov.ng/docs/national/NIGERIA_TAX_ACT_2025.pdf)). HomeAI's own commissions, listing fees, subscriptions and escrow service fees are taxable services.

A small business is exempt from VAT registration, charging and monthly returns, but may opt in by written notice (NTAA s.22). Opting in lets HomeAI recover input VAT on cloud and professional services, which the NTA now permits. Once registered, returns are due by the 21st of each month whether or not any activity took place. Section 151(5) also lets NRS appoint a platform that "receives commission relating to the supplies" to collect VAT through its commission mechanism ([NTA](https://irs.gm.gov.ng/docs/national/NIGERIA_TAX_ACT_2025.pdf)). HomeAI should expect that possibility as it scales.

Under NRS's published schedule, e-invoicing reaches taxpayers with turnover **under ₦1bn on 1 July 2027**, with enforcement from January 2028 ([Sovos](https://sovos.com/regulatory-updates/vat/nigeria-nrs-publishes-e-invoicing-timeline/)). Building the s.153 invoice fields (Tax ID, sequential numbering, CAC number) into the billing system now costs little.

### Withholding tax is the platform's largest live exposure

The 2024 Deduction at Source Regulations still supply the withholding (WHT) rates. Commission and professional fees paid to residents are taxed at **5%** (10% for non-residents), rent at **10%**, and general services at 2%. **The rate doubles where the payee has no Tax ID** ([PwC](https://pwc.com/ng/en/assets/pdf/highlights-of-the-deduction-at-source-regulations-2024.pdf); [Mondaq](https://www.mondaq.com/nigeria/withholding-tax/1525324/overview-of-the-deducting-tax-at-source-withholding-regulations-2024)). Under the NTAA, failing to deduct costs **40% of the amount not deducted** (s.105). Failing to remit by the 21st of the following month costs 10% a year plus interest at the CBN monetary policy rate (MPR), and can lead to up to three years' imprisonment (s.107) ([NTAA](https://media.premiumtimesng.com/wp-content/files/2026/01/Approved-Copy-to-Print-NIGERIA-TAX-ADMINISTRATION-ACT-2025.pdf.pdf)).

Every payout from the job board or agent earnings ledger is a WHT event, so the deduction, remittance and credit-note logic must be automated before the first payout. The 2024 Regulations exempt "broker commissions retained from principal's monies, per industry norm". That exemption may cover the commission HomeAI keeps out of rent it collects, but this needs confirmation.

### Stamp duty, PAYE and the end of startup tax holidays

Stamp duty now sits in the NTA. Leases with an **annual value under ₦10m** (or ten times the annual minimum wage, if higher) are not dutiable (s.135). Above that threshold, the lessee pays **0.78%** for terms of up to seven years, within 30 days of execution. **An unstamped instrument is inadmissible in civil proceedings** (s.127), and electronic denotation of duty is expressly permitted (s.125). A ₦50 duty applies to electronic transfers of ₦10,000 or more and is borne by the transferor ([NTA](https://irs.gm.gov.ng/docs/national/NIGERIA_TAX_ACT_2025.pdf)). Most residential leases on HomeAI therefore need no stamping. For high-value leases, the e-lease workflow should prompt electronic stamping so that the document stays enforceable.

PAYE goes to the state where each employee lives: LIRS for Lagos residents, FCT-IRS for Abuja residents. The new bands start at **0% on the first ₦800,000** and rise to 25% above ₦50m. Employees also get a new rent relief of 20% of rent, capped at ₦500,000 ([NTA Fourth Schedule](https://irs.gm.gov.ng/docs/national/NIGERIA_TAX_ACT_2025.pdf)). Employer annual returns are due by **31 January** through LIRS eTax ([TechEconomy](https://www.techeconomy.ng/lagos-employers-must-file-2025-tax-returns-by-january-31-lirs)). The monthly PAYE remittance date is reported as the 10th, but NTAA s.107 sets a general 21st-of-month deadline for deductions. HomeAI should pay by the 10th until LIRS confirms which applies.

Two expected reliefs are gone. NTA s.197(10) **deleted the tax provisions of the Startup Act** (ss.25(2)–(4) and 29(3)). Pioneer status was replaced by the Economic Development Tax Incentive, which requires at least ₦250m of qualifying capital expenditure ([NTA](https://irs.gm.gov.ng/docs/national/NIGERIA_TAX_ACT_2025.pdf); [EY](https://globaltaxnews.ey.com/news/2026-0989-nigeria-introduces-economic-development-incentive-under-nigeria-tax-act-2025-to-replace-pioneer-status-incentive)). That threshold is out of reach for an asset-light platform.

A Startup Act label still carries three tax benefits:

- Investors pay no capital gains tax on exits from a labelled startup after holding for 24 months.
- Non-residents supplying technical, professional or management services to a labelled startup suffer a 5% final withholding tax.
- Non-resident remote employees of startup or tech-services employers are exempt from Nigerian tax on their employment income if it is taxed where they live.

The 0.5% cybersecurity levy was suspended in 2024, and the NTA has since **deleted its legal basis** (s.197(14)). It does not apply to HomeAI.

## Field agents, not engineers, carry the biggest employment risk

### Who the Labour Act covers, and what every employee is owed

The Labour Act protects "workers", meaning manual and clerical staff. It excludes anyone exercising "administrative, executive, technical or professional functions" ([GLI 2025, Ikeyi Shittu & Co](https://isc.ng/wp-content/uploads/2025/06/GLIEMP25_Chapter-13_Nigeria.pdf)). HomeAI's engineers and managers therefore fall under contract and common law. Junior support and operations staff fall under the Act's minimums:

- written terms within three months;
- six working days of annual leave after a year's service;
- 12 days of paid sick leave;
- notice of one day to one month, depending on length of service.

Two exceptions apply more widely. Maternity protection (12 weeks at no less than 50% of pay) has been extended by the courts to all female employees. The National Industrial Court (NICN) also now requires a valid reason and a fair process for terminations, including during probation ([GLI 2025](https://isc.ng/wp-content/uploads/2025/06/GLIEMP25_Chapter-13_Nigeria.pdf)).

Statutory contributions build up with headcount.

**From the first hire:**

- **Pension:** at least **10% from the employer and 8% from the employee**, calculated on basic pay plus housing and transport allowances. It must be remitted within seven working days of payroll. Late payment draws a penalty of at least 2% a month ([AnooreHR](https://anoorehr.com/blog/pension-remittance-nigeria-pencom-deadlines-2026)). Sources disagree on whether the obligation starts at three employees or fifteen; HomeAI should comply from its first hire.
- **Group life insurance:** cover worth at least **three times annual emoluments** for each employee ([PenCom GLIP Guidelines](https://www.pencom.gov.ng/wp-content/uploads/2020/09/Revised-Guideline-on-GLIP-2020.pdf)).
- **NSITF employees' compensation:** **1% of monthly payroll**, paid by the employer, from the first employee ([WadataHR](https://www.wadatahr.com/guides/nsitf)).

**From five employees, or ₦50m turnover:**

- **ITF:** 1% of annual payroll, of which up to half can be refunded for approved training ([AnooreHR](https://anoorehr.com/blog/nsitf-itf-employer-obligations-2026)).
- **HIV workplace policy:** the HIV and AIDS (Anti-Discrimination) Act 2014 reportedly requires a written policy, adopted within 12 months of commencement and lodged with the Labour Ministry ([BusinessDay](https://businessday.ng/news/legal-business/article/hiv-and-aids-anti-discrimination-law-and-mandatory-policy/)).

**From 25 workers:**

- **Minimum wage:** **₦70,000 a month**. Employers with fewer than 25 workers are exempt, as are commission and piece-rate workers. The Federal Government says the next review is due on 1 June 2027 ([ThisDay, Oct 2026](https://www.thisdaylive.com/2026/10/16/minimum-wage-review-due-in-june-2027-fg-tells-labour/)).

The National Housing Fund deduction of 2.5% is now **voluntary for private-sector employees**. HomeAI should deduct it only for staff who have opted in in writing, because continuing to deduct after an opt-out is an unauthorised deduction ([AnooreHR](https://anoorehr.com/blog/nhf-voluntary-opt-out-2026)).

### The job board is the reclassification risk

Nigeria has no gig-worker statute, and the leading platform case does not settle the question. In *Olatunji v Uber* (NICN, 2018), the drivers' claim failed on evidence, not on the merits. The court said the line between employee and contractor had been "stretched" ([Mondaq](https://www.mondaq.com/nigeria/contract-of-employment/1299322/gig-economy-workers-employees-or-independent-contractors)).

The danger for HomeAI comes from the statute's wording. The Labour Act's "worker" includes anyone under "a contract personally to execute any work or labour" ([GLI 2025](https://isc.ng/wp-content/uploads/2025/06/GLIEMP25_Chapter-13_Nigeria.pdf)). That fits a field agent who personally carries out an inspection, a clean or a repair. The risk rises if HomeAI also sets the price, pays through the app, and disciplines agents through ratings or deactivation.

If agents were reclassified, HomeAI would owe back pension at 18% plus penalties, NSITF and ITF contributions, and back PAYE ([WhichPayroll](https://whichpayroll.com/countries/nigeria/contractor-management)). The defensible design gives agents genuine autonomy: they can decline jobs, use substitutes, supply their own tools, work for competitors, and invoice per job, with WHT deducted.

Two more design points follow from the case law. HomeAI's anti-harassment and grievance procedures should cover agents in substance, given *Awogu v TFG Real Estate*, where a real-estate employer paid ₦2.5m for failing to act on harassment. And restrictive covenants must not exceed the FCCPA's two-year cap on non-competes ([GLI 2025](https://isc.ng/wp-content/uploads/2025/06/GLIEMP25_Chapter-13_Nigeria.pdf)).

## NIN, BVN and an LLM make HomeAI a major data controller from the start

### Registration, a DPO and annual audits are effectively mandatory

The Nigeria Data Protection Act 2023 and the NDPC's General Application and Implementation Directive (GAID) are both in force. The GAID was issued in March 2025, became operational on **19 September 2025**, and repealed the NDPR 2019 ([Adeola Oyinlade & Co](https://www.adeolaoyinlade.com/en/key-regulatory-updates-under-the-2025-general-application-and-implementation-directive-gaid-issued-by-the-nigeria-data-protection-commission-ndpc/)).

An organisation becomes a "Data Controller of Major Importance" (DCPMI) based on how many people's data it processes in six months:

| Tier | Data subjects in 6 months | Registration fee (2024) |
|---|---|---|
| Ordinary High Level (OHL) | more than 200 | ₦10,000, renewed every year |
| Extra High Level (EHL) | more than 1,000 | ₦100,000, one-time |
| Ultra High Level (UHL) | more than 5,000 | ₦250,000, one-time |

Sources: [DLA Piper](https://www.dlapiperdataprotection.com/index.html?t=law&c=NG); [Templars](https://www.templars-law.com/app/uploads/2024/02/CLIENT-ALERT-NDPC-ISSUES-GUIDANCE-NOTICE.pdf). The fees come from the 2024 Guidance Notice and should be checked on the live NDPC portal.

Tenants, landlords, agents, guarantors and referees all count towards these thresholds, so **HomeAI will pass 5,000 data subjects almost immediately**. Registration is due within six months of crossing a threshold, and a change of tier must be notified within 60 days.

EHL and UHL entities must file an annual **Compliance Audit Return (CAR) by 31 March**, through a licensed Data Protection Compliance Organisation (DPCO). A new entity files its first CAR within 15 months. CAR filing fees run from **₦100,000 to ₦1,000,000** by volume, with a 50% surcharge for late filing ([Adeola Oyinlade & Co](https://www.adeolaoyinlade.com/en/key-regulatory-updates-under-the-2025-general-application-and-implementation-directive-gaid-issued-by-the-nigeria-data-protection-commission-ndpc/)). Sources disagree on whether using a DPCO is mandatory or merely recommended.

A DCPMI must also appoint a DPO who reports to management and produces a report every six months. Fines reach the **greater of ₦10m or 2% of the previous year's gross revenue** ([DLA Piper](https://www.dlapiperdataprotection.com/index.html?t=law&c=NG)). The NDPC has shown it will use these powers: it fined Multichoice ₦766.2m ([Mondaq](https://www.mondaq.com/nigeria/data-protection/1684204/unlocking-gaid-2025-answers-to-all-your-burning-questions)).

### What the GAID requires of HomeAI's product

The GAID requires **consent for direct marketing, cross-border transfers made on a consent basis, and automated decisions with legal effect**. Non-essential cookies need a banner with equal accept and reject options ([Adeola Oyinlade & Co](https://www.adeolaoyinlade.com/en/key-regulatory-updates-under-the-2025-general-application-and-implementation-directive-gaid-issued-by-the-nigeria-data-protection-commission-ndpc/)).

A personal-data breach must be reported to the NDPC within **72 hours**. Where no specific retention period applies, data must be deleted within **six months** after its purpose ends ([Afriwise](https://www.afriwise.com/blog/key-updates-from-the-nigeria-data-protection-act---general-application-and-implementation-directive-2025)). Rejected rental applications are the obvious candidate for automatic deletion.

The GAID's DPIA triggers include profiling, financial services delivered through digital devices, e-commerce, cross-border transfers, new technology and "vulnerable data subjects", a category that includes people in financial difficulty. HomeAI meets at least four of these, so **a DPIA must be completed before launch**.

Financial data and NIN/BVN are not "sensitive personal data" in the statutory definition. **Biometric data used for identification is.** A selfie or liveness check therefore needs explicit consent and must be covered in the DPIA ([DLA Piper](https://www.dlapiperdataprotection.com/index.html?t=law&c=NG)).

### Identity checks: use licensed partners and keep only the result

NIN checks must go through **NIMC-licensed verification partners** using the tokenised virtual-NIN flow, which is designed so that the verifier never holds the raw NIN ([Youverify](https://youverify.co/en/blogs/nimc-launches-virtual-nin-vnin)). The **NIMC Act 2026**, signed in June 2026, repealed the 2007 Act. It makes NIMC the national PKI root certification authority, and NIMC has promised regulations to follow ([ID Tech](https://idtechwire.com/nigeria-signs-nimc-act-2026-recasting-its-identity-commission-around-digital-trust/)).

BVN is more restricted. A CBN circular effective **1 May 2026** limits BVN database access to CBN-licensed institutions ([BigCapital Intel](https://www.bigcapitalintel.com/2026/06/list-of-cbn-directives-on-fintechs-banks.html)). **HomeAI has no lawful reason to collect BVN itself.** Any BVN check should happen inside its payment partner's KYC, and HomeAI should keep only the verification result, a timestamp and a reference.

### Hosting abroad and foreign LLM APIs are cross-border transfers

Hosting on AWS, GCP or Azure, or sending prompts to a foreign LLM API, is a cross-border transfer under NDPA ss.41–43. The NDPC has published **no adequacy list**, and the old NITDA whitelist has no legal effect ([Legal500](https://www.legal500.com/developments/thought-leadership/cross-border-data-transfers-an-overview-of-legal-requirements-and-compliance-mechanisms-in-nigeria/)). Some practitioners also say that standard contractual clauses (SCCs) need **prior NDPC approval** ([Mondaq](https://www.mondaq.com/nigeria/privacy-protection/1798234/cross-border-data-transfers-and-international-compliance-legal-opportunities-in-global-tech-transactions)).

The defensible stack has five parts:

- data processing agreements with SCCs for each vendor;
- a transfer impact assessment for each destination country;
- disclosure of the transfers in the privacy notice and the DCPMI registration;
- redaction of NIN, BVN and account numbers before any prompt reaches the model;
- vendor settings that disable model training and data retention.

Consent should be a backstop, not the main basis for routine hosting, because users can withdraw it.

### Cyber incidents, platform duties, advertising and e-signatures

Data breaches are not the only reportable events. The Cybercrimes (Amendment) Act 2024 requires cyber incidents to be reported to the sectoral CERT or SOC within **72 hours**, with a ₦2m fine for failure. It also imposes a two-year retention duty on traffic data held by "service providers" ([Templars](https://www.templars-law.com/app/uploads/2024/08/Cybercrimes.pdf)). HomeAI's incident runbook should therefore run two 72-hour clocks in parallel, one for the NDPC and one for the CERT. Keeping security logs for two years is the conservative choice.

NITDA's Code of Practice for interactive platforms requires several things of every platform: plain-language terms, a complaints channel, takedown of prohibited content within 24 hours of notice, and an annual compliance report. Platforms with more than **100,000 users** have extra duties, including appointing a local liaison officer ([Afriwise](https://www.afriwise.com/blog/exploring-the-nitda-code-of-practice-and-its-potential-impact-on-social-media-and-online-platforms)).

ARCON requires **pre-exposure approval** of advertisements, including social-media and influencer campaigns ([ThisDay](https://www.thisdaylive.com/2022/12/15/advertising-regulation-fg-tackles-skit-makers-influencers/)). That applies to HomeAI's own paid campaigns. "Featured" listings should at least be labelled as sponsored.

For electronic leases, the Evidence (Amendment) Act 2023 lets electronic records satisfy "in writing" requirements (s.84A) and makes cloud records admissible (s.84B) ([Omaplex](https://omaplex.com.ng/an-overview-of-the-evidence-amendment-act-2023/)). The Cybercrimes Act s.17 exclusions from e-signature validity do not mention leases. **E-signed tenancies of up to three years are likely valid** if HomeAI captures an identity-verified audit trail. Leases that must be made by deed or registered should use wet-ink or hybrid execution until the Digital Economy Bill passes.

### Consumer law and AI rules

The FCCPA's rules against misleading representations and unfair terms already apply. On **13 April 2026** the FCCPC published exposure drafts of the Consumer Protection Regulations 2026 and four Guidance Notes ([FCCPC Exposure Notice](https://fccpc.gov.ng/wp-content/uploads/2026/04/FCCPC-Consumer-Protection-Exposure-Notice.pdf)). The drafts would:

- ban pre-ticked boxes, bundled data consent and dark patterns;
- add a "Grey List" of presumptively unfair contract terms;
- give cancellation rights for distance contracts;
- prohibit "review gating" (suppressing negative reviews);
- in Guidance Note 1, govern **AI chatbots, AI-generated imagery and AI-generated testimonials**.

They are not final. HomeAI should still build to them now, because rebuilding consent flows and listing imagery later costs more.

Nigeria has **no standalone AI law**. The National AI Strategy published in September 2025 is policy, not binding law ([Digital Policy Alert](https://digitalpolicyalert.org/event/40784-federal-ministry-of-communication-innovation-and-digital-economy-released-national-artificial-intelligence-strategy)). What binds HomeAI today is NDPA s.37, the right not to be subject to solely automated decisions with legal or similarly significant effects ([Adeola Oyinlade](https://www.adeolaoyinlade.com/en/?p=2681)), together with the GAID's requirement for a DPIA before any AI deployment.

If the assistant scores or ranks rental applicants, a landlord or agent must make the final decision. Applicants also need an explanation and a route to contest the decision. The pending Digital Economy Bill would make **NITDA the AI regulator**, require impact assessments for higher-risk uses in finance, and allow fines of up to ₦10m or 2% of revenue ([Bloomberg](https://www.bloomberg.com/news/articles/2026-01-13/nigeria-set-to-pass-sweeping-ai-rules-for-digital-economy)). In July 2026 it was at third reading in the Senate, after missing earlier deadlines ([ThisDay](https://www.thisdaylive.com/2026/07/09/national-digital-economy-and-e-governance-act-2026-ready-in-weeks/)). A risk register and impact assessment written now can be reused when the Bill passes.

## Touching money or commission turns a listing site into a regulated estate agent

### SCUML registration is a pre-launch step

Under s.30 of the Money Laundering (Prevention and Prohibition) Act 2022 (MLPPA), "dealers in real estate, estate developers, estate agents and brokers" are designated non-financial businesses and professions (DNFBPs). Regulation 5(3) of the SCUML DNFBP Regulations 2024 says new businesses "shall, **before the commencement of business**, register with SCUML" ([SCUML Regulations 2024](https://scuml.efcc.gov.ng/wp-content/uploads/2024/11/EFCC-SCUML-Anti-Money-Regulation.pdf)).

Whether a pure listings portal counts as a "broker" is open. An agent portal, sale commissions or buy-side escrow make it very likely. Registration is cheap and the sanctions are not, so HomeAI should **register before launch**.

Once registered, a DNFBP must meet a set of AML duties ([SCUML Regulations 2024](https://scuml.efcc.gov.ng/wp-content/uploads/2024/11/EFCC-SCUML-Anti-Money-Regulation.pdf); [LawPadi](https://lawpadi.com/money-laundering-prevention-and-prohibition-act-2022/)):

- verify both purchasers and vendors in every sale, recording name, address, occupation, source of funds, account details and NIN (reg. 40);
- aggregate linked transactions when testing thresholds;
- file suspicious transaction reports with the NFIU "without delay", at any amount;
- report transactions above **₦5m (individuals) or ₦10m (companies)** to SCUML within seven days, and file monthly nil returns;
- screen customers against UN and Nigerian sanctions lists and register on the Sanctions Alert System;
- appoint a management-level compliance officer;
- keep records for **five years**.

Separately, MLPPA s.2 bans cash payments above those same thresholds except through a financial institution. That is a strong reason for HomeAI to refuse cash entirely.

The administrative fines are steep for a startup. Each of the following costs a business ₦1m: failing to file an STR, having no STR controls, or failing to identify a customer before transacting. Failing to screen sanctions lists costs ₦500,000, and operating "without the requisite business licence" costs ₦2m. That last item creates an AML-level link to the LASRERA permit discussed below ([SCUML Regulations 2024](https://scuml.efcc.gov.ng/wp-content/uploads/2024/11/EFCC-SCUML-Anti-Money-Regulation.pdf)).

### Lagos regulates both HomeAI and the agents it hosts

Lagos is the most demanding state. The LASRERA Law (signed February 2022) requires anyone "dealing in real estate transactions" to hold an **annual LASRERA permit**. A corporate applicant must be CAC-registered, operate a **separate client account**, keep transaction records, hold three years of tax clearance certificates, and have at least one qualifying director ([Templars review](https://www.templars-law.com/app/uploads/2022/03/Review-of-the-Lagos-State-Real-Estate-Regulatory-Authority-Law-Newsletter.pdf)).

Section 32 sets operating rules:

- tenancy money must be remitted to the landlord within **seven working days** and receipted;
- money may be collected from only one prospective client per unit, and only with the principal's consent;
- if possession is not delivered, money must be refunded within seven days, with interest at the CBN rate if late;
- agency fees are capped at **10% of rent** for lettings, and **15%** where several permit holders share a sale;
- practitioners must not prepare legal documents, and tenancy agreements must be **prepared and sealed by a legal practitioner**.

Failure to register costs an organisation at least **₦1,000,000** ([Templars](https://www.templars-law.com/app/uploads/2022/03/Review-of-the-Lagos-State-Real-Estate-Regulatory-Authority-Law-Newsletter.pdf)). The registration fee is reported at ₦1m, but that figure comes from the press, not an official schedule ([Legit.ng](https://www.legit.ng/business-economy/economy/1664245-stakeholders-urge-lasrera-review-registration-fees-n1-million/)).

In June 2025 the Lagos government said it is an offence not only to practise without registration but **"to deal with unregistered persons or organisations"** ([Nairametrics](https://nairametrics.com/2025/06/28/lagos-govt-declares-real-estate-practice-without-lasrera-registration-illegal/)). That statement reaches a marketplace directly. HomeAI should require and check a LASRERA permit number before any Lagos agent, developer or property manager can list or take jobs.

HomeAI should also apply for its own permit before it collects Lagos rent or earns letting commission. Its in-app lease templates need a lawyer to prepare and seal them. A button that lets an agent generate a lease would breach s.32(1)(f).

Two Lagos tenancy rules also need to be built into the product. Under the Lagos Tenancy Law 2011, a new tenant cannot be asked for more than a year's rent in advance ([Lagos Gazette via PolicyVault](https://policyvault.africa/wp-content/uploads/policy/NGA596.pdf)). The pending **Tenancy and Recovery of Premises Bill 2025** would cut agency commission to **5%** of a year's rent, make LASRERA registration mandatory for agents, require receipts and seven-day remittance, and set default notice periods ([OAL](https://oal.law/?p=1006020)). In May 2026 the Bill was still at committee stage ([Channels TV](https://www.channelstv.com/2026/05/26/lagos-unveils-new-tenancy-bill-to-regulate-rent-estate-agency-fees/)). HomeAI's fee caps, advance-rent limits and notice templates should therefore be configuration values, not hard-coded logic.

The FCT has no LASRERA equivalent and no statutory fee cap. Federal law governs there: the MLPPA, the FCCPA and the ESVARBON Act.

### Verification tiers can describe checks, never certify title

The Land Use Act vests land in the Governor. A Certificate of Occupancy is only **prima facie, rebuttable evidence of title** (*Ogunleye v Oni*, 1990), and the Supreme Court has held that it can be "rendered invalid, null and void" (*Adole v Gwar*, 2008) ([NigeriaLII](https://nigerialii.org/akn/ng/judgment/ngsc/1990/40/eng@1990-04-26); [NigeriaLII](https://nigerialii.org/akn/ng/judgment/ngsc/2008/7/eng@2008-04-04)). Valuation is also reserved. Under s.16 of the ESVARBON Act, it is an offence for an unregistered person to practise as an estate surveyor and valuer, or to hold themselves out as one, for reward ([PLAC](https://www.lawsofnigeria.placng.org/print.php?sn=136)).

This sets clear limits on the Bronze-to-Platinum tiers.

A tier may truthfully state:

- which documents were uploaded;
- whether a Nigerian lawyer or registered surveyor ran a land-registry search, and its date and result;
- the date of the physical audit and who carried it out.

A tier must not say:

- that a title is "valid", "genuine" or "free of encumbrance";
- that Governor's consent is perfected, unless a registry record or a lawyer's report shows it;
- anything that presents an AI "fair price" as a valuation, unless an ESVARBON-registered surveyor signs it.

Gold and Platinum should require a registry search report from a lawyer kept on file. Inspection jobs on the job board that are marketed as "valuations" or "surveys" should be restricted to ESVARBON members.

Disclaimers alone will not protect HomeAI from FCCPA misleading-representation claims, so the tier names and marketing copy must be accurate. The FCCPC is active in this sector. In 2026 it **sealed the offices of Paradise Estate, Ochacho Group and PWAN MAX** over properties that were paid for but not delivered and refunds that were never paid ([Nairametrics](https://nairametrics.com/2026/06/08/fccpc-seals-pwan-max-office-over-alleged-regulatory-non-compliance/); [Leadership](https://leadership.ng/fccpc-seals-real-estate-firms-in-abuja-over-unresolved-customer-complaints/)). A HomeAI badge on a developer that is later sealed is both a liability and a problem for releasing escrowed funds.

### Short-lets

Short-lets have no statewide Lagos licensing regime. They fall under the Hotel Occupancy and Restaurant Consumption Law's **5% consumption tax**, which hosts collect on LIRS's behalf, although enforcement has been contested in court ([Mondaq](https://www.mondaq.com/article/1646430)). Private estates can also ban short-lets. Banana Island did so in February 2026 ([BusinessDay](https://businessday.ng/companies/article/lagos-shortlet-market-growth-slows-to-n285-5bn-amid-ban-tax-changes/)). HomeAI should let hosts add the tax to the displayed price and flag listings in estates that ban short-lets.

## Never hold the money: licensed partners keep HomeAI outside the CBN and SEC perimeters

### Rent collection: a split-payment design needs no licence

The CBN's licence categories still follow the December 2020 categorisation. A **Mobile Money Operator** licence, the category that can hold customer funds and run wallets, needs **₦2bn** of capital plus an equal refundable deposit at the CBN. A **Payment Solution Service Provider** licence needs about ₦100m, or ₦250m for the combined licence; sources conflict ([Techpoint Africa 2026](https://techpoint.africa/guide/cbn-fintech-regulations/); [Lexsetters copy of CBN requirements](https://lexsetters.com/articles/wp-content/uploads/2021/07/NEW-REGIME-REGIME-REQUIREMENTS-FOR-FINTECHS.pdf)).

The CBN looks at what a product does, not what it is called. In April 2025 it fined **Paystack ₦250m** for running its Zap wallet under a switching licence that allowed it to route funds but not hold them ([Techpoint Africa](https://techpoint.africa/news/paystack-fined-250m/)). Carrying on unauthorised financial business under BOFIA can bring fines reported at up to ₦500m ([Manifield Solicitors](https://manifieldsolicitors.com/licensing-in-nigerias-fintech-industry-understanding-the-cbns-framework/)).

The licence-free route for rent is a **split payment** through a licensed payment provider. The landlord is set up as a subaccount, HomeAI's fee is the platform share, and both are settled at the same moment, so HomeAI never holds the rent itself ([Paystack Support](https://support.paystack.com/hc/en-us/articles/360009881460)). This design also meets LASRERA's seven-day remittance rule automatically. The alternative, where all money lands in HomeAI's own account and is paid out later, is the activity the Zap fine punished.

The partner will pass its own conduct obligations down to HomeAI by contract, as CBN Consumer Protection Regulations 2019 s.2 requires ([Mondaq/Pavestones](https://www.mondaq.com/nigeria/financial-services/1474486/the-emergence-of-escrow-payments-in-e-commerce-transactions-in-nigeria)). Two CBN directives will also reach HomeAI through its partners. A **June 2026 data-localisation circular** requires payment licensees to keep customer and transaction data in Nigeria by **1 January 2027** ([BigCapital Intel](https://www.bigcapitalintel.com/2026/06/list-of-cbn-directives-on-fintechs-banks.html)). A March 2026 directive requires real-time AML monitoring. HomeAI should keep a second payment provider ready, because regulators freeze partners' onboarding without warning.

### Escrow and wallets need a licensed custodian

Nigeria has **no escrow statute or escrow licence**. Banks and trustee companies act as escrow agents, and tech firms offer escrow only "through partnerships with banks" ([Mondaq/Pavestones](https://www.mondaq.com/nigeria/financial-services/1474486/the-emergence-of-escrow-payments-in-e-commerce-transactions-in-nigeria)). The proptech precedent is recent: in July 2026 **Rurblist appointed FCMB Trustees**, an SEC-regulated trustee, to hold buyers' funds until verification and contract conditions are met ([BusinessDay](https://businessday.ng/?p=1168100)).

Buy-side escrow should follow the same pattern. It needs a three-party agreement in which a bank or SEC-registered trustee holds the funds in its own name, while HomeAI acts as the verification agent that issues release instructions. Security deposits held for the length of a tenancy belong in the same structure.

The agent earnings wallet must be **issued by a licensed MMO, microfinance bank or bank** through a wallet-as-a-service partner, with HomeAI as the front end only. Rent and purchase amounts quickly exceed the Tier 1 and Tier 2 KYC limits, and every wallet tier now requires BVN or NIN ([Youverify](https://youverify.co/en/blogs/cbn-kyc-aml-requirements-2026)). The partner therefore has to run Tier 3 KYC. HomeAI should not use the words "escrow" or "wallet" in marketing until a named licensed custodian holds the funds.

### Diaspora payments and the blockchain feature

Since **1 May 2026**, IMTO remittances must pay out in naira only, through naira settlement accounts at authorised dealer banks ([Nairametrics](https://nairametrics.com/2026/03/25/cbn-orders-imtos-to-open-naira-settlement-accounts-with-nigerian-banks/)). Diaspora rent and purchase payments should come in through a payment provider or IMTO that converts the money and settles naira to the landlord or escrow agent. HomeAI should show the exchange rate and never hold foreign currency itself.

The blockchain wallet sits behind the highest legal barrier. ISA 2025 s.357 treats virtual and digital assets as **securities**. Operating as an unregistered virtual-asset service provider, exchange or custodian carries a fine of at least **₦5m, at least five years' imprisonment, or both** (s.61) ([Licentium](https://www.licentium.io/post/virtual-and-digital-assets-in-nigeria-regulatory-perimeter-approval-status-and-market-entry-sequence)). The SEC's January 2026 capital circular sets the floors, with a deadline of 30 June 2027 ([SEC Nigeria](https://sec.gov.ng/revised-minimum-capital-mc-for-regulated-capital-market-entities)):

| SEC category | Minimum capital |
|---|---|
| Ancillary virtual-asset service provider | ₦300m |
| Real-World Asset Tokenisation and Offering Platform (RATOP, new) | ₦1bn |
| Digital asset custodian | ₦2bn |
| Digital asset exchange | ₦2bn |

A **July 2026 Executive Order** created a CBN-chaired Virtual Asset Council and divided the work: securities-like activity goes to the SEC, and payment, settlement and custody go to the CBN ([Nairametrics](http://nairametrics.com/2026/07/17/tinubu-signs-virtual-assets-executive-order-creates-cbn-led-council-to-harmonise-crypto-regulation/)). Its implementing framework had not been published at the time of the research.

Regulators have acted against unregistered platforms before: Binance was declared illegal in 2023, and the CBEX collapse in 2025 led to account freezes. Storing a user's external wallet address, with no custody and no transfers, is low-risk. Anything that receives, converts, holds or tokenises assets must go through an SEC-registered or ARIP-admitted partner, or through HomeAI's own ARIP application. ARIP is the SEC's incubation programme; its processing fee is ₦2m, and approval-in-principle is "not a final licence" ([Licentium](https://www.licentium.io/post/virtual-and-digital-assets-in-nigeria-regulatory-perimeter-approval-status-and-market-entry-sequence)). Fractional property tokens are securities in their own right, so the offering itself would also need SEC registration.

## A phased roadmap: register lightly, then unlock each feature with a named partner

The sequence below orders obligations by when they bite. "Before launch" means before the first public user. Feature gates are hard stops: a feature should not ship until its gate is cleared.

### Gate 0 — before public launch

| Requirement | Why it is needed now | Authority / key figure |
|---|---|---|
| Fix the cap table, then incorporate a private Ltd; reserve name; disclose PSCs at 5% | Foreign equity triggers ₦100m capital, Business Permit and CCI; Nigerian founders need at least one-third for a Startup Act label | CAC; ₦10,000 per ₦1m capital |
| If foreign-owned: open account, import capital with a CCI, NIPC registration, Business Permit | Required before operations; CCI protects repatriation | Interior, NIPC, authorised-dealer bank |
| NRS Tax ID; state employer registration (LIRS / FCT-IRS) | Banks require a Tax ID; PAYE starts with first payroll | NRS, LIRS |
| SCUML registration; NFIU goAML registration; named compliance officer; AML/CFT policy; sanctions screening; no-cash rule | Reg. 5(3): register "before commencement of business" | SCUML/EFCC; fines ₦500k–₦2m per breach |
| NDPC: data map and records of processing, DPIA, appointed DPO, privacy and cookie notices with equal "Reject", consent log, breach runbook (72h NDPC + 72h CERT) | DCPMI thresholds crossed within weeks; DPIA triggers met | NDPC; fines up to ₦10m or 2% of revenue |
| Transfer basis for cloud and LLM vendors: DPAs with SCCs, transfer impact assessments, prompt redaction, training and retention off | Foreign hosting and APIs are cross-border transfers | NDPA ss.41–43 |
| NIN checks only through a NIMC-licensed provider (vNIN); no BVN collection; store results only | NIMC licensing; BVN access limited to CBN licensees | NIMC, CBN |
| Verification-tier wording and disclaimers; Gold/Platinum need a lawyer's registry search; AI price estimates labelled non-professional | Land Use Act case law, ESVARBON s.16, FCCPA misleading-representation rules | Courts, ESVARBON, FCCPC |
| Terms of service purged of one-sided clauses; upfront fee display; complaints desk; takedown policy; "AI assistant" label; no unlabelled AI imagery; no review gating | FCCPA in force; FCCPC 2026 drafts; NITDA Code | FCCPC, NITDA |
| Agent onboarding collects Tax ID and LASRERA permit number (Lagos); contractor agreement preserves agent autonomy | ₦5m penalty for contracting unregistered persons; LASRERA "dealing with unregistered" offence; reclassification risk | NRS, LASRERA, NICN |
| Trademark filings (Classes 36, 42, 9); .ng domains | No Paris priority in Nigeria | IPO Nigeria, NiRA |
| Letterhead, invoice and website particulars | CAMA ss.304/729, enforced from 1 Aug 2026 | CAC |

### Gate 1 — first 3 to 12 months after launch

| Requirement | Trigger | Key figure |
|---|---|---|
| NDPC DCPMI registration at the correct tier; notify tier changes within 60 days | Within 6 months of exceeding 200 / 1,000 / 5,000 data subjects | ₦10k–₦250k (verify) |
| Pension (RSA per employee), group life cover, NSITF | First employee | 10% + 8%; group life ≥3x emoluments; NSITF 1% |
| ITF registration; HIV workplace policy lodged | 5 employees (ITF also at ₦50m turnover) | 1% of payroll; HIV policy within 12 months |
| Startup Act label application | Once Nigerian-founder shareholding is at least one-third | Investor CGT exemption after 24 months |
| ARCON pre-approval for paid campaigns; "Sponsored" label on featured listings | First paid campaign | Per-ad vetting fees |
| First CAR through a DPCO | Within 15 months of establishment, then every 31 March | ₦100k–₦1m |
| Tax position memo on the "professional services" carve-out and VAT opt-in | Before commission revenue grows | Decides 0% vs 30% + 4% |

### Gate 2 — feature-specific gates

| Feature | Must be in place before it ships |
|---|---|
| Rent and deposit payments | Licensed payment provider with split settlement (HomeAI never holds the principal); same-moment or 7-working-day landlord remittance; receipts; automatic refund within 7 days if possession fails; one-applicant collection lock; advance-rent cap of 12 months (Lagos new tenants); configurable 10% Lagos fee cap (5% if the Bill passes); HomeAI's own LASRERA permit if it collects Lagos rent or earns letting commission; deposits held by a bank or trustee, not HomeAI; secondary payment provider |
| Lease generation and e-signing | Lawyer-prepared and sealed templates (LASRERA s.32(1)(f)); identity-verified e-signature audit trail; electronic stamping prompt for leases of ₦10m+ annual value; wet-ink or hybrid execution for leases over 3 years or requiring a deed |
| Buy-side escrow | Three-party escrow with a bank or SEC-registered trustee holding the funds in its own name; reg. 40 buyer and seller KYC with source of funds and NIN; ₦5m/₦10m transaction reporting and linked-transaction aggregation; PEP approval workflow; FCCPC monitoring of listed developers; refund SLAs |
| Agent job board and in-app earnings | Wallet issued by a licensed MMO, microfinance bank or bank (wallet-as-a-service) with Tier 3 KYC through the partner; automated 5% WHT (10% without a Tax ID) remitted by the 21st; contractor-model safeguards; valuation and survey jobs restricted to ESVARBON members; harassment and safety policy extended to agents |
| AI assistant and any applicant scoring | DPIA updated for AI; human final decision on applications; explanation and contest route; sensitive attributes and proxies excluded; bias testing; not-legal-or-financial-advice disclaimer; output logging; prompt redaction of identifiers |
| Short-let bookings | Host-side 5% HORC tax display; estate-ban flags; refund and cancellation rules aligned with the FCCPC distance-contract draft |
| Diaspora payments | Cross-border collection through a payment provider or IMTO with naira settlement; exchange-rate disclosure; no foreign currency on HomeAI's books; legal advice before any USD-priced escrow |
| Blockchain wallet | Phase A, address storage only: allowed with DPIA coverage. Phase B, any receipt, conversion, custody or tokenisation: only through an SEC-registered or ARIP-admitted partner, or HomeAI's own ARIP or SEC registration (₦300m–₦2bn capital); monitor the CBN–SEC framework under the July 2026 Executive Order |

### Gate 3 — growth thresholds and the recurring calendar

Several obligations switch on as HomeAI grows:

- **25 workers:** the ₦70,000 minimum wage applies.
- **Turnover above ₦50m (or ₦100m):** 30% company income tax, the 4% development levy and monthly VAT returns apply.
- **100,000 users:** NITDA's large-platform duties apply, including a local liaison officer.
- **Turnover above ₦120m, or any foreign shareholder:** CAMA's small-company concessions and audit exemption are lost.
- **1 July 2027:** e-invoicing reaches taxpayers with turnover under ₦1bn.

The recurring calendar falls into four groups:

- **Each payroll:** pension within 7 working days.
- **Monthly:** PAYE by the 10th (pending LIRS confirmation); VAT and WHT by the 21st; NSITF by the 10th to be safe; SCUML nil returns.
- **Within 30 days of execution:** stamping of any dutiable instrument.
- **Annual:** employer PAYE return on 31 January; NDPC CAR on 31 March; ITF levy around 1 April; CAC annual return within 42 days of the AGM; company tax return 6 months after year end; LASRERA permit renewal.

Missing the CAC filing is the one deadline that can end the company outright.

## Conclusion

Compliance for HomeAI is mostly a product-architecture problem, not a licensing problem. The same three choices recur across tax, AML, LASRERA, CBN and SEC rules: not holding funds, not certifying title, and not running the money ledger itself. Making those choices keeps HomeAI a lightly regulated marketplace that pays 0% tax and avoids capital requirements of ₦100m to ₦2bn. Getting any one of them wrong makes it a de facto estate agent, deposit-taker or virtual-asset provider, with matching penalties. The highest-return early investments are therefore engineering work: split settlement through a licensed partner, Tax ID and LASRERA checks at agent onboarding, automated withholding, prompt redaction and deletion schedules, and careful wording of the verification tiers. Regulators across these regimes look at what a product does, not what it is called, so marketing copy deserves the same legal review as contracts.

Timing also matters more than usual. In late 2026 several regimes are mid-change: the Lagos Tenancy Bill, the final FCCPC regulations, the Digital Economy Bill's AI chapter, regulations under the NIMC Act, the CBN–SEC virtual-asset framework, and the competing ₦50m and ₦100m tax thresholds. Each is likely to tighten rules for platforms rather than loosen them. Keeping fee caps, advance-rent limits, consent flows and AI disclosures as configurable values lets HomeAI comply with the new rules in days, not quarters. A light, well-documented compliance position now, such as an early DPIA, an early SCUML filing and an accurate badge vocabulary, is also what will let HomeAI show regulators and investors that it is a trustworthy player in a market where fake listings and undelivered properties are the norm.
