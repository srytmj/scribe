<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        $genres = [
            'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Harem',
            'Horror', 'Isekai', 'Mecha', 'Mystery', 'Psychological', 'Romance',
            'School Life', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural',
            'Thriller', 'Tragedy',
        ];

        foreach ($genres as $name) {
            Genre::firstOrCreate(['name' => $name]);
        }
    }
}
