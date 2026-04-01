import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import { common, createLowlight } from 'lowlight';
import 'highlight.js/styles/github.css';
import request from '../../utils/request';

const lowlight = createLowlight(common);

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

const Ic = ({ children, size = 16 }: { children: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>{children}</svg>
);

const MenuBar = ({ editor }: { editor: ReturnType<typeof useEditor> }) => {
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    if (!tableMenuOpen) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setTableMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [tableMenuOpen]);

  const B = ({ title, onClick, active, children }: { title: string; onClick: () => void; active?: boolean; children: React.ReactNode }) => (
    <button type="button" title={title} onClick={onClick}
      style={{
        background: active ? 'var(--accent-subtle)' : 'none',
        border: '1px solid transparent',
        borderRadius: 4,
        padding: '5px 7px',
        cursor: 'pointer',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        lineHeight: 1,
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = active ? 'var(--accent-subtle)' : 'var(--bg-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = active ? 'var(--accent-subtle)' : 'none'; }}
    >
      {children}
    </button>
  );

  const Sep = () => <span style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 3px', flexShrink: 0 }} />;

  const insertTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const [uploadProgress, setUploadProgress] = useState(-1);

  const [uploadFileName, setUploadFileName] = useState('');

  const uploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      setUploadFileName(file.name);
      setUploadProgress(0);
      try {
        const res = await request.post<{ code: number; data: { url: string } }>('/upload/image', formData, {
          onUploadProgress: (e) => {
            if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          },
        });
        const url = res.data.data?.url;
        if (url) editor?.chain().focus().setImage({ src: url }).run();
      } catch { /* */ } finally {
        setUploadProgress(-1);
        setUploadFileName('');
      }
    };
    input.click();
  };

  const uploadFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      setUploadFileName(file.name);
      setUploadProgress(0);
      try {
        // 附件上传需要更长超时（大文件）
        const res = await request.post('/upload/file', formData, {
          timeout: 300000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          onUploadProgress: (e) => {
            if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          },
        });
        const url = res.data?.data?.url;
        const fileName = res.data?.data?.fileName || file.name;
        if (url) {
          const ext = file.name.split('.').pop()?.toLowerCase() || '';
          const isAudio = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(ext);
          const isVideo = ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext);
          const icon = isVideo ? '🎬' : isAudio ? '🎵' : '📎';
          const label = isVideo ? '视频' : isAudio ? '音频' : '附件';
          // Tiptap 不支持 video/audio 标签，统一用链接形式
          const html = `<p><a href="${url}" download target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:6px;color:var(--accent);text-decoration:none;font-size:13px">${icon} ${label}: ${fileName}</a></p>`;
          editor?.chain().focus().insertContent(html).run();
        }
      } catch (err) {
        console.error('附件上传失败:', err);
      } finally {
        setUploadProgress(-1);
        setUploadFileName('');
      }
    };
    input.click();
  };

  const tableActions = [
    { label: '在上方插入行', action: () => editor?.chain().focus().addRowBefore().run() },
    { label: '在下方插入行', action: () => editor?.chain().focus().addRowAfter().run() },
    { label: '在左侧插入列', action: () => editor?.chain().focus().addColumnBefore().run() },
    { label: '在右侧插入列', action: () => editor?.chain().focus().addColumnAfter().run() },
    { label: '删除当前行', action: () => editor?.chain().focus().deleteRow().run() },
    { label: '删除当前列', action: () => editor?.chain().focus().deleteColumn().run() },
    {
      label: '合并/拆分单元格',
      action: () => editor?.chain().focus().mergeOrSplit().run(),
      hint: '拖选多个单元格后合并，或在已合并单元格中拆分',
    },
    { label: '删除表格', action: () => editor?.chain().focus().deleteTable().run(), danger: true },
  ];

  return (
    <div style={{ display: 'flex', gap: 1, padding: '5px 6px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', alignItems: 'center' }}>
      <B title="标题2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })}>
        <Ic size={15}><path d="M4 7V4h16v3M9 20h6M12 4v16" /></Ic>
      </B>
      <B title="标题3" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })}>
        <Ic size={15}><path d="M6 4V2h12v2M10 20h4M12 2v18" /></Ic>
      </B>
      <Sep />
      <B title="粗体" onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')}>
        <Ic size={16}><path d="M6 4h8a4 4 0 0 1 0 8H6z" /><path d="M6 12h9a4 4 0 0 1 0 8H6z" /></Ic>
      </B>
      <B title="斜体" onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')}>
        <Ic size={16}><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></Ic>
      </B>
      <B title="删除线" onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')}>
        <Ic size={16}><path d="M16 4H9a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h7" /></Ic>
      </B>
      <Sep />
      <B title="无序列表" onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')}>
        <Ic size={16}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></Ic>
      </B>
      <B title="有序列表" onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')}>
        <Ic size={16}><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h1v4" /><path d="M4 14h1v4" /></Ic>
      </B>
      <Sep />
      <B title="引用" onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')}>
        <Ic size={16}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1.25 0 2-.75 2-2v1c0 1.25-.75 2-2 2h-1" /><path d="M15 3c4 0 6 2 6 6v2c0 1.25-.75 2-2 2" /></Ic>
      </B>
      <B title="代码块" onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')}>
        <Ic size={16}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></Ic>
      </B>
      <B title="插入表格" onClick={insertTable} active={editor?.isActive('table')}>
        <Ic size={16}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></Ic>
      </B>

      {/* 表格操作下拉菜单 */}
      {editor?.isActive('table') && (
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            title="表格操作"
            onClick={() => setTableMenuOpen((v) => !v)}
            style={{
              background: tableMenuOpen ? 'var(--accent-subtle)' : 'none',
              border: '1px solid transparent',
              borderRadius: 4,
              padding: '5px 7px',
              cursor: 'pointer',
              color: 'var(--accent)',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Ic size={16}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></Ic>
            表格操作
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {tableMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 2000,
              background: 'var(--bg-elevated, #fff)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '4px 0',
              minWidth: 240,
              boxShadow: '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
              marginTop: 4,
            }}>
              {tableActions.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { item.action(); setTableMenuOpen(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 14px',
                    border: 'none',
                    background: 'none',
                    color: item.danger ? 'var(--red, #e74c3c)' : 'var(--text-primary, #333)',
                    cursor: 'pointer',
                    fontSize: 13,
                    textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover, #f5f5f5)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                >
                  <span>{item.label}</span>
                  {item.hint && (
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--text-tertiary, #999)', marginTop: 2 }}>{item.hint}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <B title="分割线" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
        <Ic size={16}><path d="M2 12h20" /></Ic>
      </B>
      <B title="插入图片" onClick={uploadImage}>
        <Ic size={16}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></Ic>
      </B>
      <B title="插入附件" onClick={uploadFile}>
        <Ic size={16}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></Ic>
      </B>
      <Sep />
      <B title="撤销" onClick={() => editor?.chain().focus().undo().run()}>
        <Ic size={16}><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></Ic>
      </B>
      <B title="重做" onClick={() => editor?.chain().focus().redo().run()}>
        <Ic size={16}><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></Ic>
      </B>
      {uploadProgress >= 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginLeft: 6,
          fontSize: 12, color: 'var(--text-secondary)', flex: 1, minWidth: 120,
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>
            {uploadFileName}
          </span>
          <div style={{ flex: 1, maxWidth: 160, height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.15s ease' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
            {uploadProgress}%
          </span>
        </div>
      )}
    </div>
  );
};

const RichEditor: React.FC<RichEditorProps> = ({ content, onChange, placeholder = '开始输入内容...', height = 250 }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: false, allowTableNodeSelection: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 100%;',
      },
    },
  });

  if (!editor) return null;

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'visible',
      }}
    >
      <MenuBar editor={editor} />
      <div style={{ height, overflowY: 'auto', padding: '12px 16px', minHeight: 60 }}>
        <EditorContent editor={editor} />
      </div>
      <style>{`
        .tiptap { outline: none; }
        .tiptap:focus { outline: none; }
        .tiptap p { margin: 0 0 8px; line-height: 1.7; }
        .tiptap p:last-child { margin-bottom: 0; }
        .tiptap h2 { font-size: 1.3em; font-weight: 700; margin: 16px 0 8px; }
        .tiptap h3 { font-size: 1.1em; font-weight: 600; margin: 12px 0 6px; }
        .tiptap ul, .tiptap ol { padding-left: 20px; margin: 8px 0; }
        .tiptap li { margin: 2px 0; line-height: 1.6; }
        .tiptap blockquote {
          border-left: 3px solid var(--accent);
          padding: 8px 14px;
          margin: 8px 0;
          color: var(--text-secondary);
          background: var(--bg-elevated);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        }
        .tiptap pre {
          background: #1e1e2e;
          color: #cdd6f4;
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          margin: 8px 0;
          overflow-x: auto;
        }
        .tiptap pre code {
          background: none;
          color: inherit;
          padding: 0;
          font-size: 13px;
          font-family: 'Fira Code', 'Cascadia Code', var(--font-mono), monospace;
        }
        .tiptap code {
          background: var(--bg-elevated);
          color: var(--accent);
          padding: 1px 5px;
          border-radius: 3px;
          font-size: 0.9em;
          font-family: var(--font-mono);
        }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text-tertiary);
          pointer-events: none;
          height: 0;
        }
        .tiptap hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 12px 0;
        }
        .tiptap s { text-decoration: line-through; }
        .tiptap strong { font-weight: 700; }
        .tiptap img { max-width: 100%; height: auto; border-radius: var(--radius-sm); margin: 8px 0; }
        .tiptap table {
          border-collapse: collapse;
          width: 100%;
          margin: 8px 0;
          overflow-x: auto;
        }
        .tiptap table td,
        .tiptap table th {
          border: 1px solid var(--border);
          padding: 8px 12px;
          text-align: left;
          vertical-align: top;
          min-width: 60px;
          position: relative;
        }
        .tiptap table th {
          background: var(--bg-elevated);
          font-weight: 600;
        }
        .tiptap table td {
          background: transparent;
        }
        .tiptap .selectedCell::after {
          content: '';
          position: absolute;
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(59, 130, 246, 0.1);
          pointer-events: none;
        }
        .tiptap .column-resize-handle {
          position: absolute;
          right: -2px; top: 0; bottom: -2px;
          width: 4px;
          background-color: #adf;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default RichEditor;
