// Domain types shared across admin, translator, and public pages.
// Inertia page props / auth types live in @/types/index.d.ts.

export type NovelStatus  = 'draft' | 'ongoing' | 'completed' | 'hiatus' | 'dropped';
export type ChapterStatus = 'draft' | 'on_revision' | 'published';
export type TicketType   = 'bug' | 'feature_request' | 'chapter_request' | 'other';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Genre {
    id: string;
    name: string;
}

export interface Creator {
    id: string;
    name: string;
}

export interface NovelAltTitle {
    id?: string;
    language: string;
    title: string;
}

export interface NovelListItem {
    id: string;
    title: string;
    slug: string;
    cover_url: string | null;
    status: NovelStatus;
    volumes_count: number;
    chapters_count: number;
    updated_at: string;
}

export interface NovelDetail {
    id: string;
    title: string;
    slug: string;
    synopsis: string | null;
    status: NovelStatus;
    origin_language: string | null;
    translation_language: string | null;
    is_mature: boolean;
    cover_url: string | null;
    alt_titles: NovelAltTitle[];
    authors: string[];
    illustrators: string[];
    genre_ids: string[];
    tags: string[];
}

export interface Volume {
    id: string;
    number: number;
    title: string | null;
}

export interface ChapterListItem {
    id: string;
    volume_id: string | null;
    chapter_number: string;
    title: string | null;
    status: ChapterStatus;
}

export interface ChapterDetail {
    id: string;
    novel_id: string;
    volume_id: string | null;
    chapter_number: string;
    title: string | null;
    content: string | null;
    status: ChapterStatus;
    last_autosaved_at: string | null;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    prev_page_url: string | null;
}
