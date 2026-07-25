<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\StoreVolumeRequest;
use App\Http\Requests\Dashboard\UpdateVolumeRequest;
use App\Models\Novel;
use App\Models\Volume;
use Illuminate\Http\RedirectResponse;

class VolumeController extends Controller
{
    public function store(StoreVolumeRequest $request, Novel $novel): RedirectResponse
    {
        $novel->volumes()->create($request->validated());

        return redirect()->route('dashboard.novels.edit', $novel)->with('success', 'Volume created.');
    }

    public function update(UpdateVolumeRequest $request, Novel $novel, Volume $volume): RedirectResponse
    {
        abort_unless($volume->novel_id === $novel->id, 404);

        $volume->update($request->validated());

        return redirect()->route('dashboard.novels.edit', $novel)->with('success', 'Volume updated.');
    }

    public function destroy(Novel $novel, Volume $volume): RedirectResponse
    {
        $this->authorize('update', $novel);
        abort_unless($volume->novel_id === $novel->id, 404);

        $volume->delete();

        return redirect()->route('dashboard.novels.edit', $novel)->with('success', 'Volume deleted.');
    }
}
