import data from './states-districts.json';

type State = {
  state: string;
  districts: string[];
};

export const states: State[] = data.states;
