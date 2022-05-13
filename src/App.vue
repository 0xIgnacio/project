<template>
  <div id="app" class="relative">

    <div class="absolute top-0 bottom-0 left-0 right-0 opacity-5 pointer-events-none"
      style="background: url('./dildos.jpg') no-repeat; background-size: cover">

    </div>

    <div class="flex flex-col items-center justify-center w-full h-full">
      <p style="font-size: 2.75rem" class="text-white mb-2 opacity-90">
        Fiera's fiery adventure
      </p>
      <div class="w-4/12 h-auto rounded-xl shadow-xl py-6"
        style="border: 1px solid rgba(255,0,255,0.5); background-color: rgba(0,0,0,0.25)">

        <p class="text-white mb-2 text-3xl mt-2 opacity-90">
          Enter sale code
        </p>

        <input v-model='saleCode' type="text" class="w-9/12 h-12 rounded-xl mt-2 form-input">

        <hr class="opacity-20 w-full mt-6">

        <p class="text-white mb-2 text-2xl mt-6 opacity-90">

        </p>

        <div v-bind:class='{"pointer-events-none opacity-40": !allowance}' class="flex w-full h-20 px-2">
          <button v-on:click='mint(1)' class="btn w-full h-full m-2">
            Mint 1
          </button>
          <button v-on:click='mint(2)' class="btn w-full h-full m-2">
            Mint 2
          </button>
        </div>

        <div class="w-full h-20 px-4 mt-6">
          <button v-if='!allowance' v-on:click='setAllowance()' class="btn w-full h-full">
            Approve Contract
          </button>
          <button v-else v-on:click='setAllowance(0)' class="btn w-full h-full">
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
  } from 'ethers';
  import fromExponential from 'from-exponential';

  import DefiraToken from './plugins/defira.json';
  import BidContract from './plugins/bid.json';

  export default {
    name: 'App',
    data() {
      return {
        defiraContract: null,
        bidContract: null,

        allowance: false,
        saleCode: 0
      }
    },

    async mounted() {
      await this.$web3.tryConnectWallet();

      const signer = await this.$web3.getMetaMaskWallet();
      const user = await this.$web3.getMetaMaskAccount();

      this.defiraContract = new ethers.Contract(DefiraToken.address, DefiraToken.abi, signer);
      this.bidContract = new ethers.Contract(BidContract.address, BidContract.abi, signer);

      this.allowance = await this.defiraContract.allowance(user, BidContract.address) > 0;
    },

    methods: {
      async mint(amount){
        try{
          //adjust gas retard
          const gasParameter = {
            gasPrice: 120000000000,
            gasLimit: 30000000,
          };

          let txs = [];

          for(let i = 0; i < amount; i++){
            txs.push(new Promise(() => {
              this.bidContract.bid(this.saleCode, gasParameter)
            }));
          }

          await Promise.all(txs, () => {
            console.log("PENIS");
          });
        }
        catch(err){
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
    }
  }
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
    background: linear-gradient(180deg, #181818 0%, #1E1E1E 100%);
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
  }

  .btn:focus {
    outline: none;
    cursor: pointer;
    border: none;
  }

  .btn:hover:not(.disabled) {
    color: #ffeed9;
    transform: scale(1.01);
    background: rgb(231, 63, 209);
  }
</style>