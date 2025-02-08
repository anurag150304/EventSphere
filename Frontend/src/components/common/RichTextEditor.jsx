import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EmojiExtension } from '@tiptap/extension-emoji';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useState } from 'react';

export default function RichTextEditor({
    content,
    onChange,
    placeholder = 'Write something...',
    maxLength = 500
}) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            EmojiExtension
        ],
        content,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            if (html.length <= maxLength) {
                onChange(html);
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] px-3 py-2',
                placeholder
            }
        }
    });

    const addEmoji = (emoji) => {
        editor?.commands.insertContent(emoji.native);
        setShowEmojiPicker(false);
    };

    return (
        <div className="relative border border-gray-300 rounded-md">
            <div className="border-b border-gray-300 p-2 flex justify-between items-center bg-gray-50">
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={`p-1 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                    >
                        <span className="font-bold">B</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={`p-1 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
                    >
                        <span className="italic">I</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-1 rounded hover:bg-gray-200"
                    >
                        😊
                    </button>
                </div>
                <div className="text-sm text-gray-500">
                    {editor?.storage.characterCount.characters()}/{maxLength}
                </div>
            </div>

            <EditorContent editor={editor} />

            {showEmojiPicker && (
                <div className="absolute z-10 mt-1">
                    <Picker
                        data={data}
                        onEmojiSelect={addEmoji}
                        theme="light"
                        previewPosition="none"
                        skinTonePosition="none"
                    />
                </div>
            )}
        </div>
    );
} 