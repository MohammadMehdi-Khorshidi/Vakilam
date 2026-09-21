<x-filament-panels::page>
@include('filament.pages.partials.admin-styles')
<div class="vk-admin"><div class="vk-card vk-table-wrap">
<table class="vk-table"><thead><tr><th>مدیر</th><th>عملیات</th><th>هدف</th><th>دلیل</th><th>زمان</th></tr></thead><tbody>
@foreach($this->actions() as $item)
<tr>
<td>{{ trim(($item->admin?->name ?? '').' '.($item->admin?->last_name ?? '')) }}</td>
<td><span class="vk-badge">{{ $item->action_type }}</span></td><td>{{ class_basename($item->target_type ?: '—') }}<div class="vk-muted">{{ $item->target_id }}</div></td>
<td>{{ $item->reason ?: '—' }}</td><td>{{ $item->created_at?->format('Y-m-d H:i:s') }}</td>
</tr>
@endforeach
</tbody></table></div></div>
</x-filament-panels::page>
