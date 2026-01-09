import { TechStack, ProjectType } from '../types';

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
    <div className="condition-selector">
      <div className="selector-group">
        <span className="label-text">技術スタック</span>
        <div className="radio-group">
          {techStacks.map((stack) => (
            <label key={stack.value} className="radio-label">
              <input
                type="radio"
                name="techStack"
                value={stack.value}
                checked={techStack === stack.value}
                onChange={() => onTechStackChange(stack.value)}
                className="radio-input"
              />
              <span className="radio-text">{stack.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="selector-group">
        <span className="label-text">制作種別</span>
        <div className="radio-group">
          {projectTypes.map((type) => (
            <label key={type.value} className="radio-label">
              <input
                type="radio"
                name="projectType"
                value={type.value}
                checked={projectType === type.value}
                onChange={() => onProjectTypeChange(type.value)}
                className="radio-input"
              />
              <span className="radio-text">{type.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
