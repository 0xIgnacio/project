<template>
  <div>
  </div>
</template>

<script>
export default {
  name: 'VueWeb3',
  data() {
      return {
          metamaskLoggedIn: false,
          metamaskAccount: "none",
          metamaskWallet: undefined,
          metamaskChainId: "",
          error: 'none'
      };
  },
  methods: {
      loginMetamask(){

      },

      logoutMetamask(){
          this.metamaskAccount = "";
      },

      setMetaMaskWallet(wallet){
          this.metamaskWallet = wallet;
      },

      getMetaMaskWallet(){
          return this.metamaskWallet;
      },

      getMetaMaskChainId(){
          return this.metamaskChainId;
      },

      setMetaMaskChainId(chainId){
          this.metamaskChainId = chainId;
      },

      setMetaMaskAccount(account){
          this.metamaskAccount = account;
      },

      getMetaMaskAccount(){
          return this.metamaskAccount;
      },

      setError(error){
          this.error = error;
      }
  }
}
</script>

