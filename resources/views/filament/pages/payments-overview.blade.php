<x-filament-panels::page>
@include('filament.pages.partials.admin-styles')
<div class="vk-admin"><div class="vk-card vk-table-wrap">
<table class="vk-table"><thead><tr><th>پرداخت‌کننده</th><th>مبلغ</th><th>درگاه</th><th>شناسه درگاه</th><th>فاکتور</th><th>وضعیت</th><th>تاریخ</th></tr></thead><tbody>
@foreach($this->payments() as $item)
<tr>
<td>{{ trim(($item->payer?->name ?? '').' '.($item->payer?->last_name ?? '')) }}<div class="vk-muted">{{ $item->payer?->phone }}</div></td>
<td>{{ number_format($item->amount_rial) }} ریال</td><td>{{ $item->gateway ?: '—' }}</td><td>{{ $item->gateway_ref ?: '—' }}</td>
<td>{{ $item->invoice?->public_id ?: '—' }}</td><td><span class="vk-badge {{ $item->status === 'failed' ? 'red' : '' }}">{{ $item->status }}</span></td>
<td>{{ $item->created_at?->format('Y-m-d H:i') }}</td>
</tr>
@endforeach
</tbody></table></div></div>
</x-filament-panels::page>
