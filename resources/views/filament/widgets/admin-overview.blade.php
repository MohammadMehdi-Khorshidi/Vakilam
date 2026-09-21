<x-filament-widgets::widget>
    @include('filament.pages.partials.admin-styles')
    @php($stats = $this->stats())

    <div class="vk-admin">
        <section class="vk-hero">
            <div>
                <span class="vk-eyebrow">وکیلم · مدیریت سامانه</span>
                <h2>داشبورد مدیریت</h2>
                <p>این پنل فقط قابلیت‌هایی را نمایش می‌دهد که در نسخه فعلی وکیلم واقعاً فعال هستند.</p>
            </div>
            <span class="vk-role-chip">
                {{ \App\Support\AdminAccess::isSuperAdmin(auth()->user()) ? 'سوپر ادمین' : 'ادمین' }}
            </span>
        </section>

        <div class="vk-grid vk-stats">
            <div class="vk-stat"><span>کاربران فعال</span><b>{{ number_format($stats['active_users']) }}</b></div>
            <div class="vk-stat"><span>کاربران تعلیق‌شده</span><b>{{ number_format($stats['suspended_users']) }}</b></div>
            <div class="vk-stat"><span>وکلا در انتظار بررسی</span><b>{{ number_format($stats['pending_lawyers']) }}</b></div>
            <div class="vk-stat"><span>درخواست‌های حقوقی</span><b>{{ number_format($stats['legal_requests']) }}</b></div>
            <div class="vk-stat"><span>مشاوره‌ها</span><b>{{ number_format($stats['consultations']) }}</b></div>
        </div>

        <div class="vk-dashboard-columns">
            <section class="vk-card">
                <div class="vk-section-head">
                    <div>
                        <div class="vk-title">وکلا در انتظار بررسی</div>
                        <p class="vk-muted">درخواست‌های واقعی احراز هویت وکیل.</p>
                    </div>
                </div>

                <div class="vk-list">
                    @forelse($this->pendingLawyers() as $item)
                        <div class="vk-list-row">
                            <div>
                                <b>{{ $item->lawyerProfile?->full_name ?: 'وکیل بدون نام' }}</b>
                                <div class="vk-muted">
                                    شماره پروانه: {{ $item->lawyerProfile?->license_number ?: 'ثبت نشده' }}
                                </div>
                            </div>
                            <span class="vk-badge gold">در انتظار</span>
                        </div>
                    @empty
                        <div class="vk-empty">وکیلی منتظر بررسی نیست.</div>
                    @endforelse
                </div>
            </section>

            <section class="vk-card">
                <div class="vk-section-head">
                    <div>
                        <div class="vk-title">آخرین فعالیت‌های مدیریتی</div>
                        <p class="vk-muted">عملیات ثبت‌شده واقعی مدیران.</p>
                    </div>
                </div>

                <div class="vk-list">
                    @forelse($this->recentActions() as $item)
                        <div class="vk-list-row">
                            <div>
                                <b>{{ $item->action_type }}</b>
                                <div class="vk-muted">
                                    {{ trim(($item->admin?->name ?? '').' '.($item->admin?->last_name ?? '')) ?: 'مدیر سامانه' }}
                                    · {{ $item->created_at?->format('Y-m-d H:i') }}
                                </div>
                            </div>
                            <span class="vk-badge">{{ class_basename($item->target_type ?: 'سیستم') }}</span>
                        </div>
                    @empty
                        <div class="vk-empty">هنوز فعالیت مدیریتی ثبت نشده است.</div>
                    @endforelse
                </div>
            </section>
        </div>
    </div>
</x-filament-widgets::widget>
