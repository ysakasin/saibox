<template>
  <v-dialog
    v-model="isActive"
    :overlay="false"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card tile>
      <v-toolbar
        card
        dark>
        <v-btn
          icon
          dark
          @click.native="isActive = false">
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>設定</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-list
          three-line
          subheader>
          <v-subheader>ルーム設定</v-subheader>
          <v-list-tile avatar>
            <v-text-field
              :value="roomName"
              name="roomname"
              label="ルーム名"
              @change="v => roomName = v"
            />
          </v-list-tile>
          <v-list-tile avatar>
            <v-select
              v-model="gameType"
              :items="diceBots"
              label="ダイスボット"
              item-text="name"
              item-value="gameType"
            />
          </v-list-tile>
        </v-list>
        <v-divider/>
        <v-list
          three-line
          subheader>
          <v-subheader>ユーザー設定</v-subheader>
          <v-list-tile avatar>
            <v-list-tile-action>
              <v-switch
                v-model="playDiceAnimation"
                color="primary" />
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>ダイスロールアニメーション</v-list-tile-title>
              <v-list-tile-sub-title>ダイスロール時のアニメーションを表示する</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile avatar>
            <v-list-tile-action>
              <v-switch
                v-model="playSound"
                color="primary" />
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>効果音</v-list-tile-title>
              <v-list-tile-sub-title>ダイスロール時に効果音を鳴らす</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile avatar>
            <v-list-tile-action>
              <v-switch
                v-model="showSystemInfo"
                color="primary" />
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>ヘルプ表示</v-list-tile-title>
              <v-list-tile-sub-title>ダイスコマンド入力時にヘルプを表示する</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card-text>
      <div style="flex: 1 1 auto;"/>
    </v-card>
    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      color="success"
      top>
      {{ snackbarText }}
      <v-btn
        dark
        flat
        @click="snackbar = false">
        閉じる
      </v-btn>
    </v-snackbar>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { fetchDicebots } from "./dice";

interface DiceBotInfo {
  name: string;
  gameType: string;
}

const diceBots: DiceBotInfo[] = [];

@Component({
  props: {
    value: Boolean
  },
  watch: {
    value(val: boolean) {
      if (val != this.$data.isActive) {
        this.$data.isActive = val;
      }
    },
    isActive(val: boolean) {
      this.$emit("input", val);
    }
  }
})
export default class Settings extends Vue {
  data() {
    return {
      isActive: false,
      diceBots: diceBots,
      snackbar: false,
      snackbarText: ""
    };
  }

  mounted() {
    if (this.$data.diceBots.length == 0) {
      fetchDicebots().then(dicebots => {
        this.$data.diceBots = dicebots;
      });
    }
  }

  get roomName() {
    return this.$store.state.roomName;
  }

  set roomName(newName) {
    this.$store.dispatch("updateRoomName", newName);
    this.$data.snackbarText = `ルーム名を「${newName}」に変更しました`;
    this.$data.snackbar = true;
  }

  get gameType() {
    return this.$store.state.gameType;
  }

  set gameType(newType) {
    this.$store.dispatch("updateGameType", newType);
    this.$data.snackbarText = `ダイスボットを「${newType}」に変更しました`;
    this.$data.snackbar = true;
  }

  get playSound() {
    return this.$store.state.settings.playSound;
  }
  set playSound(val: boolean) {
    this.$store.commit("updateSoundSetting", val);
  }

  get playDiceAnimation() {
    return this.$store.state.settings.playDiceAnimation;
  }
  set playDiceAnimation(val: boolean) {
    this.$store.commit("updateAnimationSetting", val);
  }

  get showSystemInfo() {
    return this.$store.state.settings.showSystemInfo;
  }
  set showSystemInfo(val: boolean) {
    this.$store.commit("updateSystemInfoSetting", val);
  }
}
</script>
