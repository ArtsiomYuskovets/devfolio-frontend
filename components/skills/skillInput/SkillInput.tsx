import { useState } from "react";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import styles from "./SkillInput.module.scss";

// Массив доступных навыков для поиска
const AVAILABLE_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Vue",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "PHP",
  "HTML",
  "CSS",
  "SCSS",
  "Tailwind",
  "Git",
  "Docker",
  "Kubernetes",
  "AWS",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Figma",
  "Adobe XD",
  "Sketch",
];

type SkillInputProps = {
  onAddSkill: (skill: string) => void;
  existingSkills?: string[];
};

export function SkillInput({ onAddSkill, existingSkills = [] }: SkillInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSkills = AVAILABLE_SKILLS.filter(skill => 
    skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !existingSkills.includes(skill)
  );

  const handleAddSkill = (skill: string) => {
    onAddSkill(skill);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className={styles["skill-input"]}>
      <Button 
        type="button" 
        variant="outline-dark" 
        size="wide"
        onClick={() => setIsOpen(!isOpen)}
      >
        Добавить навык
      </Button>

      {isOpen && (
        <div className={styles["skill-input__dropdown"]}>
          <Input
            placeholder="Поиск или ввод нового навыка..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                handleAddSkill(searchTerm.trim());
              }
            }}
            autoFocus
          />
          
          {filteredSkills.length > 0 && (
            <ul className={styles["skill-input__list"]}>
              {filteredSkills.map((skill) => (
                <li
                  key={skill}
                  className={styles["skill-input__item"]}
                  onClick={() => handleAddSkill(skill)}
                >
                  {skill}
                </li>
              ))}
            </ul>
          )}
          
          {searchTerm && filteredSkills.length === 0 && (
            <div className={styles["skill-input__empty"]}>
              <Button
                type="button"
                variant="primary-light"
                size="small"
                onClick={() => handleAddSkill(searchTerm.trim())}
              >
                Добавить "{searchTerm}"
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}