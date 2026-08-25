<script setup lang="ts">
const { $pwa } = useNuxtApp()
</script>

<template>
  <ClientOnly>
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-4 opacity-0 scale-95"
    >
      <div
        v-if="$pwa?.needRefresh"
        class="fixed bottom-4 right-4 z-50 max-w-sm bg-neutral-900 border border-neutral-700 text-neutral-100 p-4 rounded-2xl shadow-2xl space-y-3 ring-1 ring-primary/30"
      >
        <div class="flex items-start gap-3">
          <div class="p-2 rounded-xl bg-primary/20 text-primary shrink-0">
            <UIcon
              name="i-lucide-sparkles"
              class="size-5 animate-spin"
            />
          </div>
          <div>
            <h4 class="text-sm font-bold text-highlighted">
              Pembaruan Jadwal Tersedia
            </h4>
            <p class="text-xs text-muted mt-0.5 leading-relaxed">
              Terdapat data jadwal atau versi aplikasi terbaru yang siap dimuat.
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-1">
          <UButton
            label="Nanti"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="$pwa.cancelPrompt()"
          />
          <UButton
            label="Perbarui Sekarang"
            icon="i-lucide-rotate-cw"
            color="primary"
            size="xs"
            @click="$pwa.updateServiceWorker()"
          />
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>
