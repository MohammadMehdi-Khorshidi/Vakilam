<x-filament-panels::page>
@include('filament.pages.partials.admin-styles')
<div class="vk-admin">
    <div class="vk-card" style="margin-bottom:16px">
        <div class="vk-title">اصل امنیتی سوپر ادمین</div>
        <p class="vk-muted">از این صفحه فقط نقش «ادمین» داده یا گرفته می‌شود. ایجاد سوپر ادمین جدید عمداً فقط از CLI سرور ممکن است.</p>
    </div>
    <div class="vk-toolbar"><input class="vk-input" wire:model.live.debounce.400ms="search" placeholder="جستجوی کاربر"></div>
    <div class="vk-card vk-table-wrap">
        <table class="vk-table"><thead><tr><th>کاربر</th><th>موبایل</th><th>نقش‌ها</th><th>دلیل</th><th>اقدام</th></tr></thead><tbody>
        @foreach($this->users() as $user)
            @php($codes = $user->roles->pluck('code'))
            <tr>
                <td><b>{{ trim($user->name.' '.$user->last_name) }}</b></td><td>{{ $user->phone }}</td>
                <td>{{ $user->roles->pluck('name')->join('، ') ?: '—' }}</td>
                <td><input class="vk-input" style="min-width:200px" wire:model.defer="reasons.{{ $user->id }}" placeholder="توضیح تغییر دسترسی"></td>
                <td>
                    @if($codes->contains('super_admin'))
                        <span class="vk-badge gold">سوپر ادمین</span>
                    @elseif($codes->contains('admin'))
                        <button class="vk-btn red" wire:click="revoke('{{ $user->id }}')">لغو ادمین</button>
                    @else
                        <button class="vk-btn" wire:click="grant('{{ $user->id }}')">اعطای ادمین</button>
                    @endif
                </td>
            </tr>
        @endforeach
        </tbody></table>
    </div>
</div>
</x-filament-panels::page>
