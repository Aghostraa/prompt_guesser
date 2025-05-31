import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network flow-testnet`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Only deploy on Flow networks or localhost
  const isFlowNetwork = ["flowTestnet", "flowMainnet", "localhost", "hardhat"].includes(hre.network.name);
  
  if (!isFlowNetwork) {
    console.log(`⏭️  Skipping Flow deployment on ${hre.network.name} - this script is for Flow networks only`);
    return;
  }

  console.log(`🌊 Deploying YourContract to ${hre.network.name}...`);
  console.log(`📍 Deployer address: ${deployer}`);

  await deploy("YourContract", {
    from: deployer,
    // Contract constructor arguments
    args: [deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const yourContract = await hre.ethers.getContract<Contract>("YourContract", deployer);
  console.log("🎮 Contract owner:", await yourContract.owner());
  console.log("💰 Guess fee:", await yourContract.GUESS_FEE());

  if (hre.network.name.includes("flow")) {
    console.log(`✅ YourContract deployed to Flow ${hre.network.name}!`);
    console.log(`🔗 Contract address: ${await yourContract.getAddress()}`);
    console.log(`🌊 Network: ${hre.network.name}`);
    console.log(`🔗 Block Explorer: ${getBlockExplorerUrl(hre.network.name, await yourContract.getAddress())}`);
  }
};

function getBlockExplorerUrl(networkName: string, address: string): string {
  switch (networkName) {
    case "flowTestnet":
      return `https://flowscan.org/account/${address}?tab=contracts&network=testnet`;
    case "flowMainnet":
      return `https://flowscan.org/account/${address}?tab=contracts`;
    default:
      return "N/A";
  }
}

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract", "Flow"]; 