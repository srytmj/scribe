<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['sso_id', 'name', 'username', 'email', 'avatar', 'sso_role', 'role', 'bio', 'donation_url', 'access_token', 'refresh_token', 'token_expires_at'])]
#[Hidden(['access_token', 'refresh_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'access_token' => 'encrypted',
            'refresh_token' => 'encrypted',
            'token_expires_at' => 'datetime',
        ];
    }

    public function isPending(): bool
    {
        return $this->role === 'pending';
    }

    public function isTranslator(): bool
    {
        return $this->role === 'translator';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function novels(): HasMany
    {
        return $this->hasMany(Novel::class);
    }
}
