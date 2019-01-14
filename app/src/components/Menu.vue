<template>
  <q-layout-drawer
    v-model="isOpen"
    :content-class="$q.theme === 'mat' ? 'bg-grey-2' : null"
  >
    <q-list no-border link inset-delimiter>
      <q-list no-border link inset-delimiter>
        <q-list-header>Wordscapes</q-list-header>
        <q-item @click.native="() => $emit('handler:show-cell')">
          <q-item-side icon="ion-ios-color-wand" />
          <q-item-main
            label="Cheat"
            sublabel="Reveal one letter (50pts)"
          ></q-item-main>
        </q-item>
        <q-item @click.native="() => $emit('handler:show-word')">
          <q-item-side icon="accessible" />
          <q-item-main
            label="Super Cheat"
            sublabel="Reveal one word (100pts)"
          ></q-item-main>
        </q-item>
        <q-item @click.native="() => $emit('handler:new-game')">
          <q-item-side icon="dashboard" />
          <q-item-main
            label="New Game"
            sublabel="Start a new game"
          ></q-item-main>
        </q-item>
        <q-item @click.native="() => $emit('handler:forfeit')">
          <q-item-side icon="ion-ios-alert" />
          <q-item-main label="Forfeit" sublabel="Reveal board"></q-item-main>
        </q-item>
      </q-list>
    </q-list>
  </q-layout-drawer>
</template>

<script>
export default {
  name: "Menu",
  props: {
    leftDrawerOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isOpen: this.leftDrawerOpen
    };
  },
  watch: {
    leftDrawerOpen(to) {
      this.isOpen = to;
    },
    isOpen(to) {
      this.$emit("update:drawer", to);
    }
  }

  //   data() {
  //     return {
  //       open: this.leftDrawerOpen
  //     };
  //   },
  //   watch: {
  //     open(to) {
  //       this.$emit("update:drawer", to);
  //     }
  //   }
};
</script>

<style></style>
