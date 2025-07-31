export interface User {
  id: string;
  name: string;
  role: string;
}

export interface CSVUploadResponse {
  success: boolean;
  recordsProcessed: number;
  records: any[];
}

export interface EquityData {
  isin: string;
  symbol: string;
  clientId: string;
  counterparty: string;
  tradingVenue: string;
  currency: string;
  countryOfTrade: string;
  kycStatus: string;
  referenceDataValidated: boolean;
  collateralRequired: boolean;
  marginType: string;
  marginStatus: string;
  pricingSource: string;
}

export interface ForexData {
  counterparty: string;
  currencyPair: string;
  baseCurrency: string;
  termCurrency: string;
  executionVenue: string;
  productType: string;
  bookingLocation: string;
  portfolio: string;
  tradeSourceSystem: string;
  custodian: string;
  settlementInstructions: string;
  nettingEligibility: boolean;
  kycStatus: string;
  sanctionsScreening: string;
  settlementCurrency: string;
  costCenter: string;
  expenseApprovalStatus: string;
}

export interface DashboardMetrics {
  totalInstruments: number;
  activeInstruments: number;
  pendingValidations: number;
  dataQualityScore: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  timestamp: string;
  status: 'new' | 'acknowledged' | 'resolved';
}

export interface SystemStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  lastUpdated: string;
}

export interface InstrumentUpdate {
  instrument: string;
  instrumentId: string;
  assetClass: string;
  action: string;
  time: string;
}

export interface PriceFeed {
  name: string;
  status: 'Online' | 'Delayed' | 'Offline';
  instrumentsUpdated: {
    current: number;
    total: number;
  };
  responseTime: string;
  errorRate: string;
  dataQuality: string;
  lastUpdate: string;
}

export interface Instrument {
  _id?: string;
  ISIN?: string;
  symbol?: string;
  tradingVenue?: string;
  currency?: string;
  countryOfTrade?: string;
  pricingSource?: string;
  status?: string;
  RID?: string;
  currencyPair?: string;
  baseCurrency?: string;
  termCurrency?: string;
  executionVenue?: string;
  productType?: string;
  editNote?: string;
  // Fixed Income
  maturityDate?: string;
  couponRate?: number;
  couponFrequency?: string;
  issuerName?: string;
  // Futures
  contractCode?: string;
  underlyingAsset?: string;
  expiryDate?: string;
  lotSize?: number;
  // Options
  optionType?: 'Call' | 'Put';
  strikePrice?: number;
  [key: string]: any;
}

export interface ValidationFailure {
  _id?: string;
  entity: string;
  instrumentId: string;
  rule: string;
  status: string;
  message: string;
  severity: string;
  timestamp: string;
} 

export interface EquityClient {
  id: string;
  name: string;
  role: string;
  approvalStatus: string;
}

export interface ForexClient {
  id?: string;
  ClientID?: string;
  Counterparty?: string;
  Portfolio?: string;
  Custodian?: string;
  NettingEligibility?: string;
  KYCStatus?: string;
  SanctionsScreening?: string;
  ExpenseApprovalStatus?: string;
}

export interface ForexInstrument {
  id?: string;
  CurrencyPair: string;
  BaseCurrency: string;
  TermCurrency: string;
  ExecutionVenue: string;
  ProductType: string;
  Portfolio?: string;
  TradeSourceSystem?: string;
  Custodian?: string;
  SettlementInstructions?: string;
  NettingEligibility?: string;
  KYCStatus?: string;
  SanctionsScreening?: string;
  CostCenter?: string;
  ExpenseApprovalStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ForexSSI {
  id?: string;
  BookingLocation?: string;
  SettlementCurrency?: string;
  SettlementInstruction?: string;
  ConfirmationStatus?: string;
  SettlementDate?: string;
  swift_bic_code?: string;
  account_number?: string;
  iban?: string;
  bsb_code?: string;
  sort_code?: string;
  zengin_code?: string;
  aba_routing_number?: string;
  settlement_method?: string;
  beneficiary_name?: string;
} 