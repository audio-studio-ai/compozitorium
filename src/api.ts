const KEY = 'astudio.api'
const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_PORT = '8087'

export type ApiHostPort = { host: string; port: string }
export type ApiServer = ApiHostPort & { id: string; name: string }
export type AppConfig = ApiHostPort & { servers: ApiServer[]; activeId: string }

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `s-${Date.now()}`
}

export function normalizeHostPort(hostRaw: string, portRaw: string): ApiHostPort {
  let host = hostRaw.trim().replace(/^https?:\/\//i, '')
  let port = portRaw.trim() || DEFAULT_PORT
  const cut = host.indexOf('/')
  if (cut >= 0) host = host.slice(0, cut)
  if (host.includes(':') && !portRaw.trim()) {
    const i = host.lastIndexOf(':')
    port = host.slice(i + 1) || port
    host = host.slice(0, i)
  }
  return { host: host || DEFAULT_HOST, port: port.replace(/\D/g, '') || DEFAULT_PORT }
}

function coerceServer(s: Partial<ApiServer>, fallback: ApiHostPort): ApiServer {
  const hp = normalizeHostPort(String(s.host || fallback.host), String(s.port || fallback.port))
  return { id: String(s.id || uid()), name: String(s.name || '').trim(), ...hp }
}

export function normalizeConfig(raw?: Partial<AppConfig> | null): AppConfig {
  const hp = normalizeHostPort(String(raw?.host || DEFAULT_HOST), String(raw?.port || DEFAULT_PORT))
  let servers = Array.isArray(raw?.servers) ? raw.servers.map((s) => coerceServer(s, hp)) : []
  if (!servers.length) servers = [{ id: 'local', name: 'Local', ...hp }]
  let activeId = String(raw?.activeId || '')
  if (!servers.some((s) => s.id === activeId)) {
    activeId = (servers.find((s) => s.host === hp.host && s.port === hp.port) || servers[0]).id
  }
  const active = servers.find((s) => s.id === activeId)!
  return { host: active.host, port: active.port, servers, activeId }
}

export function serverLabel(s: ApiServer) {
  return s.name.trim() || `${s.host}:${s.port}`
}

function fromLs(): AppConfig {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return normalizeConfig(JSON.parse(raw) as Partial<AppConfig>)
  } catch {
    /* ignore */
  }
  return normalizeConfig(null)
}

let state: AppConfig = fromLs()
const cfgListeners = new Set<() => void>()

export function subscribeServers(fn: () => void) {
  cfgListeners.add(fn)
  return () => {
    cfgListeners.delete(fn)
  }
}

export function getServerSnapshot(): AppConfig {
  return state
}

export class BackendError extends Error {
  kind = 'offline' as const
  constructor(message: string) {
    super(message)
  }
}

const listeners = new Set<(e: BackendError) => void>()

export function subscribeBackendError(fn: (e: BackendError) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function emit(e: BackendError) {
  listeners.forEach((fn) => fn(e))
}

export function openBackendSettings() {
  emit(
    new BackendError(
      'Нет связи с Ai. Проверьте, что сервер запущен, и укажите его адрес и порт.',
    ),
  )
}

export function uiMessage(e: unknown): string {
  if (e instanceof BackendError) return ''
  return e instanceof Error ? e.message : String(e)
}

export function getApiHostPort(): ApiHostPort {
  return { host: state.host, port: state.port }
}

function remember(next: AppConfig) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  cfgListeners.forEach((fn) => fn())
}

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

async function persistDisk(next: AppConfig) {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('save_config', next)
    return
  }
  await fetch('/api/app-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(next),
  })
}

async function commit(next: AppConfig) {
  remember(next)
  try {
    await persistDisk(next)
  } catch {
    /* cache + localStorage already set */
  }
}

export async function loadApiConfig(): Promise<ApiHostPort> {
  if (isTauri()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const j = await invoke<Partial<AppConfig>>('load_config')
      if (j?.host && j.port) {
        remember(normalizeConfig(j))
        return getApiHostPort()
      }
    } catch {
      /* no file yet */
    }
  }
  try {
    const r = await fetch('/api/app-config')
    if (r.ok) remember(normalizeConfig((await r.json()) as Partial<AppConfig>))
  } catch {
    /* keep cache */
  }
  return getApiHostPort()
}

export async function setApiHostPort(host: string, port: string) {
  const hp = normalizeHostPort(host, port)
  const servers = state.servers.map((s) => (s.id === state.activeId ? { ...s, ...hp } : s))
  await commit({ ...hp, servers, activeId: state.activeId })
}

export async function selectServer(id: string) {
  const s = state.servers.find((x) => x.id === id)
  if (!s) return
  await commit({ host: s.host, port: s.port, servers: state.servers, activeId: s.id })
}

export async function saveServerList(servers: ApiServer[], activeId: string) {
  await commit(normalizeConfig({ servers, activeId }))
}

export function apiOrigin(): string {
  const { host, port } = getApiHostPort()
  return `http://${host}:${port}`
}

function sameOriginProxy(): boolean {
  try {
    const { port } = window.location
    return port === '1420' || port === '5173'
  } catch {
    return false
  }
}

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return sameOriginProxy() ? p : `${apiOrigin()}${p}`
}

function cookieCsrf(): string {
  try {
    const m = document.cookie.match(/(?:^|;\s*)(?:_csrf|csrf)=([^;]+)/i)
    return m ? decodeURIComponent(m[1]) : ''
  } catch {
    return ''
  }
}

async function ensureCsrf(): Promise<string> {
  let t = cookieCsrf()
  if (t) return t
  try {
    await fetch(apiUrl('/v1/models'), { credentials: 'include' })
  } catch {
    /* ignore */
  }
  return cookieCsrf()
}

function withCsrf(init: RequestInit, token: string): RequestInit {
  const headers = new Headers(init.headers)
  if (token) {
    headers.set('X-CSRF-Token', token)
    headers.set('X-CSRF-TOKEN', token)
  }
  return { ...init, headers, credentials: 'include' }
}

function isCsrfError(msg: string, status: number): boolean {
  return status === 400 && /csrf/i.test(msg)
}

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data?.error === 'string') return data.error
    return data?.error?.message || data?.message || res.statusText || `HTTP ${res.status}`
  } catch {
    return res.statusText || `HTTP ${res.status}`
  }
}

function failOffline(detail?: string): never {
  const err = new BackendError(
    detail ||
      'Нет связи с Ai. Проверьте, что сервер запущен, и укажите его адрес и порт.',
  )
  emit(err)
  throw err
}

async function apiFetch(path: string, init: RequestInit): Promise<Response> {
  const token = await ensureCsrf()
  let res: Response
  try {
    res = await fetch(apiUrl(path), withCsrf(init, token))
  } catch {
    failOffline()
  }
  if (!res.ok && isCsrfError(await res.clone().text().catch(() => ''), res.status)) {
    try {
      res = await fetch(apiUrl(path), withCsrf(init, await ensureCsrf()))
    } catch {
      failOffline()
    }
  }
  if (res.ok) return res
  if (res.status === 502 || res.status === 503 || res.status === 504) {
    failOffline('Сервер не отвечает. Возможно, AI ещё запускается или указан неверный адрес.')
  }
  const raw = await readError(res)
  if (isCsrfError(raw, res.status)) {
    throw new Error('Сервер отклонил запрос (CSRF). Сохраните адрес ещё раз и повторите.')
  }
  throw new Error(raw)
}

export async function probeBackend(): Promise<boolean> {
  try {
    const res = await fetch(apiUrl('/v1/models'), {
      credentials: 'include',
      signal: AbortSignal.timeout(4000),
    })
    return res.ok
  } catch {
    return false
  }
}

export type ModelKind = 'asr' | 'tts' | 'music' | 'chat'

export type InstalledModel = { id: string; kind: ModelKind }

function usecasesOf(item: Record<string, unknown>): string[] {
  const raw = item.known_usecases ?? item.knownUseCases ?? item.usecases ?? item.use_cases
  if (!Array.isArray(raw)) return []
  return raw.map((x) => String(x).toLowerCase())
}

export function classifyModel(id: string, extra?: { backend?: string; usecases?: string[] }): ModelKind | null {
  const u = extra?.usecases ?? []
  const blob = [id, extra?.backend, ...u].join(' ').toLowerCase()
  if (u.some((x) => /transcript|transcri|asr|stt/.test(x)) || /whisper|asr[-_]|qwen-asr|speech[-_]?to[-_]?text/.test(blob)) {
    return 'asr'
  }
  if (
    u.some((x) => x === 'tts' || x.includes('text-to-speech')) ||
    /(^|[^a-z])tts([^a-z]|$)|piper|kokoro|voicedesign|qwen3-tts|voice-/.test(blob)
  ) {
    return 'tts'
  }
  if (
    u.some((x) => /sound_generation|audio_generation|music/.test(x)) ||
    /acestep|ace-step|sound[-_]?gen/.test(blob)
  ) {
    return 'music'
  }
  if (
    u.some((x) => /chat|llm|completion|instruct/.test(x)) ||
    /assistant|thinking|llama|gemma|mistral|deepseek|gpt[-_.]|phi[-_\d]|glm|smollm|olmo|vicuna/.test(blob) ||
    (/qwen/.test(blob) && !/tts|asr|audio[-_]|[-_]audio/.test(blob))
  ) {
    return 'chat'
  }
  return null
}

function parseModelList(data: unknown): InstalledModel[] {
  if (!data || typeof data !== 'object') return []
  const rec = data as Record<string, unknown>
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(rec.data)
      ? rec.data
      : Array.isArray(rec.models)
        ? rec.models
        : []
  const out: InstalledModel[] = []
  const seen = new Set<string>()
  for (const raw of arr) {
    if (!raw || typeof raw !== 'object') continue
    const item = raw as Record<string, unknown>
    const id = String(item.id || item.name || '').trim()
    if (!id || seen.has(id)) continue
    const kind = classifyModel(id, {
      backend: item.backend ? String(item.backend) : undefined,
      usecases: usecasesOf(item),
    })
    if (!kind) continue
    seen.add(id)
    out.push({ id, kind })
  }
  return out
}

/** null — сервер недоступен */
export async function listInstalledModels(): Promise<InstalledModel[] | null> {
  try {
    const res = await fetch(apiUrl('/v1/models'), {
      credentials: 'include',
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return null
    return parseModelList(await res.json())
  } catch {
    return null
  }
}

/** Фиксированная ASR для микрофонов в полях и у Миры (не из селекта футера). */
export const SPEECH_ASR_MODEL = 'asr-1'

export async function chatAssistant(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  opts?: { system?: string; temperature?: number; model?: string },
): Promise<{ content: string }> {
  const system = {
    role: 'system' as const,
    content:
      opts?.system ||
      'Ты — Мира, музыкальный ассистент AudioStudio Ai. Помогаешь с caption, lyrics и TTS instructions. Отвечай по-русски коротко. На простые вопросы — сразу финальный ответ без длинных рассуждений. Если просят промпт/текст — сразу готовый вариант.',
  }
  const res = await apiFetch(
    '/v1/chat/completions',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: opts?.model || 'assistant-1',
        messages: [system, ...messages.filter((m) => m.role !== 'system')],
        temperature: opts?.temperature ?? 0.6,
        max_tokens: 4096,
      }),
    },
  )
  const data = await res.json()
  const msg = data?.choices?.[0]?.message ?? {}
  let content = String(msg.content ?? '').trim()
  let thinking = String(msg.reasoning_content ?? msg.reasoning ?? '').trim()

  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/i)
  if (thinkMatch) {
    thinking = thinking || thinkMatch[1].trim()
    content = content.replace(thinkMatch[0], '').trim()
  }

  if (!content && thinking) {
    const lines = thinking.split('\n').map((l: string) => l.trim()).filter(Boolean)
    content = lines.slice(-3).join(' ')
  }

  if (!content) content = 'Пустой ответ модели'
  return { content }
}

/** Куда переводить: кириллица → EN, латиница → RU (после перевода направление само «переключается»). */
export function detectTranslateTarget(text: string): 'ru' | 'en' {
  const cyr = (text.match(/\p{Script=Cyrillic}/gu) ?? []).length
  const lat = (text.match(/\p{Script=Latin}/gu) ?? []).length
  return cyr >= lat ? 'en' : 'ru'
}

export async function translateText(text: string, to: 'ru' | 'en', model?: string): Promise<string> {
  const toLabel = to === 'ru' ? 'русский' : 'English'
  const { content } = await chatAssistant([{ role: 'user', content: text }], {
    temperature: 0.2,
    model,
    system: `Ты переводчик. Переведи текст на ${toLabel}. Верни ТОЛЬКО перевод — без кавычек, пояснений и рассуждений. Сохрани переносы строк и метки вроде [Verse]/[Chorus].`,
  })
  return content
}

export async function speak(input: string, instructions?: string, model = 'tts-1'): Promise<Blob> {
  const instruct =
    (instructions || '').trim() ||
    'expressive intimate female Russian voice, warm breathy tone, clear diction'
  const res = await apiFetch(
    '/v1/audio/speech',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        input,
        language: 'ru',
        response_format: 'wav',
        // OpenAI + qwen3-tts-cpp: оба ключа, чтобы instruct точно дошёл
        instructions: instruct,
        instruct,
        params: {
          max_frames: '6000',
          instruct,
        },
      }),
    },
  )
  const buf = await res.arrayBuffer()
  return new Blob([buf], { type: res.headers.get('content-type') || 'audio/wav' })
}

export type MusicRequest = {
  caption: string
  lyrics: string
  bpm: number
  durationSeconds: number
  instrumental?: boolean
  keyscale?: string
  language?: string
  timesignature?: string
  model?: string
}

export async function generateMusic(req: MusicRequest): Promise<Blob> {
  const caption = req.instrumental
    ? req.caption
    : `${req.caption}. IMPORTANT: perform ALL lyrics completely end-to-end, do not cut short, do not say continuation.`
  const model = req.model || 'acestep-v15-sft'
  const meta = {
    bpm: req.bpm,
    ...(req.keyscale ? { keyscale: req.keyscale } : {}),
    ...(req.timesignature && req.timesignature !== 'auto'
      ? { timesignature: req.timesignature }
      : {}),
  }
  const body = req.instrumental
    ? {
        model,
        model_id: model,
        text: caption,
        instrumental: true,
        duration_seconds: req.durationSeconds,
        response_format: 'wav',
        audio_format: 'wav',
        ...meta,
      }
    : {
        model,
        model_id: model,
        caption,
        lyrics: req.lyrics,
        language: req.language || 'ru',
        duration_seconds: req.durationSeconds,
        think: true,
        response_format: 'wav',
        audio_format: 'wav',
        ...meta,
      }
  const res = await apiFetch(
    '/v1/sound-generation',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
  const buf = await res.arrayBuffer()
  return new Blob([buf], { type: res.headers.get('content-type') || 'audio/wav' })
}
