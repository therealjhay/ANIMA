import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const Contract = await ethers.getContractFactory("AnimaRegistry");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`AnimaRegistry deployed to: ${address}`);

  // Write deployment info
  const deploymentsDir = path.join(__dirname, "../../src/lib");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentsFile = path.join(deploymentsDir, "deployments.json");
  let currentDeployments: Record<string, string> = {};
  if (fs.existsSync(deploymentsFile)) {
    currentDeployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf-8"));
  }

  currentDeployments["AnimaRegistry"] = address;
  fs.writeFileSync(deploymentsFile, JSON.stringify(currentDeployments, null, 2));
  console.log(`Updated deployments.json with address ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
