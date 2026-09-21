<x-filament-widgets::widget>
    @include('filament.pages.partials.admin-styles')
    @php($stats = $this->stats())
    <div class="vk-admin">
        <div class="vk-grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));">
            <div class="vk-stat"><span>کاربران فعال</span><b>{{ number_format($stats['users']) }}</b></div>
            <div class="vk-stat"><span>وکلا در انتظار بررسی</span><b>{{ number_format($stats['pending_lawyers']) }}</b></div>
            <div class="vk-stat"><span>درخواست‌های حقوقی</span><b>{{ number_format($stats['requests']) }}</b></div>
            <div class="vk-stat"><span>مشاوره‌ها</span><b>{{ number_format($stats['consultations']) }}</b></div>
            <div class="vk-stat"><span>پرداخت ناموفق</span><b>{{ number_format($stats['failed_payments']) }}</b></div>
        </div>

        <div class="vk-card" style="margin-top:16px">
            <div class="vk-title">کارهای نیازمند بررسی</div>
            <p class="vk-muted">وکلا در انتظار تأیید، مهم‌ترین کار عملیاتی ادمین در نسخه اولیه هستند.</p>
            <div style="margin-top:12px">
                @forelse($this->pendingLawyers() as $item)
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #eef2f0">
                        <div>
                            <b>{{ $item->lawyerProfile?->full_name ?: 'وکیل بدون نام' }}</b>
                            <div class="vk-muted">شماره پروانه: {{ $item->lawyerProfile?->license_number ?: 'ثبت نشده' }}</div>
                        </div>
                        <span class="vk-badge gold">در انتظار بررسی</span>
                    </div>
                @empty
                    <p class="vk-muted">موردی برای بررسی وجود ندارد.</p>
                @endforelse
            </div>
        </div>
    </div>
</x-filament-widgets::widget>
