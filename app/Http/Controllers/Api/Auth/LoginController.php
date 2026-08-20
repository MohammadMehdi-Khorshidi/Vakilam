<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * @throws ValidationException
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => 'required|string|regex:/^09\d{9}$/',
            'password' => 'required|string',
            'device_name' => 'sometimes|string|max:100',
        ]);

        $user = User::query()
            ->where('phone', $data['phone'])
            ->first();

        if (!$user || $user->status !== 'active' || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'phone' => 'The phone number or password is incorrect.',
            ]);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        $token = $user->createToken($data['device_name'] ?? 'web')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully.',
            'token_type' => 'Bearer',
            'access_token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'status' => $user->status,
            ],
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
