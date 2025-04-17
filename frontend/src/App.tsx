import { useState } from 'react'
import './App.css'
import PriceFeed from './Components/PriceFeed';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chainlink Price Feed Dashboard</h1>
      </header>
      <main>
        <PriceFeed />
      </main>
    </div>
  )
}

export default App
