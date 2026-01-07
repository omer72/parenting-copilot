# Parenting Copilot 👨‍👩‍👧‍👦

אפליקציית עזרה מעשית להורים להתמודדות עם סיטואציות מאתגרות עם ילדים.

## ✨ תכונות

- 🎯 עזרה מיידית בסיטואציות מאתגרות
- 👶 ניהול פרופילים של מספר ילדים
- 🤖 תשובות מותאמות אישית באמצעות Claude AI
- 📱 ממשק מודרני וידידותי
- 🇮🇱 ממשק בעברית

## 🚀 התקנה

```bash
# התקן תלויות
npm install

# העתק את קובץ הסביבה לדוגמה
cp .env.example .env

# ערוך את קובץ .env והוסף את מפתח ה-API של Anthropic
# VITE_ANTHROPIC_API_KEY=your_api_key_here
```

## 🔑 קבלת API Key

### אופציה 1: OpenAI (מומלץ)
1. היכנס ל-[OpenAI Platform](https://platform.openai.com/)
2. צור חשבון או התחבר
3. עבור ל-API Keys
4. צור מפתח חדש והעתק אותו
5. הדבק את המפתח בקובץ `.env`:
   ```
   VITE_OPENAI_API_KEY=sk-...
   ```

### אופציה 2: Claude (Anthropic)
1. היכנס ל-[Anthropic Console](https://console.anthropic.com/)
2. צור חשבון או התחבר
3. עבור ל-API Keys
4. צור מפתח חדש והעתק אותו
5. הדבק את המפתח בקובץ `.env`:
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

**הערה:** אפשר להגדיר את שני המפתחות - המערכת תשתמש ב-OpenAI כברירת מחדל ותעבור ל-Claude כ-fallback.

## 💻 הפעלה

```bash
# הפעל את שרת הפיתוח
npm run dev

# בניה לפרודקשן
npm run build

# תצוגה מקדימה של הבניה
npm run preview
```

## ⚠️ הערה חשובה לפרודקשן

הקוד הנוכחי משתמש ב-`dangerouslyAllowBrowser: true` כדי לאפשר קריאות ישירות ל-Claude API מהדפדפן. 

**בפרודקשן, מומלץ מאוד:**
- להעביר את הקריאות ל-API דרך שרת backend
- לשמור את מפתח ה-API בצד השרת בלבד
- להשתמש ב-environment variables מאובטחות

## 🛠️ טכנולוגיות

- **React 19** - ספריית UI
- **TypeScript** - פיתוח מאובטח עם טיפוסים
- **Vite** - כלי build מהיר
- **TailwindCSS 4** - עיצוב מודרני
- **React Router** - ניווט
- **Anthropic Claude / OpenAI GPT-4** - AI לתשובות חכמות

## 📝 רישיון

פרויקט פרטי

## 💡 תמיכה

לא מחליף ייעוץ מקצועי - האפליקציה מספקת עצות כלליות בלבד.
