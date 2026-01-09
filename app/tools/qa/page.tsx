'use client';

import { useState } from 'react';
import { TechStack, ProjectType, ChecklistSection } from './types';
import { ConditionSelector } from './components/ConditionSelector';
import { ChecklistSection as ChecklistSectionComponent } from './components/ChecklistSection';
import { CopyButton } from './components/CopyButton';
import { AppHeader, AppFooter } from '@shared/components';
import { ThemeToggle } from '@shared/components';
import { getChecklistData } from './data/checklist';
import styles from './qa.module.css';

export default function QATool() {
  const [techStack, setTechStack] = useState<TechStack | null>(null);
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [checklistSections, setChecklistSections] = useState<ChecklistSection[]>(() => {
    // 初期状態で基本チェックリストを表示
    const data = getChecklistData(null, null);
    return data.sections;
  });

  const updateChecklist = (stack: TechStack | null, type: ProjectType | null) => {
    // 条件に応じてチェックリストを更新（条件がなくても基本項目は表示）
    const data = getChecklistData(stack, type);
    setChecklistSections(data.sections);
  };

  const handleTechStackChange = (stack: TechStack | null) => {
    setTechStack(stack);
    updateChecklist(stack, projectType);
  };

  const handleProjectTypeChange = (type: ProjectType | null) => {
    setProjectType(type);
    updateChecklist(techStack, type);
  };

  const handleToggleItem = (sectionId: string, itemId: string) => {
    setChecklistSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }
        
        // カテゴリーがある場合
        if (section.categories) {
          return {
            ...section,
            categories: section.categories.map((category) => ({
              ...category,
              items: category.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            })),
          };
        }
        
        // カテゴリーがない場合（直接項目）
        if (section.items) {
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          };
        }
        
        return section;
      })
    );
  };

  return (
    <div className={styles.app}>
      <AppHeader
        title="公開前確認チェックリスト"
        subtitle="公開可否を判断するための最低限の確認項目を条件に応じて表示します"
        useTailwind={true}
      >
        <ThemeToggle useTailwind={true} />
      </AppHeader>

      <main className={styles.appMain}>
        <ConditionSelector
          techStack={techStack}
          projectType={projectType}
          onTechStackChange={handleTechStackChange}
          onProjectTypeChange={handleProjectTypeChange}
        />

        {checklistSections.length > 0 && (
          <div className={styles.checklistContainer}>
            <div className={styles.checklistNotice}>
              <p>※ 本チェックは、公開可否判断のための最低限の確認です</p>
              <p>※ 網羅的な品質保証を目的としたものではありません</p>
            </div>
            
            <CopyButton sections={checklistSections} />
            
            <div className={styles.checklistSections}>
              {checklistSections.map((section) => (
                <ChecklistSectionComponent
                  key={section.id}
                  section={section}
                  onToggleItem={handleToggleItem}
                />
              ))}
            </div>
          </div>
        )}

        {checklistSections.length === 0 && (
          <div className={styles.emptyState}>
            <p>条件を選択すると、確認項目が表示されます</p>
          </div>
        )}
      </main>

      <AppFooter useTailwind={true} className="mt-12">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          本ツールは、公開可否判断のための最低限の確認項目を短時間で整理することを目的としています
        </p>
      </AppFooter>
    </div>
  );
}
