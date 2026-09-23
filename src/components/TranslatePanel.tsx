import React, { useEffect, useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../i18n/translations';

interface Props {
  /** Field name -> original English text. */
  fields: Record<string, string>;
  /** Rendered with the active text for each field. */
  children: (text: Record<string, string>, translated: boolean) => React.ReactNode;
}

/**
 * Shows an analysis in the reader's language on request.
 *
 * The analysis itself is always produced and verified in English, because the
 * evidence corpus that grounds it is English. Translating at display time keeps
 * the verified text and the retrieved evidence in the same language, so a
 * reviewer can still check one against the other — and the banner makes clear
 * that what is on screen is a machine translation, not the verified original.
 */
export const TranslatePanel: React.FC<Props> = ({ fields, children }) => {
  const { lang, t } = useLanguage();
  const [translated, setTranslated] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  // A new claim or a new language invalidates whatever was fetched before.
  useEffect(() => {
    setTranslated(null);
    setShowTranslation(false);
  }, [lang, JSON.stringify(Object.keys(fields).map((k) => fields[k]?.slice(0, 40)))]);

  const run = async () => {
    if (showTranslation) {
      setShowTranslation(false);
      return;
    }
    if (translated) {
      setShowTranslation(true);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: lang, fields }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setTranslated(data.fields || null);
      setShowTranslation(true);
    } catch {
      setShowTranslation(false);
    } finally {
      setBusy(false);
    }
  };

  const active = showTranslation && translated ? translated : fields;
  const native = LANGUAGES.find((l) => l.code === lang)?.native ?? 'English';

  return (
    <div className="space-y-3">
      {lang !== 'en' && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={run}
            disabled={busy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider border border-cyan-400/50 text-cyan-300 hover:bg-cyan-400 hover:text-slate-950 transition-all disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
            {busy
              ? t('common.translating')
              : showTranslation
                ? t('common.showOriginal')
                : `${t('common.translate')} — ${native}`}
          </button>

          {showTranslation && translated && (
            <span className="text-[11px] italic text-amber-400/90">{t('common.translatedNote')}</span>
          )}
        </div>
      )}

      {children(active, showTranslation && !!translated)}
    </div>
  );
};
