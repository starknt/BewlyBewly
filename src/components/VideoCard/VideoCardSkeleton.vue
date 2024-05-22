<script setup lang="ts">
import browser from 'webextension-polyfill'

const props = defineProps<{
  horizontal?: boolean
  hasTag?: boolean
}>()

const wValue = computed((): string => {
  if (props.horizontal)
    return 'xl:280px lg:250px md:200px 200px'
  else
    return 'w-full'
})
</script>

<template>
  <div v-if="!horizontal" class="pointer-events-none select-none video-card__skeleton">
    <div class="group relative of-hidden rounded-$bew-radius" flex="~ justify-center items-center">
      <img
        :class="{ 'max-h-196px w-full': horizontal }"
        :src="browser.runtime.getURL('/assets/placeholder.png')"
        loading="eager"
        class="w-full min-h-196px align-middle aspect-video"
        bg="cover center"
      >
    </div>
    <div class="flex mt-4 video-card__skeleton__content">
      <div class="size-36px mr-4 rounded-50% bg-$bew-fill-2 shrink-0" />
      <div w-full>
        <h3
          class="flex-1 keep-two-lines cursor-pointer"
          min-h="[calc(((1rem*1.75)-1em)*2+1em*2)]"
          text="lg overflow-ellipsis $bew-text-1"
          hover="text-$bew-theme-color"
          bg="$bew-fill-3"
          animate-pulse
        />

        <div grid gap-2 mt-2>
          <div w="80%" h-4 bg="$bew-fill-2" />
        </div>
        <div
          text="transparent sm" inline-block mt-2 p="x-2" h-7
          bg="$bew-fill-1" rounded-4
        >
          hello world
        </div>
      </div>
    </div>
  </div>

  <div
    v-else
    flex="~ gap-6"
    mb-4 pointer-events-none select-none
    class="video-card__skeleton"
  >
    <!-- By directly using predefined unocss width properties, it is possible to dynamically set the width attribute -->
    <div hidden w="xl:280px lg:250px md:200px 200px" />
    <div hidden w="full" />

    <!-- Cover -->
    <div class="rounded-$bew-radius shrink-0 aspect-video h-fit" :w="wValue" bg="$bew-fill-4" />
    <!-- Other Information -->
    <div
      w-full mt-0
      flex="~ gap-4"
      class="mt-2"
    >
      <div w-full>
        <div grid gap-2>
          <div w="5/6" h-5 bg="$bew-fill-3" />
        </div>

        <div mt-4 flex>
          <div
            text="transparent sm" inline-block p="x-2" h-7 bg="$bew-fill-1"
            rounded-4
          >
            hello world
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.video-card__skeleton {
  --at-apply: of-hidden rounded-$bew-radius;
}

.video-card__skeleton__content {
  --at-apply: p2 pt0;
}
</style>
