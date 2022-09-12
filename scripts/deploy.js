const { ethers, run, network } = require("hardhat")

// async main
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
  console.log("Deploying contract...")
  const simpleStorage = await SimpleStorageFactory.deploy()
  await simpleStorage.deployed()                                      //line 5-8
  console.log(`Deployed contract to: ${simpleStorage.address}`)
  // what happens when we deploy to our hardhat network?
  if (network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {    //checks if it is on rinkeby and there is an etherscan api key
    console.log("Waiting for block confirmations...")
    await simpleStorage.deployTransaction.wait(6)   //waits for simplestorasge to be confirmed on at least 6 blocks
    await verify(simpleStorage.address, [])   //calls verify function with simpleStorage address and the arguments needed for the contract constructor
  }

  const currentValue = await simpleStorage.retrieve()
  console.log(`Current Value is: ${currentValue}`)    //how to print a variable with a string

  // Update the current value
  const transactionResponse = await simpleStorage.store(7)
  await transactionResponse.wait(1)
  const updatedValue = await simpleStorage.retrieve()
  console.log(`Updated Value is: ${updatedValue}`)
}

// async function verify(contractAddress, args) {
const verify = async (contractAddress, args) => {
  console.log("Verifying contract...")
  try {
    await run("verify:verify", {      //run("verify: tag") there are many tags, verify os one of them.
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!")
    } else {
      console.log(e)
    }
  }
}

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })