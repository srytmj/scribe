<?php

namespace App\Http\Controllers\Translator;

use App\Http\Controllers\Controller;
use App\Models\Creator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreatorController extends Controller
{
    public function autocomplete(Request $request): JsonResponse
    {
        $search = (string) $request->query('q', '');

        $creators = Creator::query()
            ->when($search !== '', fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->limit(10)
            ->get(['id', 'name']);

        return response()->json($creators);
    }
}
