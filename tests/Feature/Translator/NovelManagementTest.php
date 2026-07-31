<?php

namespace Tests\Feature\Translator;

use App\Models\Chapter;
use App\Models\Creator;
use App\Models\Genre;
use App\Models\Novel;
use App\Models\User;
use Database\Seeders\MenuSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class NovelManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(MenuSeeder::class);
    }

    public function test_translator_can_create_novel_with_alt_titles_authors_and_genres(): void
    {
        $translator = User::factory()->translator()->create();
        $genre = Genre::create(['name' => 'Isekai']);

        $response = $this->actingAs($translator)->post(route('translator.novels.store'), [
            'title' => 'Test Novel',
            'status' => 'draft',
            'is_mature' => '0',
            'alt_titles' => [
                ['language' => 'Indonesia', 'title' => 'Novel Uji'],
            ],
            'authors' => ['Author Satu'],
            'illustrators' => ['Illustrator Satu'],
            'genre_ids' => [$genre->id],
            'tags' => ['fresh-tag'],
        ]);

        $novel = Novel::firstWhere('title', 'Test Novel');

        $response->assertRedirect(route('translator.novels.edit', $novel));
        $this->assertNotNull($novel);
        $this->assertSame($translator->id, $novel->user_id);
        $this->assertNotEmpty($novel->slug);
        $this->assertCount(1, $novel->altTitles);
        $this->assertSame('Author Satu', $novel->authors->first()->name);
        $this->assertSame('Illustrator Satu', $novel->illustrators->first()->name);
        $this->assertTrue($novel->genres->contains($genre));
        $this->assertSame('fresh-tag', $novel->tags->first()->name);
    }

    public function test_translator_cannot_edit_another_translators_novel(): void
    {
        $owner = User::factory()->translator()->create();
        $other = User::factory()->translator()->create();
        $novel = Novel::create([
            'user_id' => $owner->id,
            'title' => 'Owned Novel',
            'slug' => 'owned-novel',
            'status' => 'draft',
        ]);

        $this->actingAs($other)
            ->get(route('translator.novels.edit', $novel))
            ->assertForbidden();
    }

    public function test_pending_user_cannot_access_translator_routes(): void
    {
        $pending = User::factory()->create();

        $this->actingAs($pending)
            ->get(route('translator.novels.index'))
            ->assertForbidden();
    }

    public function test_translator_can_manage_volumes_and_chapters(): void
    {
        $translator = User::factory()->translator()->create();
        $novel = Novel::create([
            'user_id' => $translator->id,
            'title' => 'Volume Novel',
            'slug' => 'volume-novel',
            'status' => 'draft',
        ]);

        $this->actingAs($translator)
            ->post(route('translator.novels.volumes.store', $novel), [
                'number' => 1,
                'title' => 'Awal',
            ])
            ->assertRedirect(route('translator.novels.edit', $novel));

        $volume = $novel->volumes()->firstOrFail();
        $this->assertSame(1, $volume->number);

        $storeResponse = $this->actingAs($translator)
            ->post(route('translator.novels.chapters.store', $novel), [
                'volume_id' => $volume->id,
                'chapter_number' => '1.0',
                'title' => 'Awal Mula',
                'status' => 'draft',
                'content' => '',
            ]);

        $chapter = Chapter::firstWhere('novel_id', $novel->id);
        $storeResponse->assertRedirect(route('translator.chapters.edit', $chapter));

        $autosaveResponse = $this->actingAs($translator)
            ->patch(route('translator.chapters.autosave', $chapter), [
                'content' => '<p>Isi chapter</p>',
            ]);

        $autosaveResponse->assertOk();
        $chapter->refresh();
        $this->assertSame('<p>Isi chapter</p>', $chapter->content);
        $this->assertNotNull($chapter->last_autosaved_at);

        $updateResponse = $this->actingAs($translator)
            ->put(route('translator.chapters.update', $chapter), [
                'volume_id' => $volume->id,
                'chapter_number' => '1.0',
                'title' => 'Awal Mula',
                'status' => 'published',
                'content' => '<p>Isi chapter final</p>',
            ]);

        $updateResponse->assertRedirect(route('translator.chapters.edit', $chapter));
        $chapter->refresh();
        $this->assertSame('published', $chapter->status);
        $this->assertNotNull($chapter->published_at);
    }

    public function test_admin_can_bulk_delete_novels_across_translators(): void
    {
        $admin = User::factory()->admin()->create();
        $translator = User::factory()->translator()->create();
        $novel = Novel::create([
            'user_id' => $translator->id,
            'title' => 'To Delete',
            'slug' => 'to-delete',
            'status' => 'draft',
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.novels.bulk-destroy'), ['ids' => [$novel->id]])
            ->assertRedirect(route('admin.novels.index'));

        $this->assertSoftDeleted('novels', ['id' => $novel->id]);
    }

    public function test_creator_autocomplete_returns_matching_names(): void
    {
        $translator = User::factory()->translator()->create();
        Creator::create(['name' => 'Yuki Tanaka']);
        Creator::create(['name' => 'Someone Else']);

        $response = $this->actingAs($translator)
            ->getJson(route('translator.creators.autocomplete', ['q' => 'Yuki']));

        $response->assertOk()->assertJsonCount(1)->assertJsonFragment(['name' => 'Yuki Tanaka']);
    }

    public function test_translator_can_upload_inline_chapter_image(): void
    {
        Storage::fake('public');

        $translator = User::factory()->translator()->create();
        $novel = Novel::create([
            'user_id' => $translator->id,
            'title' => 'Image Novel',
            'slug' => 'image-novel',
            'status' => 'draft',
        ]);
        $chapter = $novel->chapters()->create([
            'chapter_number' => '1.0',
            'status' => 'draft',
        ]);

        $response = $this->actingAs($translator)
            ->postJson(route('translator.chapters.images.store', $chapter), [
                'image' => UploadedFile::fake()->image('inline.jpg'),
            ]);

        $response->assertOk()->assertJsonStructure(['url']);
        $this->assertNotEmpty(Storage::disk('public')->allFiles('chapter-images'));
    }
}
