<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
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
#[Fillable(['name', 'last_name', 'email', 'phone', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements FilamentUser, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, Notifiable, PasskeyAuthenticatable, SoftDeletes, TwoFactorAuthenticatable;

    /**
     * Generate UUIDs for both the primary key and the public identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['id', 'public_id'];
    }

    /** The user's single client profile. */
    public function clientProfile()
    {
        return $this->hasOne(ClientProfile::class);
    }

    /** The user's single lawyer profile. */
    public function lawyerProfile()
    {
        return $this->hasOne(LawyerProfile::class);
    }

    /** Role assignment records for this user. */
    public function roleAssignments()
    {
        return $this->hasMany(UserRole::class);
    }

    /** Roles assigned to the user through user_roles. */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->using(UserRole::class)
            ->withPivot(['id', 'granted_at', 'revoked_at'])
            ->wherePivotNull('revoked_at');
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $panel->getId() === 'admin'
            && $this->status === 'active'
            && $this->roles()->where('code', 'admin')->exists();
    }

    /** Legal requests created by this user as a client. */
    public function legalRequests()
    {
        return $this->hasMany(LegalRequest::class, 'client_user_id');
    }

    /** Consultations requested by this user as a client. */
    public function consultations()
    {
        return $this->hasMany(Consultation::class, 'client_user_id');
    }

    /** Engagements in which this user is the client. */
    public function engagements()
    {
        return $this->hasMany(Engagement::class, 'client_user_id');
    }

    /** Legal matters owned by this user as the client. */
    public function legalMatters()
    {
        return $this->hasMany(LegalMatter::class, 'client_user_id');
    }

    /** Reserved matter membership metadata; this relation does not grant matter access. */
    public function matterMemberships()
    {
        return $this->hasMany(MatterMember::class);
    }

    /** Reserved member records; client/lawyer access is derived from the matter engagement. */
    public function memberMatters()
    {
        return $this->belongsToMany(LegalMatter::class, 'matter_members', 'user_id', 'legal_matter_id')
            ->withPivot(['id', 'member_role', 'joined_at', 'revoked_at']);
    }

    /** Matter actions assigned to this user. */
    public function assignedMatterActions()
    {
        return $this->hasMany(MatterAction::class, 'assigned_user_id');
    }

    /** Matter timeline events performed by this user. */
    public function matterTimelineEvents()
    {
        return $this->hasMany(MatterTimeline::class, 'actor_user_id');
    }

    /** Lawyer verification records reviewed by this user. */
    public function reviewedLawyerVerifications()
    {
        return $this->hasMany(LawyerVerification::class, 'reviewed_by');
    }

    /** Administrative actions performed by this user. */
    public function adminActions()
    {
        return $this->hasMany(AdminAction::class, 'admin_user_id');
    }

    /** Audit log entries attributed to this user. */
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class, 'actor_user_id');
    }

    /** Reviews submitted by this user. */
    public function reviews()
    {
        return $this->hasMany(Review::class, 'reviewer_user_id');
    }

    /**
     * Application-specific notification rows.
     * Named userNotifications() so it does not override Laravel Notifiable::notifications().
     */
    public function userNotifications()
    {
        return $this->hasMany(UserNotification::class);
    }

    /** Contract versions authored by this user. */
    public function createdContractVersions()
    {
        return $this->hasMany(ContractVersion::class, 'created_by');
    }

    /** Contract signatures belonging to this user. */
    public function contractSignatures()
    {
        return $this->hasMany(ContractSignature::class, 'signer_user_id');
    }

    /** Invoices issued to this user as a client. */
    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'client_user_id');
    }

    /** Payments made by this user. */
    public function payments()
    {
        return $this->hasMany(Payment::class, 'payer_user_id');
    }

    /** AI interactions initiated for this user. */
    public function aiInteractions()
    {
        return $this->hasMany(AiInteraction::class);
    }

    /** Files uploaded by this user. */
    public function uploadedFiles()
    {
        return $this->hasMany(StoredFile::class, 'uploaded_by');
    }

    /** Documents owned by this user. */
    public function ownedDocuments()
    {
        return $this->hasMany(Document::class, 'owner_user_id');
    }

    /** Document versions uploaded by this user. */
    public function uploadedDocumentVersions()
    {
        return $this->hasMany(DocumentVersion::class, 'uploaded_by');
    }

    /** Conversation participant records for this user. */
    public function conversationParticipations()
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    /** Conversations in which this user participates. */
    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants')
            ->withPivot(['id', 'joined_at', 'left_at']);
    }

    /** Messages sent by this user. */
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_user_id');
    }

    /** Immutable messages sent during pre-contract negotiations. */
    public function sentNegotiationMessages()
    {
        return $this->hasMany(NegotiationMessage::class, 'sender_user_id');
    }

    /** Meetings organized by this user. */
    public function organizedMeetings()
    {
        return $this->hasMany(Meeting::class, 'organizer_user_id');
    }

    public function policyAcceptances(): HasMany
    {
        return $this->hasMany(UserPolicyAcceptance::class, 'user_id');
    }

    public function acceptedPolicies(): BelongsToMany
    {
        return $this->belongsToMany(
            Policy::class,
            'user_policy_acceptances',
            'user_id',
            'policy_id'
        )->withPivot(['accepted_at', 'ip_address', 'user_agent'])
            ->withTimestamps(false);
    }

    // Helper مفید
    public function hasAcceptedPolicy(string $type): bool
    {
        $current = Policy::currentOfType($type);
        if (! $current) {
            return false;
        }

        return $this->policyAcceptances()
            ->where('policy_id', $current->id)
            ->exists();
    }

    /**
     * Cast database values to useful PHP types.
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
