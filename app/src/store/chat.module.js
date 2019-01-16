import { ADD_MESSAGE } from "@/store/mutations.type";
import { SOCKET_MESSAGE } from "@/store/actions.type";

import { formatDuration } from "@/utils";

const getTimestamp = time => {
  const now = Date.now();
  const diff = now - time;
  return diff > 60000 ? formatDuration(diff) : "Just now";
};
const state = {
  messages: []
};

const getters = {};

const actions = {
  [SOCKET_MESSAGE]({ commit }, m) {
    commit(ADD_MESSAGE, m);
  }
};

const mutations = {
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
