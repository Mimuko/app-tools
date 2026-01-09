import { useState } from 'react';
import { ChecklistSection } from '../types';

interface CopyButtonProps {
  sections: ChecklistSection[];
}

export function CopyButton({ sections }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const markdown = sections
      .map((section) => {
        let sectionText = `* ${section.title}\n`;
        
        // カテゴリーがある場合
        if (section.categories && section.categories.length > 0) {
          sectionText += section.categories
            .map((category) => {
              const checkedItems = category.items.filter((item) => item.checked);
              const uncheckedItems = category.items.filter((item) => !item.checked);
              
              let categoryText = `** ${category.title}\n`;
              
              if (checkedItems.length > 0) {
                categoryText += checkedItems
                  .map((item) => `- [x] ${item.text}`)
                  .join('\n');
              }
              
              if (uncheckedItems.length > 0) {
                if (checkedItems.length > 0) {
                  categoryText += '\n';
                }
                categoryText += uncheckedItems
                  .map((item) => `- [ ] ${item.text}`)
                  .join('\n');
              }
              
              return categoryText;
            })
            .join('\n');
        } else if (section.items && section.items.length > 0) {
          // カテゴリーがない場合（直接項目）
          const checkedItems = section.items.filter((item) => item.checked);
          const uncheckedItems = section.items.filter((item) => !item.checked);
          
          if (checkedItems.length > 0) {
            sectionText += checkedItems
              .map((item) => `- [x] ${item.text}`)
              .join('\n');
          }
          
          if (uncheckedItems.length > 0) {
            if (checkedItems.length > 0) {
              sectionText += '\n';
            }
            sectionText += uncheckedItems
              .map((item) => `- [ ] ${item.text}`)
              .join('\n');
          }
        }

        return sectionText;
      })
      .join('\n');

    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
      // フォールバック: テキストエリア経由でコピー
      const textarea = document.createElement('textarea');
      textarea.value = markdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="copy-button"
      disabled={sections.length === 0}
    >
      {copied ? 'コピーしました！' : 'チェックリストをコピー'}
    </button>
  );
}
