// Map.js

import React, { useState, useEffect } from "react";
import "./Map.scss";
import mapStore from "../components/Mapstore";

const terrains = ["Water", "Grassland", "Hills", "Mountains", "Sand"];
const provinces = mapStore.getState().provinces;
const selectedProvinces = [];

// Generowanie 4 prowincji z unikatowym terenem


const generateProvincesWithTerrains = () => {
  while (selectedProvinces.length < 5) {
    const randomIndex = Math.floor(Math.random() * provinces.length);
    if (!selectedProvinces.includes(provinces[randomIndex])) {
      selectedProvinces.push(provinces[randomIndex]);
    }
  }

  const uniqueTerrains = [...terrains];

  const getRandomTerrain = () => {
    if (uniqueTerrains.length === 0) {
      uniqueTerrains.push(...terrains);
      for (let i = uniqueTerrains.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [uniqueTerrains[i], uniqueTerrains[j]] = [
          uniqueTerrains[j],
          uniqueTerrains[i],
        ];
      }
    }

    let selectedTerrain = uniqueTerrains.pop();

    return selectedTerrain;
  };

  selectedProvinces.forEach((province) => {
    province.protected = true; // Dodanie statusu "chroniony"
    province.terrain = getRandomTerrain();

    console.log(
      `Province ID: ${province.id}, Protected: ${province.protected}`
    );

    const neighbors = province.neighbors.map((neighborId) =>
      provinces.find((p) => p.id === neighborId)
    );

    neighbors.forEach((neighborProvince) => {
      if (neighborProvince && neighborProvince.terrain === undefined) {
        neighborProvince.protected = true; // Dodanie statusu "chroniony"
        neighborProvince.terrain = province.terrain;
      }
    });
  });

  return selectedProvinces;
};

generateProvincesWithTerrains();


// Pozostale prowincje niewylosowane

const getRemainingProvinces = (allProvinces, selectedProvinces) => {
  const remainingProvinces = allProvinces.filter(
    (province) =>
      !selectedProvinces.some((selected) => selected.id === province.id)
  );

  return remainingProvinces;
};
const remainingProvinces = getRemainingProvinces(provinces, selectedProvinces);

//Generowanie pozostałych prowincji

const assignRandomTerrainIfNeeded = (province) => {
  const neighborsWithTerrain = province.neighbors
    .map((neighborId) => provinces.find((p) => p.id === neighborId))
    .filter((neighbor) => neighbor && neighbor.terrain);

  if (neighborsWithTerrain.length > 0) {
    const randomTerrain = terrains[Math.floor(Math.random() * terrains.length)];
    const hasMatchingNeighbor = neighborsWithTerrain.some(
      (neighbor) => neighbor.terrain === randomTerrain
    );

    if (hasMatchingNeighbor) {
      province.terrain = randomTerrain;
      // console.log(`Assigned terrain ${province.terrain} to province ${province.id} thanks to: ${province.neighbors[0]} or ${province.neighbors[1]}`);
    }

    if (mapStore.getState().terrainModifiers[randomTerrain]) {
      const terrainModifier =
        mapStore.getState().terrainModifiers[randomTerrain];
      // Tutaj możesz wykorzystać właściwości modyfikatora, np. terrainModifier.movementSpeed
      // i zastosować go do odpowiednich parametrów prowincji
    }
  }
};

const assignTerrainsToRemainingProvinces = (remainingProvinces) => {
  remainingProvinces.forEach((province) => {
    assignRandomTerrainIfNeeded(province);
  });
};

assignTerrainsToRemainingProvinces(remainingProvinces);

const allProvincesHaveTerrain = () => {
  return provinces.every((province) => province.terrain !== undefined);
};

// Funkcja do opóźnionego wywołania
const delayedExecution = (callback, delay) => {
  setTimeout(callback, delay);
};

// Pętla sprawdzająca co 5 sekund, czy wszystkie prowincje mają przypisane tereny
const checkTerrainAssignment = () => {
  const provincesWithoutTerrain = provinces.filter(
    (province) => province.terrain === undefined
  );

  if (!allProvincesHaveTerrain()) {
    assignTerrainsToRemainingProvinces(remainingProvinces);
    delayedExecution(checkTerrainAssignment, 1); // Wywołanie ponowne po 5 sekundach
  }
};
checkTerrainAssignment();

///////////////////
////////////////////
//////////////////

const Map = () => {
  const [provinceData, setProvinceData] = useState(provinces);
  const [hoveredProvince, setHoveredProvince] = useState(null);
  const [hoveredNeighborIds, setHoveredNeighborIds] = useState([]);

  const handleProvinceHover = (province) => {
    setHoveredProvince(province);
    const neighborIds = province.neighbors;
    setHoveredNeighborIds(neighborIds);
  };

  const handleProvinceLeave = () => {
    setHoveredProvince(null);
  };

  useEffect(() => {
    if (!provinces.some((province) => province.terrain === undefined)) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const handleTerrainChange = (changedProvince) => {
        const provincesWithChangedTerrain = provinceData.map((province) =>
          province.id === changedProvince.id ? changedProvince : province
        );

        setProvinceData(provincesWithChangedTerrain);
      };

      const changedProvince = { id: 1, terrain: "Mountains" };
      handleTerrainChange(changedProvince);

      // Po zakończeniu funkcji modifyProvincesTerrain przestań nasłuchiwać stanu
      if (allProvincesHaveTerrain()) {
        clearTimeout(timeoutId);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [provinceData]);

  //Usuwanie pojedynczych "wysepek" wygenerowanego terenu

  const modifyProvincesTerrain = (provinces) => {
    provinces.forEach((province) => {
      if (!province.protected) {
        const neighborsWithSameTerrain = province.neighbors
          .map((neighborId) => provinces.find((p) => p.id === neighborId))
          .filter(
            (neighbor) => neighbor && neighbor.terrain === province.terrain
          );

        if (neighborsWithSameTerrain.length <= 1) {
          const availableNeighborTerrains = province.neighbors
            .map((neighborId) => provinces.find((p) => p.id === neighborId))
            .filter((neighbor) => neighbor && neighbor.terrain !== undefined)
            .map((neighbor) => neighbor.terrain);

          if (availableNeighborTerrains.length > 0) {
            const randomTerrain =
              availableNeighborTerrains[
                Math.floor(Math.random() * availableNeighborTerrains.length)
              ];
            province.terrain = randomTerrain;

            if (mapStore.getState().terrainModifiers[randomTerrain]) {
              const terrainModifier =
                mapStore.getState().terrainModifiers[randomTerrain];
            }
          }
        }
      }
    });
  };

  modifyProvincesTerrain(provinces);

  const handleProvinceClick = (province) => {
    console.log("Terrain:", province.terrain);

    province.neighbors.forEach((neighborId) => {
      const neighbor = provinces.find((p) => p.id === neighborId);
      if (neighbor) {
        console.log(`Neighbor: ${neighbor.id}`);
      }
    });

    const acquiredFromNeighbor = province.neighbors.find((neighborId) => {
      const neighbor = provinces.find((p) => p.id === neighborId);
      return neighbor && neighbor.terrain === province.terrain;
    });

    if (acquiredFromNeighbor) {
      console.log(`Acquired terrain from neighbor: ${acquiredFromNeighbor}`);
    } else {
      console.log("No neighbor with matching terrain found.");
    }

    const terrainModifier =
      mapStore.getState().terrainModifiers[province.terrain];
    if (terrainModifier) {
      console.log("Terrain Modifier:", terrainModifier);
    }

  
  };


  return (
    
    <div className="maparea">
      <div className="map-sectors">
        <div className="sectors-container">
          <div className="provinces-container">
            {provinces.map((province) => (
              <div
                key={province.id}
                className={`provinces ${
                  province.terrain ? `terrain-${province.terrain}` : ""
                } ${
                  hoveredNeighborIds.includes(province.id)
                    ? "province-transparent"
                    : ""
                }`}
                onMouseEnter={() => handleProvinceHover(province)}
                onMouseLeave={handleProvinceLeave}
                onClick={() => handleProvinceClick(province)}
              >
                {hoveredProvince !== province && (
                  <div className="info-visible">
                    <div>{province.id}</div>
                    <div>{province.terrain}</div>
                    {province.units && province.units.length > 0 && (
                     <div>Units: {province.units.map(unit => unit.name).join(", ")}</div>
                    )}
                  </div>
                )}
                {hoveredProvince === province && (
                  <div className="info-box">
                    <div>Neighbors: {province.neighbors.join(", ")}</div>
                    {/* ... inne informacje ... */}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
  
    </div>
  );
};

export default Map;

