<script setup lang="ts">
import { useElementHover } from '@vueuse/core'
import type { VideoCardProps } from './types'
import { calcTimeSince, numFormatter } from '~/utils/dataFormatter'
import { getCSRF, removeHttpFromUrl } from '~/utils/main'
import { settings } from '~/logic'
import type { VideoPreviewResult } from '~/models/video/videoPreview'

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
const avatarEl = useDelayedHover({
  enter: (e) => {
    if (props.mid)
      p.openUserProfile(props.mid, e)
  },
  leave: () => {
    if (props.mid)
      p.closeUserProfile(props.mid)
  },
  leaveDelay: 1200,
})
const previewVideoUrl = ref<string>()
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
            <img :src="`${removeHttpFromUrl(cover)}` + '@672w_378h_1c_!web-home-common-cover'" loading="lazy" class="w-full max-w-full min-h-196px align-middle aspect-video" bg="cover center">
          </picture>

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
            <Button circle size="small" class="flex justify-center items-center" @click.prevent="toggleWatchLater">
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

          <div flex="~ items-center gap-1 wrap">
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