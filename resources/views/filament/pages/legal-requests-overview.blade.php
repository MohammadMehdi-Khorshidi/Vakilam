<x-filament-panels::page>
@include('filament.pages.partials.admin-styles')
<div class="vk-admin">
    <div class="vk-toolbar"><input class="vk-input" wire:model.live.debounce.400ms="search" placeholder="جستجوی درخواست یا موبایل موکل"></div>
    <div class="vk-card vk-table-wrap">
        <table class="vk-table"><thead><tr><th>درخواست</th><th>موکل</th><th>دسته‌بندی</th><th>موقعیت</th><th>مسیر</th><th>وضعیت</th></tr></thead><tbody>
        @foreach($this->requests() as $item)
            <tr>
                <td><b>{{ $item->title ?: 'درخواست حقوقی' }}</b><div class="vk-muted">{{ \Illuminate\Support\Str::limit($item->description, 90) }}</div></td>
                <td>{{ trim(($item->client?->name ?? '').' '.($item->client?->last_name ?? '')) }}<div class="vk-muted">{{ $item->client?->phone }}</div></td>
                <td>{{ $item->legalCategory?->name ?: '—' }}</td>
                <td>{{ collect([$item->province?->name, $item->city?->name])->filter()->join('، ') ?: '—' }}</td>
                <td>{{ $item->service_intent ?: '—' }}</td><td><span class="vk-badge">{{ $item->status }}</span></td>
            </tr>
        @endforeach
        </tbody></table>
    </div>
</div>
</x-filament-panels::page>
