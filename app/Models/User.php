<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property string $id
 * @property string $name
 * @property string $last_name
 * @property string $public_id
 * @property string|null $email
 * @property string $phone
 * @property Carbon|null $phone_verified_at
 * @property Carbon|null $last_login_at
 * @property Carbon|null $deleted_at
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string $status
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'last_name', 'email', 'phone', 'password', 'status'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the columns that should receive unique identifiers.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['id', 'public_id'];
    }


    //Get the client profile associated with the user.
    public function clientProfile()
    {
        return $this->hasOne(ClientProfile::class);
    }

    //Get the lawyer profile associated with the user.
    public function lawyerProfile()
    {
        return $this->hasOne(LawyerProfile::class);
    }

    // A user has many roles.
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    // A user has many consultations.
    public function consultations()
    {
        return $this->hasMany(Consultation::class, 'client_user_id');
    }
    
    // A user has many engagements.
    public function engagements()
    {
        return $this->hasMany(Engagement::class, 'client_user_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'deleted_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
