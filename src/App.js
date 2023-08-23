import "./App.scss";
import Map from "../src/components/Map";
import { StoreProvider } from 'easy-peasy';
import mapStore from './components/Mapstore'; // Ścieżka do pliku Mapstore.js

function App() {
  return (
    <StoreProvider store={mapStore}>
      <div className="App">
        <header className="Header"> </header>

        <Map />

        <footer className="Footer"></footer>
      </div>{" "}
    </StoreProvider>
  );
}

export default App;
