import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Heading2, Image as ImageIcon, Italic, List, ListOrdered, Quote,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { cn } from '@/lib/utils';

interface ChapterEditorProps {
    chapterId: string;
    content: string;
    onChange: (html: string) => void;
}

export default function ChapterEditor({ chapterId, content, onChange }: ChapterEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Placeholder.configure({ placeholder: 'Tulis isi chapter di sini...' }),
        ],
        content,
        editorProps: {
            attributes: {
                class: cn(
                    'min-h-[50vh] max-w-none text-sm leading-relaxed focus:outline-none',
                    '[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold',
                    '[&_p]:mb-3',
                    '[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5',
                    '[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5',
                    '[&_blockquote]:mb-3 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
                    '[&_img]:my-4 [&_img]:rounded-md',
                ),
            },
        },
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content, false);
        }
        // Only sync when the chapter identity changes (e.g. navigating between chapters),
        // not on every keystroke — the editor is the source of truth while typing.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chapterId]);

    async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !editor) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await window.axios.post<{ url: string }>(
                route('translator.chapters.images.store', chapterId),
                formData,
            );
            editor.chain().focus().setImage({ src: res.data.url }).run();
        } catch {
            // upload failed silently — user can retry
        }
    }

    if (!editor) return null;

    return (
        <div className="rounded-lg border">
            <div className="flex flex-wrap items-center gap-1 border-b p-2">
                <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                    <Heading2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                    <Quote className="h-4 w-4" />
                </ToolbarButton>
                <Separator orientation="vertical" className="mx-1 h-5" />
                <ToolbarButton onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="h-4 w-4" />
                </ToolbarButton>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelected}
                />
            </div>
            <div className="p-4">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

function ToolbarButton({
    active, onClick, children,
}: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', active && 'bg-accent text-accent-foreground')}
            onClick={onClick}
        >
            {children}
        </Button>
    );
}
