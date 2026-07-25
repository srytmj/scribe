import { FormEventHandler } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import ChapterEditor from '@/Components/ChapterEditor';

export interface VolumeOption {
    id: number;
    number: number;
    title: string | null;
}

export interface ChapterFormData {
    chapter_number: string;
    title: string;
    content: string;
    status: string;
    volume_id: number | null;
    [key: string]: unknown;
}

const STATUS_OPTIONS = ['draft', 'on_revision', 'published'];
const NO_VOLUME = 'none';

export default function ChapterForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel,
    volumes,
    imageUploadUrl,
    onAutosave,
}: {
    data: ChapterFormData;
    setData: <K extends keyof ChapterFormData>(key: K, value: ChapterFormData[K]) => void;
    errors: Partial<Record<string, string>>;
    processing: boolean;
    onSubmit: FormEventHandler;
    submitLabel: string;
    volumes: VolumeOption[];
    imageUploadUrl: string;
    onAutosave?: (content: string) => void;
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="chapter_number">Chapter Number</Label>
                    <Input
                        id="chapter_number"
                        type="number"
                        step="0.1"
                        value={data.chapter_number}
                        onChange={(e) => setData('chapter_number', e.target.value)}
                    />
                    {errors.chapter_number && <p className="text-sm text-destructive">{errors.chapter_number}</p>}
                </div>

                <div className="space-y-2">
                    <Label>Volume</Label>
                    <Select
                        value={data.volume_id ? String(data.volume_id) : NO_VOLUME}
                        onValueChange={(value) => setData('volume_id', value === NO_VOLUME ? null : Number(value))}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NO_VOLUME}>No volume</SelectItem>
                            {volumes.map((v) => (
                                <SelectItem key={v.id} value={String(v.id)}>
                                    Vol. {v.number}
                                    {v.title ? ` — ${v.title}` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
                <Label>Content</Label>
                <ChapterEditor
                    content={data.content}
                    onChange={(html) => setData('content', html)}
                    imageUploadUrl={imageUploadUrl}
                    onAutosave={onAutosave}
                />
                {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
            </div>

            <Button type="submit" disabled={processing}>
                {submitLabel}
            </Button>
        </form>
    );
}
