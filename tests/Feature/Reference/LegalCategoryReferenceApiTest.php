<?php

use App\Models\LegalCategory;

test('only active legal categories are publicly listed in sort order', function () {
    $second = LegalCategory::query()->create([
        'code' => 'family',
        'name' => 'Family',
        'status' => true,
        'sort_order' => 20,
    ]);
    $first = LegalCategory::query()->create([
        'code' => 'financial',
        'name' => 'Financial',
        'status' => true,
        'sort_order' => 10,
    ]);
    LegalCategory::query()->create([
        'code' => 'disabled',
        'name' => 'Disabled',
        'status' => false,
        'sort_order' => 1,
    ]);

    $this->getJson('/api/reference/legal-categories')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $first->id)
        ->assertJsonPath('data.1.id', $second->id);
});
