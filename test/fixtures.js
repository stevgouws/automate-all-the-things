import chai from "chai";
import chaiAsPromised from "chai-as-promised";

export async function mochaGlobalSetup() {
  process.env.NODE_ENV = "test";
  chai.use(chaiAsPromised);
}

// export async function mochaGlobalTeardown() {

// }
