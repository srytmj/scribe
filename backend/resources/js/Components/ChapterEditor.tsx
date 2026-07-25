import { useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

export default function ChapterEditor({
    content,
    onChange,
    imageUploadUrl,
    onAutosave,
}: {
    content: string;
    onChange: (html: string) => void;
    imageUploadUrl: string;
    onAutosave?: (html: string) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const autosaveTimer = useRef<ReturnType<typeof setTimeout>>();

    const editor = useEditor({
        extensions: [StarterKit, Image],
        content,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);

            if (onAutosave) {
                clearTimeout(autosaveTimer.current);
                autosaveTimer.current = setTimeout(() => onAutosave(html), 2000);
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none min-h-[300px] rounded-md border border-input px-3 py-2 focus:outline-none',
            },
        },
    });

    useEffect(() => {
        return () => clearTimeout(autosaveTimer.current);
    }, []);

    const uploadImage = useCallback(
        async (file: File) => {
            if (!editor) return;

            const formData = new FormData();
            formData.append('image', file);

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

            const response = await fetch(imageUploadUrl, {
                method: 'POST',
                body: formData,
                headers: { 'X-CSRF-TOKEN': csrfToken, Accept: 'application/json' },
            });

            if (!response.ok) {
                return;
            }

            const { url } = await response.json();
            editor.chain().focus().setImage({ src: url }).run();
        },
        [editor, imageUploadUrl],
    );

    if (!editor) {
        return null;
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1 rounded-md border border-input bg-muted/30 p-1">
                <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                    Bold
                </ToolbarButton>
                <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                    Italic
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive('heading', { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    H2
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    List
                </ToolbarButton>
                <ToolbarButton onClick={() => fileInputRef.current?.click()}>Insert Image</ToolbarButton>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file);
                        e.target.value = '';
                    }}
                />
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}

function ToolbarButton({
    children,
    onClick,
    active,
}: {
    children: React.ReactNode;
    onClick: () => void;
    active?: boolean;
}) {
    return (
        <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClick}
            className={cn('h-7 px-2 text-xs', active && 'bg-accent')}
        >
            {children}
        </Button>
    );
}
