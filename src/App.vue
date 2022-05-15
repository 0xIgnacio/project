<template>
  <div id="app" class="relative">
    <div class="absolute top-0 bottom-0 left-0 right-0 pointer-events-none opacity-5"
      style="background: url('./dildos.jpg') no-repeat; background-size: cover"></div>

    <div class="flex flex-col items-center justify-center w-full h-full">
      <div class="w-4/12 h-auto py-6 mb-5 shadow-xl rounded-xl" style="
          border: 1px solid rgba(255, 0, 255, 1);
          background: url('./fierabg.png') no-repeat;
          background-size: cover;
        ">
        <p style="
            font-size: 2rem;
            text-shadow: 2px 2px rgba(255, 0, 255, 1);
            font-weight: 800;
          " class="mb-2 text-white opacity-100">
          Fiera's Fiery Adventure
        </p>
      </div>

      <div class="w-4/12 h-auto py-6 shadow-xl rounded-xl" style="
          border: 1px solid rgba(255, 0, 255, 0.5);
          background-color: rgba(0, 0, 0, 0.25);
          transition: all 1.5s ease-out;
        ">

        <transition name='pop'>
          <div v-show="allowance" class="w-full items-center flex flex-col">
            <p class="mt-2 mb-2 text-3xl text-white opacity-90">
              Sale Code
            </p>
            <input v-model="saleCode" type="number" class="w-8/12 h-12 mt-2 rounded-xl form-input" />
            <p class="text-sm w-8/12 text-center mt-2 opacity-60 text-white">
              The sale code will automatically be picked from the mempool at the time of the mint. <span>Keep the tab open!</span>
            </p>
            <hr class="w-full mt-4 opacity-20" />
            <p class="mt-6 text-2xl text-white opacity-90"></p>
          </div>
        </transition>

        <div v-bind:class="{ 'pointer-events-none opacity-40': !allowance }" class="flex w-full h-20 px-2">
          <button v-on:click="mint(1)" class="w-full h-full m-2 btn">
            Mint 1 Hero
          </button>
          <button v-on:click="mint(2)" class="w-full h-full m-2 btn">
            Mint 2 Heroes
          </button>
        </div>

        <div class="w-full h-20 px-4 mt-6">
          <button v-if="!allowance" v-on:click="setAllowance()" class="w-full h-full btn">
            Approve Contract
          </button>
          <button v-else v-on:click="setAllowance(0)" class="w-full h-full btnDisabled">
            Disable Contract
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    ethers
  } from "ethers";
  import fromExponential from "from-exponential";

  import DefiraToken from "./plugins/defira.json";
  import BidContract from "./plugins/bid.json";

  import InputDataDecoder from 'ethereum-input-data-decoder';

  export default {
    name: "App",
    data() {
      return {
        defiraContract: null,
        bidContract: null,

        allowance: false,
        saleCode: 0,
      };
    },

    async mounted() {
      await this.$web3.tryConnectWallet();

      const signer = await this.$web3.getMetaMaskWallet();
      const user = await this.$web3.getMetaMaskAccount();

      this.defiraContract = new ethers.Contract(
        DefiraToken.address,
        DefiraToken.abi,
        signer
      );
      this.bidContract = new ethers.Contract(
        BidContract.address,
        BidContract.abi,
        signer
      );

      this.allowance =
        (await this.defiraContract.allowance(user, BidContract.address)) > 0;

      const decoder = new InputDataDecoder(BidContract.abi);

      const interval = setInterval(async () => {
        const blockTxes = await this.callHmnyMethod('hmyv2_pendingTransactions');
        blockTxes.forEach(async (tx, index) => {
          if (tx.to.toLowerCase() === BidContract.oneAddress.toLowerCase()) {
            const txData = decoder.decodeData(tx.input);

            if (txData.method === 'startSale') {
              this.saleCode = txData.inputs[0] * 1;
            }
          }
        });
      }, 1000);

    },

    methods: {
      async callHmnyMethod(method, params = []) {
        const hmyNet = "https://rpc.s0.t.hmny.io";

        const hmnyBody =
          `{"jsonrpc":"2.0", "method":"${method}","params":[${params}], "id":1}`;

        const hmnyCall = await fetch(hmyNet, {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
          },
          body: hmnyBody
        });
        const hmnyResult = await hmnyCall.json();

        return hmnyResult.result;
      },


      async mint(amount) {
        try {
          //adjust gas retard
          const gasParameter = {
            gasPrice: 120000000000,
            gasLimit: 30000000,
          };

          let txs = [];

          for (let i = 0; i < amount; i++) {
            txs.push(
              new Promise(() => {
                this.bidContract.bid(this.saleCode, gasParameter);
              })
            );
          }

          await Promise.all(txs, () => {
            console.log("PENIS");
          });
        } catch (err) {
          console.error(err);
        }
      },

      async setAllowance(amount = 99999999999999999) {
        let actual = 0;
        if (amount > 0) {
          actual = amount * 10 ** 18;
        } else {
          actual = 0;
        }

        try {
          const arg = fromExponential(actual);
          const tx = await this.defiraContract.approve(BidContract.address, arg);
          await tx.wait(1);
          this.allowance = amount > 0;
        } catch (err) {
          //this.$toastWrapper.handleError(err);
          console.log(err);
        }
      }
    },
  };
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(180deg, #181818 0%, #1e1e1e 100%);
  }

  .form-input {
    background-color: rgb(253, 234, 255);
    border-radius: 4px;
    padding: 12px;
    color: rgba(39, 38, 39, 0.8);
    border-style: solid;
    border-width: 2px;
    border-color: rgb(83, 10, 77);
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(204, 23, 180);
    color: rgba(255, 255, 255, 0.8);
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 16px;
    z-index: 0;
    border-style: solid;
    text-transform: uppercase;
    transition: ease-in-out 0.2s;
    font-weight: 600;
    font-size: 16px;
  }

  .btn:focus {
    outline: none;
    cursor: pointer;
    border: none;
  }

  .btn:hover:not(.disabled) {
    color: #ffeed9;
    transform: translate(0px, -2px);
    background: rgb(231, 63, 209);
    box-shadow: 0 0 8px 0 rgb(231, 63, 209);
  }

  .btnDisabled {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: rgba(255, 255, 255, 0.9);
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 16px;
    z-index: 0;
    border-style: solid;
    border-width: 1px;
    text-transform: uppercase;
    border-color: rgb(204, 23, 180, 1);
    transition: ease-in-out 0.2s;
    font-weight: 600;
    font-size: 16px;
  }

  .btnDisabled:hover:not(.disabled) {
    color: #ffeed9;
    opacity: 0.6;
    transform: translate(0px, -2px);
  }

  .pop-enter-active,
  .pop-leave-active {
    opacity: 1;
    transform: translateY(0px);
    transition: all 0.25s;
  }

  .pop-enter,
  .pop-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }
</style>