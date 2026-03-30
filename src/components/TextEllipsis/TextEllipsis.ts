import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * 文本省略组件支持的浮层主题。
 */
export type TextEllipsisEffect = 'dark' | 'light'

/**
 * 文本省略组件的入参定义。
 */
export interface TextEllipsisProps {
  /** 需要展示的文本内容。 */
  text?: string
  /** 是否强制显示 tooltip。 */
  omit?: boolean
  /** 追加到文本节点上的样式类。 */
  textClass?: string
  /** 展示的最大行数。 */
  lines?: number
  /** tooltip 的主题效果。 */
  effect?: TextEllipsisEffect
}

/**
 * 文本省略组件的默认入参。
 */
export const textEllipsisPropsDefaults: Required<TextEllipsisProps> = {
  text: '',
  omit: false,
  textClass: '',
  lines: 1,
  effect: 'dark'
}

/**
 * 文本省略组件对外抛出的事件定义。
 */
export interface TextEllipsisEmits {
  /** 点击文本区域时抛出。 */
  (e: 'click'): void
}

/**
 * 提供文本省略组件的显示状态与交互逻辑。
 */
export function useTextEllipsis(
  props: Readonly<Required<TextEllipsisProps>>,
  emit: TextEllipsisEmits
) {
  /**
   * 文本元素引用，用于计算是否发生溢出。
   */
  const textRef = ref<HTMLElement>()

  /**
   * 当前文本是否已经溢出可见区域。
   */
  const isOverflow = ref(false)

  /**
   * 是否应显示 tooltip。
   */
  const tooltipShow = computed(() => (props.omit ? props.omit : isOverflow.value))

  /**
   * tooltip 额外样式类。
   */
  const tooltipClass = computed(() =>
    props.effect === 'light'
      ? 'card-text_ellipsis card-text_ellipsis_light'
      : 'card-text_ellipsis'
  )

  /**
   * 重新计算文本溢出状态。
   */
  const checkOverflow = () => {
    const el = textRef.value

    if (!el) {
      isOverflow.value = false
      return
    }

    if (props.lines > 1) {
      isOverflow.value = el.scrollHeight > el.clientHeight
      return
    }

    isOverflow.value = el.scrollWidth > el.clientWidth
  }

  /**
   * 对外转发点击事件。
   */
  const handleClick = () => {
    emit('click')
  }

  /**
   * 窗口尺寸变化后重新检测溢出。
   */
  const handleResize = () => {
    checkOverflow()
  }

  watch(
    () => [props.text, props.lines] as const,
    () => {
      nextTick(() => {
        checkOverflow()
      })
    },
    { immediate: true }
  )

  onMounted(() => {
    window.addEventListener('resize', handleResize)
    nextTick(() => {
      checkOverflow()
    })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    textRef,
    tooltipShow,
    tooltipClass,
    handleClick
  }
}
