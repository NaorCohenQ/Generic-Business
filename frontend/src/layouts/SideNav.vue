<template>
  <aside
    :class="['sidenav', { open: isOpen }]"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <ul>
      <li class="active">
        <span class="icon">📊</span>
        <span class="label">Dashboard</span>
      </li>
      <li>
        <span class="icon">🧾</span>
        <span class="label">Logs</span>
      </li>
      <li>
        <span class="icon">⚙️</span>
        <span class="label">Settings</span>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// parent still passes :open (pinned state)
const props = defineProps<{ open: boolean }>();

// local hover state
const hovering = ref(false);

// when either pinned (props.open) or hovering, treat as open
const isOpen = computed(() => props.open || hovering.value);
</script>

<style scoped lang="scss">
.sidenav {
  width: 56px;
  background: #111827;
  color: #cbd5e1;
  transition: width .2s;
  height: 100%;
  overflow: hidden; /* hide labels when collapsed */
}

.sidenav.open { width: 200px; }

ul { list-style: none; padding: 0; margin: 0; }
li {
  display: flex; align-items: center; gap: .75rem;
  padding: .75rem 1rem; cursor: pointer;
}
li:hover { background: #1f2937; }
li.active { background: #374151; }

.icon { width: 24px; text-align: center; flex: 0 0 24px; }

/* labels are always in DOM; just hide/show via CSS */
.label { display: none; white-space: nowrap; }
.sidenav.open .label { display: inline; }
</style>
