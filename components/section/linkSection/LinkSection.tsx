import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import styles from "./LinkSection.module.scss";
import { useCallback, memo } from "react";
import type { ProfileLinkItem } from "@/lib/profileLinks";
import { MAX_PROFILE_LINKS } from "@/lib/profileLinks";

type LinksSectionProps = {
  links: ProfileLinkItem[];
  canAddLink: boolean;
  onKeyChange: (id: string, newKey: string) => void;
  onValueChange: (id: string, newValue: string) => void;
  onAddLink: () => void;
  onRemoveLink: (id: string) => void;
};

type LinkRowProps = {
  link: ProfileLinkItem;
  onKeyChange: (id: string, newKey: string) => void;
  onValueChange: (id: string, newValue: string) => void;
  onRemoveLink: (id: string) => void;
};

const LinkRow = memo(
  ({ link, onKeyChange, onValueChange, onRemoveLink }: LinkRowProps) => {
    const handleKeyChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onKeyChange(link.id, e.target.value);
      },
      [link.id, onKeyChange]
    );

    const handleValueChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange(link.id, e.target.value);
      },
      [link.id, onValueChange]
    );

    const handleRemove = useCallback(() => {
      onRemoveLink(link.id);
    }, [link.id, onRemoveLink]);

    return (
      <div className={styles["links-section__group"]}>
        <div className={styles["links-section__field"]}>
          <span className={styles["links-section__label"]}>Название</span>
          <Input
            className={styles["links-section__input"]}
            variant="primary-light"
            placeholder="например: github, linkedin"
            value={link.key}
            onChange={handleKeyChange}
          />
        </div>

        <div className={styles["links-section__field"]}>
          <span className={styles["links-section__label"]}>Ссылка</span>
          <Input
            className={styles["links-section__input"]}
            variant="primary-light"
            placeholder="https://ссылка-на-вас"
            value={link.value}
            onChange={handleValueChange}
          />
        </div>

        <button
          className={styles["links-section__remove"]}
          onClick={handleRemove}
          type="button"
          aria-label="Удалить ссылку"
        >
          ×
        </button>
      </div>
    );
  }
);

LinkRow.displayName = "LinkRow";

export function LinksSection({
  links,
  canAddLink,
  onKeyChange,
  onValueChange,
  onAddLink,
  onRemoveLink,
}: LinksSectionProps) {
  return (
    <div className={styles["links-section"]}>
      <div className={styles["links-section__stack"]}>
        {links.map((link) => (
          <LinkRow
            key={link.id}
            link={link}
            onKeyChange={onKeyChange}
            onValueChange={onValueChange}
            onRemoveLink={onRemoveLink}
          />
        ))}

        <p className={styles["links-section__hint"]}>
          Добавьте до {MAX_PROFILE_LINKS} ссылок на социальные сети и проекты
        </p>

        {canAddLink ? (
          <Button
            type="button"
            variant="primary-light"
            size="wide"
            onClick={onAddLink}
          >
            + Добавить ссылку
          </Button>
        ) : null}
      </div>
    </div>
  );
}
