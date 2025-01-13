import { type MaybeElementRef, useElementBounding } from '@vueuse/core'
import type { CSSProperties } from 'vue'

export interface Transfromer {
  x: number | string
  y: number | string
  center?: boolean
}

function checkChromium(): boolean {
  return navigator.userAgent.includes('Chrome')
}

/**
 * Covert transform to top and left style, if no chromium, use transform
 * @param transfromer
 */
export function createTransformer(target: MaybeElementRef, transfromer: Transfromer): Ref<CSSProperties> {
  const isChromium = checkChromium()
  const style = ref<CSSProperties>({})
  const rect = useElementBounding(target, {
    windowResize: true,
    windowScroll: true,
  })

  watchEffect(() => {
    let x = transfromer.x
    let y = transfromer.y

    if (transfromer.center && isChromium) {
      if (typeof transfromer.x === 'number') {
        x = `calc(${transfromer.x}px - ${rect.width.value / 2}px)`
      }
      else {
        x = `calc(${transfromer.x} - ${rect.width.value / 2}px)`
      }

      if (typeof transfromer.y === 'number') {
        y = `calc(${transfromer.y}px - ${rect.height.value / 2}px)`
      }
      else {
        y = `calc(${transfromer.y} - ${rect.height.value / 2}px)`
      }
    }

    if (isChromium) {
      style.value = {
        top: y,
        left: x,
      }
    }
    else {
      style.value = {
        transform: `translate(${x}, ${y})`,
        transformOrigin: transfromer.center ? 'center' : 'top left',
      }
    }
  })

  return style
}
