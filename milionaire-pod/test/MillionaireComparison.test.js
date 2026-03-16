import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

// Import hardhat chai matchers
import "@nomicfoundation/hardhat-chai-matchers";

// Helper function to deploy with retry logic for COTI testnet instability
async function deployWithRetry(alice, bob, maxRetries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const MillionaireComparison = await ethers.getContractFactory("MillionaireComparison");
      // Deploy with manual gas limit to avoid estimateGas issues on COTI testnet
      const contract = await MillionaireComparison.deploy(alice.address, bob.address, {
        gasLimit: 5000000 // Manual gas limit
      });
      await contract.waitForDeployment();
      console.log(`Contract deployed successfully at: ${await contract.getAddress()}`);
      return contract;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} deployment attempts failed`);
        throw error;
      }
      console.log(`Deployment attempt ${attempt} failed: ${error.message}`);
      console.log(`Retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

describe("MillionaireComparison", function () {
  let millionaireContract;
  let alice;
  let bob;
  let charlie;
  let david;
  let isCotiNetwork;

  // Increase timeout for COTI testnet
  this.timeout(60000);

  // Deploy ONCE before all tests (not before each!)
  before(async function () {
    [alice, bob, charlie, david] = await ethers.getSigners();

    // Deploy with retry logic - only once for all tests
    millionaireContract = await deployWithRetry(alice, bob);

    // Check if we're on COTI network (chainId: 7082400)
    const network = await ethers.provider.getNetwork();
    isCotiNetwork = Number(network.chainId) === 7082400;
  });

  describe("Contract Initialization", function () {
    it("should initialize with Alice's address set correctly", async function () {
      const aliceAddress = await millionaireContract.getAliceAddress();
      expect(aliceAddress).to.equal(alice.address);
    });

    it("should initialize with Bob's address set correctly", async function () {
      const bobAddress = await millionaireContract.getBobAddress();
      expect(bobAddress).to.equal(bob.address);
    });

    it("should initialize with no wealth set", async function () {
      const aliceSet = await millionaireContract.isAliceWealthSet();
      const bobSet = await millionaireContract.isBobWealthSet();
      const bothSet = await millionaireContract.areBothWealthsSet();

      expect(aliceSet).to.be.false;
      expect(bobSet).to.be.false;
      expect(bothSet).to.be.false;
    });

    it("should revert when deployed with zero address for Alice", async function () {
      if (isCotiNetwork) {
        this.skip(); // Skip on COTI testnet to avoid deployment issues
      }
      const MillionaireComparison = await ethers.getContractFactory("MillionaireComparison");
      await expect(
        MillionaireComparison.deploy(ethers.ZeroAddress, bob.address)
      ).to.be.revertedWith("Invalid addresses");
    });

    it("should revert when deployed with zero address for Bob", async function () {
      if (isCotiNetwork) {
        this.skip(); // Skip on COTI testnet to avoid deployment issues
      }
      const MillionaireComparison = await ethers.getContractFactory("MillionaireComparison");
      await expect(
        MillionaireComparison.deploy(alice.address, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid addresses");
    });

    it("should revert when Alice and Bob have the same address", async function () {
      if (isCotiNetwork) {
        this.skip(); // Skip on COTI testnet to avoid deployment issues
      }
      const MillionaireComparison = await ethers.getContractFactory("MillionaireComparison");
      await expect(
        MillionaireComparison.deploy(alice.address, alice.address)
      ).to.be.revertedWith("Alice and Bob must be different");
    });
  });

  describe("State Management", function () {
    it("should track wealth set state correctly for Alice", async function () {
      const beforeSet = await millionaireContract.isAliceWealthSet();
      expect(beforeSet).to.be.false;
    });

    it("should track wealth set state correctly for Bob", async function () {
      const beforeSet = await millionaireContract.isBobWealthSet();
      expect(beforeSet).to.be.false;
    });

    it("should track both wealths set state correctly", async function () {
      const aliceSet = await millionaireContract.isAliceWealthSet();
      const bobSet = await millionaireContract.isBobWealthSet();
      const bothSet = await millionaireContract.areBothWealthsSet();

      expect(bothSet).to.equal(aliceSet && bobSet);
    });

    it("should allow checking state from any address", async function () {
      if (isCotiNetwork) {
        this.skip(); // .connect() has issues on COTI testnet
      }
      const aliceSetFromCharlie = await millionaireContract.connect(charlie).isAliceWealthSet();
      const bobSetFromDavid = await millionaireContract.connect(david).isBobWealthSet();
      const bothSetFromCharlie = await millionaireContract.connect(charlie).areBothWealthsSet();

      expect(aliceSetFromCharlie).to.be.false;
      expect(bobSetFromDavid).to.be.false;
      expect(bothSetFromCharlie).to.be.false;
    });
  });

  describe("Access Control - Wealth Submission", function () {
    it("should allow Alice to view her own address", async function () {
      if (isCotiNetwork) {
        this.skip(); // .connect() has issues on COTI testnet
      }
      const aliceAddress = await millionaireContract.connect(alice).getAliceAddress();
      expect(aliceAddress).to.equal(alice.address);
    });

    it("should allow Bob to view Alice's address", async function () {
      if (isCotiNetwork) {
        this.skip(); // .connect() has issues on COTI testnet
      }
      const aliceAddress = await millionaireContract.connect(bob).getAliceAddress();
      expect(aliceAddress).to.equal(alice.address);
    });

    it("should allow anyone to view participant addresses", async function () {
      if (isCotiNetwork) {
        this.skip(); // .connect() has issues on COTI testnet
      }
      const aliceAddr = await millionaireContract.connect(charlie).getAliceAddress();
      const bobAddr = await millionaireContract.connect(charlie).getBobAddress();

      expect(aliceAddr).to.equal(alice.address);
      expect(bobAddr).to.equal(bob.address);
    });
  });

  describe("Access Control - Wealth Retrieval", function () {
    it("should revert when getting Alice's wealth before it's set", async function () {
      await expect(millionaireContract.getAliceWealth())
        .to.be.revertedWith("Alice's wealth not set yet");
    });

    it("should revert when getting Bob's wealth before it's set", async function () {
      await expect(millionaireContract.getBobWealth())
        .to.be.revertedWith("Bob's wealth not set yet");
    });
  });

  describe("Function Signatures", function () {
    it("should have correct setAliceWealth function signature", async function () {
      const fragment = millionaireContract.interface.getFunction("setAliceWealth");
      expect(fragment).to.exist;
      expect(fragment.name).to.equal("setAliceWealth");
    });

    it("should have correct setBobWealth function signature", async function () {
      const fragment = millionaireContract.interface.getFunction("setBobWealth");
      expect(fragment).to.exist;
      expect(fragment.name).to.equal("setBobWealth");
    });

    it("should have correct compareWealth function signature", async function () {
      const fragment = millionaireContract.interface.getFunction("compareWealth");
      expect(fragment).to.exist;
      expect(fragment.name).to.equal("compareWealth");
    });

    it("should have correct getAliceResult function signature", async function () {
      const fragment = millionaireContract.interface.getFunction("getAliceResult");
      expect(fragment).to.exist;
      expect(fragment.name).to.equal("getAliceResult");
      expect(fragment.stateMutability).to.equal("view");
    });

    it("should have correct getBobResult function signature", async function () {
      const fragment = millionaireContract.interface.getFunction("getBobResult");
      expect(fragment).to.exist;
      expect(fragment.name).to.equal("getBobResult");
      expect(fragment.stateMutability).to.equal("view");
    });

    it("should have correct isAliceWealthSet function signature", async function () {
      const fragment = millionaireContract.interface.getFunction("isAliceWealthSet");
      expect(fragment).to.exist;
      expect(fragment.name).to.equal("isAliceWealthSet");
      expect(fragment.stateMutability).to.equal("view");
    });

    it("should have correct isBobWealthSet function signature", async function () {
      const fragment = millionaireContract.interface.getFunction("isBobWealthSet");
      expect(fragment).to.exist;
      expect(fragment.name).to.equal("isBobWealthSet");
      expect(fragment.stateMutability).to.equal("view");
    });

    it("should have correct areBothWealthsSet function signature", async function () {
      const fragment = millionaireContract.interface.getFunction("areBothWealthsSet");
      expect(fragment).to.exist;
      expect(fragment.name).to.equal("areBothWealthsSet");
      expect(fragment.stateMutability).to.equal("view");
    });

    it("should have correct getAliceWealth function signature", async function () {
      const fragment = millionaireContract.interface.getFunction("getAliceWealth");
      expect(fragment).to.exist;
      expect(fragment.name).to.equal("getAliceWealth");
      expect(fragment.stateMutability).to.equal("view");
    });

    it("should have correct getBobWealth function signature", async function () {
      const fragment = millionaireContract.interface.getFunction("getBobWealth");
      expect(fragment).to.exist;
      expect(fragment.name).to.equal("getBobWealth");
      expect(fragment.stateMutability).to.equal("view");
    });

    it("should have correct reset function signature", async function () {
      const fragment = millionaireContract.interface.getFunction("reset");
      expect(fragment).to.exist;
      expect(fragment.name).to.equal("reset");
    });

    it("should have correct getAliceAddress function signature", async function () {
      const fragment = millionaireContract.interface.getFunction("getAliceAddress");
      expect(fragment).to.exist;
      expect(fragment.name).to.equal("getAliceAddress");
      expect(fragment.stateMutability).to.equal("view");
    });

    it("should have correct getBobAddress function signature", async function () {
      const fragment = millionaireContract.interface.getFunction("getBobAddress");
      expect(fragment).to.exist;
      expect(fragment.name).to.equal("getBobAddress");
      expect(fragment.stateMutability).to.equal("view");
    });
  });

  describe("Event Definitions", function () {
    it("should have WealthSubmitted event defined", async function () {
      const eventFragment = millionaireContract.interface.getEvent("WealthSubmitted");
      expect(eventFragment).to.exist;
      expect(eventFragment.name).to.equal("WealthSubmitted");
    });

    it("should have correct WealthSubmitted event parameters", async function () {
      const eventFragment = millionaireContract.interface.getEvent("WealthSubmitted");
      expect(eventFragment.inputs).to.have.length(2);
      expect(eventFragment.inputs[0].name).to.equal("user");
      expect(eventFragment.inputs[0].type).to.equal("address");
      expect(eventFragment.inputs[0].indexed).to.be.true;
      expect(eventFragment.inputs[1].name).to.equal("role");
      expect(eventFragment.inputs[1].type).to.equal("string");
    });

    it("should have ComparisonCompleted event defined", async function () {
      const eventFragment = millionaireContract.interface.getEvent("ComparisonCompleted");
      expect(eventFragment).to.exist;
      expect(eventFragment.name).to.equal("ComparisonCompleted");
    });

    it("should have correct ComparisonCompleted event parameters", async function () {
      const eventFragment = millionaireContract.interface.getEvent("ComparisonCompleted");
      expect(eventFragment.inputs).to.have.length(1);
      expect(eventFragment.inputs[0].name).to.equal("requester");
      expect(eventFragment.inputs[0].type).to.equal("address");
      expect(eventFragment.inputs[0].indexed).to.be.true;
    });
  });

  describe("Error Messages", function () {
    it("should revert with correct message when getting Alice's wealth before set", async function () {
      await expect(millionaireContract.getAliceWealth())
        .to.be.revertedWith("Alice's wealth not set yet");
    });

    it("should revert with correct message when getting Bob's wealth before set", async function () {
      await expect(millionaireContract.getBobWealth())
        .to.be.revertedWith("Bob's wealth not set yet");
    });
  });

  describe("View Function Behavior", function () {
    it("should allow multiple calls to state check functions without gas cost", async function () {
      const check1 = await millionaireContract.isAliceWealthSet();
      const check2 = await millionaireContract.isAliceWealthSet();
      const check3 = await millionaireContract.isBobWealthSet();
      const check4 = await millionaireContract.areBothWealthsSet();

      expect(check1).to.equal(check2);
      expect(check1).to.be.false;
      expect(check3).to.be.false;
      expect(check4).to.be.false;
    });

    it("should allow multiple calls to address getters without gas cost", async function () {
      const addr1 = await millionaireContract.getAliceAddress();
      const addr2 = await millionaireContract.getAliceAddress();
      const addr3 = await millionaireContract.getBobAddress();
      const addr4 = await millionaireContract.getBobAddress();

      expect(addr1).to.equal(addr2);
      expect(addr3).to.equal(addr4);
      expect(addr1).to.equal(alice.address);
      expect(addr3).to.equal(bob.address);
    });
  });

  describe("Edge Cases", function () {
    it("should handle rapid successive state checks", async function () {
      const promises = Array(10).fill().map(() => millionaireContract.isAliceWealthSet());
      const results = await Promise.all(promises);

      // All results should be consistent
      expect(results.every(r => r === false)).to.be.true;
    });

    it("should handle calls from different users for address queries", async function () {
      if (isCotiNetwork) {
        this.skip(); // .connect() has issues on COTI testnet
      }
      const aliceFromAlice = await millionaireContract.connect(alice).getAliceAddress();
      const aliceFromBob = await millionaireContract.connect(bob).getAliceAddress();
      const aliceFromCharlie = await millionaireContract.connect(charlie).getAliceAddress();

      expect(aliceFromAlice).to.equal(aliceFromBob);
      expect(aliceFromBob).to.equal(aliceFromCharlie);
      expect(aliceFromCharlie).to.equal(alice.address);
    });

    it("should maintain correct state across multiple state checks", async function () {
      const state1 = {
        alice: await millionaireContract.isAliceWealthSet(),
        bob: await millionaireContract.isBobWealthSet(),
        both: await millionaireContract.areBothWealthsSet()
      };

      const state2 = {
        alice: await millionaireContract.isAliceWealthSet(),
        bob: await millionaireContract.isBobWealthSet(),
        both: await millionaireContract.areBothWealthsSet()
      };

      expect(state1.alice).to.equal(state2.alice);
      expect(state1.bob).to.equal(state2.bob);
      expect(state1.both).to.equal(state2.both);
    });
  });

  describe("Contract Deployment", function () {
    it("should deploy with correct bytecode", async function () {
      const code = await ethers.provider.getCode(await millionaireContract.getAddress());
      expect(code).to.not.equal("0x");
      expect(code.length).to.be.greaterThan(2); // More than just "0x"
    });

    it("should deploy to a valid address", async function () {
      const address = await millionaireContract.getAddress();
      expect(ethers.isAddress(address)).to.be.true;
      expect(address).to.not.equal(ethers.ZeroAddress);
    });

    it("should allow multiple deployments with different participants", async function () {
      if (isCotiNetwork) {
        this.skip(); // Skip on COTI testnet to avoid deployment issues
      }
      const MillionaireComparison = await ethers.getContractFactory("MillionaireComparison");
      const contract1 = await MillionaireComparison.deploy(alice.address, bob.address);
      await contract1.waitForDeployment();

      const contract2 = await MillionaireComparison.deploy(charlie.address, david.address);
      await contract2.waitForDeployment();

      const addr1 = await contract1.getAddress();
      const addr2 = await contract2.getAddress();

      expect(addr1).to.not.equal(addr2);

      // Verify correct Alice/Bob addresses in each contract
      expect(await contract1.getAliceAddress()).to.equal(alice.address);
      expect(await contract1.getBobAddress()).to.equal(bob.address);
      expect(await contract2.getAliceAddress()).to.equal(charlie.address);
      expect(await contract2.getBobAddress()).to.equal(david.address);
    });
  });

  describe("Gas Estimation", function () {
    it("should estimate gas for state check calls", async function () {
      if (isCotiNetwork) {
        this.skip(); // estimateGas doesn't work on COTI testnet
      }
      const gasEstimate1 = await millionaireContract.isAliceWealthSet.estimateGas();
      const gasEstimate2 = await millionaireContract.isBobWealthSet.estimateGas();
      const gasEstimate3 = await millionaireContract.areBothWealthsSet.estimateGas();

      expect(Number(gasEstimate1)).to.be.greaterThan(0);
      expect(Number(gasEstimate2)).to.be.greaterThan(0);
      expect(Number(gasEstimate3)).to.be.greaterThan(0);
      // View functions should be cheap
      expect(Number(gasEstimate1)).to.be.lessThan(100000);
      expect(Number(gasEstimate2)).to.be.lessThan(100000);
      expect(Number(gasEstimate3)).to.be.lessThan(100000);
    });

    it("should estimate gas for address getter calls", async function () {
      if (isCotiNetwork) {
        this.skip(); // estimateGas doesn't work on COTI testnet
      }
      const gasEstimate1 = await millionaireContract.getAliceAddress.estimateGas();
      const gasEstimate2 = await millionaireContract.getBobAddress.estimateGas();

      expect(Number(gasEstimate1)).to.be.greaterThan(0);
      expect(Number(gasEstimate2)).to.be.greaterThan(0);
      expect(Number(gasEstimate1)).to.be.lessThan(100000);
      expect(Number(gasEstimate2)).to.be.lessThan(100000);
    });
  });
});
