import { expect } from "chai";
import { ethers } from "hardhat";

describe("AnimaRegistry", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const AnimaRegistry = await ethers.getContractFactory("AnimaRegistry");
    const contract = await AnimaRegistry.deploy();
    return { contract, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should start with empty companions", async function () {
      const { contract, owner } = await deployFixture();
      const companions = await contract.getOwnerCompanions(owner.address);
      expect(companions.length).to.equal(0);
    });
  });

  describe("Companions", function () {
    it("Should create a companion", async function () {
      const { contract, owner } = await deployFixture();
      await contract.createCompanion("MyAI", "root_hash_1");
      const companions = await contract.getOwnerCompanions(owner.address);
      expect(companions.length).to.equal(1);
      
      const comp = await contract.companions(companions[0]);
      expect(comp.name).to.equal("MyAI");
      expect(comp.owner).to.equal(owner.address);
      expect(comp.memoryRootHash).to.equal("root_hash_1");
      expect(comp.memoryNodeCount).to.equal(0);
    });

    it("Should update memory", async function () {
      const { contract, owner } = await deployFixture();
      await contract.createCompanion("MyAI", "root_hash_1");
      const companions = await contract.getOwnerCompanions(owner.address);
      const id = companions[0];

      await contract.updateMemory(id, "root_hash_2", 5);
      const comp = await contract.companions(id);
      expect(comp.memoryRootHash).to.equal("root_hash_2");
      expect(comp.memoryNodeCount).to.equal(5);
    });

    it("Should fail to update memory if not owner", async function () {
      const { contract, otherAccount } = await deployFixture();
      await contract.createCompanion("MyAI", "root_hash_1");
      
      // We know id is 1
      await expect(
        contract.connect(otherAccount).updateMemory(1, "root_hash_2", 5)
      ).to.be.revertedWith("Not owner");
    });

    it("Should verify memory correctly", async function () {
      const { contract } = await deployFixture();
      await contract.createCompanion("MyAI", "root_hash_1");
      
      expect(await contract.verifyMemory(1, "root_hash_1")).to.be.true;
      expect(await contract.verifyMemory(1, "root_hash_2")).to.be.false;
    });
  });
});
