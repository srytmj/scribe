<?php

namespace App\Http\Controllers\Translator;

use App\Http\Controllers\Controller;
use App\Http\Requests\Translator\StoreVolumeRequest;
use App\Http\Requests\Translator\UpdateVolumeRequest;
use App\Models\Novel;
use App\Models\Volume;
use Illuminate\Http\RedirectResponse;

class VolumeController extends Controller
{
    public function store(StoreVolumeRequest $request, Novel $novel): RedirectResponse
    {
        $this->authorize('update', $novel);
        $this->authorize('create', Volume::class);

        $novel->volumes()->create($request->validated());

        return redirect()->route('translator.novels.edit', $novel)
            ->with('success', 'Volume berhasil ditambahkan.');
    }

    public function update(UpdateVolumeRequest $request, Volume $volume): RedirectResponse
    {
        $this->authorize('update', $volume);

        $volume->update($request->validated());

        return redirect()->route('translator.novels.edit', $volume->novel_id)
            ->with('success', 'Volume berhasil diperbarui.');
    }

    public function destroy(Volume $volume): RedirectResponse
    {
        $this->authorize('delete', $volume);

        $novelId = $volume->novel_id;
        $volume->delete();

        return redirect()->route('translator.novels.edit', $novelId)
            ->with('success', 'Volume berhasil dihapus.');
    }
}
