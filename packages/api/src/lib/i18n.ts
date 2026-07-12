interface PhraseSet {
  pwdTitle: string
  pwdLabel: string
  pwdPlaceholder: string
  pwdError: string
  proceed: string
  warnTitle: string
  warnDesc: string
  retreat: string
}

const LOCALES = ['de-DE', 'en-US', 'fr-FR', 'id-ID', 'it-IT', 'pt-BR', 'pt-PT', 'vi-VN', 'zh-CN', 'zh-TW'] as const
export type Locale = typeof LOCALES[number]
const FALLBACK = 'en-US'

export const PHRASES: Record<string, PhraseSet> = {
  'de-DE': { pwdTitle: 'Passwort erforderlich', pwdLabel: 'Passwort', pwdPlaceholder: 'Passwort eingeben', pwdError: 'Falsches Passwort', proceed: 'Weiter', warnTitle: 'Potenziell unsicherer Link', warnDesc: 'Dieser Link wurde als potenziell unsicher markiert.', retreat: 'Zurück' },
  'en-US': { pwdTitle: 'Password Required', pwdLabel: 'Password', pwdPlaceholder: 'Enter password', pwdError: 'Incorrect password', proceed: 'Continue', warnTitle: 'Potentially Unsafe Link', warnDesc: 'This link has been flagged as potentially unsafe. Proceed with caution.', retreat: 'Go Back' },
  'fr-FR': { pwdTitle: 'Mot de passe requis', pwdLabel: 'Mot de passe', pwdPlaceholder: 'Entrez le mot de passe', pwdError: 'Mot de passe incorrect', proceed: 'Continuer', warnTitle: 'Lien potentiellement dangereux', warnDesc: 'Ce lien a été signalé comme potentiellement dangereux.', retreat: 'Retour' },
  'id-ID': { pwdTitle: 'Diperlukan Kata Sandi', pwdLabel: 'Kata Sandi', pwdPlaceholder: 'Masukkan kata sandi', pwdError: 'Kata sandi salah', proceed: 'Lanjutkan', warnTitle: 'Tautan Berpotensi Tidak Aman', warnDesc: 'Tautan ini telah ditandai berpotensi tidak aman.', retreat: 'Kembali' },
  'it-IT': { pwdTitle: 'Password richiesta', pwdLabel: 'Password', pwdPlaceholder: 'Inserisci la password', pwdError: 'Password errata', proceed: 'Continua', warnTitle: 'Link potenzialmente non sicuro', warnDesc: 'Questo link è stato contrassegnato come potenzialmente non sicuro.', retreat: 'Indietro' },
  'pt-BR': { pwdTitle: 'Senha necessária', pwdLabel: 'Senha', pwdPlaceholder: 'Digite a senha', pwdError: 'Senha incorreta', proceed: 'Continuar', warnTitle: 'Link potencialmente inseguro', warnDesc: 'Este link foi sinalizado como potencialmente inseguro.', retreat: 'Voltar' },
  'pt-PT': { pwdTitle: 'Palavra-passe necessária', pwdLabel: 'Palavra-passe', pwdPlaceholder: 'Introduza a palavra-passe', pwdError: 'Palavra-passe incorreta', proceed: 'Continuar', warnTitle: 'Ligação potencialmente insegura', warnDesc: 'Esta ligação foi assinalada como potencialmente insegura.', retreat: 'Voltar' },
  'vi-VN': { pwdTitle: 'Yêu cầu mật khẩu', pwdLabel: 'Mật khẩu', pwdPlaceholder: 'Nhập mật khẩu', pwdError: 'Mật khẩu không đúng', proceed: 'Tiếp tục', warnTitle: 'Liên kết có thể không an toàn', warnDesc: 'Liên kết này đã bị đánh dấu là có thể không an toàn.', retreat: 'Quay lại' },
  'zh-CN': { pwdTitle: '需要密码', pwdLabel: '密码', pwdPlaceholder: '请输入密码', pwdError: '密码错误', proceed: '继续', warnTitle: '潜在不安全链接', warnDesc: '此链接已被标记为潜在不安全。请谨慎访问。', retreat: '返回' },
  'zh-TW': { pwdTitle: '需要密碼', pwdLabel: '密碼', pwdPlaceholder: '請輸入密碼', pwdError: '密碼錯誤', proceed: '繼續', warnTitle: '潛在不安全連結', warnDesc: '此連結已被標記為潛在不安全。請謹慎訪問。', retreat: '返回' },
}

const ALIASES: Record<string, Locale> = {
  de: 'de-DE', en: 'en-US', fr: 'fr-FR', id: 'id-ID', it: 'it-IT',
  pt: 'pt-BR', vi: 'vi-VN', zh: 'zh-CN', 'zh-Hans': 'zh-CN', 'zh-Hant': 'zh-TW',
}

function resolve(code: string | undefined): Locale | undefined {
  if (!code) return undefined
  const norm = code.replace('_', '-')
  try {
    const c = Intl.getCanonicalLocales(norm)[0]
    if ((LOCALES as readonly string[]).includes(c)) return c as Locale
    const a = ALIASES[c]
    if (a) return a
    const p = c.split('-')[0]
    return p ? ALIASES[p] : undefined
  } catch { return undefined }
}

export function detectLocale(acceptLang?: string): Locale {
  if (!acceptLang) return FALLBACK
  for (const code of acceptLang.split(',').map((s: string) => s.split(';')[0].trim())) {
    const loc = resolve(code)
    if (loc) return loc
  }
  return FALLBACK
}
