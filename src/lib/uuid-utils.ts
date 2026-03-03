// Stub — will be removed once ID strategy is unified in Step 1
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

export function cuidToUuid(cuid: string): string {
  const hash = crypto.createHash('sha256').update(cuid).digest('hex')
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32),
  ].join('-')
}

export function generateUuid(): string {
  return uuidv4()
}
