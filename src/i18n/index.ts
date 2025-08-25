import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import tr from "./tr";
import en from "./en";

const locales = Localization.getLocales?.() ?? [];
const languageCode = locales[0]?.languageCode?.toLowerCase() ?? "en";

i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    lng: languageCode === "tr" ? "tr" : "en",
    fallbackLng: "en",
    resources: {
        tr: { translation: tr },
        en: { translation: en },
    },
    interpolation: { escapeValue: false },
});

export default i18n;