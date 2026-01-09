import React from "react";
import { useTranslation } from "react-i18next";
import { EmptyIconCAM } from "@/assets/icons";
import styles from "./index.module.less";

const BlankPage: React.FC<{ message?: string }> = ({ message }) => {
    const { t } = useTranslation();

    return (
        <div
            className={styles.loadingCenter}
            style={{ flexDirection: "column" }}
        >
            <img src={EmptyIconCAM} alt="Empty" width={200} />
            <div
                style={{
                    marginTop: 16,
                    color: "var(--color-text-3)",
                    fontSize: 14,
                }}
            >
                {message || t("common.noData")}
            </div>
        </div>
    );
};

export default BlankPage;
