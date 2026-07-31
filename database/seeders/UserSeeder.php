<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'Admin Scribe',
            'email' => 'admin@scribe.dev',
        ]);

        User::factory()->translator()->create([
            'name' => 'Translator Demo',
            'email' => 'translator@scribe.dev',
        ]);

        User::factory()->count(2)->translator()->create();
    }
}
