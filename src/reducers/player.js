const playerState = {
  name: '',
  assertions: 0,
  score: 0,
  gravatarEmail: '',
};

const player = (state = playerState, action) => {
  switch (action.type) {
  case ('userInfo'):
    return { ...state,
      name: action.payload.name,
      gravatarEmail: action.payload.email };
  case ('scoreUpdate'):
    return { ...state,
      score: state.score + action.payload,
      assertions: state.assertions + 1 };
  default:
    return state;
  }
};

export default player;
