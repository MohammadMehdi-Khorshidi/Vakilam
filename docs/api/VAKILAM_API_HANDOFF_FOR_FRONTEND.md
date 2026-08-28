# تحویل API بک‌اند وکیلم برای اتصال فرانت‌اند

**مبنای سورس:** `abolfazl-master` — commit `2041c4cb873b7169e8c33c5e85e4d1f4933e6d8d`

**تاریخ:** 2026-08-28

**مخاطب:** تیم فرانت‌اند (آیدا)

**وضعیت:** قرارداد API فعلی سورس؛ با Route، Controller، Request و Resource تطبیق داده شده و پیش از اتصال نهایی باید Smoke Test اجرا شود.

## 1. تنظیمات اتصال

```text
Backend base URL: http://127.0.0.1:8000/api
Frontend URL:     http://localhost:3000
Content-Type:     application/json
Accept:           application/json
Authorization:    Bearer {access_token}
```

برای endpointهای آپلود فایل، به‌جای JSON از `multipart/form-data` استفاده شود.

پاسخ‌های متداول Laravel:

```json
// 401
{"message":"Unauthenticated."}

// 403
{"message":"This action is unauthorized."}

// 422
{
  "message":"The given data was invalid.",
  "errors":{"field":["Validation message"]}
}
```

## 2. احراز هویت

### `POST /auth/register/send-otp` — عمومی

```json
{"phone":"09123456789"}
```

```json
{
  "message":"Verification code generated.",
  "expires_in":120,
  "resend_after":60,
  "debug_otp":"123456"
}
```

`debug_otp` فقط در محیط `local/testing` برگردانده می‌شود.

### `POST /auth/register/verify-otp` — عمومی

```json
{"phone":"09123456789","otp":"123456"}
```

```json
{
  "message":"Phone number verified.",
  "verification_token":"64-character-token",
  "expires_in":600
}
```

### `POST /auth/register` — عمومی

```json
{
  "first_name":"علی",
  "last_name":"احمدی",
  "phone":"09123456789",
  "password":"Password123!",
  "password_confirmation":"Password123!",
  "role":"client",
  "license_number":null,
  "terms_accepted":true,
  "verification_token":"64-character-token"
}
```

برای `role=lawyer`، مقدار `license_number` الزامی است و باید با رجیستری و شماره موبایل تطابق داشته باشد.

```json
{
  "message":"Registered successfully.",
  "token_type":"Bearer",
  "access_token":"token",
  "user":{
    "id":"uuid",
    "name":"علی",
    "last_name":"احمدی",
    "phone":"09123456789",
    "role":"client",
    "status":"active"
  }
}
```

### `POST /auth/login` — عمومی

```json
{"phone":"09123456789","password":"Password123!","device_name":"web"}
```

```json
{
  "message":"Logged in successfully.",
  "token_type":"Bearer",
  "access_token":"token",
  "user":{"id":"uuid","name":"علی","phone":"09123456789","status":"active"}
}
```

### `POST /auth/logout` — Bearer

```json
{"message":"Logged out successfully."}
```

### بازیابی رمز

| Method | Path | Body اصلی | پاسخ موفق |
|---|---|---|---|
| POST | `/auth/password/forgot/send-otp` | `phone` | `message`, `expires_in`, `resend_after` و در local مقدار `debug_otp` |
| POST | `/auth/password/forgot/verify-otp` | `phone`, `otp` | `message`, `reset_token`, `expires_in` |
| POST | `/auth/password/reset` | `phone`, `reset_token`, `password`, `password_confirmation` | `message` |

### `GET /user` — Bearer

در نسخه فعلی مدل User را مستقیم برمی‌گرداند. فرانت فعلاً روی فیلدهای زیر حساب کند:

```json
{
  "id":"uuid",
  "public_id":"uuid",
  "name":"علی",
  "last_name":"احمدی",
  "email":null,
  "phone":"09123456789",
  "status":"active"
}
```

## 3. داده‌های مرجع و دایرکتوری وکیل

| Method | Path | Auth | ورودی |
|---|---|---|---|
| GET | `/reference/provinces` | خیر | — |
| GET | `/reference/provinces/{province_id}/cities` | خیر | — |
| GET | `/reference/specialties` | خیر | — |
| GET | `/lawyers` | خیر | query: `specialty_id`, `province_id`, `city_id`, `per_page` |
| GET | `/lawyers/{lawyer_public_id}` | خیر | — |

نمونه Lawyer عمومی:

```json
{
  "public_id":"uuid",
  "full_name":"وکیل نمونه",
  "bio":"...",
  "average_rating":"4.50",
  "rating_count":12,
  "is_available":true,
  "specialties":[],
  "service_areas":[]
}
```

فهرست `/lawyers` پاسخ pagination استاندارد Laravel با کلیدهای `data`, `links`, `meta` می‌دهد.

## 4. پروفایل وکیل — Bearer

| Method | Path | Body |
|---|---|---|
| GET | `/lawyer/profile` | — |
| PATCH | `/lawyer/profile` | `first_name`, `last_name`, `bio`, `is_available`, `specialties`, `service_areas` |
| PUT | `/lawyer/profile/specialties` | `specialties[]: {specialty_id, years_experience}` |
| PUT | `/lawyer/profile/service-areas` | `service_areas[]: {province_id, city_id?}` |

نمونه پاسخ پروفایل:

```json
{
  "lawyer_profile":{
    "id":"uuid",
    "public_id":"uuid",
    "first_name":"علی",
    "last_name":"وکیل",
    "full_name":"علی وکیل",
    "phone":"09123456789",
    "license_number":"12345",
    "bio":"...",
    "verification_status":"approved",
    "average_rating":"0.00",
    "rating_count":0,
    "is_available":true,
    "specialties":[],
    "service_areas":[]
  }
}
```

## 5. LegalRequest موکل — Bearer

### قرارداد LegalRequest

```json
{
  "id":"internal-uuid",
  "public_id":"public-uuid",
  "client_user_id":"uuid",
  "title":"عنوان درخواست",
  "description":"شرح مسئله",
  "legal_category_id":"uuid",
  "province_id":1,
  "city_id":1,
  "urgency":"normal",
  "service_intent":"lawyer_selection",
  "status":"draft",
  "submitted_at":null,
  "cancelled_at":null,
  "parties":[],
  "created_at":"2026-08-27T10:00:00.000000Z",
  "updated_at":"2026-08-27T10:00:00.000000Z"
}
```

### Endpointها

| Method | Path | کاربرد/Body | پاسخ اصلی |
|---|---|---|---|
| GET | `/legal-requests` | فهرست درخواست‌های موکل | `active_cases[]` |
| GET | `/legal-requests/draft` | Draft فعال | `legal_request` یا `null` |
| POST | `/legal-requests` | ساخت/بازیابی Draft؛ `description` الزامی | `message`, `legal_request`؛ HTTP 201 برای ساخت و HTTP 200 برای Draft موجود |
| GET | `/legal-requests/{id}` | جزئیات | `legal_request` |
| PATCH | `/legal-requests/{id}` | autosave Draft | `message`, `legal_request` |
| POST | `/legal-requests/{id}/submit` | بدون body | `message`, `legal_request` |
| GET | `/legal-requests/{id}/proposals` | Proposalهای غیر Draft | `proposals[]` |

Body نمونه ساخت/ویرایش:

```json
{
  "title":"اختلاف قراردادی",
  "description":"شرح کامل مسئله",
  "legal_category_id":"uuid",
  "province_id":1,
  "city_id":1,
  "urgency":"normal",
  "service_intent":"lawyer_selection",
  "parties":[
    {"party_role":"plaintiff","full_name":"علی احمدی","is_client":true}
  ]
}
```

## 6. داشبورد و پرونده موکل — Bearer

### `GET /client/dashboard`

```json
{
  "draft_cases":[],
  "active_cases":[]
}
```

نکته اتصال: در commit فعلی، LegalRequest با وضعیت `submitted` داخل این پاسخ نیست. برای مشاهده آن فعلاً از `GET /legal-requests` استفاده شود.

### `GET /client/cases/{legalMatter_id}`

```json
{
  "data":{
    "id":"uuid",
    "public_id":"uuid",
    "title":"عنوان پرونده",
    "status":"onboarding",
    "opened_at":"...",
    "closed_at":null,
    "source_request":{},
    "documents":[],
    "timeline":[],
    "created_at":"..."
  }
}
```

## 7. انتخاب مسیر خدمت — Bearer

### `GET /legal-requests/{id}/service-options`

```json
{
  "legal_request":{"id":"uuid","status":"submitted","service_intent":"lawyer_selection"},
  "options":[]
}
```

### `POST /legal-requests/{id}/service-intent`

```json
{"service_intent":"lawyer_selection"}
```

```json
{"message":"Service intent selected successfully.","legal_request":{},"next_action":{}}
```

## 8. Matching و ارسال درخواست به وکلا — Bearer موکل

| Method | Path | Body | پاسخ |
|---|---|---|---|
| POST | `/legal-requests/{id}/matching` | — | HTTP 201، Match Run + candidates |
| GET | `/legal-requests/{id}/matching?page=1` | — | آخرین Match Run + candidates |
| POST | `/legal-requests/{id}/lawyer-requests` | `lawyer_public_ids`؛ ۱ تا ۵ وکیل | `message`, `data[]`, `meta` |
| GET | `/legal-requests/{id}/consultation-lawyers` | — | `data[]` |

نمونه ارسال به پنج وکیل:

```json
{
  "lawyer_public_ids":["uuid-1","uuid-2"]
}
```

```json
{
  "message":"The legal request was sent to the selected lawyers.",
  "data":[
    {
      "distribution_id":"uuid",
      "status":"sent",
      "sent_at":"...",
      "lawyer":{}
    }
  ],
  "meta":{
    "selection_limit":5,
    "selected_count":1,
    "remaining_count":4
  }
}
```

## 9. درخواست مستقیم همکاری — وضعیت فعلی سورس

### موکل: `POST /legal-requests/{id}/lawyer-selection/{lawyer_profile_id}`

Body ندارد.

```json
{
  "message":"Lawyer collaboration request sent successfully.",
  "distribution":{"id":"uuid","status":"pending"}
}
```

### وکیل: `POST /lawyer/distributions/{distribution_id}/respond`

```json
{"action":"accept"}
```

در سورس فعلی، `accept` مستقیماً Engagement می‌سازد و رقبا را لغو می‌کند:

```json
{
  "message":"Lawyer collaboration request accepted successfully.",
  "distribution":{"id":"uuid","status":"accepted"},
  "engagement":{"id":"uuid","status":"pending_contract"}
}
```

این رفتار برای اتصال آزمایشی مستند شده است؛ تغییر آن به Negotiation قبل از Proposal باید بعد از تست اتصال و تأیید نهایی Workflow انجام شود.

## 10. Proposal و انتخاب نهایی — Bearer

| Method | Path | نقش | Body |
|---|---|---|---|
| POST | `/lawyer/distributions/{distribution_id}/proposal` | وکیل | `summary`, `proposed_fee_rial`, `estimated_days` |
| PATCH | `/lawyer/proposals/{proposal_id}` | وکیل | فیلدهای بالا؛ partial |
| POST | `/lawyer/proposals/{proposal_id}/submit` | وکیل | — |
| POST | `/lawyer/proposals/{proposal_id}/withdraw` | وکیل | — |
| POST | `/lawyer/proposals/{proposal_id}/select` | موکل | — |
| POST | `/legal-requests/{id}/lawyer-selection` | موکل | `proposal_public_id` |
| GET | `/legal-requests/{id}/lawyer-selection` | موکل | انتخاب فعلی |

نمونه Proposal:

```json
{
  "summary":"شرایط پیشنهادی همکاری",
  "proposed_fee_rial":50000000,
  "estimated_days":30
}
```

```json
{
  "message":"Proposal draft created successfully.",
  "proposal":{
    "id":"uuid",
    "public_id":"uuid",
    "status":"draft",
    "summary":"شرایط پیشنهادی همکاری",
    "proposed_fee_rial":50000000,
    "estimated_days":30
  }
}
```

انتخاب از مسیر LegalRequest:

```json
{"proposal_public_id":"uuid"}
```

```json
{
  "message":"The final lawyer was selected successfully.",
  "data":{
    "proposal_public_id":"uuid",
    "summary":"...",
    "proposed_fee_rial":50000000,
    "estimated_days":30,
    "status":"selected",
    "submitted_at":"...",
    "lawyer":{}
  }
}
```

نکته مهم: دو endpoint انتخاب Proposal در سورس وجود دارد، اما رفتار آن‌ها یکسان نیست:

- مسیر `POST /lawyer/proposals/{proposal_id}/select`، Proposal را انتخاب می‌کند، Engagement با وضعیت `pending_contract` می‌سازد و درخواست‌های مستقیم در انتظار را لغو می‌کند.
- مسیر `POST /legal-requests/{id}/lawyer-selection` نیز Proposal را `selected`، Proposalهای رقیب را `rejected` و LegalRequest را `matched` می‌کند و دقیقاً یک Engagement با وضعیت `pending_contract` می‌سازد؛ پاسخ فعلی این مسیر شامل `message` و `data` است.

برای اتصال آزمایشی فرانت که باید به Engagement برسد، مسیر اصلی فعلی این است:

```text
POST /lawyer/proposals/{proposal_id}/select
```

پاسخ موفق این مسیر شامل `message`، `proposal` و `engagement` است و برای ساخت جدید HTTP 201 برمی‌گرداند.

## 11. اسناد — Bearer و `multipart/form-data`

| Method | Path | Body/پاسخ |
|---|---|---|
| GET | `/legal-requests/{id}/documents` | `documents[]` |
| POST | `/legal-requests/{id}/documents` | `title`, `document_type_id?`, `file`؛ HTTP 201 |
| GET | `/legal-matters/{id}/documents` | `documents[]` |
| POST | `/legal-matters/{id}/documents` | `title`, `document_type_id?`, `file`؛ HTTP 201 |
| GET | `/documents/{id}` | `document` |
| GET | `/documents/{id}/download` | فایل stream شده |
| POST | `/documents/{id}/versions` | `file`؛ HTTP 201 |
| DELETE | `/documents/{id}` | `message` |

فرمت مجاز: PDF، JPEG و PNG؛ حداکثر حجم فعلی ۵ مگابایت.

نمونه پاسخ سند:

```json
{
  "message":"Document uploaded successfully.",
  "document":{
    "id":"uuid",
    "public_id":"uuid",
    "title":"قرارداد",
    "status":"active"
  }
}
```

## 12. مشاوره و زمان‌بندی — Bearer

### `POST /lawyer/availabilities`

```json
{
  "starts_at":"2026-08-28T09:00:00Z",
  "ends_at":"2026-08-28T09:30:00Z",
  "note":"جلسه آنلاین"
}
```

```json
{"message":"Availability slot created successfully.","availability":{}}
```

### `GET /legal-requests/{id}/consultation-lawyers/{lawyer_public_id}/slots`

```json
{"data":[],"meta":{"count":0}}
```

### `POST /legal-requests/{id}/consultation-slots/{slot_id}/reserve`

Body ندارد. پاسخ موفق:

```json
{
  "message":"Consultation slot reserved successfully.",
  "consultation":{
    "public_id":"uuid",
    "status":"requested",
    "scheduled_start_at":"...",
    "scheduled_end_at":"..."
  },
  "reservation":{
    "slot_id":"uuid",
    "status":"reserved",
    "reserved_until":"..."
  }
}
```

## 13. مواردی که فرانت فعلاً نباید به‌عنوان API آماده فرض کند

- Negotiation مستقل قبل از Proposal endpoint ندارد.
- فهرست فرصت‌های ورودی/داشبورد کامل وکیل endpoint مشخص ندارد.
- endpoint مشاهده Engagement برای موکل و وکیل وجود ندارد.
- قرارداد، پرداخت و ساخت LegalMatter بعد از پرداخت API عملیاتی کامل ندارند.
- notification عملیاتی وکیل endpoint ندارد.
- درخواست `submitted` در `GET /client/dashboard` نمایش داده نمی‌شود؛ از `GET /legal-requests` استفاده شود.
- هر دو مسیر انتخاب Proposal اکنون Engagement می‌سازند؛ برای یک قرارداد پاسخ ثابت در فرانت، آیدا فقط از `POST /lawyer/proposals/{proposal_id}/select` استفاده کند.

این موارد باید در UI با placeholder یا حالت «در حال توسعه» کنترل شوند و فرانت نباید مسیر فرضی بسازد.

## 14. ترتیب پیشنهادی Smoke Test اتصال آیدا

1. Register OTP → Verify OTP → Register Client
2. Login → ذخیره Bearer token → `GET /user`
3. Reference Provinces/Cities/Specialties
4. Create Draft → Patch Draft → Submit
5. Select `lawyer_selection`
6. Matching → ارسال درخواست به حداکثر ۵ وکیل
7. Login Lawyer → Profile → ساخت Proposal → Submit
8. Login Client → Proposal list → `POST /lawyer/proposals/{proposal_id}/select`
9. بررسی اینکه Engagement ساخته شده و LegalMatter هنوز ساخته نشده است

هر اختلاف واقعی بین پاسخ اجرا و این فایل باید با status code، response body و endpoint ثبت شود تا همان مورد اصلاح شود.