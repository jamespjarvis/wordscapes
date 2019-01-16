import {
  ADD_MESSAGE,
  CLEAR_MESSAGES,
  SOCKET_NICKNAME_SET
} from "@/store/mutations.type";
import { SOCKET_MESSAGE } from "@/store/actions.type";

import { formatDuration } from "@/utils";

const getTimestamp = time => {
  const now = Date.now();
  const diff = now - time;
  return diff > 60000 ? formatDuration(diff) : "Just now";
};
const state = {
  nickname: "",
  messages: []
};

const getters = {};

const actions = {
  [SOCKET_MESSAGE]({ commit }, m) {
    commit(ADD_MESSAGE, m);
  }
};

const mutations = {
  [SOCKET_NICKNAME_SET](state, { nickname }) {
    state.nickname = nickname;
  },
  [CLEAR_MESSAGES](state) {
    state.messages = [];
  },
  [ADD_MESSAGE](state, m) {
    const lastMessage = state.messages[state.messages.length - 1];
    if (
      lastMessage &&
      (lastMessage.nickname === m.nickname || (lastMessage.sent && m.sent))
    ) {
      lastMessage.message.push(...m.message);
      lastMessage.time = m.time;
      lastMessage.timestamp = getTimestamp(m.time);
      state.messages[state.messages.length - 1] = lastMessage;
    } else {
      state.messages.push({
        ...m,
        sent: m.nickname === state.nickname,
        timestamp: getTimestamp(m.time)
      });
    }
  }
};

export default {
  state,
  actions,
  mutations,
  getters
};
