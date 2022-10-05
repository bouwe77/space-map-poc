function App() {
  return (
    <>
      <h1>Space Map POC</h1>

      <Map>
        <Planets />
        <Spaceships />
      </Map>
    </>
  )
}

const Map = ({ children }) => {
  return (
    <svg width="400" height="400" style={{ background: 'black' }}>
      {children}
    </svg>
  )
}

const Spaceships = () => (
  <>
    <Spaceship x={230} y={230} color="red" />
  </>
)

const Spaceship = ({ x, y, color }) => (
  <rect x={x} y={y} fill={color} width="4" height="4" />
)

const Planets = () => (
  <>
    <Planet x={30} y={210} size={8} color="lightgreen" />
    <Planet x={230} y={50} size={20} color="pink" />
    <Planet x={170} y={280} size={12} color="lightblue" />
  </>
)

const Planet = ({ x, y, size, color }) => (
  <circle cx={x} cy={y} r={size} stroke-width="4" fill={color} />
)

export default App
