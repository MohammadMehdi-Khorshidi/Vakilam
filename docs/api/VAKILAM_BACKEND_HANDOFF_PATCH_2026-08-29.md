# VAKILAM Backend Handoff Patch — 2026-08-29

**Base source:** `VAKILAM_LATEST_SOURCE.zip`  
**Base commit recorded in source docs:** `2041c4cb873b7169e8c33c5e85e4d1f4933e6d8d`

## اصلاحات انجام‌شده

1. Login و `GET /api/user` اکنون `role`، `roles`، `profile.status` و `next_step` را برمی‌گردانند.
2. Middleware سراسری Active User برای APIهای محافظت‌شده اضافه شد؛ Token قدیمی کاربر suspended دیگر اجازهٔ استفاده از API را نمی‌دهد.
3. صندوق ورودی وکیل اضافه شد: `GET /api/lawyer/opportunities` و `distribution_id` هر درخواست را برمی‌گرداند.
4. فهرست Proposalهای وکیل اضافه شد: `GET /api/lawyer/proposals`؛ Draftها بعد از Reload قابل بازیابی‌اند.
5. فهرست Engagementهای وکیل اضافه شد: `GET /api/lawyer/engagements`.
6. Dashboard موکل اکنون `submitted_requests`/`matched` را تا قبل از LegalMatter نگه می‌دارد.
7. API مشاهده Engagement اضافه شد:
   - `GET /api/engagements/{engagement_public_id}`
   - `GET /api/legal-requests/{legalRequest}/engagement`
8. Route درخواست مستقیم موکل اکنون `lawyer_public_id` می‌گیرد.
9. Routeهای Update/Submit/Withdraw/Select Proposal اکنون `proposal_public_id` می‌گیرند.
10. منطق انتخاب Proposal در `ProposalSelectionService` متمرکز شد؛ endpoint قدیمی Final Selection نیز به همین سرویس متصل است.
11. Role revoke وکیل در Proposal/Respond/Workspace enforce می‌شود؛ حساب‌های Legacy بدون role history فقط در صورت داشتن LawyerProfile سازگار باقی می‌مانند.
12. تغییر `service_intent` بعد از شروع Flow مسدود شد.
13. Password Reset دیگر وجود یا عدم وجود شماره موبایل را در Response عمومی افشا نمی‌کند.
14. پذیرش Terms در صورت وجود `terms_of_service` جاری در جدول `policies` داخل `user_policy_acceptances` ثبت می‌شود.
15. مسیر ثبت‌نام وب Legacy که OTP/Role flow را دور می‌زد غیرفعال شد؛ ثبت‌نام مرجع از API موبایل است.
16. `.env.example` بدون Secret اضافه شد.
17. تعارض دو Vite config ریشه حذف شد؛ `vite.config.js` نگه داشته شد و `resources/css/app.css` اضافه شد.
18. مستند API آیدا با Routeها و Responseهای جدید بازنویسی شد.
19. Testهای جدید برای Login Role، Active User، Lawyer Workspace، Engagement Read، Revoked Lawyer Role، Password Enumeration، Policy Acceptance و Service Intent Lock اضافه شد.

## اعتبارسنجی انجام‌شده در محیط Patch

- PHP CLI موجود بود.
- تمام فایل‌های PHP در `app/`, `bootstrap/`, `config/`, `database/`, `routes/`, `tests/` lint شدند.
- نتیجه: `260` فایل، `0` خطای Syntax.

## محدودیت اعتبارسنجی

در ZIP ورودی `vendor/` وجود نداشت و Composer در محیط Patch نصب نبود؛ بنابراین اجرای واقعی Laravel Test Suite و `route:list` در این محیط ممکن نبود. تلاش برای `npm ci` نیز به دلیل دسترسی شبکه/timeout کامل نشد و `node_modules` حاصل از تلاش حذف شد.

پس قبل از Merge روی محیط توسعهٔ پروژه این‌ها باید اجرا شوند:

```powershell
composer install
php artisan optimize:clear
php artisan migrate:fresh --seed
php artisan route:list
php artisan test
npm ci
npm run build
```

و Test Suite حداقل یک بار روی MySQL مشابه محیط مقصد اجرا شود.

## مواردی که عمداً در این Patch «آماده» اعلام نشده‌اند

این‌ها Bug کوچک Handoff نیستند و به Flow محصول/Feature مستقل نیاز دارند:

- Negotiation مستقل قبل از Final Proposal
- Final Proposal دارای `negotiation_id`
- Open Proposal عمومی وکیل دعوت‌نشده
- Contract/Payment عملیاتی کامل
- Guard تشکیل LegalMatter بعد از Payment موفق
- AI Assistant کامل
- Unique دیتابیسی قطعی برای Active Roleهای `user_roles` در MySQL
- Seed/محتوای حقوقی Policyهای واقعی؛ Patch فقط پذیرش Policy جاریِ از قبل تنظیم‌شده را ثبت می‌کند

## Endpoint مرجع انتخاب Proposal برای فرانت

Front جدید فقط از این مسیر استفاده کند:

```text
POST /api/lawyer/proposals/{proposal_public_id}/select
```

مسیر قدیمی LegalRequest Final Selection فقط برای Compatibility باقی مانده و Business Logic آن به همان Selection Service مشترک متصل شده است.
