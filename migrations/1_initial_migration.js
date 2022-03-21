const Migrations = artifacts.require("Migrations");
const DaiTokenMock = artifacts.require("DaiTokenMock");

module.exports = async function(deployer) {
  await deployer.deploy(Migrations);
  await deployer.deploy(DaiTokenMock);
  const tokenMock = await DaiTokenMock.deployed();
  // Mint 1,000 Dai Tokens for the deployer
  await tokenMock.mint(
    "0x1871b3f9AD5540955cabDBD74128a52F4874e829",
    "1000000000000000000000"
  );
};
