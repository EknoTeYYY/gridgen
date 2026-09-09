// Lança e reaproveita UM browser Puppeteer para todos os slides de um job (a
// versão original do script abria um processo Chrome novo por slide via CLI —
// lento e não portável). Usa a API real do puppeteer-core em vez de
// `execFileSync` chamando o binário com `--screenshot`, o que também permite
// passar `--no-sandbox`, exigido pela maioria das VMs/containers Linux
// rodando como root.
import { existsSync } from 'node:fs'
import puppeteer, { type Browser } from 'puppeteer-core'

const CANDIDATOS_LINUX = [
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
]
const CANDIDATOS_WINDOWS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
]

export function encontrarExecutavelChrome(): string {
  const candidatos = [process.env.CHROME, ...CANDIDATOS_LINUX, ...CANDIDATOS_WINDOWS].filter(
    (c): c is string => Boolean(c),
  )
  for (const caminho of candidatos) {
    if (existsSync(caminho)) return caminho
  }
  throw new Error('Chrome/Chromium não encontrado. Defina a env CHROME com o caminho do executável.')
}

let browserPromise: Promise<Browser> | null = null

export function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      executablePath: encontrarExecutavelChrome(),
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--hide-scrollbars',
        '--no-first-run',
        '--no-default-browser-check',
      ],
    })
  }
  return browserPromise
}

export async function closeBrowser(): Promise<void> {
  if (!browserPromise) return
  const browser = await browserPromise
  browserPromise = null
  await browser.close()
}
