<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\LegalMatter */
class ClientCaseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'public_id' => $this->public_id,
            'title' => $this->title,
            'status' => $this->status,

            'opened_at' => $this->opened_at?->toISOString(),
            'closed_at' => $this->closed_at?->toISOString(),

            'source_request' => $this->whenLoaded('sourceLegalRequest', function () {
                return [
                    'id' => $this->sourceLegalRequest->id,
                    'public_id' => $this->sourceLegalRequest->public_id,
                    'title' => $this->sourceLegalRequest->title,
                    'description' => $this->sourceLegalRequest->description,
                ];
            }),

            'documents' => DocumentResource::collection(
                $this->whenLoaded('documents')
            ),

            'timeline' => $this->whenLoaded('timelineEvents', function () {
                return $this->timelineEvents
                    ->sortByDesc('occurred_at')
                    ->values()
                    ->map(fn ($event) => [
                        'event_type' => $event->event_type,
                        'summary' => $event->summary,
                        'occurred_at' => $event->occurred_at?->toISOString(),
                    ]);
            }),

            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}