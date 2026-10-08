// Per-product customer field schemas extracted directly from the 6 Scheidt & Bachmann Excel sheets.

export interface ProductFieldSchema {
  id: string;
  label: string;
  hint?: string;
  type: "text" | "number" | "email" | "password" | "select" | "boolean" | "file" | "textarea";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface ProductStepSchema {
  stepId: string;
  title: string;
  description: string;
  fields: ProductFieldSchema[];
}

export interface ProductWizardSchema {
  productId: string;
  productName: string;
  excelSource: string;
  steps: ProductStepSchema[];
}

export const PRODUCT_FORM_SCHEMAS: Record<string, ProductWizardSchema> = {
  "smart-web-pay": {
    productId: "smart-web-pay",
    productName: "entervo smart web pay",
    excelSource: "RSAPP_ONBOARDING_entervo-smart-web-pay-Operator-Subsidiary_en-GB-1.xlsx",
    steps: [
      {
        stepId: "operator",
        title: "Operator & System Access",
        description: "Network connectivity and operator identity details.",
        fields: [
          { id: "opName", label: "Parking Operator Name", required: true, type: "text", placeholder: "Enter parking operator name" },
          { id: "opEmail", label: "Operator Email Address", required: true, type: "email", placeholder: "operator@company.com" },
          { id: "techEmail", label: "Technical Support Email", required: true, type: "email", placeholder: "support@company.com" },
          { id: "phone", label: "Operator Phone Number", required: true, type: "text", placeholder: "+49 123 456789" },
          { id: "version", label: "Parking System Version", required: true, type: "select", options: [
            { value: "V3R0P0M5", label: "entervo V3R0P0M5 (Recommended)" },
            { value: "V2R5M5", label: "entervo V2R5M5" },
            { value: "V2R4", label: "entervo V2R4 / Older" }
          ]},
          { id: "ip", label: "Static Public IP Address", required: true, type: "text", placeholder: "Enter static public IP address" },
          { id: "port", label: "Communication Port", required: true, type: "text", placeholder: "e.g. 8443 or 8701" },
          { id: "domain", label: "Operator Domain / IP:Port", required: true, type: "text", placeholder: "carpark.company.com or IP:Port" },
          { id: "reachable", label: "Cell Computer Reachable Outside Local Network", type: "boolean" },
          { id: "forwarding", label: "Network Communication Forwarding Tested", type: "boolean" }
        ]
      },
      {
        stepId: "cell",
        title: "App & Receipt Configuration",
        description: "Receipt text, branding, and app-level time limits.",
        fields: [
          { id: "financialInfo", label: "Financial Information (Prints on Receipt)", required: true, type: "text", placeholder: "Company name / VAT Tax No." },
          { id: "inpayEntry", label: "In-Pay Time ENTRY (Minutes)", required: true, type: "number", placeholder: "Enter minutes (e.g. 1)" },
          { id: "inpayPayment", label: "In-Pay Time PAYMENT (Minutes)", required: true, type: "number", placeholder: "Enter minutes (e.g. 15)" },
          { id: "tariffClass", label: "Tariff Class ID", type: "text", placeholder: "0 (Default standard tariff)" },
          { id: "tocUrl", label: "Terms & Conditions URL", required: true, type: "text", placeholder: "https://company.com/terms" },
          { id: "vouchers", label: "Vouchers Feature Supported", type: "boolean" },
          { id: "prepay", label: "Prepayment Feature Supported", type: "boolean" },
          { id: "topup", label: "Top-up Feature Supported", type: "boolean" }
        ]
      },
      {
        stepId: "facilities",
        title: "Facilities & Nested Areas",
        description: "Parking facilities connected to smart web pay.",
        fields: [
          { id: "facilityName", label: "Parking Facility Name", required: true, type: "text", placeholder: "Enter facility name" },
          { id: "facilityAddress", label: "Physical Address & City", required: true, type: "text", placeholder: "Street address, City" },
          { id: "facilityId", label: "Cell Facility ID", required: true, type: "text", placeholder: "Enter facility ID" },
          { id: "freeflow", label: "Free-flow System with Late Payment", type: "boolean" }
        ]
      },
      {
        stepId: "payment",
        title: "PSP Payment Gateway Credentials",
        description: "Payment Service Provider integration details.",
        fields: [
          { id: "psp", label: "Select Payment Service Provider", required: true, type: "select", options: [
            { value: "fiserv", label: "Fiserv / Telecash" },
            { value: "planet", label: "Planet" },
            { value: "trustcommerce", label: "TrustCommerce" },
            { value: "nmi", label: "NMI" },
            { value: "ccv", label: "CCV" },
            { value: "worldline", label: "Worldline" }
          ]},
          { id: "pspMid", label: "Merchant Account / Store / Customer ID", required: true, type: "text", placeholder: "Enter Merchant Account ID" },
          { id: "pspKey", label: "API Key / User ID", required: true, type: "text", placeholder: "Enter API Key" },
          { id: "pspSecret", label: "API Secret / Private Password", required: true, type: "password", placeholder: "••••••••" }
        ]
      }
    ]
  },

  "entervo-connect": {
    productId: "entervo-connect",
    productName: "entervo connect",
    excelSource: "entervo_connect_onboarding_request_Chelsea Bridge Wharf.xlsx",
    steps: [
      {
        stepId: "operator",
        title: "Business Partner & Operator",
        description: "Business Partner and Operator Identity details.",
        fields: [
          { id: "opName", label: "Business Partner Name", required: true, type: "text", placeholder: "Enter company name" },
          { id: "country", label: "Country", required: true, type: "text", placeholder: "Enter country" },
          { id: "city", label: "City", required: true, type: "text", placeholder: "Enter city" },
          { id: "currency", label: "Currency (ISO 4217)", required: true, type: "select", options: [
            { value: "GBP", label: "GBP - British Pound" },
            { value: "EUR", label: "EUR - Euro" },
            { value: "USD", label: "USD - US Dollar" },
            { value: "CAD", label: "CAD - Canadian Dollar" }
          ]},
          { id: "opId", label: "Operator ID (5 digits)", required: true, type: "text", placeholder: "Enter 5-digit Operator ID" }
        ]
      },
      {
        stepId: "contact",
        title: "Responsible Contacts",
        description: "Overall Responsible Person and Technical Administrator.",
        fields: [
          { id: "respName", label: "Responsible Contact Full Name", required: true, type: "text", placeholder: "Enter contact full name" },
          { id: "opEmail", label: "Responsible Contact Email", required: true, type: "email", placeholder: "email@company.com" },
          { id: "phone", label: "Responsible Contact Phone", required: true, type: "text", placeholder: "+44 123 456789" },
          { id: "techAdminName", label: "Technical Admin Username / Name", required: true, type: "text", placeholder: "Enter admin username" },
          { id: "techEmail", label: "Technical Admin Email", required: true, type: "email", placeholder: "admin@company.com" }
        ]
      },
      {
        stepId: "cell",
        title: "Cell Computer & Services",
        description: "Cell Computer IDs and enabled entervo connect services.",
        fields: [
          { id: "cellId", label: "Cell Computer ID", required: true, type: "text", placeholder: "Enter Cell ID" },
          { id: "participantId", label: "Participant ID (Superuser S&B profile)", required: true, type: "text", placeholder: "Enter Participant ID" },
          { id: "uiPassword", label: "Cellcomputer Password", required: true, type: "password", placeholder: "••••••••" },
          { id: "onlineAuth", label: "Online Authorization Service Enabled", type: "boolean" },
          { id: "customerMedia", label: "Customer & Media Service Enabled", type: "boolean" },
          { id: "counting", label: "Counting Service Enabled (Smart CONTRACT)", type: "boolean" }
        ]
      },
      {
        stepId: "facilities",
        title: "Connection Points / Facilities",
        description: "Connected car park facility endpoints.",
        fields: [
          { id: "facilityId", label: "Facility ID", required: true, type: "text", placeholder: "Enter Facility ID" },
          { id: "facilityName", label: "Facility Name", required: true, type: "text", placeholder: "Enter facility name" },
          { id: "carparkType", label: "Carpark Type", required: true, type: "select", options: [
            { value: "PA", label: "PA - Park Area (Default)" },
            { value: "MSCP", label: "MSCP - Multi Storey Car Park" },
            { value: "UGCP", label: "UGCP - Underground Car Park" },
            { value: "MSCP_NESTED", label: "MSCP Nested" }
          ]},
          { id: "apiKey", label: "API Key / Access Token", type: "text", placeholder: "Enter API Key" }
        ]
      }
    ]
  },

  "smart-validation": {
    productId: "smart-validation",
    productName: "entervo smart validation",
    excelSource: "entervo_smart_validation_new_tenant_request(v2.0) V3_empty.xlsx",
    steps: [
      {
        stepId: "tenant",
        title: "Tenant Profile & Distribution",
        description: "Smart validation tenant URL and notification distribution lists.",
        fields: [
          { id: "tenantShortname", label: "Tenant Shortname (URL Slug, max 20 lower-case chars)", required: true, type: "text", placeholder: "e.g. shoppingmall" },
          { id: "tenantDesc", label: "Tenant Description / Long Name", required: true, type: "text", placeholder: "Enter tenant description" },
          { id: "opId", label: "Operator ID", required: true, type: "text", placeholder: "Enter Operator ID" },
          { id: "country", label: "Country", required: true, type: "text", placeholder: "Enter country" },
          { id: "currency", label: "Currency (ISO 4217)", required: true, type: "select", options: [
            { value: "EUR", label: "EUR - Euro" },
            { value: "GBP", label: "GBP - British Pound" },
            { value: "USD", label: "USD - US Dollar" }
          ]},
          { id: "lang", label: "Language Tag", required: true, type: "select", options: [
            { value: "en-GB", label: "en-GB - English (UK)" },
            { value: "de-DE", label: "de-DE - Deutsch" },
            { value: "fr-FR", label: "fr-FR - Français" }
          ]},
          { id: "subtechEmail", label: "SUBTECH Admin Email (OVAL Admin)", required: true, type: "email", placeholder: "admin.oval@tenant.com" },
          { id: "incidentEmail", label: "Maintenance / Incident Email Distribution List", required: true, type: "email", placeholder: "incidents@tenant.com" }
        ]
      },
      {
        stepId: "cell",
        title: "Cell Computer Data",
        description: "Cell computer authorization details.",
        fields: [
          { id: "cellId", label: "Cell Computer ID", required: true, type: "text", placeholder: "Enter Cell ID" },
          { id: "cellName", label: "Cell Computer Name", required: true, type: "text", placeholder: "Enter Cell Name" },
          { id: "ip", label: "Public Cell IP Address", required: true, type: "text", placeholder: "Enter public IP" },
          { id: "port", label: "Cell Port (standard 8443)", required: true, type: "text", placeholder: "8443" },
          { id: "cellUser", label: "Authorization Username (Digits only)", required: true, type: "text", placeholder: "Enter numeric username" },
          { id: "cellPass", label: "Authorization Password (max 9 chars, no spaces)", required: true, type: "password", placeholder: "••••••••" }
        ]
      },
      {
        stepId: "carpark",
        title: "Carpark & Mediatypes",
        description: "Facility configurations and accepted media types.",
        fields: [
          { id: "facilityId", label: "Facility ID", required: true, type: "text", placeholder: "Enter Facility ID" },
          { id: "facilityName", label: "Facility Name", required: true, type: "text", placeholder: "Enter facility name" },
          { id: "timezone", label: "Facility Timezone", required: true, type: "select", options: [
            { value: "Europe/Berlin", label: "Europe/Berlin (CET)" },
            { value: "Europe/London", label: "Europe/London (GMT)" },
            { value: "America/New_York", label: "America/New_York (EST)" }
          ]},
          { id: "barcode", label: "Barcode Media Supported", type: "boolean" },
          { id: "lpr", label: "LPN (License Plate Recognition) Supported", type: "boolean" },
          { id: "mobileId", label: "Mobile-ID Supported", type: "boolean" }
        ]
      }
    ]
  },

  "mobility-connect": {
    productId: "mobility-connect",
    productName: "mobility CONNECT",
    excelSource: "mobility CONNECT - Garage_Information_ENG_Full Service.xlsx",
    steps: [
      {
        stepId: "basic",
        title: "Garage Basic Data & Operating Hours",
        description: "Physical specs, capacities, and daily operating hours.",
        fields: [
          { id: "siteName", label: "Car Park Name", required: true, type: "text", placeholder: "Enter car park name" },
          { id: "carparkType", label: "Car Park Type", required: true, type: "select", options: [
            { value: "MSCP", label: "Multi Storey Car Park" },
            { value: "UGCP", label: "Underground Car Park" },
            { value: "PA", label: "Surface Parking Area" }
          ]},
          { id: "is247", label: "Operates 24 Hours / 7 Days", type: "boolean" },
          { id: "heightLimit", label: "Height Limit (Meters)", required: true, type: "text", placeholder: "e.g. 2.10m" },
          { id: "totalCapacity", label: "Total Number of Parking Lots", required: true, type: "number", placeholder: "Enter total spaces" },
          { id: "evCharging", label: "Number of EV Charging Stations", type: "number", placeholder: "Enter EV charging count" },
          { id: "costCenter", label: "Cost Center Code", type: "text", placeholder: "Enter cost center code" }
        ]
      },
      {
        stepId: "lanes",
        title: "Lanes & Access Infrastructure",
        description: "Entry/exit lanes and access controls.",
        fields: [
          { id: "entryLanes", label: "Number of Entry Lanes", required: true, type: "number", placeholder: "Enter entry lanes count" },
          { id: "exitLanes", label: "Number of Exit Lanes", required: true, type: "number", placeholder: "Enter exit lanes count" },
          { id: "afterHoursAccess", label: "Access Outside Opening Hours Available", type: "boolean" }
        ]
      },
      {
        stepId: "address",
        title: "Address & Geo Coordinates",
        description: "Physical address and GPS location data.",
        fields: [
          { id: "address", label: "Street Address", required: true, type: "text", placeholder: "Enter street address" },
          { id: "zipCode", label: "Zip Code", required: true, type: "text", placeholder: "Enter zip code" },
          { id: "city", label: "City", required: true, type: "text", placeholder: "Enter city" },
          { id: "latLong", label: "Latitude, Longitude Coordinates", required: true, type: "text", placeholder: "e.g. 51.4851, -0.1492" }
        ]
      },
      {
        stepId: "billing",
        title: "Pricing, Billing & Mobility Provider",
        description: "Daily max rates, operator billing, and MSP partner keys.",
        fields: [
          { id: "dailyMax", label: "Daily Maximum Tariff Rate", required: true, type: "text", placeholder: "Enter rate (e.g. 25.00 EUR)" },
          { id: "opName", label: "Operator Legal Name (Invoice)", required: true, type: "text", placeholder: "Enter legal company name" },
          { id: "taxId", label: "Tax ID / VAT Number", required: true, type: "text", placeholder: "Enter Tax / VAT number" },
          { id: "opEmail", label: "Billing Email Address", required: true, type: "email", placeholder: "invoices@company.com" },
          { id: "sbLocationId", label: "S&B Location ID", required: true, type: "text", placeholder: "Enter Location ID" }
        ]
      }
    ]
  },

  "smart-select": {
    productId: "smart-select",
    productName: "entervo smart select",
    excelSource: "smart select - english.xlsx",
    steps: [
      {
        stepId: "portal",
        title: "Portal Branding & Domain",
        description: "Webshop portal URL, DKIM email, logo, and legal documents.",
        fields: [
          { id: "urlSlug", label: "Portal Web Address Slug (my-parkingportal.com/NAME)", required: true, type: "text", placeholder: "e.g. mygarage" },
          { id: "projectName", label: "Project Name (Appears on website & emails)", required: true, type: "text", placeholder: "Enter project name" },
          { id: "senderEmail", label: "Sender Email Address (DKIM Verified)", required: true, type: "email", placeholder: "contact@domain.com" },
          { id: "hexColors", label: "Brand Hex Color Codes", required: true, type: "text", placeholder: "#0B1F3A, #1A6FD4" },
          { id: "paymentProvider", label: "Payment Provider", required: true, type: "select", options: [
            { value: "Moneris", label: "Moneris" },
            { value: "Fiserv", label: "Fiserv" },
            { value: "Worldline", label: "Worldline" }
          ]},
          { id: "paymentType", label: "Default Payment Type", required: true, type: "select", options: [
            { value: "pay_go_encashment", label: "Pay-as-you-go (Encashment - Automatic)" },
            { value: "monthly_encashment", label: "Monthly (Encashment - Automatic)" },
            { value: "monthly_invoice", label: "Monthly (Invoice)" },
            { value: "daily_encashment", label: "Daily (Encashment)" }
          ]}
        ]
      },
      {
        stepId: "operator",
        title: "Operator Information (Billing)",
        description: "Operator company details and executive directors.",
        fields: [
          { id: "opName", label: "Operator Company Name", required: true, type: "text", placeholder: "Enter company name" },
          { id: "address", label: "Street & Number", required: true, type: "text", placeholder: "Enter street address" },
          { id: "zipCity", label: "Postal Code & City", required: true, type: "text", placeholder: "Enter postal code and city" },
          { id: "vat", label: "VAT Number", required: true, type: "text", placeholder: "Enter VAT number" },
          { id: "directors", label: "Executive Directors", required: true, type: "text", placeholder: "Enter executive directors" }
        ]
      },
      {
        stepId: "functions",
        title: "Special Automated Functions",
        description: "Automatic check-out, boost function, and webshop rules.",
        fields: [
          { id: "autoCheckout", label: "Automatic Check-Out Enabled", type: "boolean" },
          { id: "minDuration", label: "Min Parking Duration before Auto Check-Out", type: "text", placeholder: "e.g. 24h" },
          { id: "checkInterval", label: "Exceeded Duration Check Interval", type: "text", placeholder: "e.g. 6h" },
          { id: "boostFunction", label: "Boost Function Enabled (Short-term to Smart Select)", type: "boolean" },
          { id: "webshopActive", label: "Product Webshop Function Active", type: "boolean" },
          { id: "autoDeactivate", label: "Auto-Deactivate Medium on Payment Failure", type: "boolean" }
        ]
      },
      {
        stepId: "products",
        title: "Product Packages Configuration",
        description: "Season Parker, Time Cards, Slot Bundles, and Prepaid Cards.",
        fields: [
          { id: "productType", label: "Product Package Type", required: true, type: "select", options: [
            { value: "season_parker", label: "Contract Parker (Season Parker A)" },
            { value: "time_card", label: "Time Card (Week / Month Pass)" },
            { value: "time_slot_bundle", label: "Time Slot Bundle (Pay-per-use slots)" },
            { value: "prepaid", label: "Prepaid Balance Card" }
          ]},
          { id: "pkgName", label: "Product Name", required: true, type: "text", placeholder: "Enter product name" },
          { id: "oneTimeFee", label: "One-Time Fee", required: true, type: "text", placeholder: "e.g. 0 EUR" },
          { id: "recurringFee", label: "Recurring / Price Fee", required: true, type: "text", placeholder: "e.g. 50 EUR / month" },
          { id: "adminApproval", label: "Admin Approval Required before User Activation", type: "boolean" }
        ]
      }
    ]
  },

  "smart-tenant": {
    productId: "smart-tenant",
    productName: "entervo smart tenant",
    excelSource: "smart tenant - project name.xlsx",
    steps: [
      {
        stepId: "tenant",
        title: "General Tenant Portal & Branding",
        description: "Portal subdomain, DKIM sender mail, and brand colors.",
        fields: [
          { id: "subdomain", label: "Tenant Subdomain (tenant.evopark-staging.de/NAME)", required: true, type: "text", placeholder: "e.g. my-tenant-portal" },
          { id: "projectName", label: "Project Name on easy TENANT website", required: true, type: "text", placeholder: "Enter project name" },
          { id: "senderEmail", label: "Sender Email Address (DKIM Verified)", required: true, type: "email", placeholder: "info@domain.com" },
          { id: "hexColors", label: "Design Color Hex Codes", required: true, type: "text", placeholder: "#FEFEFE" },
          { id: "opAccountEmails", label: "Emails of Users Receiving Operator Accounts", required: true, type: "email", placeholder: "admin@company.com" },
          { id: "marketingContact", label: "Marketing Contact Person", type: "text", placeholder: "Enter marketing contact name" }
        ]
      },
      {
        stepId: "garage",
        title: "Parking Garage Information",
        description: "Garage facility attributes, capacity, and VAT rate.",
        fields: [
          { id: "garageName", label: "Garage Name", required: true, type: "text", placeholder: "Enter garage name" },
          { id: "address", label: "Street & Number", required: true, type: "text", placeholder: "Enter street address" },
          { id: "zipCity", label: "Postal Code & City", required: true, type: "text", placeholder: "Enter postal code and city" },
          { id: "currency", label: "Currency (ISO 4217)", required: true, type: "select", options: [
            { value: "EUR", label: "EUR - Euro" },
            { value: "GBP", label: "GBP - British Pound" },
            { value: "USD", label: "USD - US Dollar" }
          ]},
          { id: "totalSpaces", label: "Total Parking Spaces", required: true, type: "number", placeholder: "Enter total spaces" },
          { id: "vatRate", label: "VAT Rate (%)", required: true, type: "text", placeholder: "e.g. 19%" },
          { id: "is247", label: "Opened 24/7", type: "boolean" },
          { id: "qrFallback", label: "QR Code Reader Available as Fallback Medium", type: "boolean" },
          { id: "locationId", label: "S&B Location ID", required: true, type: "text", placeholder: "Enter Location ID" }
        ]
      },
      {
        stepId: "rules",
        title: "Special Automated Features",
        description: "Automatic closing rules and boost function.",
        fields: [
          { id: "autoClose", label: "Automatic Closing Exceeded Stay Feature Enabled", type: "boolean" },
          { id: "minDuration", label: "Min Parking Duration Considered for Auto Closing", type: "text", placeholder: "e.g. 24h" },
          { id: "checkInterval", label: "Duration Exceeded Check Interval", type: "text", placeholder: "e.g. 6h" },
          { id: "boostFunction", label: "Boost Function Enabled (Entrance Ticket Conversion)", type: "boolean" }
        ]
      }
    ]
  }
};
