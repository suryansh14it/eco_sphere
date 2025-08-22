const { ethers } = require("hardhat");

async function main() {
  const GreenCredits = await ethers.getContractFactory("GreenCredits");
  const greenCredits = await GreenCredits.deploy();
  await greenCredits.waitForDeployment();

  console.log("✅ GreenCredits deployed to:", await greenCredits.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
