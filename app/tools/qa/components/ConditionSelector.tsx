import { TechStack, ProjectType } from '../../types';
import styles from '../qa.module.css';

interface ConditionSelectorProps {
  techStack: TechStack | null;
  projectType: ProjectType | null;
  onTechStackChange: (stack: TechStack | null) => void;
  onProjectTypeChange: (type: ProjectType | null) => void;
}

export function ConditionSelector({
  techStack,
  projectType,
  onTechStackChange,
  onProjectTypeChange,
}: ConditionSelectorProps) {
  const techStacks: { value: TechStack; label: string }[] = [
    { value: 'hubspot', label: 'HubSpot' },
    { value: 'wordpress', label: 'WordPress' },
    { value: 'static', label: '静的サイト' },
    { value: 'other-cms', label: 'その他CMS' },
  ];

  const projectTypes: { value: ProjectType; label: string }[] = [
    { value: 'new', label: '新規制作' },
    { value: 'renewal', label: 'リニューアル・リプレイス' },
  ];

  return (
    <div className={styles.conditionSelector}>
      <div className={styles.selectorGroup}>
        <span className={styles.labelText}>技術スタック</span>
        <div className={styles.radioGroup}>
          {techStacks.map((stack) => (
            <label key={stack.value} className={styles.radioLabel}>
              <input
                type="radio"
                name="techStack"
                value={stack.value}
                checked={techStack === stack.value}
                onChange={() => onTechStackChange(stack.value)}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>{stack.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.selectorGroup}>
        <span className={styles.labelText}>制作種別</span>
        <div className={styles.radioGroup}>
          {projectTypes.map((type) => (
            <label key={type.value} className={styles.radioLabel}>
              <input
                type="radio"
                name="projectType"
                value={type.value}
                checked={projectType === type.value}
                onChange={() => onProjectTypeChange(type.value)}
                className={styles.radioInput}
              />
              <span className={styles.radioText}>{type.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
