import { 
          useState, 
          useEffect,
       } from 'react'
import {  useChainId, 
          useAccount,
          useReadContract, 
          useWriteContract,
          useWatchContractEvent,
          useSimulateContract
       } from 'wagmi'
import { AddressType } from 'abitype'

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


type AddressPerBlockchainType = {
  [key: number]: AddressType
}


const contractAddrs : AddressPerBlockchainType = {
  // Sepolia
    11155111: '0xC87506C66c7896366b9E988FE0aA5B6dDE77CFfA'
}

type TimerProps = {
  lastUpdate: Date
}

const Timer = ({ lastUpdate }: TimerProps) => {
  const [_, setNow] = useState(new Date())

  setInterval(() => setNow(new Date), 1000)

  const secondsSinceUpdate = Math.floor(
    (Date.now() - lastUpdate.getTime()) / 1000
  )

  return (
    <span>{secondsSinceUpdate} seconds ago</span>
  )
}

const Greeter = () => {  
  const chainId = useChainId()
  const account = useAccount()

  const greeterAddr = chainId && contractAddrs[chainId] 

  const readResults = useReadContract({
    address: greeterAddr,
    abi: greeterABI,
    functionName: "greet", // No arguments
  })

  const [ currentGreeting, setCurrentGreeting ] = 
    useState("Please wait while we fetch the greeting from the blockchain...")
  const [ newGreeting, setNewGreeting ] = useState("")
  const [ lastSetterAddress, setLastSetterAddress ] = useState("")
  const [ status, setStatus ] = useState("")
  const [ statusTime, setStatusTime ] = useState(new Date())

  useEffect(() => {
    if (readResults.data) {
      setCurrentGreeting(readResults.data)
      setStatus("Greeting fetched from blockchain")
    }
  }, [readResults.data])

  useWatchContractEvent({
    address: greeterAddr,
    abi: greeterABI,
    eventName: 'SetGreeting',
    chainId,
    enabled: !!greeterAddr,
    onLogs: logs => {
      const greetingFromContract = logs[0].args.greeting
      setCurrentGreeting(greetingFromContract)
      setLastSetterAddress(logs[0].args.sender)
      updateStatus("Greeting updated by event")
    },
  })


  const updateStatus = newStatus => {
    setStatus(newStatus)
    setStatusTime(new Date())
  }

  const greetingChange = (evt) =>
    setNewGreeting(evt.target.value)
  
  const { writeContractAsync } = useWriteContract()

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
      {currentGreeting}
      {lastSetterAddress && (
        <p>Last updated by {
          lastSetterAddress == account.address ? "you" : lastSetterAddress
        }</p>
      )}
      <hr />      
      <input type="text"
        value={newGreeting}
        onChange={greetingChange}
      />
      <br />
      <button disabled={!simulation.data}
        onClick={async () => {
          updateStatus("Please confirm in wallet...")
          await writeContractAsync(simulation.data.request)
          updateStatus("Transaction sent, waiting for greeting to change...")
        }}
      >
        Update greeting
      </button>
      <h4>Status: {status}</h4>
      <p>Updated <Timer lastUpdate={statusTime} /> </p>
    </>
  )
}



export {Greeter}
