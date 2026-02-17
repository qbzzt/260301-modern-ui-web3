import { 
          useState, 
          useEffect,
          useCallback, 
        } from 'react'
import {  useChainId, 
          useAccount,
          useReadContract, 
          useWriteContract,
          useWatchContractEvent,
          useSimulateContract
        } from 'wagmi'

let greeterABI = [
  {
    "type": "function",
    "name": "greet",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setGreeting",
    "inputs": [
      {
        "name": "_greeting",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "SetGreeting",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "greeting",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ],
    "anonymous": false
  }
]  // greeterABI




const contractAddrs = {
  // Sepolia
    11155111: '0xC87506C66c7896366b9E988FE0aA5B6dDE77CFfA'
}

const Greeter = () => {  
  const chainId = useChainId()
  const account = useAccount()

  const greeterAddr = chainId && contractAddrs[chainId] 

  const readResults = useReadContract({
    address: greeterAddr,
    abi: greeterABI,
    functionName: "greet", // No arguments
    watch: true,
    chainId
  })

  const [ currentGreeting, setCurrentGreeting ] = 
    useState("Loading...")
  const [ newGreeting, setNewGreeting ] = useState("")
  const [ lastSetterAddress, setLastSetterAddress ] = useState("")

  useEffect(() => {
    if (readResults.data) {
      setCurrentGreeting(readResults.data)
    }
  }, [readResults.data])

  if (greeterAddr) {
    useWatchContractEvent({
      address: greeterAddr,
      abi: greeterABI,
      eventName: 'SetGreeting',
      chainId,
      onLogs(logs) {
        const greetingFromContract = logs[0].args.greeting
        setCurrentGreeting(greetingFromContract)
        setLastSetterAddress(logs[0].args.sender)
      },
    })
  }

  const greetingChange = (evt) =>
    setNewGreeting(evt.target.value)
  
  const { writeContract } = useWriteContract()

  const simulation = useSimulateContract({
    address: greeterAddr,
    abi: greeterABI,
    functionName: 'setGreeting',
    args: [newGreeting],
    account: account.address    
  })

  return (
    <>
      <h2>Greeter</h2>
      {readResults.isLoading ? "Loading..." : currentGreeting}
      {lastSetterAddress && (
        <p>Last updated by: {lastSetterAddress}</p>
      )}
      <hr />      
      <input type="text"
        value={newGreeting}
        onChange={greetingChange}      
      />
      <br />
      <button disabled={!simulation.data}
              onClick={() => writeContract(
                simulation.data.request
              )}
      >
        Update greeting
      </button>
    </>
  )
}



export {Greeter}