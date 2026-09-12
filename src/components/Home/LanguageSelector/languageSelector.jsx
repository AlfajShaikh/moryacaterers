import { useEffect, useState } from "react";

export default function LanguageSelector() {
    const [language, setLanguage] = useState(
        () => sessionStorage.getItem("selectedLanguage") || "mr"
    );

    useEffect(() => {
        sessionStorage.setItem("selectedLanguage", language);
    }, [language]);

    return (
        <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
        >
            <option value="mr">मराठी</option>
            <option value="en">English</option>
        </select>
    );
}