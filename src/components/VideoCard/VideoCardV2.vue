<script setup lang="ts">
import { useElementHover, useEventListener } from '@vueuse/core'
import Button from '../Button.vue'
import type { VideoCardProps } from './types'
import VideoCardSkeleton from './VideoCardSkeleton.vue'
import { calcTimeSince, numFormatter } from '~/utils/dataFormatter'
import { getCSRF, removeHttpFromUrl } from '~/utils/main'
import { settings } from '~/logic'
import type { VideoPreviewResult } from '~/models/video/videoPreview'
import { useApiClient } from '~/composables/api'
import { useProfileCard } from '~/composables/useProfileCard'

const props = withDefaults(defineProps<VideoCardProps>(), {
  topRightContent: true,
  type: 'horizontal',
})

const emit = defineEmits<{
  (e: 'moreClick', event: MouseEvent): MouseEvent
  (e: 'undo'): void
}>()

const api = useApiClient()
const p = useProfileCard()
const warperEl = ref<HTMLElement>()
const previewEl = ref<HTMLElement>()
const avatarEl = ref<HTMLElement>()
useEventListener(avatarEl, 'mouseenter', () => {
  p.open(props.mid!, avatarEl.value!)
})
useEventListener(avatarEl, 'mouseleave', () => {
  p.close()
})

const previewVideoUrl = ref<string>()
const previewPictureLoaded = ref(false)
const isInWatchLater = ref(false)

const videoUrl = computed(() => {
  if (props.bvid || props.aid)
    return `https://www.bilibili.com/video/${props.bvid ?? `av${props.aid}`}`
  else if (props.epid)
    return `https://www.bilibili.com/bangumi/play/ss${props.epid}`
  else if (props.uri)
    return props.uri
  return ''
})
const authorUrl = computed(() => {
  if (props.authorUrl)
    return props.authorUrl
  else if (props.mid)
    return `//space.bilibili.com/${props.mid}`
  else
    return ''
})

const isHoverPreviewEl = useElementHover(previewEl)
const showPreviewVideo = computed(() => props.showPreview && settings.value.enableVideoPreview && previewVideoUrl && isHoverPreviewEl.value)

function toggleWatchLater() {
  const id = props.id
  const csrf = getCSRF()
  if (!isInWatchLater.value) {
    api.watchlater.saveToWatchLater({
      aid: id,
      csrf,
    })
      .then((res) => {
        if (res.code === 0)
          isInWatchLater.value = true
      })
  }
  else {
    api.watchlater.removeFromWatchLater({
      aid: id,
      csrf,
    })
      .then((res) => {
        if (res.code === 0)
          isInWatchLater.value = false
      })
  }
}

watch(isHoverPreviewEl, (isHover) => {
  if (props.showPreview && settings.value.enableVideoPreview && isHover && !previewVideoUrl.value) {
    api.video.getVideoPreview({
      bvid: props.bvid,
      cid: props.cid,
    }).then((res: VideoPreviewResult) => {
      if (res.code === 0)
        previewVideoUrl.value = res.data.durl[0].url
    })
  }
})
</script>

<template>
  <div ref="warperEl" class="video-card-wrapper of-hidden rounded-$bew-radius" style="content-visibility: auto;">
    <!-- bewly video card -->
    <div v-if="!skeleton" flex="~ col gap-y-2" class="bewly-video-card">
      <!-- video card cover -->
      <a :href="videoUrl" target="_blank" rel="noopener noreferrer" :draggable="!showPreviewVideo">
        <div ref="previewEl" class="group relative of-hidden rounded-$bew-radius" flex="~ justify-center items-center">
          <picture draggable="false">
            <source :srcset="`${removeHttpFromUrl(cover)}` + '@672w_378h_1c_!web-home-common-cover.avif'" type="image/avif">
            <source :srcset="`${removeHttpFromUrl(cover)}` + '@672w_378h_1c_!web-home-common-cover.webp'" type="image/webp">
            <img :src="`${removeHttpFromUrl(cover)}` + '@672w_378h_1c_!web-home-common-cover'" loading="lazy" class="w-full max-w-full min-h-196px align-middle aspect-video" bg="cover center" @load="previewPictureLoaded = true">
          </picture>

          <!-- preview picture skeleton -->
          <div v-if="!previewPictureLoaded" class="animate-pulse" pos="absolute top-0 left-0 bottom-0 right-0" bg="$bew-fill-2" />

          <!-- preview video -->
          <Transition name="fade">
            <div v-if="showPreviewVideo" pos="absolute top-0 left-0 bottom-0 right-0">
              <video
                autoplay muted
                :controls="settings.enableVideoCtrlBarOnVideoCard"
                class="size-full aspect-video bg-black"
              >
                <source :src="previewVideoUrl" type="video/mp4">
              </video>
            </div>
          </Transition>

          <!-- rank -->
          <div v-if="rank" pos="absolute top-1 left-1 p-2" flex="~ justify-center items-center">
            <div
              class="size-30px rounded-full shadow-$bew-shadow-1"
              bg="$bew-theme-color"
              border="1 $bew-theme-color"
              text="white center 2xl fw-bold"
            >
              {{ rank }}
            </div>
          </div>

          <!-- watch later -->
          <div pos="absolute top-3 right-3" class="op-0 group-hover:op-100 z-1000">
            <Button :title="isInWatchLater ? $t('common.added') : $t('common.save_to_watch_later')" circle size="small" class="flex justify-center items-center" @click.prevent="toggleWatchLater">
              <i v-if="isInWatchLater" class="i-line-md:confirm" />
              <i v-else class="i-mingcute:carplay-line" />
            </Button>
          </div>

          <!-- removed -->
          <div
            v-if="removed"
            flex="~ col items-center justify-center gap-2"
            pos="absolute top-0 left-0 bottom-0 right-0 z-2000"
            bg="$bew-fill-4"
            class="backdrop-blur-20px mix-blend-luminosity"
          >
            <p class="text-white text-lg">
              {{ $t('home.video_removed') }}
            </p>
            <Button
              color="rgba(255,255,255,.35)" text-color="white" size="small"
              @click.prevent="emit('undo')"
            >
              <template #left>
                <i class="i-mingcute:back-line text-lg" />
              </template>
              {{ $t('common.undo') }}
            </Button>
          </div>
        </div>
      </a>

      <!-- video card infomation -->
      <div v-if="!removed" flex="~ gap-x-4" class="p2 pt-0 group">
        <!-- avatar -->
        <a
          :href="authorUrl" target="_blank" rel="noopener noreferrer"
          class="size-36px relative rounded-full object-cover cursor-pointer"
        >
          <img
            ref="avatarEl"
            :src="`${removeHttpFromUrl(authorFace!)}@50w_50h_1c`"
            class="rounded-full object-cover size-36px"
            loading="lazy"
          >
          <div
            v-if="followed"
            class="size-14px rounded-full"
            pos="absolute bottom--2px right--2px"
            bg="$bew-theme-color"
            flex="~ items-center justify-center"
          >
            <i text="sm white" class="i-mingcute:check-fill size-10px" />
          </div>
        </a>

        <div flex="~ col gap-y-2" class="w-full">
          <!-- header -->
          <div class="w-full flex gap-x-2">
            <!-- title -->
            <h3
              :title="title"
              class="flex-1 min-h-[calc(((1rem*1.75)-1em)*2+1em*2)] keep-two-lines cursor-pointer"
              text="lg overflow-ellipsis $bew-text-1"
              hover="text-$bew-theme-color"
            >
              <a :href="videoUrl" target="_blank" rel="noopener noreferrer">
                {{ title }}
              </a>
            </h3>

            <!-- more btn -->
            <button
              v-if="moreBtn"
              role="button"
              flex="~ justify-center items-center"
              class="transition-opacity op-0 focus:op-100! focus:ring-2 size-30px rounded-full cursor-pointer"
              ring="1 $bew-border-color"
              group-hover="op-100 hover:bg-slate-200 hover:dark:bg-slate-800"
              @click="emit('moreClick', $event)"
            >
              <i class="i-mingcute:more-2-line text-lg" />
            </button>
          </div>

          <div flex="~ items-center gap-x-.5 wrap">
            <a
              v-if="author"
              hover="text-$bew-theme-color"
              flex="~ items-center gap-x-.5"
              class="mr-2 text-sm text-$bew-text-3"
              :href="authorUrl" target="_blank" rel="noopener noreferrer"
              @click.stop=""
            >
              <svg
                class="size-16px vertical-middle"
                xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" width="24" height="24"
                fill="currentColor"
              ><path d="M6.15 8.24805C6.5642 8.24805 6.9 8.58383 6.9 8.99805L6.9 12.7741C6.9 13.5881 7.55988 14.248 8.3739 14.248C9.18791 14.248 9.8478 13.5881 9.8478 12.7741L9.8478 8.99805C9.8478 8.58383 10.1836 8.24805 10.5978 8.24805C11.012 8.24805 11.3478 8.58383 11.3478 8.99805L11.3478 12.7741C11.3478 14.41655 10.01635 15.748 8.3739 15.748C6.73146 15.748 5.4 14.41655 5.4 12.7741L5.4 8.99805C5.4 8.58383 5.73578 8.24805 6.15 8.24805z" fill="currentColor" /><path d="M12.6522 8.99805C12.6522 8.58383 12.98795 8.24805 13.4022 8.24805L15.725 8.24805C17.31285 8.24805 18.6 9.53522 18.6 11.123C18.6 12.71085 17.31285 13.998 15.725 13.998L14.1522 13.998L14.1522 14.998C14.1522 15.4122 13.8164 15.748 13.4022 15.748C12.98795 15.748 12.6522 15.4122 12.6522 14.998L12.6522 8.99805zM14.1522 12.498L15.725 12.498C16.4844 12.498 17.1 11.8824 17.1 11.123C17.1 10.36365 16.4844 9.74804 15.725 9.74804L14.1522 9.74804L14.1522 12.498z" fill="currentColor" /><path d="M12 4.99805C9.48178 4.99805 7.283 5.12616 5.73089 5.25202C4.65221 5.33949 3.81611 6.16352 3.72 7.23254C3.60607 8.4998 3.5 10.171 3.5 11.998C3.5 13.8251 3.60607 15.4963 3.72 16.76355C3.81611 17.83255 4.65221 18.6566 5.73089 18.7441C7.283 18.8699 9.48178 18.998 12 18.998C14.5185 18.998 16.7174 18.8699 18.2696 18.74405C19.3481 18.65655 20.184 17.8328 20.2801 16.76405C20.394 15.4973 20.5 13.82645 20.5 11.998C20.5 10.16965 20.394 8.49877 20.2801 7.23205C20.184 6.1633 19.3481 5.33952 18.2696 5.25205C16.7174 5.12618 14.5185 4.99805 12 4.99805zM5.60965 3.75693C7.19232 3.62859 9.43258 3.49805 12 3.49805C14.5677 3.49805 16.8081 3.62861 18.3908 3.75696C20.1881 3.90272 21.6118 5.29278 21.7741 7.09773C21.8909 8.3969 22 10.11405 22 11.998C22 13.88205 21.8909 15.5992 21.7741 16.8984C21.6118 18.7033 20.1881 20.09335 18.3908 20.23915C16.8081 20.3675 14.5677 20.498 12 20.498C9.43258 20.498 7.19232 20.3675 5.60965 20.2392C3.81206 20.0934 2.38831 18.70295 2.22603 16.8979C2.10918 15.5982 2 13.8808 2 11.998C2 10.1153 2.10918 8.39787 2.22603 7.09823C2.38831 5.29312 3.81206 3.90269 5.60965 3.75693z" fill="currentColor" />
              </svg>
              <span>{{ author }}</span>
            </a>

            <!-- View & Danmaku Count -->
            <div class="text-$bew-text-3 rounded-$bew-radius inline-block">
              <span v-if="view || viewStr">
                {{ view ? $t('common.view', { count: numFormatter(view) }, view) : `${viewStr}${$t('common.viewWithoutNum')}` }}
              </span>
              <template v-if="danmaku || danmakuStr">
                <span text-xs font-light mx-4px>•</span>
                <span>{{ danmaku ? $t('common.danmaku', { count: numFormatter(danmaku) }, danmaku) : `${danmakuStr}${$t('common.danmakuWithoutNum')}` }}</span>
              </template>
              <br>
            </div>
          </div>

          <div flex="~ items-center gap-x-2">
            <!-- Tag -->
            <span v-if="tag" class="video-tag">{{ tag }}</span>
            <span
              v-if="publishedTimestamp || capsuleText"
              class="px2 py1 rounded-$bew-radius"
              bg="$bew-fill-1"
              text="sm $bew-text-3"
            >
              {{ publishedTimestamp ? calcTimeSince(publishedTimestamp * 1000) : capsuleText?.trim() }}
            </span>

            <!-- Video type -->
            <span text="$bew-text-2" flex="~ items-center justify-center">
              <i v-if="type === 'vertical'" class="i-mingcute:cellphone-line" />
              <i v-if="type === 'bangumi'" class="i-mingcute:movie-line" />
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- skeleton -->
    <VideoCardSkeleton v-if="skeleton" />
  </div>
</template>

<style>
.bewly-video-card {
  --at-apply: transition-shadow duration-500;
  /* --at-apply: shadow-[0_5px_10px_0_rgba(0,0,0,0.15)]; */
}

.video-tag {
  --at-apply: bg-$bew-theme-color-20;
  --at-apply: text-sm text-$bew-text-2 lh-6;
  --ay-apply: "rounded-$bew-radius";
}
</style>
