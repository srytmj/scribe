<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $menus = [
            // Admin sidebar
            [
                'key' => 'admin.dashboard',
                'label' => 'Dashboard',
                'icon' => 'layout-dashboard',
                'route_name' => 'admin.dashboard',
                'sort_order' => 1,
                'role_access' => ['admin'],
            ],
            [
                'key' => 'admin.novels',
                'label' => 'Novel',
                'icon' => 'book-open',
                'route_name' => 'admin.novels.index',
                'sort_order' => 2,
                'role_access' => ['admin'],
            ],
            [
                'key' => 'admin.users',
                'label' => 'Pengguna',
                'icon' => 'users',
                'route_name' => 'admin.users.index',
                'sort_order' => 3,
                'role_access' => ['admin'],
            ],
            [
                'key' => 'admin.tickets',
                'label' => 'Tiket',
                'icon' => 'ticket',
                'route_name' => 'admin.tickets.index',
                'sort_order' => 4,
                'role_access' => ['admin'],
            ],
            [
                'key' => 'admin.activity-logs',
                'label' => 'Log Aktivitas',
                'icon' => 'activity',
                'route_name' => 'admin.activity-logs.index',
                'sort_order' => 5,
                'role_access' => ['admin'],
            ],
            [
                'key' => 'admin.menus',
                'label' => 'Menu',
                'icon' => 'menu',
                'route_name' => 'admin.menus.index',
                'sort_order' => 6,
                'role_access' => ['admin'],
            ],
            [
                'key' => 'admin.announcements',
                'label' => 'Pengumuman',
                'icon' => 'megaphone',
                'route_name' => 'admin.announcements.index',
                'sort_order' => 7,
                'role_access' => ['admin'],
            ],
            [
                'key' => 'admin.anilist',
                'label' => 'AniList Search',
                'icon' => 'search',
                'route_name' => 'admin.anilist.index',
                'sort_order' => 8,
                'role_access' => ['admin'],
            ],
            [
                'key' => 'admin.settings',
                'label' => 'Pengaturan',
                'icon' => 'settings',
                'route_name' => 'admin.settings.index',
                'sort_order' => 9,
                'role_access' => ['admin'],
            ],

            // Translator sidebar
            [
                'key' => 'translator.dashboard',
                'label' => 'Dashboard',
                'icon' => 'layout-dashboard',
                'route_name' => 'translator.dashboard',
                'sort_order' => 1,
                'role_access' => ['translator'],
            ],
            [
                'key' => 'translator.novels',
                'label' => 'Novel Saya',
                'icon' => 'book-open',
                'route_name' => 'translator.novels.index',
                'sort_order' => 2,
                'role_access' => ['translator'],
            ],
            [
                'key' => 'translator.tickets',
                'label' => 'Tiket',
                'icon' => 'ticket',
                'route_name' => 'translator.tickets.index',
                'sort_order' => 3,
                'role_access' => ['translator'],
            ],

            // Shared — profil (translator & admin), read-only dari SSO
            [
                'key' => 'settings',
                'label' => 'Profil',
                'icon' => 'user',
                'route_name' => 'settings.index',
                'sort_order' => 99,
                'role_access' => ['translator', 'admin'],
            ],
        ];

        foreach ($menus as $menu) {
            Menu::updateOrCreate(['key' => $menu['key']], $menu);
        }
    }
}
