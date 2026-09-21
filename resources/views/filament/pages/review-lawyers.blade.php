<x-filament-panels::page>
@include('filament.pages.partials.admin-styles')
<div class="vk-admin">
    <div class="vk-toolbar">
        <input class="vk-input" wire:model.live.debounce.400ms="search" placeholder="نام، موبایل یا شماره پروانه">
        <select class="vk-select" wire:model.live="filter">
            <option value="pending">در انتظار</option><option value="approved">تأییدشده</option>
            <option value="rejected">ردشده</option><option value="">همه</option>
        </select>
    </div>
    <div class="vk-grid">
        @forelse($this->verifications() as $item)
            <div class="vk-card">
                <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
                    <div>
                        <div class="vk-title">{{ $item->lawyerProfile?->full_name ?: 'بدون نام' }}</div>
                        <div class="vk-muted">موبایل: {{ $item->lawyerProfile?->user?->phone ?: '—' }} · پروانه: {{ $item->lawyerProfile?->license_number ?: '—' }}</div>
                        <div class="vk-muted">تخصص‌ها: {{ $item->lawyerProfile?->specialties?->pluck('name')->join('، ') ?: 'ثبت نشده' }}</div>
                    </div>
                    <span class="vk-badge {{ $item->status === 'rejected' ? 'red' : ($item->status === 'pending' ? 'gold' : '') }}">{{ $item->status }}</span>
                </div>
                @if($item->status === 'pending')
                    <textarea class="vk-textarea" style="margin-top:14px" wire:model.defer="notes.{{ $item->id }}" placeholder="یادداشت بررسی؛ برای رد کردن اجباری است"></textarea>
                    <div class="vk-actions">
                        <button class="vk-btn" wire:click="approve('{{ $item->id }}')">تأیید وکیل</button>
                        <button class="vk-btn red" wire:click="reject('{{ $item->id }}')">رد با دلیل</button>
                    </div>
                @else
                    <p class="vk-muted" style="margin-top:12px">یادداشت بررسی: {{ $item->review_note ?: '—' }}</p>
                @endif
            </div>
        @empty
            <div class="vk-card"><p class="vk-muted">موردی پیدا نشد.</p></div>
        @endforelse
    </div>
</div>
</x-filament-panels::page>
