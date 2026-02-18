import { 
  useConnect, 
  useConnection, 
  useDisconnect,
  useSwitchChain 
} from 'wagmi'

import { useEffect } from 'react'

import { Greeter } from './Greeter'

const SEPOLIA_CHAIN_ID = 11155111

function App() {
  const connection = useConnection()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  useEffect(() => {
    if (connection.status === 'connected' && 
        connection.chainId !== SEPOLIA_CHAIN_ID
    ) {
      switchChain({ chainId: SEPOLIA_CHAIN_ID })
    }
  }, [connection.status, connection.chainId])

  return (
    <>
      <h2>Connection</h2>
      <div>
        status: {connection.status}
        <br />
        addresses: {JSON.stringify(connection.addresses)}
        <br />
        chainId: {connection.chainId}
      </div>

      {connection.status === 'connected' && (
        <div>
          <Greeter />
          <hr />
          <button type="button" onClick={disconnect}>
            Disconnect
          </button>
        </div>
      )}

      {connection.status !== 'connected' && (
        <div>
          <h2>Connect</h2>
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              type="button"
            >
              {connector.name}
            </button>
          ))}
          <div>{status}</div>
          <div>{error?.message}</div>
        </div>
      )}
    </>
  )
}

export default App
