<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Negotiation;
use App\Models\NegotiationAttachment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class NegotiationAttachmentController extends Controller
{
    public function store(Request $request, Negotiation $negotiation): JsonResponse
    {
        $user = $this->participant($request, $negotiation);

        abort_unless(
            in_array($negotiation->status, [
                Negotiation::STATUS_ACTIVE,
                Negotiation::STATUS_PROPOSAL_SUBMITTED,
            ], true),
            409,
            'Temporary files can only be sent while negotiation is active.',
        );

        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'mimetypes:application/pdf,image/jpeg,image/png',
                'max:5120',
            ],
        ]);

        /** @var UploadedFile $file */
        $file = $validated['file'];
        $disk = 'local';
        $extension = strtolower(
            $file->guessExtension()
            ?: $file->getClientOriginalExtension()
        );

        $name = Str::uuid().($extension !== '' ? ".{$extension}" : '');
        $path = $file->storeAs(
            "negotiations/{$negotiation->public_id}/temporary",
            $name,
            $disk,
        );

        abort_unless(is_string($path), 500, 'Temporary file could not be stored.');

        try {
            $attachment = $negotiation->attachments()->create([
                'sender_user_id' => $user->id,
                'disk' => $disk,
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType() ?: $file->getClientMimeType(),
                'size_bytes' => (int) $file->getSize(),
                'expires_at' => now()->addHours(48),
            ]);
        } catch (Throwable $exception) {
            Storage::disk($disk)->delete($path);
            throw $exception;
        }

        $attachment->load('sender:id,public_id,name,last_name');

        return response()->json([
            'message' => 'Temporary negotiation file uploaded.',
            'data' => $this->serialize($attachment),
        ], 201);
    }

    public function download(
        Request $request,
        NegotiationAttachment $attachment,
    ): StreamedResponse {
        $attachment->loadMissing('negotiation');
        $this->participant($request, $attachment->negotiation);

        abort_if(
            $attachment->expires_at === null
            || $attachment->expires_at->isPast(),
            410,
            'This temporary negotiation file has expired.',
        );

        abort_unless(
            Storage::disk($attachment->disk)->exists($attachment->path),
            404,
            'Temporary negotiation file was not found.',
        );

        return Storage::disk($attachment->disk)->download(
            $attachment->path,
            $attachment->original_name,
            ['Content-Type' => $attachment->mime_type],
        );
    }

    private function participant(Request $request, Negotiation $negotiation): User
    {
        $user = $request->user();

        abort_unless($user instanceof User && $user->status === 'active', 403);

        $negotiation->loadMissing([
            'legalRequest:id,client_user_id',
            'lawyerProfile:id,user_id',
        ]);

        $isClient = $negotiation->legalRequest?->client_user_id === $user->id;
        $isLawyer = $negotiation->lawyerProfile?->user_id === $user->id
            && $user->mayActAsRole('lawyer');

        abort_unless($isClient || $isLawyer, 403);

        return $user;
    }

    private function serialize(NegotiationAttachment $attachment): array
    {
        return [
            'public_id' => $attachment->public_id,
            'original_name' => $attachment->original_name,
            'mime_type' => $attachment->mime_type,
            'size_bytes' => (int) $attachment->size_bytes,
            'created_at' => $attachment->created_at,
            'expires_at' => $attachment->expires_at,
            'sender' => $attachment->sender === null ? null : [
                'public_id' => $attachment->sender->public_id,
                'name' => $attachment->sender->name,
                'last_name' => $attachment->sender->last_name,
            ],
        ];
    }
}
