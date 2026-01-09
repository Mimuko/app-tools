import { useState } from 'react';
import { ChecklistSection as ChecklistSectionType } from '../types';

interface ChecklistSectionProps {
  section: ChecklistSectionType;
  onToggleItem: (sectionId: string, itemId: string) => void;
}

export function ChecklistSection({ section, onToggleItem }: ChecklistSectionProps) {
  const [collapsed, setCollapsed] = useState(section.collapsed ?? false);

  // カテゴリーがある場合はカテゴリーごとに表示、ない場合は直接項目を表示
  const hasCategories = section.categories && section.categories.length > 0;
  const hasItems = section.items && section.items.length > 0;

  return (
    <div className="checklist-section">
      <button
        className="section-header"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
      >
        <span className="section-title">{section.title}</span>
        <span className="collapse-icon">{collapsed ? '▼' : '▲'}</span>
      </button>
      
      {!collapsed && (
        <div className="section-content">
          {hasCategories && section.categories?.map((category) => (
            <div key={category.id} className="category-group">
              <h3 className="category-title">{category.title}</h3>
              <div className="category-items">
                {category.items.map((item) => (
                  <label key={item.id} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => onToggleItem(section.id, item.id)}
                      className="checkbox-input"
                    />
                    <span className="item-text">{item.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          
          {hasItems && !hasCategories && section.items?.map((item) => (
            <label key={item.id} className="checklist-item">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => onToggleItem(section.id, item.id)}
                className="checkbox-input"
              />
              <span className="item-text">{item.text}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
