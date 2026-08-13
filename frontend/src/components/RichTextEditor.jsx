import React, { useEffect, useRef } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Indent,
  Italic,
  List,
  ListOrdered,
  Outdent,
  Quote,
  Type,
  Underline,
} from 'lucide-react';
import { sanitizeRichHtml } from '../utils/sanitizeHtml';

const toolbarGroups = [
  [
    { command: 'bold', icon: Bold, label: 'Bold' },
    { command: 'italic', icon: Italic, label: 'Italic' },
    { command: 'underline', icon: Underline, label: 'Underline' },
  ],
  [
    { command: 'justifyLeft', icon: AlignLeft, label: 'Align left' },
    { command: 'justifyCenter', icon: AlignCenter, label: 'Align center' },
    { command: 'justifyRight', icon: AlignRight, label: 'Align right' },
  ],
  [
    { command: 'insertUnorderedList', icon: List, label: 'Bulleted list' },
    { command: 'insertOrderedList', icon: ListOrdered, label: 'Numbered list' },
    { command: 'indent', icon: Indent, label: 'Increase margin' },
    { command: 'outdent', icon: Outdent, label: 'Decrease margin' },
  ],
  [
    { command: 'formatBlock', value: 'blockquote', icon: Quote, label: 'Quote' },
  ],
];

const RichTextEditor = ({ value = '', onChange, error }) => {
  const editorRef = useRef(null);
  const latestValueRef = useRef(value);

  useEffect(() => {
    if (editorRef.current && value !== latestValueRef.current) {
      editorRef.current.innerHTML = sanitizeRichHtml(value);
      latestValueRef.current = value;
    }
  }, [value]);

  const emitChange = () => {
    const nextValue = sanitizeRichHtml(editorRef.current?.innerHTML || '');
    latestValueRef.current = nextValue;
    onChange(nextValue);
  };

  const runCommand = (command, commandValue = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2">
        {toolbarGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center gap-1 border-r border-slate-800 pr-2 last:border-r-0 last:pr-0">
            {group.map(({ command, value: commandValue, icon: Icon, label }) => (
              <button
                key={`${command}-${label}`}
                type="button"
                title={label}
                aria-label={label}
                onClick={() => runCommand(command, commandValue)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        ))}

        <div className="flex items-center gap-1">
          <Type className="h-4 w-4 text-slate-500" />
          <select
            aria-label="Text style"
            defaultValue="p"
            onChange={(event) => {
              const nextValue = event.target.value;
              if (nextValue.startsWith('font-')) {
                runCommand('fontSize', nextValue.replace('font-', ''));
              } else {
                runCommand('formatBlock', nextValue);
              }
            }}
            className="h-8 rounded-lg border border-slate-800 bg-slate-900 px-2 text-xs text-slate-300 focus:outline-none focus:border-primary-500"
          >
            <option value="p">Paragraph</option>
            <option value="h2">Large heading</option>
            <option value="h3">Medium heading</option>
            <option value="h4">Small heading</option>
            <option value="font-2">Small text</option>
            <option value="font-3">Normal text</option>
            <option value="font-5">Large text</option>
            <option value="font-6">Huge text</option>
          </select>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        className="rich-editor min-h-[320px] w-full rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
        data-placeholder="Write your article body here. Use the toolbar for headings, bold text, lists, alignment, quotes, and margins..."
      />
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  );
};

export default RichTextEditor;
