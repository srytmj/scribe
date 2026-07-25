import { FormEventHandler } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import CreatorAutocomplete, { CreatorOption } from '@/Components/CreatorAutocomplete';
import GenreTagPicker, { PickerOption } from '@/Components/GenreTagPicker';

export interface AltTitle {
    language: string;
    title: string;
}

export interface NovelFormData {
    title: string;
    synopsis: string;
    origin_language: string;
    translation_language: string;
    status: string;
    cover_image: File | null;
    alt_titles: AltTitle[];
    authors: CreatorOption[];
    illustrators: CreatorOption[];
    genres: number[];
    tags: number[];
    [key: string]: unknown;
}

const STATUS_OPTIONS = ['draft', 'ongoing', 'completed', 'hiatus', 'dropped'];

export default function NovelForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
    coverPreviewUrl,
    availableGenres,
    availableTags,
}: {
    data: NovelFormData;
    setData: <K extends keyof NovelFormData>(key: K, value: NovelFormData[K]) => void;
    errors: Partial<Record<string, string>>;
    processing: boolean;
    onSubmit: FormEventHandler;
    submitLabel: string;
    coverPreviewUrl?: string | null;
    availableGenres: PickerOption[];
    availableTags: PickerOption[];
}) {
    const addAltTitle = () => setData('alt_titles', [...data.alt_titles, { language: '', title: '' }]);

    const updateAltTitle = (index: number, key: keyof AltTitle, value: string) => {
        const next = [...data.alt_titles];
        next[index] = { ...next[index], [key]: value };
        setData('alt_titles', next);
    };

    const removeAltTitle = (index: number) => {
        setData('alt_titles', data.alt_titles.filter((_, i) => i !== index));
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Title (original)</Label>
                <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="synopsis">Synopsis</Label>
                <Textarea
                    id="synopsis"
                    rows={5}
                    value={data.synopsis}
                    onChange={(e) => setData('synopsis', e.target.value)}
                />
                {errors.synopsis && <p className="text-sm text-destructive">{errors.synopsis}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="origin_language">Origin Language</Label>
                    <Input
                        id="origin_language"
                        value={data.origin_language}
                        onChange={(e) => setData('origin_language', e.target.value)}
                        placeholder="Japanese"
                    />
                    {errors.origin_language && <p className="text-sm text-destructive">{errors.origin_language}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="translation_language">Translation Language</Label>
                    <Input
                        id="translation_language"
                        value={data.translation_language}
                        onChange={(e) => setData('translation_language', e.target.value)}
                        placeholder="Indonesian"
                    />
                    {errors.translation_language && (
                        <p className="text-sm text-destructive">{errors.translation_language}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Status</Label>
                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                                {status}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="cover_image">Cover Image</Label>
                {coverPreviewUrl && (
                    <img src={coverPreviewUrl} alt="Current cover" className="h-32 w-auto rounded-md border" />
                )}
                <Input
                    id="cover_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setData('cover_image', e.target.files?.[0] ?? null)}
                />
                {errors.cover_image && <p className="text-sm text-destructive">{errors.cover_image}</p>}
            </div>

            <CreatorAutocomplete
                label="Authors"
                selected={data.authors}
                onChange={(next) => setData('authors', next)}
            />

            <CreatorAutocomplete
                label="Illustrators"
                selected={data.illustrators}
                onChange={(next) => setData('illustrators', next)}
            />

            <GenreTagPicker
                label="Genres"
                options={availableGenres}
                selectedIds={data.genres}
                onChange={(next) => setData('genres', next)}
            />

            <GenreTagPicker
                label="Tags"
                options={availableTags}
                selectedIds={data.tags}
                onChange={(next) => setData('tags', next)}
            />

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Alternative Titles</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addAltTitle}>
                        Add
                    </Button>
                </div>
                {data.alt_titles.map((altTitle, index) => (
                    <div key={index} className="flex gap-2">
                        <Input
                            placeholder="Language"
                            className="w-1/3"
                            value={altTitle.language}
                            onChange={(e) => updateAltTitle(index, 'language', e.target.value)}
                        />
                        <Input
                            placeholder="Title"
                            value={altTitle.title}
                            onChange={(e) => updateAltTitle(index, 'title', e.target.value)}
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeAltTitle(index)}>
                            Remove
                        </Button>
                    </div>
                ))}
            </div>

            <Button type="submit" disabled={processing}>
                {submitLabel}
            </Button>
        </form>
    );
}
