<x-filament-panels::page>
@include('filament.pages.partials.admin-styles')
<div class="vk-admin">
    <div class="vk-toolbar">
        <input class="vk-input" wire:model.live.debounce.400ms="search" placeholder="جستجو با نام، موبایل یا شناسه">
        <select class="vk-select" wire:model.live="status">
            <option value="">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="suspended">تعلیق‌شده</option>
            <option value="closed">بسته</option>
        </select>
    </div>
    <div class="vk-card vk-table-wrap">
        <table class="vk-table">
            <thead><tr><th>کاربر</th><th>موبایل</th><th>نقش‌ها</th><th>وضعیت</th><th>اقدام مدیریتی</th></tr></thead>
            <tbody>
            @foreach($this->users() as $user)
                <tr>
                    <td><b>{{ trim($user->name.' '.$user->last_name) }}</b><div class="vk-muted">{{ $user->public_id }}</div></td>
                    <td>{{ $user->phone }}</td>
                    <td>{{ $user->roles->pluck('name')->join('، ') ?: '—' }}</td>
                    <td><span class="vk-badge {{ $user->status === 'suspended' ? 'red' : '' }}">{{ $user->status }}</span></td>
                    <td style="min-width:270px">
                        <input class="vk-input" style="min-width:220px" wire:model.defer="reasons.{{ $user->id }}" placeholder="دلیل/توضیح برای کاربر">
                        <div class="vk-actions">
                            @if($user->status === 'active')
                                <button class="vk-btn red" wire:click="suspend('{{ $user->id }}')">تعلیق</button>
                            @elseif($user->status === 'suspended')
                                <button class="vk-btn" wire:click="activate('{{ $user->id }}')">فعال‌سازی</button>
                            @endif
                        </div>
                    </td>
                </tr>
            @endforeach
            </tbody>
        </table>
    </div>
</div>
</x-filament-panels::page>
