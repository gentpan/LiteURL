export interface AppEnv {
  port: number
  secret: string
  dbFile: string
  dataRoot: string
  fwdCode: number
  caseFold: boolean
  passQuery: boolean
  noCache: boolean
  landingTarget: string
  fallbackPage: string
  aiKey: string
  aiEndpoint: string
  aiModel: string
  aiSlugPrompt: string
  aiMetaPrompt: string
  hookUrl: string
  hookSecret: string
  corsOn: boolean
  safeCheckDoh: string
  suppressBotLogs: boolean
  autoBackupOff: boolean
  aliasLen: number
  pageLimit: number
}

export function getEnv(): AppEnv {
  return {
    port: Number(process.env.SERVER_PORT || '3000'),
    secret: process.env.SERVER_SITE_TOKEN || 'ChangeMe',
    dbFile: process.env.SERVER_DB_PATH || './data/app.db',
    dataRoot: process.env.SERVER_DATA_DIR || './data',
    fwdCode: Number(process.env.REDIRECT_STATUS_CODE || '308'),
    caseFold: process.env.REDIRECT_CASE_SENSITIVE !== 'true',
    passQuery: process.env.REDIRECT_WITH_QUERY === 'true',
    noCache: process.env.REDIRECT_NO_STORE === 'true',
    landingTarget: process.env.HOME_URL || '',
    fallbackPage: process.env.NOT_FOUND_REDIRECT || '',
    aiKey: process.env.AI_API_KEY || '',
    aiEndpoint: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    aiModel: process.env.AI_MODEL || 'gpt-4o-mini',
    aiSlugPrompt: process.env.AI_PROMPT || `You are an alias generator. Given a URL or page content, generate a concise, URL-friendly alias.
Rules:
- The alias must match: /^[a-zA-Z0-9_-]+$/
- Return ONLY JSON: {"alias": "your-alias-here"}
- Keep it short (3-6 characters ideal)
- Use lowercase letters and hyphens
- Make it human-readable and memorable`,
    aiMetaPrompt: process.env.AI_OG_PROMPT || `You are a metadata generator. Given a URL or page content, generate a title and description.
Return ONLY JSON: {"title": "...", "description": "..."}
Title: max 70 chars, descriptive and accurate.
Description: max 200 chars, concise summary.`,
    hookUrl: process.env.WEBHOOK_URL || '',
    hookSecret: process.env.WEBHOOK_SECRET || '',
    corsOn: process.env.API_CORS === 'true',
    safeCheckDoh: process.env.SAFE_BROWSING_DOH || '',
    suppressBotLogs: process.env.DISABLE_BOT_ACCESS_LOG === 'true',
    autoBackupOff: process.env.DISABLE_AUTO_BACKUP === 'true',
    aliasLen: Number(process.env.SLUG_DEFAULT_LENGTH || '6'),
    pageLimit: Number(process.env.LIST_QUERY_LIMIT || '500'),
  }
}
