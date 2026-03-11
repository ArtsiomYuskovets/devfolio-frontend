import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import styles from "./LinkSection.module.scss";
import { useCallback, memo } from "react";

type LinksSectionProps = {
    links: Array<{ key: string; value: string }>;
    onKeyChange: (index: number, newKey: string) => void;
    onValueChange: (index: number, newValue: string) => void;
    onAddLink: () => void;
    onRemoveLink: (index: number) => void;
};

type LinkRowProps = {
    link: { key: string; value: string };
    index: number;
    onKeyChange: (index: number, newKey: string) => void;
    onValueChange: (index: number, newValue: string) => void;
    onRemoveLink: (index: number) => void;
    isOnlyOne: boolean;
}

const LinkRow = memo(({ 
    link, 
    index, 
    onKeyChange, 
    onValueChange, 
    onRemoveLink, 
    isOnlyOne 
}: LinkRowProps) => {
    const handleKeyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onKeyChange(index, e.target.value);
    }, [index, onKeyChange]);

    const handleValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange(index, e.target.value);
    }, [index, onValueChange]);

    const handleRemove = useCallback(() => {
        onRemoveLink(index);
    }, [index, onRemoveLink]);

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

            {!isOnlyOne && (
                <button
                    className={styles["links-section__remove"]}
                    onClick={handleRemove}
                    type="button"
                    aria-label="Удалить ссылку"
                >
                    ×
                </button>
            )}
        </div>
    );
});

export function LinksSection({
    links,
    onKeyChange,
    onValueChange,
    onAddLink,
    onRemoveLink
}: LinksSectionProps) {
    return (
        <div className={styles["links-section"]}>
            <div className={styles["links-section__stack"]}>
                {links.map((link, index) => (
                    <LinkRow
                        key={index} 
                        link={link}
                        index={index}
                        onKeyChange={onKeyChange}
                        onValueChange={onValueChange}
                        onRemoveLink={onRemoveLink}
                        isOnlyOne={links.length === 1}
                    />
                ))}

                <p className={styles["links-section__hint"]}>
                    Добавьте до 5 ссылок на социальные сети и проекты
                </p>

                {links.length < 5 && (
                    <Button
                        type="button"
                        variant="primary-light"
                        size="wide"
                        onClick={onAddLink}
                    >
                        + Добавить ссылку
                    </Button>
                )}
            </div>
        </div>
    );
}