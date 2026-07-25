<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Creator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreatorController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $query = (string) $request->query('q', '');

        $creators = Creator::query()
            ->when($query !== '', fn ($builder) => $builder->where('name', 'ILIKE', "%{$query}%"))
            ->orderBy('name')
            ->limit(10)
            ->get(['id', 'name']);

        return response()->json($creators);
    }
}
