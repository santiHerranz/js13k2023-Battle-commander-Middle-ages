import { soundWaitTime } from '@/index.js'
import zzfx from './zzfx.js'

export const sound = (s: (number | undefined)[]) => {
  if (!soundWaitTime.elapsed()) return
  zzfx(...s)
  soundWaitTime.set(.05)
}
