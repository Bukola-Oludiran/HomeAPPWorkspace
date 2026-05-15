# HomeAI - Canada Region Integration Suggestions

**Comprehensive Provider & Regulatory Mapping for Canadian Expansion**

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Date | January 2026 |
| Status | Research & Recommendations |
| Target Region | Canada (All Provinces) |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Payment Providers](#2-payment-providers)
3. [Identity Verification (KYC/AML)](#3-identity-verification-kycaml)
4. [Property & Land Registry](#4-property--land-registry)
5. [Real Estate Agent Verification](#5-real-estate-agent-verification)
6. [Communication Providers](#6-communication-providers)
7. [Maps & Geocoding](#7-maps--geocoding)
8. [Regulatory Compliance](#8-regulatory-compliance)
9. [Blockchain Considerations](#9-blockchain-considerations)
10. [Recommended Configuration](#10-recommended-configuration)

---

## 1. Executive Summary

Canada presents a unique opportunity for HomeAI expansion due to its strong real estate market, high digital adoption, and well-established regulatory framework. However, there are key differences from the Nigerian market:

### Key Differences from Nigeria

| Aspect | Nigeria | Canada |
|--------|---------|--------|
| **ID System** | NIN (centralized) | Provincial driver's licenses, SIN (restricted use) |
| **Land Registry** | State-based (e.g., Lagos Land Registry) | Provincial systems (varies by province) |
| **Payment** | Paystack, Flutterwave | Stripe, Moneris, Interac |
| **Real Estate Regulation** | LASRERA (Lagos) | Provincial bodies (RECO, BCFSA, etc.) |
| **Data Protection** | NDPR | PIPEDA + Provincial laws |
| **Escrow** | Platform-managed | Lawyer trust accounts (regulated) |

### Provincial Complexity

Canada has **10 provinces and 3 territories**, each with:
- Separate land registry systems
- Different real estate regulatory bodies
- Varying landlord-tenant laws
- Provincial privacy legislation (in some cases)

**Recommendation:** Start with **Ontario** and **British Columbia** as pilot provinces due to:
- Largest real estate markets
- Digital-first land registry systems
- Clear regulatory frameworks
- High demand for rental/purchase platforms

---

## 2. Payment Providers

### 2.1 Recommended Primary: Stripe

| Attribute | Details |
|-----------|---------|
| **Provider** | Stripe |
| **Why Primary** | Best developer experience, full feature set, CAD/USD support |
| **Supported Methods** | Credit/Debit cards, Bank debits (PAD), Apple Pay, Google Pay |
| **Fees** | 2.9% + $0.30 CAD per transaction |
| **Escrow Support** | Stripe Connect (for marketplace payouts) |
| **API Quality** | Excellent documentation, SDKs for all major languages |
| **Website** | https://stripe.com/en-ca |

**Key Features:**
- Pre-authorized debits (PAD) for recurring rent payments
- Stripe Connect for landlord payouts
- Strong fraud detection (Radar)
- PCI DSS Level 1 compliant
- Instant payouts available

### 2.2 Recommended Secondary: Moneris

| Attribute | Details |
|-----------|---------|
| **Provider** | Moneris (Canada's largest payment processor) |
| **Why Secondary** | Canadian-owned, trusted by major banks, Interac support |
| **Supported Methods** | Credit/Debit cards, Interac Online, Apple Pay, Google Pay |
| **Fees** | Custom pricing based on volume |
| **API** | Moneris Gateway API (REST) |
| **Website** | https://www.moneris.com |

**Key Features:**
- Native Interac e-Transfer support (very popular in Canada)
- Multi-currency pricing (CAD + USD)
- Direct debit via Canadian bank accounts
- Strong presence with Canadian financial institutions

### 2.3 Interac e-Transfer Integration

Interac e-Transfer is **extremely popular** in Canada for peer-to-peer and business payments.

| Provider | Integration Type |
|----------|-----------------|
| **Interac** (via partner banks) | Direct API (requires banking partnership) |
| **Moneris** | Interac Online supported |
| **PaySimply** | Interac e-Transfer for business |
| **Rotessa** | Pre-authorized debits + Interac |

**Recommendation:** For rent collection, consider Interac Autodeposit or Interac Request Money features.

### 2.4 Additional Options

| Provider | Best For | Notes |
|----------|----------|-------|
| **Square** | In-person + online | Good for agents needing mobile POS |
| **PayPal** | International tenants | Wide acceptance, higher fees |
| **Helcim** | Cost-conscious | Lower interchange-plus pricing |
| **Rotessa** | Rent collection | Specialized in recurring PAD |

### 2.5 Escrow Considerations

**Important:** In Canada, real estate escrow is typically handled through **lawyer trust accounts**, not third-party platforms. This is legally required for property purchases.

| Scenario | Recommended Approach |
|----------|---------------------|
| **Property Purchase** | Funds held by buyer's lawyer in trust account |
| **Rental Deposits** | Platform escrow via Stripe Connect or integrate with provincial rent deposit rules |
| **Agent Payments** | Platform-managed via Stripe Connect |

**Provincial Deposit Rules:**
- **Ontario:** Security deposit = max 1 month rent, must be held for last month
- **BC:** Security deposit = max 1/2 month rent; pet deposit = max 1/2 month rent
- **Alberta:** Security deposit = max 1 month rent

---

## 3. Identity Verification (KYC/AML)

### 3.1 Regulatory Context

Canada's KYC requirements are governed by:
- **PCMLTFA** (Proceeds of Crime Money Laundering and Terrorist Financing Act)
- **FINTRAC** (Financial Transactions and Reports Analysis Centre of Canada)

Real estate is a **designated sector** under FINTRAC, meaning platforms facilitating property transactions may have reporting obligations.

### 3.2 Recommended Primary: Onfido (Entrust)

| Attribute | Details |
|-----------|---------|
| **Provider** | Onfido (now part of Entrust) |
| **Why Primary** | Best document coverage, PCMLTFA compliant, Canadian ID support |
| **Supported IDs** | Driver's licenses (all provinces), Passport, PR Card, Indigenous Card |
| **Features** | Document verification, biometric face match, liveness detection |
| **Compliance** | FINTRAC-ready workflows |
| **Website** | https://www.entrust.com/use-case/kyc/canada |

**Supported Canadian Documents:**
- Provincial driver's licenses (all 10 provinces + 3 territories)
- Canadian passport
- Permanent Resident (PR) card
- Canadian citizenship card
- Indigenous status card
- Provincial health cards (some provinces)

### 3.3 Recommended Secondary: Jumio

| Attribute | Details |
|-----------|---------|
| **Provider** | Jumio |
| **Why Secondary** | Enterprise-grade, 200+ countries, excellent accuracy |
| **Features** | AI-powered verification, AML screening, continuous monitoring |
| **Website** | https://www.jumio.com |

### 3.4 Canadian-Specific Options

| Provider | Specialty | Notes |
|----------|-----------|-------|
| **Securefact (ESC)** | Canadian data sources | Direct access to Canadian credit bureaus |
| **KYC Canada** | FINTRAC compliance | Purpose-built for Canadian regulations |
| **Trulioo** | Global + Canadian | Vancouver-based, excellent Canadian coverage |
| **Persona** | Flexible workflows | Good for custom verification flows |

### 3.5 Credit Check Integration

For tenant screening, credit checks are common in Canada:

| Provider | Service | Notes |
|----------|---------|-------|
| **Equifax Canada** | Credit reports | Requires tenant consent |
| **TransUnion Canada** | Credit reports | Requires tenant consent |
| **Certn** | Background + credit | All-in-one tenant screening |
| **SingleKey** | Tenant verification | Purpose-built for landlords |
| **Naborly** | AI tenant screening | Modern API, good UX |

**Important:** Under PIPEDA, you must obtain **explicit consent** before running credit checks.

### 3.6 SIN (Social Insurance Number) Considerations

**Do NOT collect SIN** unless legally required (e.g., for employment or tax reporting). SIN collection is heavily regulated in Canada and generally not needed for rental/property transactions.

---

## 4. Property & Land Registry

### 4.1 Provincial Land Registry Systems

Canada does **not** have a national land registry. Each province maintains its own system:

| Province | System | Digital Access | API Available |
|----------|--------|----------------|---------------|
| **Ontario** | Teranet/OnLand | Yes | Limited (Teranet Express) |
| **British Columbia** | LTSA (myLTSA) | Yes | Yes (LTSA Web Filing) |
| **Alberta** | SPIN2 | Yes | Yes |
| **Quebec** | Registre foncier du Québec | Yes | Limited |
| **Manitoba** | Property Registry | Yes | Limited |
| **Saskatchewan** | ISC Land Titles | Yes | Yes |
| **Nova Scotia** | Property Online | Yes | Limited |
| **New Brunswick** | SNB Land Registry | Yes | No |
| **Newfoundland** | Registry of Deeds | Partial | No |
| **PEI** | Land Registry | Limited | No |

### 4.2 Ontario: Teranet/OnLand

| Attribute | Details |
|-----------|---------|
| **System** | Teranet (private operator) / OnLand (public portal) |
| **Access** | Online via OnLand or Teranet Express |
| **Search Types** | By address, PIN (parcel identifier), owner name |
| **Costs** | ~$35-50 CAD per parcel register |
| **API** | Teranet Express API (requires partnership) |
| **Website** | https://www.onland.ca |

**Integration Options:**
1. **Direct API** (Teranet) - Requires business agreement
2. **Title Search Services** - Third-party aggregators like Dye & Durham
3. **Manual/Hybrid** - Platform triggers search, results manually uploaded

### 4.3 British Columbia: LTSA

| Attribute | Details |
|-----------|---------|
| **System** | Land Title and Survey Authority (LTSA) |
| **Access** | myLTSA Portal, LTSA Explorer |
| **Search Types** | By PID (Parcel Identifier), legal description, address |
| **Costs** | ~$15-20 CAD per title search |
| **API** | Web Filing API (for registered users) |
| **Website** | https://ltsa.ca |

**Key Feature:** BC has the **Land Owner Transparency Registry (LOTR)** - a public registry showing beneficial ownership (anti-money laundering measure).

### 4.4 Recommended Integration Partner: Dye & Durham

| Attribute | Details |
|-----------|---------|
| **Provider** | Dye & Durham |
| **Coverage** | All Canadian provinces |
| **Services** | Title search, corporate searches, due diligence |
| **API** | Unity platform API |
| **Website** | https://dyedurham.com |

**Why Dye & Durham:**
- Single API for multi-province coverage
- Aggregates multiple provincial systems
- Well-established in Canadian legal/real estate industry
- Includes title insurance integration

### 4.5 Alternative Providers

| Provider | Coverage | Notes |
|----------|----------|-------|
| **First Canadian Title (FCT)** | National | Title insurance + searches |
| **Stewart Title** | National | Title insurance focus |
| **ESC Corporate Services** | National | Corporate + property searches |
| **RealtiWeb** | BC, AB, ON | Real estate-focused |

---

## 5. Real Estate Agent Verification

### 5.1 Provincial Regulatory Bodies

Each province has its own real estate regulatory body:

| Province | Regulator | Verification Portal |
|----------|-----------|-------------------|
| **Ontario** | RECO (Real Estate Council of Ontario) | https://www.reco.on.ca/RegistrantSearch |
| **British Columbia** | BCFSA | https://www.bcfsa.ca/public-resources/real-estate/find-professional |
| **Alberta** | RECA | https://www.reca.ca/consumers/find-a-professional/ |
| **Quebec** | OACIQ | https://www.oaciq.com/en/find-a-broker |
| **Manitoba** | MREA + MSC | https://realestatemanitoba.com |
| **Saskatchewan** | SREC | https://www.srec.ca/find-an-agent |
| **Nova Scotia** | NSREC | https://nsrec.ns.ca/find-a-licensee/ |
| **New Brunswick** | NBREA | https://www.nbrea.ca/find-an-agent |
| **Newfoundland** | NLREC | https://www.nlrec.ca |
| **PEI** | PEIRREC | http://www.peirrec.com |

### 5.2 Verification Approach

**Challenge:** No unified national API for agent verification.

**Recommended Approach:**

1. **Manual Verification Flow:**
   - Agent provides license number + province
   - Platform verifies via provincial portal (initially manual)
   - Store verification date and expiry

2. **Automated (Future):**
   - Build scrapers/API integrations per province
   - Start with ON and BC (highest volume)
   - Partner with regulatory bodies for data access

3. **Third-Party Options:**
   - **CREA (Canadian Real Estate Association)** - Membership verification (REALTORS® only)
   - **Local real estate boards** - May have verification APIs

### 5.3 REALTOR® Verification

Many (but not all) agents are members of CREA and use the REALTOR® trademark:

| Organization | What It Verifies |
|--------------|-----------------|
| **CREA** | REALTOR® membership (voluntary) |
| **Provincial Regulator** | License to practice (mandatory) |

**Note:** Being a REALTOR® is not required to practice real estate in Canada - it's a voluntary membership with the Canadian Real Estate Association.

---

## 6. Communication Providers

### 6.1 Recommended Primary: Twilio

| Attribute | Details |
|-----------|---------|
| **Provider** | Twilio |
| **Services** | SMS, Voice, WhatsApp, Email (SendGrid) |
| **Canada SMS Pricing** | $0.0079 CAD/message outbound |
| **Number Types** | Long codes, Toll-free, Short codes |
| **Compliance** | CASL compliant, Toll-free verification |
| **Website** | https://www.twilio.com |

**Canada-Specific Considerations:**
- **Toll-free verification required** for business SMS since Jan 2024
- **10DLC registration** for US/Canada messaging at scale
- **CASL compliance** - Must have consent for marketing messages

### 6.2 SMS Compliance (CASL)

Canada's Anti-Spam Legislation (CASL) is **stricter than US CAN-SPAM**:

| Requirement | Details |
|-------------|---------|
| **Consent** | Express consent required for marketing; implied for transactional |
| **Identification** | Must identify sender + contact info |
| **Unsubscribe** | Must provide unsubscribe mechanism |
| **Penalties** | Up to $10M CAD for corporations |

**Transactional Messages (No express consent needed):**
- Order confirmations
- Appointment reminders
- Payment notifications
- Security alerts

**Marketing Messages (Express consent required):**
- Promotional content
- Newsletters
- Property recommendations

### 6.3 Alternative Providers

| Provider | Best For | Notes |
|----------|----------|-------|
| **MessageBird** | Multi-channel | Strong WhatsApp support |
| **Vonage** | Enterprise | Good Canadian coverage |
| **Plivo** | Cost-conscious | Lower pricing |
| **AWS SNS** | High volume | If already on AWS |

### 6.4 Email Providers

| Provider | Recommendation |
|----------|----------------|
| **SendGrid** (Twilio) | Primary - integrates with Twilio |
| **Amazon SES** | Secondary - lowest cost at scale |
| **Mailgun** | Alternative - good deliverability |
| **Postmark** | Transactional focus |

### 6.5 Push Notifications

| Provider | Platform |
|----------|----------|
| **Firebase Cloud Messaging (FCM)** | Primary (iOS + Android) |
| **Apple Push Notification Service (APNS)** | iOS direct |
| **OneSignal** | Alternative - easier setup |

---

## 7. Maps & Geocoding

### 7.1 Recommended: Google Maps Platform

| Service | Use Case | Pricing |
|---------|----------|---------|
| **Maps JavaScript API** | Property maps | $7/1000 loads |
| **Geocoding API** | Address → coordinates | $5/1000 requests |
| **Places API** | Address autocomplete | $2.83-17/1000 requests |
| **Directions API** | Routing/distance | $5-10/1000 requests |

**Canada-Specific:** Google Maps has excellent coverage of Canadian addresses, including:
- Postal codes (format: A1A 1A1)
- Rural routes
- Indigenous community addresses

### 7.2 Alternatives

| Provider | Pros | Cons |
|----------|------|------|
| **Mapbox** | Lower cost, customizable | Less accurate in rural Canada |
| **HERE Maps** | Good Canadian data | Enterprise pricing |
| **Canada Post AddressComplete** | Official postal data | Address validation only |
| **OpenStreetMap** | Free | Variable quality |

### 7.3 Canada Post Integration

For **address validation**, Canada Post offers:

| Service | Use Case |
|---------|----------|
| **AddressComplete** | Real-time address autocomplete |
| **Address Accuracy** | Batch address validation |

Website: https://www.canadapost-postescanada.ca/cpc/en/business/marketing/campaign/address-accuracy.page

---

## 8. Regulatory Compliance

### 8.1 Data Protection: PIPEDA

| Aspect | Requirement |
|--------|-------------|
| **Law** | Personal Information Protection and Electronic Documents Act |
| **Scope** | All commercial activities in Canada |
| **Key Principles** | Consent, limited collection, accuracy, safeguards, openness |
| **Breach Notification** | Mandatory reporting to OPC for breaches posing "real risk of significant harm" |
| **Privacy Officer** | Must designate individual responsible for compliance |

**Provincial Privacy Laws:**
- **Quebec:** Law 25 (stricter than PIPEDA, GDPR-like)
- **BC:** PIPA
- **Alberta:** PIPA

**Recommendation:** Design for **Quebec Law 25** compliance (strictest) to cover all provinces.

### 8.2 Landlord-Tenant Laws by Province

| Province | Key Legislation | Deposit Rules | Notice Periods |
|----------|-----------------|---------------|----------------|
| **Ontario** | Residential Tenancies Act (RTA) | Last month rent only | 60 days (landlord), 60 days (tenant) |
| **BC** | Residential Tenancy Act | 1/2 month security + 1/2 month pet | 2 months (landlord), 1 month (tenant) |
| **Alberta** | Residential Tenancies Act | 1 month max | 90 days (landlord), 1 month (tenant) |
| **Quebec** | Civil Code of Quebec | No limit | 3-6 months depending on lease |

**Important:** Each province has a **Landlord and Tenant Board** or equivalent for dispute resolution.

### 8.3 Anti-Money Laundering (AML)

| Requirement | Details |
|-------------|---------|
| **Regulator** | FINTRAC |
| **Threshold** | Large cash transactions ($10,000+) |
| **Reporting** | Suspicious transaction reports (STRs) |
| **Record Keeping** | 5 years minimum |

**Real Estate Reporting:** If HomeAI facilitates property purchases, you may need to register as a **real estate reporting entity** with FINTRAC.

### 8.4 Provincial Real Estate Regulations

**Key Compliance Areas:**

1. **Disclosure Requirements:**
   - Material facts about property
   - Agency relationships
   - Conflicts of interest

2. **Trust Account Rules:**
   - Deposits must be held in designated accounts
   - Strict accounting requirements

3. **Advertising Standards:**
   - Must include brokerage name
   - Cannot make misleading claims
   - Price accuracy requirements

---

## 9. Blockchain Considerations

### 9.1 Regulatory Status

| Aspect | Status in Canada |
|--------|-----------------|
| **Cryptocurrency** | Legal, regulated as commodity/security depending on use |
| **Smart Contracts** | No specific legislation; contract law applies |
| **Digital Assets** | Subject to securities laws if investment-like |
| **Stablecoins** | Under review by Bank of Canada |

### 9.2 Recommended Approach for Canada

**Keep blockchain integration optional** for Canada due to:
1. Strong existing legal framework for escrow (lawyer trust accounts)
2. High trust in traditional financial systems
3. Less consumer demand compared to markets with weaker institutions

**Where Blockchain Could Add Value:**

| Use Case | Benefit | Implementation |
|----------|---------|----------------|
| **Verification Proofs** | Immutable audit trail | Store hashes on-chain |
| **Agreement Timestamps** | Proof of signing time | Timestamp service |
| **Cross-Border Transactions** | Diaspora payments | USDC/CAD stablecoin |
| **Title History** | Transparent ownership chain | Future consideration |

### 9.3 Recommended Network

If implementing blockchain features in Canada:

| Network | Rationale |
|---------|-----------|
| **Polygon** | Low fees, Ethereum compatible, established |
| **Base** (Coinbase L2) | Canadian users familiar with Coinbase |
| **Arbitrum** | Strong security, growing adoption |

---

## 10. Recommended Configuration

### 10.1 Canada Region Configuration

```typescript
// config/regions/canada.ts

export const CanadaConfig: RegionConfig = {
  code: 'CA',
  name: 'Canada',
  currency: {
    code: 'CAD',
    symbol: '$',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  locale: {
    languages: ['en-CA', 'fr-CA'],  // Bilingual support important
    dateFormat: 'YYYY-MM-DD',        // ISO format common in Canada
    timeFormat: '12h'
  },
  timezone: 'America/Toronto',  // Default; adjust per province
  
  features: {
    escrowEnabled: true,         // Platform-managed for rentals
    blockchainEnabled: false,    // Optional, not primary
    aiAssistantEnabled: true,
    shortLetEnabled: true,
    landSalesEnabled: true,
    agentMarketplaceEnabled: true,
    mortgageIntegrationEnabled: true,  // Strong mortgage market
    creditCheckEnabled: true     // Common for tenant screening
  },
  
  providers: {
    payment: {
      primary: 'stripe',
      fallback: ['moneris'],
      supportedMethods: ['card', 'pad', 'interac', 'apple_pay', 'google_pay'],
      escrowProvider: 'stripe_connect'
    },
    identity: {
      primary: 'onfido',
      fallback: ['jumio', 'trulioo'],
      requiredDocuments: ['drivers_license', 'passport'],
      supportedIdTypes: [
        'drivers_license_ca',  // All provinces
        'passport_ca',
        'pr_card',
        'citizenship_card'
      ],
      biometricEnabled: true,
      livenessCheckRequired: true
    },
    creditCheck: {
      primary: 'certn',
      fallback: ['equifax_ca', 'transunion_ca'],
      consentRequired: true
    },
    document: {
      primary: 'dye_durham',
      fallback: ['manual_review'],
      propertyRegistries: {
        'ON': 'teranet',
        'BC': 'ltsa',
        'AB': 'spin2',
        // ... other provinces
      }
    },
    agentVerification: {
      registries: {
        'ON': { name: 'RECO', url: 'https://www.reco.on.ca' },
        'BC': { name: 'BCFSA', url: 'https://www.bcfsa.ca' },
        'AB': { name: 'RECA', url: 'https://www.reca.ca' },
        // ... other provinces
      },
      verificationMethod: 'manual_with_portal'  // Until APIs available
    },
    communication: {
      sms: { 
        primary: 'twilio', 
        fallback: ['messagebird'],
        tollFreeVerificationRequired: true
      },
      email: { primary: 'sendgrid', fallback: ['ses'] },
      push: { primary: 'fcm', fallback: [] }
    },
    maps: {
      primary: 'google_maps',
      fallback: ['mapbox'],
      addressValidation: 'canada_post'
    },
    blockchain: {
      enabled: false,
      network: 'polygon',
      rpcProvider: 'alchemy'
    }
  },
  
  verification: {
    tiers: [
      {
        id: 'basic',
        name: 'Basic',
        requirements: ['identity_verified'],
        benefits: ['can_list', 'can_apply'],
        visibilityBoost: 0
      },
      {
        id: 'verified',
        name: 'Verified',
        requirements: ['identity_verified', 'address_verified'],
        benefits: ['verified_badge', 'priority_support'],
        visibilityBoost: 10
      },
      {
        id: 'professional',
        name: 'Professional',
        requirements: ['identity_verified', 'address_verified', 'agent_license'],
        benefits: ['professional_badge', 'featured_listings'],
        visibilityBoost: 25
      }
    ],
    propertyDocuments: [
      {
        id: 'title_search',
        name: 'Title Search',
        description: 'Recent title search from provincial land registry',
        required: true,
        validityPeriod: 30,  // 30 days
        verificationMethod: 'dye_durham_api'
      },
      {
        id: 'property_tax',
        name: 'Property Tax Statement',
        description: 'Current year property tax statement',
        required: false,
        validityPeriod: 365,
        verificationMethod: 'manual_review'
      }
    ]
  },
  
  compliance: {
    dataProtection: 'pipeda',
    provincialPrivacy: {
      'QC': 'law_25',
      'BC': 'pipa_bc',
      'AB': 'pipa_ab'
    },
    antiSpam: 'casl',
    amlReporting: 'fintrac',
    amlKycLevel: 'standard',
    tenantScreening: {
      creditCheckAllowed: true,
      consentRequired: true,
      humanRightsCompliance: true  // Cannot discriminate
    },
    transactionLimits: {
      reportingThreshold: 10000,  // CAD - FINTRAC reporting
      requiresEnhancedKyc: 25000
    }
  },
  
  // Province-specific configurations
  provinces: {
    'ON': {
      name: 'Ontario',
      timezone: 'America/Toronto',
      landRegistry: 'teranet',
      realEstateRegulator: 'RECO',
      tenantLaw: {
        maxDeposit: 'last_month_rent',
        depositType: 'last_month_only',
        landlordNotice: 60,
        tenantNotice: 60,
        rentControl: true,
        tribunal: 'Landlord and Tenant Board'
      }
    },
    'BC': {
      name: 'British Columbia',
      timezone: 'America/Vancouver',
      landRegistry: 'ltsa',
      realEstateRegulator: 'BCFSA',
      tenantLaw: {
        maxDeposit: 0.5,  // Half month
        petDeposit: 0.5,  // Additional half month
        landlordNotice: 60,
        tenantNotice: 30,
        rentControl: true,
        tribunal: 'Residential Tenancy Branch'
      },
      specialFeatures: ['lotr']  // Land Owner Transparency Registry
    },
    'AB': {
      name: 'Alberta',
      timezone: 'America/Edmonton',
      landRegistry: 'spin2',
      realEstateRegulator: 'RECA',
      tenantLaw: {
        maxDeposit: 1,  // One month
        landlordNotice: 90,
        tenantNotice: 30,
        rentControl: false,
        tribunal: 'Residential Tenancy Dispute Resolution Service'
      }
    },
    'QC': {
      name: 'Quebec',
      timezone: 'America/Montreal',
      landRegistry: 'registre_foncier',
      realEstateRegulator: 'OACIQ',
      primaryLanguage: 'fr-CA',
      tenantLaw: {
        maxDeposit: 0,  // No security deposit allowed!
        landlordNotice: 180,  // 6 months for fixed term
        tenantNotice: 90,
        rentControl: true,
        tribunal: 'Tribunal administratif du logement'
      },
      specialRequirements: ['french_language_compliance']
    }
  }
};
```

### 10.2 Implementation Priority

| Phase | Scope | Timeline |
|-------|-------|----------|
| **Phase 1** | Ontario + BC only | Months 1-4 |
| **Phase 2** | Alberta + Quebec | Months 5-8 |
| **Phase 3** | Remaining provinces | Months 9-12 |

### 10.3 Integration Checklist

#### Payment Integration
- [ ] Stripe Canada account setup
- [ ] Pre-authorized debit (PAD) configuration
- [ ] Stripe Connect for landlord payouts
- [ ] Interac e-Transfer investigation (future)

#### Identity Verification
- [ ] Onfido/Entrust contract
- [ ] Canadian document templates
- [ ] Credit check provider (Certn or equivalent)
- [ ] PIPEDA-compliant consent flows

#### Property Verification
- [ ] Dye & Durham partnership
- [ ] Teranet Express access (Ontario)
- [ ] LTSA access (BC)
- [ ] Manual verification workflow

#### Communication
- [ ] Twilio Canada setup
- [ ] Toll-free number verification
- [ ] CASL compliance review
- [ ] French-language templates (Quebec)

#### Compliance
- [ ] PIPEDA privacy policy
- [ ] CASL consent mechanisms
- [ ] FINTRAC assessment (if applicable)
- [ ] Provincial landlord-tenant law review

---

## Summary: Key Provider Recommendations

| Category | Primary | Secondary | Notes |
|----------|---------|-----------|-------|
| **Payment** | Stripe | Moneris | Add Interac later |
| **Identity (KYC)** | Onfido | Jumio | Trulioo as backup |
| **Credit Check** | Certn | Equifax/TransUnion | Consent required |
| **Property Registry** | Dye & Durham | Direct provincial | Start with ON/BC |
| **Agent Verification** | Manual + RECO/BCFSA | - | No unified API |
| **SMS** | Twilio | MessageBird | Toll-free required |
| **Email** | SendGrid | Amazon SES | - |
| **Maps** | Google Maps | Mapbox | Canada Post for validation |
| **Blockchain** | Polygon (optional) | - | Not primary focus |

---

*Document Version 1.0 | January 2026 | HomeAI Canada Expansion Research*
