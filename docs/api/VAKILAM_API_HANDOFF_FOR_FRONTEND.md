# تحویل API بک‌اند وکیلم برای فرانت‌اند — Flow جدید

**Data:** 2026-08-29
**Flow مرجع:** `Submitted LegalRequest → Matching/Interest → Negotiation → Final Proposal → Client Selection → Engagement → Confirmations → Contract → Payment → LegalMatter`

## قواعد اصلی

- پذیرش دعوت مستقیم وکیل **Engagement نمی‌سازد**؛ فقط Negotiation را باز می‌کند.
- موکل می‌تواند هم‌زمان با چند وکیل Negotiation فعال داشته باشد.
- Proposal نهایی فقط از Negotiation معتبر ساخته می‌شود.
- Proposal از `submitted_at` خودش 72 ساعت اعتبار دارد و expiry آن مستقل از Distribution است.
- انتخاب یک Final Proposal دقیقاً یک Engagement می‌سازد و رقبا را cancel می‌کند.
- Engagement یک پنجره مستقل 48 ساعته برای تأیید اولیه، امضای قرارداد و پرداخت دارد.
- `LegalMatter` فقط بعد از Payment موفق ساخته و `active` می‌شود.
- «Open Proposal» قدیمی در Flow جدید به **Lawyer Interest → Client Accept → Negotiation → Final Proposal** تبدیل شده است؛ وکیل دعوت‌نشده Final Proposal را بدون مذاکره نمی‌فرستد.

## Auth

- `POST /auth/login`
- `GET /user`
- `POST /auth/logout`
- Register/OTP و Password Reset طبق APIهای قبلی فعال‌اند.

## LegalRequest و Matching

- `GET /legal-requests`
- `GET /legal-requests/draft`
- `POST /legal-requests`
- `GET /legal-requests/{legalRequest}`
- `PATCH /legal-requests/{legalRequest}`
- `POST /legal-requests/{legalRequest}/submit`
- `GET /legal-requests/{legalRequest}/service-options`
- `POST /legal-requests/{legalRequest}/service-intent`
- `POST /legal-requests/{legalRequest}/matching`
- `GET /legal-requests/{legalRequest}/matching`
- `POST /legal-requests/{legalRequest}/lawyer-requests` — ارسال دعوت به 1 تا 5 وکیل Matching شده
- `POST /legal-requests/{legalRequest}/lawyer-selection/{lawyer_public_id}` — compatibility برای دعوت یک وکیل

### پاسخ وکیل به دعوت مستقیم

`POST /lawyer/distributions/{distribution_id}/respond`

```json
{"action":"accept"}
```

Accept خروجی `negotiation.public_id` می‌دهد و `engagement` برابر `null` است.

## فرصت عمومی / Interest وکیل

- `GET /lawyer/open-opportunities` — LegalRequestهای submitted و واجد شرایط؛ بدون اسناد و اطلاعات حساس
- `POST /lawyer/legal-requests/{legalRequest}/interest` — اعلام علاقه وکیل دعوت‌نشده
- `GET /legal-requests/{legalRequest}/lawyer-interests` — برای موکل
- `POST /legal-requests/{legalRequest}/lawyer-interests/{distribution_id}/respond`

Body:

```json
{"action":"accept"}
```

Accept موکل Negotiation را باز می‌کند. Reject فقط همان Interest را می‌بندد.

## Negotiation

- `GET /legal-requests/{legalRequest}/negotiations` — موکل
- `GET /lawyer/negotiations` — وکیل
- `GET /negotiations/{negotiation_public_id}`
- `POST /negotiations/{negotiation_public_id}/messages`
- `POST /negotiations/{negotiation_public_id}/close`
- `POST /negotiations/{negotiation_public_id}/proposal` — ساخت Draft Final Proposal توسط وکیل

Message body:

```json
{"body":"متن مذاکره"}
```

Draft Proposal body:

```json
{
  "summary":"توضیح نهایی",
  "service_scope":"دامنه خدمت",
  "proposed_fee_rial":90000000,
  "estimated_days":40
}
```

## Final Proposal

- `PATCH /lawyer/proposals/{proposal_public_id}` — ویرایش Draft
- `POST /lawyer/proposals/{proposal_public_id}/submit` — Submit Final Proposal و شروع اعتبار 72 ساعته
- `POST /lawyer/proposals/{proposal_public_id}/withdraw`
- `GET /lawyer/proposals` — پیشنهادهای وکیل
- `GET /legal-requests/{legalRequest}/proposals` — Proposalهای موکل

Canonical انتخاب برنده توسط موکل:

`POST /legal-requests/{legalRequest}/proposals/{proposal_public_id}/select`

نتیجه:

- Proposal برنده: `selected`
- Negotiation برنده: `won`
- Proposal/Negotiation/Distribution رقبا: `cancelled`
- دقیقاً یک Engagement: `pending_contract`
- `contract_due_at`: 48 ساعت بعد از انتخاب

مسیرهای قدیمی `/lawyer/proposals/{proposal}/select` و `/legal-requests/{legalRequest}/lawyer-selection` فقط compatibility/deprecated هستند و همان Service مرکزی را صدا می‌زنند.

## Engagement

- `GET /engagements/{engagement_public_id}`
- `GET /legal-requests/{legalRequest}/engagement`
- `GET /lawyer/engagements`
- `POST /engagements/{engagement_public_id}/confirm`

Client و Lawyer هرکدام مستقل Confirm می‌کنند. پس از Confirm هر دو، Contract نسخه 1 ساخته و وارد `signing` می‌شود.

## Contract

- `GET /contracts/{contract_public_id}`
- `POST /contracts/{contract_public_id}/sign`

پس از امضای هر دو طرف:

- Contract: `approved`
- ContractVersion: `executed`
- Invoice با مبلغ Final Proposal: `issued`
- `due_at` همان deadline مستقل 48 ساعته Engagement است.

## Payment

### ایجاد Payment attempt توسط موکل

`POST /invoices/{invoice_public_id}/payments`

Header اجباری:

```text
Idempotency-Key: 16-to-64-character-key
```

مبلغ از Invoice گرفته می‌شود و از Client پذیرفته نمی‌شود.

### نتیجه Gateway

`POST /payments/{payment_public_id}/webhook`

Header:

```text
X-Payment-Webhook-Secret: <PAYMENT_WEBHOOK_SECRET>
```

Body:

```json
{"status":"succeeded","gateway_ref":"gateway-reference"}
```

یا:

```json
{"status":"failed"}
```

این webhook یک adapter کنترل‌شده است. در محیط Production باید Secret و اعتبارسنجی Callback با Provider واقعی تنظیم شود.

### Payment موفق

به‌صورت اتمیک:

1. Payment → `succeeded`
2. Invoice → `paid`
3. Contract → `active`
4. Engagement → `active`
5. LegalRequest → `in_progress`
6. دقیقاً یک LegalMatter → `active`

Webhook retry idempotent است و Matter تکراری نمی‌سازد.

## Workspace وکیل

- `GET /lawyer/opportunities`
- `GET /lawyer/open-opportunities`
- `GET /lawyer/negotiations`
- `GET /lawyer/proposals`
- `GET /lawyer/engagements`

## Environment جدید

`.env.example`:

```text
PAYMENT_WEBHOOK_SECRET=
```

در Production مقدار قوی و محرمانه تنظیم شود.
