import { createStore } from "easy-peasy";

const armyModel = {
  Units: [
    {
      name: "Infantry",
      description: "Basic foot soldiers",
      attack: 10,
      defense: 5,
      movement: 2,
    },
    {
      name: "Archer",
      description: "Ranged units for long-range attacks",
      attack: 8,
      defense: 2,
      movement: 2,
    },
    {
      name: "Cavalry",
      description: "Mounted warriors for fast attacks",
      attack: 15,
      defense: 3,
      movement: 5,
    },
    {
      name: "Artillery",
      description: "Ranged heavy units ",
      attack: 10,
      defense: 10,
      movement: 1,
    },
  ],
};

const militaryStore = createStore(armyModel);

export default militaryStore;
