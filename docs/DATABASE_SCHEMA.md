# Database Schema Diagram

## Entity Relationship Diagram

```mermaid
erDiagram
    AUTH_USERS ||--o| PROFILES : "has"
    AUTH_USERS ||--o{ USER_ROLES : "has"
    PROFILES ||--o{ BENEFICIARY_SCHEMES : "enrolls"
    PROFILES ||--o{ PAYMENTS : "receives"
    PROFILES ||--o{ GRIEVANCES : "submits"
    PROFILES ||--o{ FRAUD_ALERTS : "linked"
    WELFARE_SCHEMES ||--o{ BENEFICIARY_SCHEMES : "has"
    WELFARE_SCHEMES ||--o{ PAYMENTS : "funds"
    AUTH_USERS ||--o{ NOTIFICATIONS : "receives"

    AUTH_USERS {
        uuid id PK
        string email
        string phone
        jsonb raw_user_meta_data
        timestamp created_at
    }

    PROFILES {
        uuid id PK
        uuid user_id FK
        string full_name
        string full_name_hindi
        string phone
        date date_of_birth
        string gender
        string aadhaar_masked
        string bank_account_masked
        string address
        string district
        string state
        numeric annual_income
        string employment_status
        string avatar_url
        string verification_status
        boolean email_verified
        boolean phone_verified
        boolean is_disabled
        timestamp verified_at
        uuid verified_by
        string rejection_reason
        timestamp created_at
        timestamp updated_at
    }

    USER_ROLES {
        uuid id PK
        uuid user_id FK
        app_role role
        uuid assigned_by
        timestamp assigned_at
    }

    WELFARE_SCHEMES {
        uuid id PK
        string name
        string name_hindi
        string description
        string description_hindi
        numeric monthly_amount
        integer min_age
        integer max_age
        numeric max_income
        boolean requires_disability
        jsonb eligibility_criteria
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    BENEFICIARY_SCHEMES {
        uuid id PK
        uuid beneficiary_id FK
        uuid scheme_id FK
        scheme_status status
        uuid approved_by
        timestamp approved_at
        string remarks
        timestamp enrolled_at
    }

    PAYMENTS {
        uuid id PK
        uuid beneficiary_id FK
        uuid scheme_id FK
        numeric amount
        payment_status status
        string transaction_id
        date payment_date
        string failure_reason
        integer retry_count
        timestamp processed_at
        timestamp created_at
    }

    GRIEVANCES {
        uuid id PK
        uuid beneficiary_id FK
        string subject
        string category
        string description
        grievance_status status
        uuid assigned_to
        string admin_response
        timestamp resolved_at
        timestamp created_at
        timestamp updated_at
    }

    FRAUD_ALERTS {
        uuid id PK
        uuid beneficiary_id FK
        string alert_type
        string description
        string severity
        string status
        string action_taken
        uuid reviewed_by
        timestamp reviewed_at
        timestamp detected_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string title
        string title_hindi
        string message
        string message_hindi
        string type
        boolean is_read
        timestamp created_at
    }
```

## Data Flow Diagram (Level 1)

```mermaid
flowchart TB
    subgraph External["External Entities"]
        B[("👤 Beneficiary")]
        A[("👔 Admin/Officer")]
        AI[("🤖 AI System")]
    end

    subgraph System["Pension & Welfare System"]
        subgraph Auth["Authentication Layer"]
            AUTH[Auth Service]
        end
        
        subgraph Core["Core Processes"]
            P1[Profile Management]
            P2[Scheme Enrollment]
            P3[Payment Processing]
            P4[Grievance Handling]
            P5[Fraud Detection]
            P6[Notification Service]
        end
        
        subgraph Data["Data Stores"]
            DB_PROFILES[(Profiles)]
            DB_SCHEMES[(Welfare Schemes)]
            DB_PAYMENTS[(Payments)]
            DB_GRIEVANCES[(Grievances)]
            DB_FRAUD[(Fraud Alerts)]
            DB_NOTIF[(Notifications)]
        end
    end

    B -->|Login/Register| AUTH
    AUTH -->|Create Profile| P1
    P1 <-->|Read/Write| DB_PROFILES
    
    B -->|Apply for Scheme| P2
    P2 <-->|Read| DB_SCHEMES
    P2 <-->|Write| DB_PROFILES
    
    A -->|Approve/Reject| P2
    A -->|Process| P3
    P3 <-->|Read/Write| DB_PAYMENTS
    P3 -->|Notify| P6
    
    B -->|Submit Complaint| P4
    P4 <-->|Read/Write| DB_GRIEVANCES
    A -->|Respond| P4
    
    AI -->|Analyze| P5
    P5 <-->|Read/Write| DB_FRAUD
    P5 -->|Alert| P6
    
    P6 <-->|Read/Write| DB_NOTIF
    P6 -->|Push| B
    P6 -->|Push| A
```

## Enums

| Enum Name | Values |
|-----------|--------|
| `app_role` | `super_admin`, `scheme_officer`, `auditor`, `support_staff`, `beneficiary` |
| `scheme_status` | `pending`, `approved`, `rejected`, `suspended` |
| `payment_status` | `pending`, `processing`, `completed`, `failed`, `cancelled` |
| `grievance_status` | `submitted`, `under_review`, `in_progress`, `resolved`, `closed` |
| `beneficiary_status` | `active`, `inactive`, `suspended`, `deceased` |

## Key Relationships

1. **User → Profile**: One-to-one relationship via `user_id`
2. **User → Roles**: One-to-many (user can have multiple roles)
3. **Profile → Schemes**: Many-to-many via `beneficiary_schemes` junction table
4. **Profile → Payments**: One-to-many (beneficiary receives multiple payments)
5. **Profile → Grievances**: One-to-many (beneficiary can submit multiple grievances)
6. **Scheme → Payments**: One-to-many (scheme funds multiple payments)

## Security Model (RLS)

- **Profiles**: Users can only view/edit their own profile; admins can view all
- **Payments**: Users see own payments; admins manage all
- **Grievances**: Users CRUD own grievances; admins can respond
- **Schemes**: Public read for active schemes; admin-only management
- **Fraud Alerts**: Admin-only access
- **User Roles**: Users see own roles; super_admin manages all
