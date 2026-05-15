# HomeAI Nigeria
## Multi-Region Abstraction Architecture

**Extensible Integration Layer for Global Expansion**

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Date | January 2026 |
| Status | Architecture Specification |
| Parent Document | HomeAI Backend Handoff PRD |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Core Abstraction Principles](#2-core-abstraction-principles)
3. [Region Configuration System](#3-region-configuration-system)
4. [Payment Provider Abstraction](#4-payment-provider-abstraction)
5. [Identity Verification Abstraction](#5-identity-verification-abstraction)
6. [Document Verification Abstraction](#6-document-verification-abstraction)
7. [Communication Provider Abstraction](#7-communication-provider-abstraction)
8. [Regulatory Compliance Abstraction](#8-regulatory-compliance-abstraction)
9. [Maps & Location Abstraction](#9-maps--location-abstraction)
10. [Blockchain Abstraction](#10-blockchain-abstraction)
11. [Implementation Guide](#11-implementation-guide)
12. [Adding a New Region](#12-adding-a-new-region)

---

## 1. Overview

### 1.1 Problem Statement

The initial HomeAI implementation targets Nigeria with specific integrations:
- NIN (National Identification Number) for identity
- LASRERA for real estate regulation
- Paystack for payments
- Africa's Talking for SMS

To expand to other countries (Ghana, Kenya, South Africa, UK, US, etc.), we need a flexible architecture that:
- Abstracts all third-party integrations behind interfaces
- Allows region-specific configurations
- Supports multiple providers per integration type
- Enables easy addition of new regions without code changes

### 1.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                                 │
│    (Services use abstracted interfaces, unaware of specific providers)  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PROVIDER ABSTRACTION LAYER                          │
│                                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │  Payment    │ │  Identity   │ │  Document   │ │Communication│       │
│  │  Provider   │ │  Provider   │ │  Provider   │ │  Provider   │       │
│  │  Interface  │ │  Interface  │ │  Interface  │ │  Interface  │       │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘       │
│         │               │               │               │               │
│  ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐       │
│  │  Provider   │ │  Provider   │ │  Provider   │ │  Provider   │       │
│  │  Factory    │ │  Factory    │ │  Factory    │ │  Factory    │       │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘       │
└─────────┼───────────────┼───────────────┼───────────────┼───────────────┘
          │               │               │               │
          ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       PROVIDER IMPLEMENTATIONS                           │
│                                                                          │
│  Payment:     Paystack │ Flutterwave │ Stripe │ M-Pesa │ Razorpay      │
│  Identity:    NIMC │ GRA │ IPRS │ DHA │ Onfido │ Jumio │ Veriff        │
│  Document:    LASRERA │ GhLA │ KLA │ Custom │ Onfido                    │
│  Comms:       AfricasTalking │ Twilio │ MessageBird │ SNS              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     REGION CONFIGURATION STORE                           │
│                                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Nigeria  │ │  Ghana   │ │  Kenya   │ │   UK     │ │   US     │      │
│  │  Config  │ │  Config  │ │  Config  │ │  Config  │ │  Config  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Abstraction Principles

### 2.1 Design Patterns Used

| Pattern | Purpose | Application |
|---------|---------|-------------|
| **Strategy Pattern** | Swap implementations at runtime | Provider selection based on region |
| **Factory Pattern** | Create provider instances | ProviderFactory creates correct provider |
| **Adapter Pattern** | Normalize different APIs | Adapters wrap external APIs to common interface |
| **Repository Pattern** | Abstract data access | Region configs stored/retrieved uniformly |
| **Plugin Architecture** | Add providers without core changes | New providers as separate modules |

### 2.2 Key Principles

1. **Code to Interfaces**: Services depend on interfaces, not implementations
2. **Configuration over Code**: Region-specific behavior via config, not conditionals
3. **Fail-Safe Defaults**: If provider unavailable, graceful degradation
4. **Provider Redundancy**: Multiple providers per category for failover
5. **Feature Flags**: Enable/disable features per region

---

## 3. Region Configuration System

### 3.1 Region Configuration Schema

```typescript
// types/region-config.ts

interface RegionConfig {
  // Basic Info
  code: string;                    // ISO 3166-1 alpha-2 (NG, GH, KE, ZA, GB, US)
  name: string;
  currency: CurrencyConfig;
  locale: LocaleConfig;
  timezone: string;
  
  // Feature Flags
  features: FeatureFlags;
  
  // Provider Configurations
  providers: {
    payment: PaymentProviderConfig;
    identity: IdentityProviderConfig;
    document: DocumentProviderConfig;
    communication: CommunicationProviderConfig;
    maps: MapsProviderConfig;
    blockchain: BlockchainProviderConfig;
  };
  
  // Verification Requirements
  verification: VerificationConfig;
  
  // Regulatory Compliance
  compliance: ComplianceConfig;
  
  // Localization
  localization: LocalizationConfig;
}

interface CurrencyConfig {
  code: string;              // NGN, GHS, KES, ZAR, GBP, USD
  symbol: string;            // ₦, GH₵, KSh, R, £, $
  decimalPlaces: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

interface FeatureFlags {
  escrowEnabled: boolean;
  blockchainEnabled: boolean;
  aiAssistantEnabled: boolean;
  shortLetEnabled: boolean;
  landSalesEnabled: boolean;
  agentMarketplaceEnabled: boolean;
  mortgageIntegrationEnabled: boolean;
}

interface PaymentProviderConfig {
  primary: string;           // Provider ID
  fallback: string[];        // Fallback provider IDs
  supportedMethods: string[]; // card, bank_transfer, mobile_money, etc.
  escrowProvider: string;
}

interface IdentityProviderConfig {
  primary: string;
  fallback: string[];
  requiredDocuments: IdentityDocumentType[];
  supportedIdTypes: string[];
  biometricEnabled: boolean;
  livenessCheckRequired: boolean;
}

interface VerificationConfig {
  tiers: VerificationTierConfig[];
  propertyDocuments: PropertyDocumentConfig[];
  expirationRules: ExpirationRuleConfig[];
}
```

### 3.2 Example Region Configurations

```typescript
// config/regions/nigeria.ts

export const NigeriaConfig: RegionConfig = {
  code: 'NG',
  name: 'Nigeria',
  currency: {
    code: 'NGN',
    symbol: '₦',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  locale: {
    language: 'en-NG',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h'
  },
  timezone: 'Africa/Lagos',
  
  features: {
    escrowEnabled: true,
    blockchainEnabled: true,
    aiAssistantEnabled: true,
    shortLetEnabled: true,
    landSalesEnabled: true,
    agentMarketplaceEnabled: true,
    mortgageIntegrationEnabled: false
  },
  
  providers: {
    payment: {
      primary: 'paystack',
      fallback: ['flutterwave'],
      supportedMethods: ['card', 'bank_transfer', 'ussd'],
      escrowProvider: 'paystack'
    },
    identity: {
      primary: 'smile_identity',
      fallback: ['verified_africa'],
      requiredDocuments: ['national_id'],
      supportedIdTypes: ['nin', 'voters_card', 'drivers_license', 'passport'],
      biometricEnabled: true,
      livenessCheckRequired: true
    },
    document: {
      primary: 'lasrera',
      fallback: ['manual_review'],
      propertyRegistry: 'lagos_land_registry',
      regulatoryBody: 'lasrera'
    },
    communication: {
      sms: { primary: 'africas_talking', fallback: ['twilio'] },
      email: { primary: 'sendgrid', fallback: ['ses'] },
      push: { primary: 'fcm', fallback: [] },
      whatsapp: { primary: 'twilio', fallback: [] }
    },
    maps: {
      primary: 'google_maps',
      fallback: ['mapbox'],
      geocodingProvider: 'google_maps'
    },
    blockchain: {
      network: 'polygon',
      rpcProvider: 'alchemy',
      fallbackRpc: 'infura'
    }
  },
  
  verification: {
    tiers: [
      {
        id: 'bronze',
        name: 'Bronze',
        requirements: ['identity_verified'],
        benefits: ['verified_badge'],
        visibilityBoost: 0
      },
      {
        id: 'silver',
        name: 'Silver',
        requirements: ['identity_verified', 'address_verified', 'property_ownership'],
        benefits: ['verified_badge', 'priority_listing'],
        visibilityBoost: 15
      },
      {
        id: 'gold',
        name: 'Gold',
        requirements: ['identity_verified', 'address_verified', 'property_ownership', 'physical_audit'],
        benefits: ['verified_badge', 'priority_listing', 'featured_placement'],
        visibilityBoost: 25
      },
      {
        id: 'platinum',
        name: 'Platinum',
        requirements: ['gold_tier', 'clean_history_6mo', 'rating_4_5_plus'],
        benefits: ['premium_badge', 'top_results', 'dedicated_support'],
        visibilityBoost: 40
      }
    ],
    propertyDocuments: [
      {
        id: 'cofo',
        name: 'Certificate of Occupancy',
        description: 'Official C of O from state government',
        required: true,
        validityPeriod: 1825, // 5 years in days
        verificationMethod: 'land_registry_api'
      },
      {
        id: 'survey_plan',
        name: 'Survey Plan',
        description: 'Approved survey plan',
        required: false,
        validityPeriod: null,
        verificationMethod: 'manual_review'
      }
    ]
  },
  
  compliance: {
    dataProtection: 'ndpr',
    taxReporting: true,
    amlKycLevel: 'enhanced',
    transactionLimits: {
      singleTransaction: 50000000, // ₦50M
      dailyLimit: 100000000,       // ₦100M
      requiresEnhancedKyc: 10000000 // ₦10M
    }
  }
};
```

```typescript
// config/regions/ghana.ts

export const GhanaConfig: RegionConfig = {
  code: 'GH',
  name: 'Ghana',
  currency: {
    code: 'GHS',
    symbol: 'GH₵',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  locale: {
    language: 'en-GH',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h'
  },
  timezone: 'Africa/Accra',
  
  features: {
    escrowEnabled: true,
    blockchainEnabled: true,
    aiAssistantEnabled: true,
    shortLetEnabled: true,
    landSalesEnabled: true,
    agentMarketplaceEnabled: true,
    mortgageIntegrationEnabled: false
  },
  
  providers: {
    payment: {
      primary: 'paystack',
      fallback: ['flutterwave', 'hubtel'],
      supportedMethods: ['card', 'mobile_money', 'bank_transfer'],
      escrowProvider: 'paystack'
    },
    identity: {
      primary: 'smile_identity',
      fallback: ['onfido'],
      requiredDocuments: ['national_id'],
      supportedIdTypes: ['ghana_card', 'voters_id', 'drivers_license', 'passport'],
      biometricEnabled: true,
      livenessCheckRequired: true
    },
    document: {
      primary: 'lands_commission_gh',
      fallback: ['manual_review'],
      propertyRegistry: 'lands_commission_gh',
      regulatoryBody: 'ghana_real_estate_agency_council'
    },
    communication: {
      sms: { primary: 'hubtel', fallback: ['africas_talking', 'twilio'] },
      email: { primary: 'sendgrid', fallback: ['ses'] },
      push: { primary: 'fcm', fallback: [] }
    },
    maps: {
      primary: 'google_maps',
      fallback: ['mapbox']
    },
    blockchain: {
      network: 'polygon',
      rpcProvider: 'alchemy'
    }
  },
  
  verification: {
    tiers: [
      // Similar structure, Ghana-specific requirements
    ],
    propertyDocuments: [
      {
        id: 'land_title',
        name: 'Land Title Certificate',
        description: 'Title certificate from Lands Commission',
        required: true,
        validityPeriod: 1825,
        verificationMethod: 'lands_commission_api'
      },
      {
        id: 'site_plan',
        name: 'Site Plan',
        description: 'Approved site plan',
        required: true,
        validityPeriod: null,
        verificationMethod: 'manual_review'
      }
    ]
  },
  
  compliance: {
    dataProtection: 'data_protection_act_2012',
    taxReporting: true,
    amlKycLevel: 'standard'
  }
};
```

```typescript
// config/regions/kenya.ts

export const KenyaConfig: RegionConfig = {
  code: 'KE',
  name: 'Kenya',
  currency: {
    code: 'KES',
    symbol: 'KSh',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  locale: {
    language: 'en-KE',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h'
  },
  timezone: 'Africa/Nairobi',
  
  providers: {
    payment: {
      primary: 'mpesa',           // M-Pesa dominant in Kenya
      fallback: ['flutterwave', 'paystack'],
      supportedMethods: ['mobile_money', 'card', 'bank_transfer'],
      escrowProvider: 'flutterwave'
    },
    identity: {
      primary: 'iprs_kenya',     // Integrated Population Registration System
      fallback: ['smile_identity', 'onfido'],
      requiredDocuments: ['national_id'],
      supportedIdTypes: ['national_id', 'passport', 'alien_id'],
      biometricEnabled: true,
      livenessCheckRequired: true
    },
    document: {
      primary: 'kenya_lands_ministry',
      fallback: ['manual_review'],
      propertyRegistry: 'ardhisasa',  // Kenya's digital land registry
      regulatoryBody: 'estate_agents_registration_board'
    },
    communication: {
      sms: { primary: 'africas_talking', fallback: ['twilio'] },
      email: { primary: 'sendgrid', fallback: ['ses'] },
      push: { primary: 'fcm', fallback: [] }
    }
  },
  
  verification: {
    propertyDocuments: [
      {
        id: 'title_deed',
        name: 'Title Deed',
        description: 'Certificate of title from Ministry of Lands',
        required: true,
        validityPeriod: null, // No expiry
        verificationMethod: 'ardhisasa_api'
      },
      {
        id: 'land_search',
        name: 'Official Land Search',
        description: 'Recent official search from lands registry',
        required: true,
        validityPeriod: 90, // Valid for 90 days
        verificationMethod: 'ardhisasa_api'
      }
    ]
  }
};
```

```typescript
// config/regions/united-kingdom.ts

export const UnitedKingdomConfig: RegionConfig = {
  code: 'GB',
  name: 'United Kingdom',
  currency: {
    code: 'GBP',
    symbol: '£',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  locale: {
    language: 'en-GB',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  },
  timezone: 'Europe/London',
  
  providers: {
    payment: {
      primary: 'stripe',
      fallback: ['adyen'],
      supportedMethods: ['card', 'bank_transfer', 'open_banking'],
      escrowProvider: 'stripe_connect'
    },
    identity: {
      primary: 'onfido',
      fallback: ['jumio', 'veriff'],
      requiredDocuments: ['identity_proof', 'address_proof'],
      supportedIdTypes: ['passport', 'drivers_license', 'brp'],
      biometricEnabled: true,
      livenessCheckRequired: true
    },
    document: {
      primary: 'hm_land_registry',
      fallback: ['manual_review'],
      propertyRegistry: 'hm_land_registry',
      regulatoryBody: null  // No single regulatory body
    },
    communication: {
      sms: { primary: 'twilio', fallback: ['messagebird'] },
      email: { primary: 'sendgrid', fallback: ['ses'] },
      push: { primary: 'fcm', fallback: [] }
    }
  },
  
  verification: {
    propertyDocuments: [
      {
        id: 'title_register',
        name: 'Title Register',
        description: 'Official title register from HM Land Registry',
        required: true,
        validityPeriod: 30, // Fresh search recommended
        verificationMethod: 'land_registry_api'
      },
      {
        id: 'epc',
        name: 'Energy Performance Certificate',
        description: 'Valid EPC (required for rentals)',
        required: true,
        validityPeriod: 3650, // 10 years
        verificationMethod: 'epc_register_api'
      },
      {
        id: 'gas_safety',
        name: 'Gas Safety Certificate',
        description: 'Annual gas safety check (CP12)',
        required: true,
        validityPeriod: 365,
        verificationMethod: 'manual_review'
      }
    ]
  },
  
  compliance: {
    dataProtection: 'uk_gdpr',
    taxReporting: true,
    rightToRent: true,  // UK-specific
    depositProtection: true,  // UK-specific
    amlKycLevel: 'enhanced'
  }
};
```

### 3.3 Region Configuration Service

```typescript
// services/region-config.service.ts

import { Injectable } from '@nestjs/common';
import { NigeriaConfig } from '../config/regions/nigeria';
import { GhanaConfig } from '../config/regions/ghana';
import { KenyaConfig } from '../config/regions/kenya';
import { UnitedKingdomConfig } from '../config/regions/united-kingdom';

@Injectable()
export class RegionConfigService {
  private configs: Map<string, RegionConfig> = new Map();
  
  constructor() {
    this.registerConfig(NigeriaConfig);
    this.registerConfig(GhanaConfig);
    this.registerConfig(KenyaConfig);
    this.registerConfig(UnitedKingdomConfig);
  }
  
  registerConfig(config: RegionConfig): void {
    this.configs.set(config.code, config);
  }
  
  getConfig(regionCode: string): RegionConfig {
    const config = this.configs.get(regionCode.toUpperCase());
    if (!config) {
      throw new Error(`Region ${regionCode} is not configured`);
    }
    return config;
  }
  
  getSupportedRegions(): string[] {
    return Array.from(this.configs.keys());
  }
  
  isFeatureEnabled(regionCode: string, feature: keyof FeatureFlags): boolean {
    const config = this.getConfig(regionCode);
    return config.features[feature] ?? false;
  }
  
  getProviderConfig<T extends keyof RegionConfig['providers']>(
    regionCode: string,
    providerType: T
  ): RegionConfig['providers'][T] {
    const config = this.getConfig(regionCode);
    return config.providers[providerType];
  }
}
```

---

## 4. Payment Provider Abstraction

### 4.1 Payment Provider Interface

```typescript
// interfaces/payment-provider.interface.ts

export interface PaymentProvider {
  readonly providerId: string;
  readonly supportedRegions: string[];
  readonly supportedMethods: PaymentMethod[];
  
  // Core Operations
  initializePayment(params: InitializePaymentParams): Promise<PaymentInitResult>;
  verifyPayment(reference: string): Promise<PaymentVerifyResult>;
  
  // Transfers/Payouts
  createRecipient(params: CreateRecipientParams): Promise<RecipientResult>;
  initiateTransfer(params: TransferParams): Promise<TransferResult>;
  
  // Refunds
  initiateRefund(params: RefundParams): Promise<RefundResult>;
  
  // Webhooks
  validateWebhook(payload: any, signature: string): boolean;
  parseWebhookEvent(payload: any): WebhookEvent;
}

export interface InitializePaymentParams {
  amount: number;
  currency: string;
  email: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
  paymentMethod?: PaymentMethod;
  channels?: string[];  // Provider-specific channels
}

export interface PaymentInitResult {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference: string;
  providerReference?: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  status: 'success' | 'failed' | 'pending' | 'abandoned';
  amount: number;
  currency: string;
  reference: string;
  providerReference: string;
  paidAt?: Date;
  channel?: string;
  metadata?: Record<string, any>;
}

export type PaymentMethod = 
  | 'card' 
  | 'bank_transfer' 
  | 'ussd' 
  | 'mobile_money' 
  | 'qr' 
  | 'open_banking';
```

### 4.2 Provider Implementations

```typescript
// providers/payment/paystack.provider.ts

@Injectable()
export class PaystackProvider implements PaymentProvider {
  readonly providerId = 'paystack';
  readonly supportedRegions = ['NG', 'GH', 'ZA', 'KE'];
  readonly supportedMethods: PaymentMethod[] = ['card', 'bank_transfer', 'ussd', 'mobile_money'];
  
  private client: AxiosInstance;
  
  constructor(private configService: ConfigService) {
    this.client = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        Authorization: `Bearer ${configService.get('PAYSTACK_SECRET_KEY')}`,
      },
    });
  }
  
  async initializePayment(params: InitializePaymentParams): Promise<PaymentInitResult> {
    const response = await this.client.post('/transaction/initialize', {
      email: params.email,
      amount: Math.round(params.amount * 100), // Convert to kobo/pesewas
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
      channels: this.mapChannels(params.channels),
    });
    
    return {
      success: response.data.status,
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference,
    };
  }
  
  async verifyPayment(reference: string): Promise<PaymentVerifyResult> {
    const response = await this.client.get(`/transaction/verify/${reference}`);
    const data = response.data.data;
    
    return {
      success: data.status === 'success',
      status: this.mapStatus(data.status),
      amount: data.amount / 100,
      currency: data.currency,
      reference: data.reference,
      providerReference: data.id.toString(),
      paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
      channel: data.channel,
      metadata: data.metadata,
    };
  }
  
  // ... other methods
}
```

```typescript
// providers/payment/stripe.provider.ts

@Injectable()
export class StripeProvider implements PaymentProvider {
  readonly providerId = 'stripe';
  readonly supportedRegions = ['GB', 'US', 'EU', 'CA', 'AU'];
  readonly supportedMethods: PaymentMethod[] = ['card', 'bank_transfer', 'open_banking'];
  
  private stripe: Stripe;
  
  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }
  
  async initializePayment(params: InitializePaymentParams): Promise<PaymentInitResult> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: this.mapPaymentMethods(params.paymentMethod),
      line_items: [{
        price_data: {
          currency: params.currency.toLowerCase(),
          product_data: { name: 'HomeAI Transaction' },
          unit_amount: Math.round(params.amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${params.callbackUrl}?reference=${params.reference}&status=success`,
      cancel_url: `${params.callbackUrl}?reference=${params.reference}&status=cancelled`,
      client_reference_id: params.reference,
      metadata: params.metadata,
    });
    
    return {
      success: true,
      authorizationUrl: session.url,
      reference: params.reference,
      providerReference: session.id,
    };
  }
  
  // ... other methods
}
```

```typescript
// providers/payment/mpesa.provider.ts

@Injectable()
export class MpesaProvider implements PaymentProvider {
  readonly providerId = 'mpesa';
  readonly supportedRegions = ['KE', 'TZ', 'UG', 'GH'];
  readonly supportedMethods: PaymentMethod[] = ['mobile_money'];
  
  private client: AxiosInstance;
  private accessToken: string;
  private tokenExpiry: Date;
  
  constructor(private configService: ConfigService) {
    this.client = axios.create({
      baseURL: configService.get('MPESA_BASE_URL'),
    });
  }
  
  async initializePayment(params: InitializePaymentParams): Promise<PaymentInitResult> {
    await this.ensureAccessToken();
    
    // STK Push for Lipa Na M-Pesa
    const response = await this.client.post('/mpesa/stkpush/v1/processrequest', {
      BusinessShortCode: this.configService.get('MPESA_SHORTCODE'),
      Password: this.generatePassword(),
      Timestamp: this.getTimestamp(),
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(params.amount),
      PartyA: params.metadata?.phoneNumber,
      PartyB: this.configService.get('MPESA_SHORTCODE'),
      PhoneNumber: params.metadata?.phoneNumber,
      CallBackURL: params.callbackUrl,
      AccountReference: params.reference,
      TransactionDesc: 'HomeAI Payment',
    }, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    
    return {
      success: response.data.ResponseCode === '0',
      reference: params.reference,
      providerReference: response.data.CheckoutRequestID,
    };
  }
  
  // ... other methods
}
```

### 4.3 Payment Provider Factory

```typescript
// factories/payment-provider.factory.ts

@Injectable()
export class PaymentProviderFactory {
  private providers: Map<string, PaymentProvider> = new Map();
  
  constructor(
    private paystackProvider: PaystackProvider,
    private stripeProvider: StripeProvider,
    private mpesaProvider: MpesaProvider,
    private flutterwaveProvider: FlutterwaveProvider,
    private regionConfig: RegionConfigService,
  ) {
    this.registerProvider(this.paystackProvider);
    this.registerProvider(this.stripeProvider);
    this.registerProvider(this.mpesaProvider);
    this.registerProvider(this.flutterwaveProvider);
  }
  
  private registerProvider(provider: PaymentProvider): void {
    this.providers.set(provider.providerId, provider);
  }
  
  getProvider(regionCode: string): PaymentProvider {
    const config = this.regionConfig.getProviderConfig(regionCode, 'payment');
    
    // Try primary provider
    const primaryProvider = this.providers.get(config.primary);
    if (primaryProvider && this.isProviderHealthy(config.primary)) {
      return primaryProvider;
    }
    
    // Try fallbacks
    for (const fallbackId of config.fallback) {
      const fallbackProvider = this.providers.get(fallbackId);
      if (fallbackProvider && this.isProviderHealthy(fallbackId)) {
        return fallbackProvider;
      }
    }
    
    throw new Error(`No available payment provider for region ${regionCode}`);
  }
  
  getProviderById(providerId: string): PaymentProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Payment provider ${providerId} not found`);
    }
    return provider;
  }
  
  private isProviderHealthy(providerId: string): boolean {
    // Check provider health/availability
    // Could use circuit breaker pattern here
    return true;
  }
}
```

### 4.4 Payment Service (Using Abstraction)

```typescript
// services/payment.service.ts

@Injectable()
export class PaymentService {
  constructor(
    private providerFactory: PaymentProviderFactory,
    private transactionRepository: TransactionRepository,
  ) {}
  
  async initiatePayment(
    userId: string,
    regionCode: string,
    params: CreatePaymentDto
  ): Promise<PaymentInitResponse> {
    // Get appropriate provider for region
    const provider = this.providerFactory.getProvider(regionCode);
    
    // Create transaction record
    const transaction = await this.transactionRepository.create({
      userId,
      amount: params.amount,
      currency: params.currency,
      status: 'pending',
      provider: provider.providerId,
      reference: this.generateReference(),
    });
    
    // Initialize with provider
    const result = await provider.initializePayment({
      amount: params.amount,
      currency: params.currency,
      email: params.email,
      reference: transaction.reference,
      callbackUrl: `${this.configService.get('API_URL')}/webhooks/payment/${provider.providerId}`,
      metadata: {
        transactionId: transaction.id,
        userId,
        ...params.metadata,
      },
    });
    
    // Update transaction with provider reference
    await this.transactionRepository.update(transaction.id, {
      providerReference: result.providerReference,
    });
    
    return {
      transactionId: transaction.id,
      reference: transaction.reference,
      authorizationUrl: result.authorizationUrl,
      provider: provider.providerId,
    };
  }
}
```

---

## 5. Identity Verification Abstraction

### 5.1 Identity Provider Interface

```typescript
// interfaces/identity-provider.interface.ts

export interface IdentityProvider {
  readonly providerId: string;
  readonly supportedRegions: string[];
  readonly supportedIdTypes: IdentityDocumentType[];
  
  // Verification Operations
  verifyIdentity(params: VerifyIdentityParams): Promise<IdentityVerifyResult>;
  verifyDocument(params: VerifyDocumentParams): Promise<DocumentVerifyResult>;
  performLivenessCheck(params: LivenessCheckParams): Promise<LivenessResult>;
  
  // Status & Retrieval
  getVerificationStatus(verificationId: string): Promise<VerificationStatus>;
  getVerificationResult(verificationId: string): Promise<FullVerificationResult>;
}

export interface VerifyIdentityParams {
  userId: string;
  idType: IdentityDocumentType;
  idNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  country: string;
  // For document upload verification
  frontImageUrl?: string;
  backImageUrl?: string;
  selfieUrl?: string;
}

export interface IdentityVerifyResult {
  success: boolean;
  verificationId: string;
  status: 'pending' | 'verified' | 'failed' | 'manual_review';
  confidence?: number;
  matchedFields?: string[];
  unmatchedFields?: string[];
  message?: string;
}

export type IdentityDocumentType =
  // Nigeria
  | 'nin'
  | 'voters_card'
  | 'drivers_license_ng'
  // Ghana
  | 'ghana_card'
  | 'voters_id_gh'
  | 'drivers_license_gh'
  // Kenya
  | 'national_id_ke'
  | 'alien_id_ke'
  // UK
  | 'passport_uk'
  | 'drivers_license_uk'
  | 'brp'  // Biometric Residence Permit
  // Universal
  | 'passport'
  | 'drivers_license';
```

### 5.2 Provider Implementations

```typescript
// providers/identity/smile-identity.provider.ts

@Injectable()
export class SmileIdentityProvider implements IdentityProvider {
  readonly providerId = 'smile_identity';
  readonly supportedRegions = ['NG', 'GH', 'KE', 'ZA', 'UG', 'TZ'];
  readonly supportedIdTypes: IdentityDocumentType[] = [
    'nin', 'voters_card', 'drivers_license_ng',
    'ghana_card', 'voters_id_gh',
    'national_id_ke',
    'passport'
  ];
  
  async verifyIdentity(params: VerifyIdentityParams): Promise<IdentityVerifyResult> {
    const jobType = this.getJobType(params.idType);
    
    const response = await this.client.post('/v1/id_verification', {
      partner_id: this.partnerId,
      source_sdk: 'rest_api',
      source_sdk_version: '1.0.0',
      partner_params: {
        user_id: params.userId,
        job_id: this.generateJobId(),
        job_type: jobType,
      },
      id_info: {
        country: this.mapCountry(params.country),
        id_type: this.mapIdType(params.idType),
        id_number: params.idNumber,
        first_name: params.firstName,
        last_name: params.lastName,
        dob: params.dateOfBirth,
      },
    });
    
    return this.mapResponse(response.data);
  }
  
  private getJobType(idType: IdentityDocumentType): number {
    // Smile Identity job types
    const jobTypes = {
      'nin': 5,           // ID Verification
      'ghana_card': 5,
      'national_id_ke': 5,
      'passport': 1,      // Biometric KYC
    };
    return jobTypes[idType] ?? 5;
  }
  
  private mapIdType(idType: IdentityDocumentType): string {
    const mapping = {
      'nin': 'NIN',
      'voters_card': 'VOTER_ID',
      'drivers_license_ng': 'DRIVERS_LICENSE',
      'ghana_card': 'GHANA_CARD',
      'national_id_ke': 'NATIONAL_ID',
      'passport': 'PASSPORT',
    };
    return mapping[idType] ?? idType.toUpperCase();
  }
}
```

```typescript
// providers/identity/onfido.provider.ts

@Injectable()
export class OnfidoProvider implements IdentityProvider {
  readonly providerId = 'onfido';
  readonly supportedRegions = ['GB', 'US', 'EU', 'CA', 'AU', 'NG', 'GH', 'KE'];
  readonly supportedIdTypes: IdentityDocumentType[] = [
    'passport', 'drivers_license', 'passport_uk', 'drivers_license_uk', 'brp'
  ];
  
  private onfido: Onfido;
  
  constructor(private configService: ConfigService) {
    this.onfido = new Onfido({
      apiToken: configService.get('ONFIDO_API_TOKEN'),
      region: Region.EU,
    });
  }
  
  async verifyIdentity(params: VerifyIdentityParams): Promise<IdentityVerifyResult> {
    // Create applicant
    const applicant = await this.onfido.applicant.create({
      firstName: params.firstName,
      lastName: params.lastName,
      dob: params.dateOfBirth,
    });
    
    // Create check
    const check = await this.onfido.check.create({
      applicantId: applicant.id,
      reportNames: ['document', 'facial_similarity_photo'],
    });
    
    return {
      success: true,
      verificationId: check.id,
      status: 'pending',
      message: 'Verification initiated, awaiting document upload',
    };
  }
  
  async performLivenessCheck(params: LivenessCheckParams): Promise<LivenessResult> {
    const check = await this.onfido.check.create({
      applicantId: params.applicantId,
      reportNames: ['facial_similarity_video'],
    });
    
    return {
      success: true,
      checkId: check.id,
      status: 'pending',
    };
  }
}
```

```typescript
// providers/identity/nimc.provider.ts (Nigeria-specific)

@Injectable()
export class NimcProvider implements IdentityProvider {
  readonly providerId = 'nimc';
  readonly supportedRegions = ['NG'];
  readonly supportedIdTypes: IdentityDocumentType[] = ['nin'];
  
  // Direct NIMC integration (if available) or via aggregator
  async verifyIdentity(params: VerifyIdentityParams): Promise<IdentityVerifyResult> {
    if (params.idType !== 'nin') {
      throw new Error('NIMC only supports NIN verification');
    }
    
    const response = await this.client.post('/verify/nin', {
      nin: params.idNumber,
      firstname: params.firstName,
      lastname: params.lastName,
      dob: params.dateOfBirth,
    });
    
    return {
      success: response.data.status === 'success',
      verificationId: response.data.reference,
      status: response.data.status === 'success' ? 'verified' : 'failed',
      confidence: response.data.confidence,
      matchedFields: response.data.matched_fields,
      unmatchedFields: response.data.unmatched_fields,
    };
  }
}
```

### 5.3 Identity Provider Factory

```typescript
// factories/identity-provider.factory.ts

@Injectable()
export class IdentityProviderFactory {
  private providers: Map<string, IdentityProvider> = new Map();
  
  constructor(
    private smileIdentity: SmileIdentityProvider,
    private onfido: OnfidoProvider,
    private nimc: NimcProvider,
    private jumio: JumioProvider,
    private regionConfig: RegionConfigService,
  ) {
    this.registerProvider(this.smileIdentity);
    this.registerProvider(this.onfido);
    this.registerProvider(this.nimc);
    this.registerProvider(this.jumio);
  }
  
  getProvider(regionCode: string, idType?: IdentityDocumentType): IdentityProvider {
    const config = this.regionConfig.getProviderConfig(regionCode, 'identity');
    
    // If specific ID type requested, find provider that supports it
    if (idType) {
      const provider = this.findProviderForIdType(config, idType);
      if (provider) return provider;
    }
    
    // Otherwise return primary provider
    return this.providers.get(config.primary);
  }
  
  private findProviderForIdType(
    config: IdentityProviderConfig,
    idType: IdentityDocumentType
  ): IdentityProvider | null {
    const allProviders = [config.primary, ...config.fallback];
    
    for (const providerId of allProviders) {
      const provider = this.providers.get(providerId);
      if (provider?.supportedIdTypes.includes(idType)) {
        return provider;
      }
    }
    
    return null;
  }
}
```

---

## 6. Document Verification Abstraction

### 6.1 Document Provider Interface

```typescript
// interfaces/document-provider.interface.ts

export interface DocumentProvider {
  readonly providerId: string;
  readonly supportedRegions: string[];
  readonly supportedDocumentTypes: PropertyDocumentType[];
  
  // Verification Operations
  verifyDocument(params: VerifyPropertyDocumentParams): Promise<DocumentVerifyResult>;
  searchRegistry(params: RegistrySearchParams): Promise<RegistrySearchResult>;
  
  // For regulatory bodies
  verifyAgentLicense?(licenseNumber: string): Promise<LicenseVerifyResult>;
  verifyPropertyRegistration?(propertyId: string): Promise<RegistrationResult>;
}

export interface VerifyPropertyDocumentParams {
  documentType: PropertyDocumentType;
  documentNumber?: string;
  documentUrl: string;
  propertyAddress: PropertyAddress;
  ownerName?: string;
  metadata?: Record<string, any>;
}

export interface DocumentVerifyResult {
  success: boolean;
  verificationId: string;
  status: 'verified' | 'failed' | 'pending' | 'manual_review';
  confidence?: number;
  extractedData?: ExtractedDocumentData;
  matchScore?: number;  // Address/name match score
  issues?: string[];
  validUntil?: Date;
}

export type PropertyDocumentType =
  // Nigeria
  | 'certificate_of_occupancy'
  | 'governors_consent'
  | 'survey_plan'
  | 'deed_of_assignment'
  // Ghana
  | 'land_title_certificate'
  | 'site_plan'
  | 'indenture'
  // Kenya
  | 'title_deed'
  | 'land_search'
  | 'rates_clearance'
  // UK
  | 'title_register'
  | 'epc'
  | 'gas_safety_certificate'
  | 'electrical_certificate'
  // Universal
  | 'utility_bill'
  | 'tax_receipt';
```

### 6.2 Provider Implementations

```typescript
// providers/document/lasrera.provider.ts

@Injectable()
export class LasreraProvider implements DocumentProvider {
  readonly providerId = 'lasrera';
  readonly supportedRegions = ['NG'];
  readonly supportedDocumentTypes: PropertyDocumentType[] = [
    'certificate_of_occupancy', 'governors_consent', 'survey_plan'
  ];
  
  async verifyDocument(params: VerifyPropertyDocumentParams): Promise<DocumentVerifyResult> {
    // Extract document data using OCR
    const extractedData = await this.extractDocumentData(params.documentUrl);
    
    // Verify with Lagos Land Registry
    const registryResult = await this.verifyWithLandRegistry(
      params.documentType,
      extractedData.documentNumber,
      params.propertyAddress
    );
    
    // Calculate address match score
    const matchScore = this.calculateAddressMatch(
      extractedData.address,
      params.propertyAddress
    );
    
    return {
      success: registryResult.valid && matchScore >= 0.8,
      verificationId: this.generateVerificationId(),
      status: registryResult.valid ? 'verified' : 'failed',
      confidence: matchScore,
      extractedData,
      matchScore,
      issues: this.collectIssues(registryResult, matchScore),
      validUntil: this.calculateValidity(params.documentType),
    };
  }
  
  async verifyAgentLicense(licenseNumber: string): Promise<LicenseVerifyResult> {
    const response = await this.client.get(`/agents/verify/${licenseNumber}`);
    
    return {
      valid: response.data.status === 'active',
      licenseNumber,
      agentName: response.data.name,
      companyName: response.data.company,
      expiryDate: new Date(response.data.expiry_date),
      category: response.data.category,
    };
  }
}
```

```typescript
// providers/document/hm-land-registry.provider.ts

@Injectable()
export class HMLandRegistryProvider implements DocumentProvider {
  readonly providerId = 'hm_land_registry';
  readonly supportedRegions = ['GB'];
  readonly supportedDocumentTypes: PropertyDocumentType[] = ['title_register'];
  
  async searchRegistry(params: RegistrySearchParams): Promise<RegistrySearchResult> {
    // Use HM Land Registry API
    const response = await this.client.post('/search/titles', {
      postcode: params.postcode,
      address: params.address,
    });
    
    return {
      found: response.data.results.length > 0,
      titles: response.data.results.map(r => ({
        titleNumber: r.title_number,
        address: r.property_address,
        tenure: r.tenure,
        registeredOwners: r.proprietor_names,
      })),
    };
  }
  
  async verifyDocument(params: VerifyPropertyDocumentParams): Promise<DocumentVerifyResult> {
    // For UK, we can do real-time title searches
    const titleNumber = params.documentNumber;
    
    const titleInfo = await this.client.get(`/titles/${titleNumber}`);
    
    // Verify owner matches
    const ownerMatch = this.verifyOwnership(
      titleInfo.data.proprietors,
      params.ownerName
    );
    
    // Verify address matches
    const addressMatch = this.calculateAddressMatch(
      titleInfo.data.property_address,
      params.propertyAddress
    );
    
    return {
      success: ownerMatch && addressMatch >= 0.9,
      verificationId: this.generateVerificationId(),
      status: ownerMatch && addressMatch >= 0.9 ? 'verified' : 'failed',
      extractedData: {
        titleNumber,
        tenure: titleInfo.data.tenure,
        owners: titleInfo.data.proprietors,
        address: titleInfo.data.property_address,
        charges: titleInfo.data.charges, // Mortgages etc
      },
      matchScore: addressMatch,
    };
  }
}
```

```typescript
// providers/document/ardhisasa.provider.ts (Kenya)

@Injectable()
export class ArdhisasaProvider implements DocumentProvider {
  readonly providerId = 'ardhisasa';
  readonly supportedRegions = ['KE'];
  readonly supportedDocumentTypes: PropertyDocumentType[] = [
    'title_deed', 'land_search'
  ];
  
  async searchRegistry(params: RegistrySearchParams): Promise<RegistrySearchResult> {
    // Kenya's Ardhisasa digital land registry
    const response = await this.client.post('/api/search', {
      title_number: params.titleNumber,
      county: params.county,
    });
    
    return {
      found: response.data.found,
      titles: response.data.parcels?.map(p => ({
        titleNumber: p.title_number,
        parcelNumber: p.parcel_number,
        county: p.county,
        registeredOwners: p.owners,
        area: p.area,
        tenure: p.tenure_type,
      })),
    };
  }
  
  async verifyDocument(params: VerifyPropertyDocumentParams): Promise<DocumentVerifyResult> {
    // Perform official search
    const searchResult = await this.client.post('/api/official-search', {
      title_number: params.documentNumber,
      applicant_id: this.apiKey,
    });
    
    return {
      success: searchResult.data.status === 'clean',
      verificationId: searchResult.data.search_reference,
      status: this.mapStatus(searchResult.data.status),
      extractedData: {
        titleNumber: searchResult.data.title_number,
        owners: searchResult.data.proprietors,
        encumbrances: searchResult.data.encumbrances,
        caveats: searchResult.data.caveats,
        restrictions: searchResult.data.restrictions,
      },
      issues: searchResult.data.encumbrances?.length > 0 
        ? ['Property has existing encumbrances']
        : [],
    };
  }
}
```

### 6.3 Manual Review Fallback

```typescript
// providers/document/manual-review.provider.ts

@Injectable()
export class ManualReviewProvider implements DocumentProvider {
  readonly providerId = 'manual_review';
  readonly supportedRegions = ['*']; // All regions
  readonly supportedDocumentTypes: PropertyDocumentType[] = ['*' as any]; // All types
  
  async verifyDocument(params: VerifyPropertyDocumentParams): Promise<DocumentVerifyResult> {
    // Create manual review task
    const task = await this.taskService.create({
      type: 'document_verification',
      documentType: params.documentType,
      documentUrl: params.documentUrl,
      propertyAddress: params.propertyAddress,
      metadata: params.metadata,
      priority: 'normal',
      status: 'pending',
    });
    
    // Notify admin team
    await this.notificationService.notifyAdmins({
      type: 'new_verification_task',
      taskId: task.id,
    });
    
    return {
      success: true,
      verificationId: task.id,
      status: 'pending',
      message: 'Document submitted for manual review. Expected response within 24-48 hours.',
    };
  }
}
```

---

## 7. Communication Provider Abstraction

### 7.1 Communication Provider Interfaces

```typescript
// interfaces/communication-provider.interface.ts

export interface SmsProvider {
  readonly providerId: string;
  readonly supportedRegions: string[];
  
  sendSms(params: SendSmsParams): Promise<SmsResult>;
  sendBulkSms(params: BulkSmsParams): Promise<BulkSmsResult>;
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>;
}

export interface EmailProvider {
  readonly providerId: string;
  
  sendEmail(params: SendEmailParams): Promise<EmailResult>;
  sendTemplatedEmail(params: TemplatedEmailParams): Promise<EmailResult>;
  sendBulkEmail(params: BulkEmailParams): Promise<BulkEmailResult>;
}

export interface PushProvider {
  readonly providerId: string;
  
  sendPush(params: PushParams): Promise<PushResult>;
  sendMulticastPush(params: MulticastPushParams): Promise<MulticastResult>;
  subscribeToTopic(token: string, topic: string): Promise<void>;
}

export interface WhatsAppProvider {
  readonly providerId: string;
  readonly supportedRegions: string[];
  
  sendMessage(params: WhatsAppMessageParams): Promise<WhatsAppResult>;
  sendTemplate(params: WhatsAppTemplateParams): Promise<WhatsAppResult>;
}
```

### 7.2 Unified Communication Service

```typescript
// services/communication.service.ts

@Injectable()
export class CommunicationService {
  constructor(
    private smsFactory: SmsProviderFactory,
    private emailFactory: EmailProviderFactory,
    private pushFactory: PushProviderFactory,
    private whatsappFactory: WhatsAppProviderFactory,
    private regionConfig: RegionConfigService,
    private templateService: TemplateService,
  ) {}
  
  async sendNotification(
    userId: string,
    regionCode: string,
    notification: NotificationPayload
  ): Promise<NotificationResult> {
    const user = await this.userService.findById(userId);
    const config = this.regionConfig.getProviderConfig(regionCode, 'communication');
    const results: NotificationResult = { channels: {} };
    
    // Determine channels based on user preferences and notification type
    const channels = this.determineChannels(user, notification);
    
    // Send via each channel
    if (channels.includes('sms') && user.phone) {
      const smsProvider = this.smsFactory.getProvider(regionCode);
      const template = await this.templateService.getSmsTemplate(
        notification.type,
        regionCode,
        user.locale
      );
      
      results.channels.sms = await smsProvider.sendSms({
        to: user.phone,
        message: this.templateService.render(template, notification.data),
      });
    }
    
    if (channels.includes('email') && user.email) {
      const emailProvider = this.emailFactory.getProvider();
      
      results.channels.email = await emailProvider.sendTemplatedEmail({
        to: user.email,
        templateId: this.getEmailTemplateId(notification.type, regionCode),
        data: notification.data,
      });
    }
    
    if (channels.includes('push') && user.pushTokens?.length > 0) {
      const pushProvider = this.pushFactory.getProvider();
      
      results.channels.push = await pushProvider.sendMulticastPush({
        tokens: user.pushTokens,
        title: notification.title,
        body: notification.body,
        data: notification.data,
      });
    }
    
    if (channels.includes('whatsapp') && user.whatsappOptIn) {
      const whatsappProvider = this.whatsappFactory.getProvider(regionCode);
      
      results.channels.whatsapp = await whatsappProvider.sendTemplate({
        to: user.phone,
        templateName: this.getWhatsAppTemplate(notification.type),
        templateParams: notification.data,
        language: user.locale,
      });
    }
    
    return results;
  }
}
```

---

## 8. Regulatory Compliance Abstraction

### 8.1 Compliance Configuration

```typescript
// interfaces/compliance-config.interface.ts

export interface ComplianceConfig {
  dataProtection: DataProtectionRegulation;
  taxReporting: TaxReportingConfig;
  amlKyc: AmlKycConfig;
  propertyLaw: PropertyLawConfig;
  consumerProtection: ConsumerProtectionConfig;
}

export interface DataProtectionRegulation {
  framework: 'gdpr' | 'uk_gdpr' | 'ndpr' | 'popia' | 'dpa_kenya' | 'dpa_ghana';
  dataRetentionDays: number;
  consentRequired: boolean;
  rightToErasure: boolean;
  dataPortability: boolean;
  breachNotificationHours: number;
  dpoRequired: boolean;
}

export interface TaxReportingConfig {
  enabled: boolean;
  threshold?: number;  // Amount above which reporting required
  reportingPeriod: 'monthly' | 'quarterly' | 'annually';
  withholdingTax?: {
    enabled: boolean;
    rate: number;
  };
}

export interface AmlKycConfig {
  level: 'basic' | 'standard' | 'enhanced';
  enhancedThreshold?: number;  // Transaction amount requiring enhanced KYC
  pep_screening: boolean;  // Politically Exposed Persons
  sanctions_screening: boolean;
  ongoing_monitoring: boolean;
}

export interface PropertyLawConfig {
  // UK-specific
  rightToRentCheck?: boolean;
  depositProtectionScheme?: string[];
  howToRentGuideRequired?: boolean;
  
  // Nigeria-specific
  lasreraRegistrationRequired?: boolean;
  stamping_required?: boolean;
  
  // Universal
  tenancyAgreementRequired: boolean;
  inventoryRequired: boolean;
  maxDepositMonths?: number;
  noticePeriodDays?: {
    landlord: number;
    tenant: number;
  };
}
```

### 8.2 Compliance Service

```typescript
// services/compliance.service.ts

@Injectable()
export class ComplianceService {
  constructor(
    private regionConfig: RegionConfigService,
    private kycService: KycService,
    private dataProtectionService: DataProtectionService,
    private taxService: TaxService,
  ) {}
  
  async performPreTransactionChecks(
    userId: string,
    regionCode: string,
    transactionAmount: number,
    transactionType: string
  ): Promise<ComplianceCheckResult> {
    const config = this.regionConfig.getConfig(regionCode);
    const results: ComplianceCheckResult = {
      passed: true,
      checks: [],
      requiredActions: [],
    };
    
    // KYC Level Check
    const kycCheck = await this.checkKycLevel(
      userId,
      transactionAmount,
      config.compliance.amlKyc
    );
    results.checks.push(kycCheck);
    
    // Sanctions Screening
    if (config.compliance.amlKyc.sanctions_screening) {
      const sanctionsCheck = await this.performSanctionsScreening(userId);
      results.checks.push(sanctionsCheck);
    }
    
    // PEP Screening
    if (config.compliance.amlKyc.pep_screening) {
      const pepCheck = await this.performPepScreening(userId);
      results.checks.push(pepCheck);
    }
    
    // Tax Withholding Check (for payouts)
    if (transactionType === 'payout' && config.compliance.taxReporting.withholdingTax?.enabled) {
      results.taxWithholding = {
        applicable: true,
        rate: config.compliance.taxReporting.withholdingTax.rate,
        amount: transactionAmount * config.compliance.taxReporting.withholdingTax.rate,
      };
    }
    
    // Aggregate results
    results.passed = results.checks.every(c => c.passed);
    results.requiredActions = results.checks
      .filter(c => !c.passed)
      .flatMap(c => c.requiredActions);
    
    return results;
  }
  
  async getPropertyComplianceRequirements(
    regionCode: string,
    listingType: 'rent' | 'sale' | 'short-let'
  ): Promise<PropertyComplianceRequirements> {
    const config = this.regionConfig.getConfig(regionCode);
    const requirements: PropertyComplianceRequirements = {
      documents: [],
      checks: [],
      disclosures: [],
    };
    
    // UK-specific requirements
    if (regionCode === 'GB' && listingType === 'rent') {
      requirements.documents.push(
        { id: 'epc', name: 'Energy Performance Certificate', required: true },
        { id: 'gas_safety', name: 'Gas Safety Certificate', required: true },
        { id: 'electrical_cert', name: 'Electrical Safety Certificate', required: true },
        { id: 'how_to_rent', name: 'How to Rent Guide', required: true }
      );
      requirements.checks.push(
        { id: 'right_to_rent', name: 'Right to Rent Check', required: true }
      );
      requirements.disclosures.push(
        { id: 'deposit_protection', name: 'Deposit Protection Details', required: true }
      );
    }
    
    // Nigeria-specific requirements
    if (regionCode === 'NG') {
      requirements.documents.push(
        { id: 'cofo', name: 'Certificate of Occupancy', required: true },
        { id: 'survey', name: 'Survey Plan', required: false }
      );
      if (config.compliance.propertyLaw.lasreraRegistrationRequired) {
        requirements.checks.push(
          { id: 'lasrera', name: 'LASRERA Registration', required: true }
        );
      }
    }
    
    return requirements;
  }
  
  // GDPR / Data Protection
  async handleDataSubjectRequest(
    userId: string,
    regionCode: string,
    requestType: 'access' | 'erasure' | 'portability' | 'rectification'
  ): Promise<DataSubjectRequestResult> {
    const config = this.regionConfig.getConfig(regionCode);
    
    switch (requestType) {
      case 'access':
        return this.dataProtectionService.generateDataReport(userId);
        
      case 'erasure':
        if (!config.compliance.dataProtection.rightToErasure) {
          return { success: false, message: 'Right to erasure not applicable in this region' };
        }
        return this.dataProtectionService.processErasureRequest(userId);
        
      case 'portability':
        if (!config.compliance.dataProtection.dataPortability) {
          return { success: false, message: 'Data portability not applicable in this region' };
        }
        return this.dataProtectionService.exportUserData(userId, 'json');
        
      case 'rectification':
        return { success: true, redirectTo: '/settings/profile' };
    }
  }
}
```

---

## 9. Maps & Location Abstraction

### 9.1 Maps Provider Interface

```typescript
// interfaces/maps-provider.interface.ts

export interface MapsProvider {
  readonly providerId: string;
  readonly supportedRegions: string[];
  
  // Geocoding
  geocode(address: string, region?: string): Promise<GeocodeResult>;
  reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult>;
  
  // Autocomplete
  autocomplete(query: string, options?: AutocompleteOptions): Promise<AutocompleteResult>;
  
  // Place Details
  getPlaceDetails(placeId: string): Promise<PlaceDetails>;
  
  // Distance/Routing
  getDistance(origin: LatLng, destination: LatLng): Promise<DistanceResult>;
  getDirections(origin: LatLng, destination: LatLng): Promise<DirectionsResult>;
}

export interface AutocompleteOptions {
  types?: ('address' | 'establishment' | 'geocode')[];
  region?: string;  // ISO country code
  location?: LatLng;  // Bias towards location
  radius?: number;
}
```

### 9.2 Provider Implementations

```typescript
// providers/maps/google-maps.provider.ts

@Injectable()
export class GoogleMapsProvider implements MapsProvider {
  readonly providerId = 'google_maps';
  readonly supportedRegions = ['*'];
  
  async geocode(address: string, region?: string): Promise<GeocodeResult> {
    const response = await this.client.get('/geocode/json', {
      params: {
        address,
        key: this.apiKey,
        region: region?.toLowerCase(),
      },
    });
    
    if (response.data.status !== 'OK') {
      return { success: false, results: [] };
    }
    
    return {
      success: true,
      results: response.data.results.map(r => ({
        formattedAddress: r.formatted_address,
        location: {
          lat: r.geometry.location.lat,
          lng: r.geometry.location.lng,
        },
        placeId: r.place_id,
        components: this.parseAddressComponents(r.address_components),
      })),
    };
  }
  
  async autocomplete(query: string, options?: AutocompleteOptions): Promise<AutocompleteResult> {
    const params: any = {
      input: query,
      key: this.apiKey,
    };
    
    if (options?.region) {
      params.components = `country:${options.region.toLowerCase()}`;
    }
    
    if (options?.types) {
      params.types = options.types.join('|');
    }
    
    if (options?.location) {
      params.location = `${options.location.lat},${options.location.lng}`;
      params.radius = options.radius || 50000;
    }
    
    const response = await this.client.get('/place/autocomplete/json', { params });
    
    return {
      success: response.data.status === 'OK',
      predictions: response.data.predictions.map(p => ({
        placeId: p.place_id,
        description: p.description,
        mainText: p.structured_formatting.main_text,
        secondaryText: p.structured_formatting.secondary_text,
      })),
    };
  }
}
```

```typescript
// providers/maps/mapbox.provider.ts

@Injectable()
export class MapboxProvider implements MapsProvider {
  readonly providerId = 'mapbox';
  readonly supportedRegions = ['*'];
  
  async geocode(address: string, region?: string): Promise<GeocodeResult> {
    const response = await this.client.get(
      `/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
      {
        params: {
          access_token: this.accessToken,
          country: region?.toLowerCase(),
          types: 'address,place',
        },
      }
    );
    
    return {
      success: response.data.features.length > 0,
      results: response.data.features.map(f => ({
        formattedAddress: f.place_name,
        location: {
          lat: f.center[1],
          lng: f.center[0],
        },
        placeId: f.id,
        components: this.parseContext(f.context),
      })),
    };
  }
}
```

---

## 10. Blockchain Abstraction

### 10.1 Blockchain Provider Interface

```typescript
// interfaces/blockchain-provider.interface.ts

export interface BlockchainProvider {
  readonly providerId: string;
  readonly network: string;
  readonly chainId: number;
  
  // Connection
  getConnection(): Web3Provider;
  isConnected(): Promise<boolean>;
  
  // Transactions
  sendTransaction(tx: TransactionRequest): Promise<TransactionReceipt>;
  getTransactionStatus(txHash: string): Promise<TransactionStatus>;
  
  // Contract Interaction
  getContract<T>(address: string, abi: any[]): T;
  deployContract(bytecode: string, abi: any[], args: any[]): Promise<DeployResult>;
  
  // Events
  subscribeToEvents(address: string, eventName: string, callback: EventCallback): Subscription;
}

export interface BlockchainConfig {
  network: 'polygon' | 'ethereum' | 'bsc' | 'base' | 'arbitrum';
  rpcUrl: string;
  fallbackRpcUrls: string[];
  chainId: number;
  contracts: {
    escrow: string;
    agreement: string;
    verification: string;
  };
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}
```

### 10.2 Network Configurations

```typescript
// config/blockchain/networks.ts

export const BlockchainNetworks: Record<string, BlockchainConfig> = {
  polygon: {
    network: 'polygon',
    rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}',
    fallbackRpcUrls: [
      'https://polygon-mainnet.infura.io/v3/${INFURA_KEY}',
      'https://rpc.ankr.com/polygon',
    ],
    chainId: 137,
    contracts: {
      escrow: '0x...',
      agreement: '0x...',
      verification: '0x...',
    },
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  
  base: {  // Coinbase L2 - another option for lower fees
    network: 'base',
    rpcUrl: 'https://mainnet.base.org',
    fallbackRpcUrls: [
      'https://base.blockpi.network/v1/rpc/public',
    ],
    chainId: 8453,
    contracts: {
      escrow: '0x...',
      agreement: '0x...',
      verification: '0x...',
    },
    explorerUrl: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};
```

---

## 11. Implementation Guide

### 11.1 Adding a New Provider

```typescript
// Step 1: Implement the interface
@Injectable()
export class NewPaymentProvider implements PaymentProvider {
  readonly providerId = 'new_provider';
  readonly supportedRegions = ['XX', 'YY'];
  readonly supportedMethods = ['card', 'bank_transfer'];
  
  // Implement all interface methods...
}

// Step 2: Register in the factory
// factories/payment-provider.factory.ts
constructor(
  // ... existing providers
  private newProvider: NewPaymentProvider,
) {
  // ... existing registrations
  this.registerProvider(this.newProvider);
}

// Step 3: Add to region config
// config/regions/new-region.ts
providers: {
  payment: {
    primary: 'new_provider',
    fallback: ['stripe'],
    // ...
  }
}
```

### 11.2 Module Structure

```
src/
├── interfaces/
│   ├── payment-provider.interface.ts
│   ├── identity-provider.interface.ts
│   ├── document-provider.interface.ts
│   ├── communication-provider.interface.ts
│   └── maps-provider.interface.ts
│
├── providers/
│   ├── payment/
│   │   ├── paystack.provider.ts
│   │   ├── stripe.provider.ts
│   │   ├── mpesa.provider.ts
│   │   └── flutterwave.provider.ts
│   ├── identity/
│   │   ├── smile-identity.provider.ts
│   │   ├── onfido.provider.ts
│   │   └── nimc.provider.ts
│   ├── document/
│   │   ├── lasrera.provider.ts
│   │   ├── hm-land-registry.provider.ts
│   │   └── manual-review.provider.ts
│   └── communication/
│       ├── sms/
│       ├── email/
│       └── push/
│
├── factories/
│   ├── payment-provider.factory.ts
│   ├── identity-provider.factory.ts
│   ├── document-provider.factory.ts
│   └── communication-provider.factory.ts
│
├── config/
│   ├── regions/
│   │   ├── nigeria.ts
│   │   ├── ghana.ts
│   │   ├── kenya.ts
│   │   ├── south-africa.ts
│   │   ├── united-kingdom.ts
│   │   └── united-states.ts
│   └── blockchain/
│       └── networks.ts
│
└── services/
    ├── region-config.service.ts
    ├── payment.service.ts
    ├── verification.service.ts
    ├── compliance.service.ts
    └── communication.service.ts
```

---

## 12. Adding a New Region

### 12.1 Checklist for New Region

```markdown
## New Region Checklist: [Country Name]

### 1. Research & Planning
- [ ] Identify regulatory requirements
- [ ] Research local payment providers
- [ ] Identify identity verification requirements
- [ ] Research property document requirements
- [ ] Identify local communication preferences (WhatsApp, SMS, etc.)
- [ ] Research data protection laws

### 2. Configuration
- [ ] Create region config file (`config/regions/[country].ts`)
- [ ] Define currency and locale settings
- [ ] Configure feature flags
- [ ] Set up provider configurations

### 3. Provider Integration
- [ ] Integrate primary payment provider
- [ ] Set up identity verification provider
- [ ] Configure document verification (or manual review)
- [ ] Set up SMS/communication providers
- [ ] Configure maps provider (or verify existing works)

### 4. Compliance Setup
- [ ] Configure data protection settings
- [ ] Set up tax reporting rules
- [ ] Configure AML/KYC levels
- [ ] Set property law requirements

### 5. Verification Hub
- [ ] Define verification tiers for region
- [ ] Configure required documents
- [ ] Set validity periods
- [ ] Map to verification providers

### 6. Localization
- [ ] Add translations for region
- [ ] Configure date/time formats
- [ ] Set up email/SMS templates
- [ ] Configure notification preferences

### 7. Testing
- [ ] Unit tests for new providers
- [ ] Integration tests for payment flow
- [ ] Verification flow testing
- [ ] Compliance checks testing
- [ ] End-to-end testing

### 8. Documentation
- [ ] Update API documentation
- [ ] Document region-specific requirements
- [ ] Update user-facing help content
```

### 12.2 Example: Adding South Africa

```typescript
// config/regions/south-africa.ts

export const SouthAfricaConfig: RegionConfig = {
  code: 'ZA',
  name: 'South Africa',
  currency: {
    code: 'ZAR',
    symbol: 'R',
    decimalPlaces: 2,
    thousandsSeparator: ' ',
    decimalSeparator: ','
  },
  locale: {
    language: 'en-ZA',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: '24h'
  },
  timezone: 'Africa/Johannesburg',
  
  features: {
    escrowEnabled: true,
    blockchainEnabled: true,
    aiAssistantEnabled: true,
    shortLetEnabled: true,
    landSalesEnabled: true,
    agentMarketplaceEnabled: true,
    mortgageIntegrationEnabled: false
  },
  
  providers: {
    payment: {
      primary: 'paystack',
      fallback: ['peach_payments', 'paygate'],
      supportedMethods: ['card', 'eft', 'instant_eft'],
      escrowProvider: 'paystack'
    },
    identity: {
      primary: 'smile_identity',
      fallback: ['onfido', 'xds'],  // XDS for credit bureau
      requiredDocuments: ['national_id'],
      supportedIdTypes: ['sa_id', 'passport', 'asylum_seeker_permit'],
      biometricEnabled: true,
      livenessCheckRequired: true
    },
    document: {
      primary: 'deeds_office_za',
      fallback: ['windeed', 'manual_review'],
      propertyRegistry: 'deeds_office',
      regulatoryBody: 'estate_agency_affairs_board'
    },
    communication: {
      sms: { primary: 'clickatell', fallback: ['africas_talking', 'twilio'] },
      email: { primary: 'sendgrid', fallback: ['ses'] },
      push: { primary: 'fcm', fallback: [] }
    },
    maps: {
      primary: 'google_maps',
      fallback: ['mapbox']
    },
    blockchain: {
      network: 'polygon',
      rpcProvider: 'alchemy'
    }
  },
  
  verification: {
    tiers: [
      {
        id: 'bronze',
        name: 'Bronze',
        requirements: ['identity_verified'],
        benefits: ['verified_badge'],
        visibilityBoost: 0
      },
      {
        id: 'silver',
        name: 'Silver',
        requirements: ['identity_verified', 'address_verified', 'title_deed'],
        benefits: ['verified_badge', 'priority_listing'],
        visibilityBoost: 15
      },
      {
        id: 'gold',
        name: 'Gold',
        requirements: ['silver_tier', 'rates_clearance', 'eaab_registration'],
        benefits: ['gold_badge', 'featured_placement'],
        visibilityBoost: 25
      }
    ],
    propertyDocuments: [
      {
        id: 'title_deed',
        name: 'Title Deed',
        description: 'Official title deed from Deeds Office',
        required: true,
        validityPeriod: null,
        verificationMethod: 'deeds_office_api'
      },
      {
        id: 'rates_clearance',
        name: 'Rates Clearance Certificate',
        description: 'Certificate showing no outstanding rates',
        required: true,
        validityPeriod: 120, // 4 months
        verificationMethod: 'manual_review'
      },
      {
        id: 'zoning_certificate',
        name: 'Zoning Certificate',
        description: 'Confirmation of property zoning',
        required: false,
        validityPeriod: null,
        verificationMethod: 'manual_review'
      }
    ]
  },
  
  compliance: {
    dataProtection: 'popia',  // Protection of Personal Information Act
    taxReporting: true,
    amlKycLevel: 'enhanced',
    fica: true,  // Financial Intelligence Centre Act
    transactionLimits: {
      singleTransaction: 25000000,  // R25M
      requiresEnhancedKyc: 5000000  // R5M
    }
  }
};
```

---

## Summary

This abstraction architecture enables HomeAI to:

1. **Expand to new regions** by adding configuration files without changing core code
2. **Swap providers** based on availability, cost, or feature requirements
3. **Handle region-specific requirements** through configuration
4. **Maintain compliance** with local regulations automatically
5. **Provide fallback options** when primary providers fail
6. **Support multi-region users** (diaspora) seamlessly

The key principles are:
- **Interface-based design** for all external integrations
- **Factory pattern** for provider instantiation
- **Configuration-driven behavior** instead of code conditionals
- **Plugin architecture** for easy provider addition

---

*Document Version 1.0 | January 2026 | HomeAI Nigeria Backend Team*
