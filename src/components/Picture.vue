<script setup lang="ts">
defineProps<{
  src: string
  loading: 'lazy' | 'eager'
  alt?: string
}>()

const id = browser.runtime.id
</script>

<template>
  <picture>
    <source :srcset="`${src}.avif#${id}`" type="image/avif">
    <source :srcset="`${src}.webp#${id}`" type="image/webp">
    <img
      :src="`${src}#${id}`"
      :loading="loading"
      :alt="alt"
      block w-full h-full object="[inherit]" aspect-inherit
      rounded-inherit
    >
  </picture>
</template>
