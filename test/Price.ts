import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from 'hardhat';

describe('PriceFeedConsumer', function() {
  async function deployPriceFeedConsumerFixture() {
    const [owner, user1, user2] = await hre.ethers.getSigners();

    const MockAggregator = await hre.ethers.getContractFactory("MockV3Aggregator");
    const ethUsdMock = await MockAggregator.deploy(8, 200000000000); 
    const btcUsdMock = await MockAggregator.deploy(8, 4000000000000); 

    const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
    const simpleToken = await SimpleToken.deploy();
    

    const PriceFeedConsumer = await hre.ethers.getContractFactory("PriceFeedConsumer");
    const priceFeedConsumer = await PriceFeedConsumer.deploy(
      await simpleToken.getAddress(),
    );
    

    await priceFeedConsumer.updatePriceFeed("ETH/USD", await ethUsdMock.getAddress());
    await priceFeedConsumer.updatePriceFeed("BTC/USD", await btcUsdMock.getAddress());

    await simpleToken.mint(user1.address, hre.ethers.parseUnits("1000", 18));

    await simpleToken.connect(user1).approve(
      await priceFeedConsumer.getAddress(), 
      hre.ethers.parseUnits("1000", 18)
    );

    return { priceFeedConsumer, ethUsdMock, btcUsdMock, simpleToken, owner, user1, user2 };
  }

  describe("Price Feed Functionality", function() {
    it("Should get the correct ETH price", async function() {
      const { priceFeedConsumer } = await loadFixture(deployPriceFeedConsumerFixture);
      const price = await priceFeedConsumer.getPriceInUSD("ETH/USD");
      expect(price).to.equal(2000); // $2000
    });

    it("Should get the correct BTC price", async function() {
      const { priceFeedConsumer } = await loadFixture(deployPriceFeedConsumerFixture);
      const price = await priceFeedConsumer.getPriceInUSD("BTC/USD");
      expect(price).to.equal(40000); // $40000
    });

    it("Should get multiple prices correctly", async function() {
      const { priceFeedConsumer } = await loadFixture(deployPriceFeedConsumerFixture);
      const prices = await priceFeedConsumer.getAllprice(["ETH/USD", "BTC/USD"]);
      expect(prices[0]).to.equal(2000);
      expect(prices[1]).to.equal(40000);
    });

    it("Should revert when getting price for non-existent feed", async function() {
      const { priceFeedConsumer } = await loadFixture(deployPriceFeedConsumerFixture);
      await expect(priceFeedConsumer.getPriceInUSD("XRP/USD"))
        .to.be.revertedWith("Price feed not found");
    });
  });

  describe("Token Integration", function() {
    it("Should mint tokens if ETH price is high enough", async function() {
      const { priceFeedConsumer, simpleToken, user2 } = await loadFixture(deployPriceFeedConsumerFixture);
      
      const initialBalance = await simpleToken.balanceOf(user2.address);
      await priceFeedConsumer.mintIfPriceHigh(user2.address);
      const finalBalance = await simpleToken.balanceOf(user2.address);
      
      expect(finalBalance - initialBalance).to.equal(hre.ethers.parseUnits("100", 18));
    });

    it("Should transfer tokens if ETH price is high enough", async function() {
      const { priceFeedConsumer, simpleToken, user1, user2 } = await loadFixture(deployPriceFeedConsumerFixture);
      
      const amount = hre.ethers.parseUnits("50", 18);
      const initialSenderBalance = await simpleToken.balanceOf(user1.address);
      const initialReceiverBalance = await simpleToken.balanceOf(user2.address);
      
      await priceFeedConsumer.connect(user1).transferIfPriceHigh(user2.address, amount);
      
      const finalSenderBalance = await simpleToken.balanceOf(user1.address);
      const finalReceiverBalance = await simpleToken.balanceOf(user2.address);
      
      expect(initialSenderBalance - finalSenderBalance).to.equal(amount);
      expect(finalReceiverBalance - initialReceiverBalance).to.equal(amount);
      console.log("finalSenderBalance, finalSenderBalance")
    });

    it("Should revert mintIfPriceHigh if ETH price is too low", async function() {
      const { priceFeedConsumer, ethUsdMock, user2 } = await loadFixture(deployPriceFeedConsumerFixture);
      
      // Update price to $1000 (below 1500 threshold)
      await ethUsdMock.updateAnswer(100000000000);
      
      await expect(priceFeedConsumer.mintIfPriceHigh(user2.address))
        .to.be.revertedWith("Price too low");
    });

    it("Should revert transferIfPriceHigh if ETH price is too low", async function() {
      const { priceFeedConsumer, ethUsdMock, user1, user2 } = await loadFixture(deployPriceFeedConsumerFixture);
      
      // Update price to $1000 (below 1500 threshold)
      await ethUsdMock.updateAnswer(100000000000);
      
      await expect(priceFeedConsumer.connect(user1).transferIfPriceHigh(
        user2.address, 
        hre.ethers.parseUnits("50", 18)
      )).to.be.revertedWith("Price too low");
    });
  });
});