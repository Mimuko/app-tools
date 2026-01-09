import { useState } from 'react';
import { ChecklistSection as ChecklistSectionType } from '../../types';
import styles from '../qa.module.css';

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
    <div className={styles.checklistSection}>
      <button
        className={styles.sectionHeader}
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
      >
        <span className={styles.sectionTitle}>{section.title}</span>
        <span className={styles.collapseIcon}>{collapsed ? '▼' : '▲'}</span>
      </button>
      
      {!collapsed && (
        <div className={styles.sectionContent}>
          {hasCategories && section.categories?.map((category) => (
            <div key={category.id} className={styles.categoryGroup}>
              <h3 className={styles.categoryTitle}>{category.title}</h3>
              <div className={styles.categoryItems}>
                {category.items.map((item) => (
                  <label key={item.id} className={styles.checklistItem}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => onToggleItem(section.id, item.id)}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.itemText}>{item.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          
          {hasItems && !hasCategories && section.items?.map((item) => (
            <label key={item.id} className={styles.checklistItem}>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => onToggleItem(section.id, item.id)}
                className={styles.checkboxInput}
              />
              <span className={styles.itemText}>{item.text}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
