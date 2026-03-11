import { useState } from "react";
import { SectionTitle } from "@/components/ui/section-title/SectionTitle";
import { SkillInput } from "../skillInput/SkillInput";
import styles from "./SkillsSection.module.scss";

type SkillsSectionProps = {
  initialSkills?: string[];
  onSkillsChange?: (skills: string[]) => void;
};

export function SkillsSection({ initialSkills = [], onSkillsChange }: SkillsSectionProps) {
  const [skills, setSkills] = useState<string[]>(initialSkills);

  const handleAddSkill = (newSkill: string) => {
    if (!skills.includes(newSkill)) {
      const updatedSkills = [...skills, newSkill];
      setSkills(updatedSkills);
      onSkillsChange?.(updatedSkills);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    onSkillsChange?.(updatedSkills);
  };

  return (
    <div className={styles["skills-section"]}>
      <SectionTitle>НАВЫКИ</SectionTitle>
      
      <SkillInput 
        onAddSkill={handleAddSkill}
        existingSkills={skills}
      />

      {skills.length > 0 && (
        <div className={styles["skills-section__list"]}>
          {skills.map((skill) => (
            <div key={skill} className={styles["skill-tag"]}>
              <span className={styles["skill-tag__name"]}>{skill}</span>
              <button
                className={styles["skill-tag__remove"]}
                onClick={() => handleRemoveSkill(skill)}
                aria-label={`Удалить ${skill}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}