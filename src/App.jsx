import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * TODO:
 *
 *  - Bug: Follow spaceship, dan pijltje klikken: Hij unfollowed niet. Als ik op unfollow klik werkt het wel...
 *
 * - Alle knoppen doen raar...
 *
 * - Logica is complex: State machine?
 *
 * - MouseOver + onClick coords kloppen niet:
 *   --> Enterprise zit op SVG 0,0, maar element.clientX en clientY geven ander coordinaat,
 *   dus dit hoort vast zo, want het zijn verschillende "technieken", dus ik moet ff wat "corrigeren"?
 *
 *  - eslint react hooks plugin!!!
 *
 *
 * ====== Rerenders ======
 * - De MouseOver re-rendered Map, dus de mouseOverCoords state moet uit App
 *   (memoization met useCallback en React.memo helpt niet, lijkt een pad zonder eind)
 *   Dus of useMemo proberen, of state ergens anders, of selectors (!!!)
 *   Map wordt natuurlijk ook gerendered als spaceships wijzigen (bewegen), maar dat is logisch.
 *   Dus bij een mouse over waar spaceships niet bewegen moet er eigenlijk niks rerenderen.
 */

const initialSpaceships = [
  {
    name: 'Enterprise',
    positionX: 0,
    positionY: 0,
    color: 'red',
  },
  {
    name: 'Defiant',
    positionX: 320,
    positionY: 120,
    color: 'blue',
  },
  {
    name: 'Voyager',
    positionX: 120,
    positionY: 130,
    color: 'green',
  },
]

const move = (spaceship) => {
  const moveIt = {
    Defiant: (spaceship) => {
      return { ...spaceship, positionX: spaceship.positionX + 10 }
    },
    Voyager: (spaceship) => {
      return {
        ...spaceship,
        positionX: spaceship.positionX - 10,
        positionY: spaceship.positionY + 10,
      }
    },
  }
  return spaceship.name in moveIt
    ? moveIt[spaceship.name](spaceship)
    : () => spaceship
}

const initialCenterPosition = {
  x: 200,
  y: 200,
}

const useSpaceships = () => {
  const [spaceships, setSpaceships] = useState(initialSpaceships)

  useInterval(() => {
    setSpaceships(
      spaceships.map((s) => {
        return { ...s, ...move(s) }
      }),
    )
  }, 1000)

  return spaceships
}

function App() {
  const spaceships = useSpaceships()
  const [centerPosition, setCenterPosition] = useState(initialCenterPosition)
  const [mouseOverCoords, setMouseOverCoords] = useState({ x: 0, y: 0 })
  const [followingSpaceship, setFollowingSpaceship] = useState(null)

  const changeCenter = (pos) => {
    setCenterPosition(pos ? pos : initialCenterPosition)
  }

  const centerToSpaceship = useCallback(
    (name) => {
      const spaceship = spaceships.find((s) => s.name === name)
      if (
        !spaceship ||
        (centerPosition.x === spaceship.positionX &&
          centerPosition.y === spaceship.positionY)
      )
        return

      changeCenter({
        x: spaceship.positionX,
        y: spaceship.positionY,
      })
    },
    [spaceships, changeCenter],
  )

  const followSpaceship = useCallback(
    (name) => {
      setFollowingSpaceship(name)
      centerToSpaceship(name)
    },
    [setFollowingSpaceship, centerToSpaceship],
  )

  const centerOnMap = useCallback(
    (pos) => {
      changeCenter(pos)
      unfollowSpaceship()
    },
    [changeCenter, setFollowingSpaceship],
  )

  useEffect(() => {
    const spaceship = spaceships.find(
      (s) => followingSpaceship && s.name === followingSpaceship,
    )

    if (!spaceship) return

    centerToSpaceship(followingSpaceship)
  }, [spaceships, followingSpaceship, centerToSpaceship])

  const unfollowSpaceship = useCallback(
    () => setFollowingSpaceship(null),
    [setFollowingSpaceship],
  )

  return (
    <>
      <h1>Space Map POC</h1>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        <div>
          <Map
            centerPosition={centerPosition}
            onMouseMove={setMouseOverCoords}
            onClick={centerOnMap}
          >
            <Planets />
            <Spaceships spaceships={spaceships} />
          </Map>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>{formatCoords(mouseOverCoords)}</div>
          <div>
            <CenterMap changeCenter={changeCenter} />
          </div>
          <div>
            <PinPosition
              centerPosition={centerPosition}
              changeCenter={changeCenter}
              followSpaceship={followSpaceship}
              unfollowSpaceship={unfollowSpaceship}
            />
          </div>
        </div>
      </div>
    </>
  )
}

const Map = ({ children, centerPosition, onMouseMove, onClick }) => {
  const width = 400
  const height = 400

  //TODO centreert niet altijd?
  let topLeftX = centerPosition.x - width / 2
  if (topLeftX < 0) topLeftX = 0
  let topLeftY = centerPosition.y - height / 2
  if (topLeftY < 0) topLeftY = 0

  return (
    <svg
      width={width}
      height={height}
      viewBox={`${topLeftX} ${topLeftY} ${width} ${height}`}
      onMouseMove={(e) => onMouseMove({ x: e.clientX, y: e.clientY })}
      onClick={(e) => onClick({ x: e.clientX, y: e.clientY })}
      style={{ background: 'black' }}
    >
      {children}
    </svg>
  )
}

const PinPosition = ({
  centerPosition,
  changeCenter,
  followSpaceship,
  unfollowSpaceship,
}) => {
  const xRef = useRef()
  const yRef = useRef()

  if (xRef?.current) xRef.current.value = centerPosition?.x ?? 0
  if (yRef?.current) yRef.current.value = centerPosition?.y ?? 0

  return (
    <>
      <br />
      <br />
      {initialSpaceships.map((s) => (
        <div key={s.name}>
          <button
            key={s.name}
            onClick={() => followSpaceship(s.name)}
            style={{ color: s.color }}
          >
            {s.name}
          </button>
          <br />
        </div>
      ))}

      <button onClick={unfollowSpaceship}>unfollow </button>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          changeCenter({
            x: toNumber(xRef.current.value),
            y: toNumber(yRef.current.value),
          })
        }}
      >
        X <input style={{ width: '40px' }} type="number" ref={xRef} />
        &nbsp; Y <input style={{ width: '40px' }} type="number" ref={yRef} />
        &nbsp;&nbsp;<button type="submit">Pin</button>
      </form>
      <br />
      <br />
      <button onClick={() => changeCenter(null)}>Reset</button>
      <br />
    </>
  )
}

const CenterMap = ({ changeCenter }) => (
  <>
    &nbsp;&nbsp;&nbsp;
    <button
      onClick={() => changeCenter((prev) => ({ ...prev, y: prev.y - 10 }))}
    >
      ^
    </button>
    <br />{' '}
    <button
      onClick={() => changeCenter((prev) => ({ ...prev, x: prev.x - 10 }))}
    >
      &lt;
    </button>
    <button
      onClick={() => changeCenter((prev) => ({ ...prev, x: prev.x + 10 }))}
    >
      &gt;
    </button>
    <br />
    &nbsp;&nbsp;&nbsp;
    <button
      onClick={() => changeCenter((prev) => ({ ...prev, y: prev.y + 10 }))}
    >
      v
    </button>
  </>
)

const Spaceships = ({ spaceships }) => {
  return (
    <>
      {spaceships.map(({ name, positionX, positionY, color }) => (
        <Spaceship key={name} x={positionX} y={positionY} color={color} />
      ))}
    </>
  )
}

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
  <circle cx={x} cy={y} r={size} fill={color} />
)

const toNumber = (val) => {
  return !val || isNaN(val) ? 0 : parseInt(val)
}

const formatCoords = ({ x, y }) => `${Math.round(x)},${Math.round(y)}`

const useInterval = (callback, delay) => {
  const savedCallback = useRef()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    const tick = () => {
      savedCallback.current()
    }
    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

export default App
