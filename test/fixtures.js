import chai from "chai";
import chaiAsPromised from "chai-as-promised";

export async function mochaGlobalSetup() {
  safetyCheckEnv();
  chai.use(chaiAsPromised);
}

// export async function mochaGlobalTeardown() {

// }

function safetyCheckEnv() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error(
      `You're trying to run tests while on ${process.env.NODE_ENV}, that is very naughty! You might want to change your environment to test first...`
    );
  }
}
