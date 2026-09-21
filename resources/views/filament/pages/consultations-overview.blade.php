<x-filament-panels::page>
@include('filament.pages.partials.admin-styles')
<div class="vk-admin"><div class="vk-card vk-table-wrap">
<table class="vk-table"><thead><tr><th>موضوع</th><th>موکل</th><th>وکیل</th><th>زمان</th><th>مدت</th><th>مبلغ</th><th>وضعیت</th></tr></thead><tbody>
@foreach($this->consultations() as $item)
<tr>
<td>{{ $item->legalRequest?->title ?: 'مشاوره حقوقی' }}</td>
<td>{{ trim(($item->client?->name ?? '').' '.($item->client?->last_name ?? '')) }}</td>
<td>{{ $item->lawyerProfile?->full_name ?: '—' }}</td>
<td>{{ $item->scheduled_start_at?->format('Y-m-d H:i') ?: '—' }}</td>
<td>{{ $item->duration_minutes ? $item->duration_minutes.' دقیقه' : '—' }}</td>
<td>{{ $item->price_rial ? number_format($item->price_rial).' ریال' : '—' }}</td>
<td><span class="vk-badge">{{ $item->status }}</span></td>
</tr>
@endforeach
</tbody></table></div></div>
</x-filament-panels::page>
