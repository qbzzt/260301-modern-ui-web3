import { 
  useConnect, 
  useConnection, 
  useConnectors, 
  useDisconnect 
} from 'wagmi'

import { Greeter } from './Greeter'

function App() {
  const connection = useConnection()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()

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
