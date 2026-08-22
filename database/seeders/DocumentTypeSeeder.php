<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $documentTypes = [
            ['code' => 'national_card', 'name' => 'کارت ملی'],
            ['code' => 'birth_certificate', 'name' => 'شناسنامه'],
            ['code' => 'contract', 'name' => 'قرارداد'],
            ['code' => 'petition', 'name' => 'دادخواست'],
            ['code' => 'complaint', 'name' => 'شکواییه'],
            ['code' => 'court_notice', 'name' => 'ابلاغیه'],
            ['code' => 'judgment', 'name' => 'رأی دادگاه'],
            ['code' => 'power_of_attorney', 'name' => 'وکالت‌نامه'],
            ['code' => 'payment_receipt', 'name' => 'رسید پرداخت'],
            ['code' => 'cheque', 'name' => 'چک'],
            ['code' => 'promissory_note', 'name' => 'سفته'],
            ['code' => 'property_deed', 'name' => 'سند مالکیت'],
            ['code' => 'expert_report', 'name' => 'نظریه کارشناسی'],
            ['code' => 'correspondence', 'name' => 'مکاتبات'],
            ['code' => 'image_evidence', 'name' => 'مستندات تصویری'],
            ['code' => 'other', 'name' => 'سایر'],
        ];

        foreach ($documentTypes as $documentType) {
            DocumentType::query()->updateOrCreate(
                ['code' => $documentType['code']],
                [
                    'name' => $documentType['name'],
                    'status' => true,
                ],
            );
        }
    }
}
