import {
    ethers
} from 'ethers';
import VueWeb3 from '../components/VueWeb3';

const TimeStamper = {
    install(Vue) {
        const HARMONY_TESTNET = 1666700000;
        const HARMONY_MAINNET = 1666600000;

        //Create a new instance of the VueWeb3 component
        let constructor = Vue.extend(VueWeb3);
        let web3Container = new constructor();

        //Mount the new VueWeb3 instance to the body element
        const vm = web3Container.$mount();
        document.querySelector('body').appendChild(vm.$el);

        if (typeof window !== "undefined" && window.Vue) {
            window.Vue.use(web3Container);
        }

        //Creates an object which will act as an interface for the VueWeb3 component
        const web3 = {
            async clearAccountCache(){
                await localStorage.removeItem('collectionKnights');
                await localStorage.removeItem('upgradesData');
            },

            getAddress(contract){
                const key = web3Container.getMetaMaskChainId() === HARMONY_MAINNET ? "mainnet" : "testnet";
                return contract[key];
            },

            async getChainId(){
                const chainId = web3Container.getMetaMaskChainId();
                if(!chainId || chainId === 'none'){
                    await this.connectWallet();
                }
                
                return web3Container.getMetaMaskChainId() === HARMONY_MAINNET ? "mainnet" : "testnet";
            },

            getError(){
                return web3Container.error;
            },

            async getMetaMaskAccount() {
                const account = web3Container.getMetaMaskAccount();
                if (!account || account === 'none') {
                    await this.connectWallet();
                }

                return web3Container.getMetaMaskAccount();
            },

            async getMetaMaskWallet() {
                const wallet = web3Container.getMetaMaskWallet();
                if (!wallet) {
                    await this.connectWallet();
                }

                return web3Container.getMetaMaskWallet();
            },

            async tryConnectWallet(){
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const network = await provider.getNetwork();
                if (network.chainId === HARMONY_TESTNET || network.chainId === HARMONY_TESTNET) {
                    await this.connectWallet();
                }
                await this.connectToHarmony();
            },

            //Basic metamask connection: request accounts, signer & network
            async connectWallet() {
                if (window.ethereum !== undefined) {
                    try {
                        const provider = new ethers.providers.Web3Provider(window.ethereum);
                        await provider.send('eth_requestAccounts', []);
                        const signer = await provider.getSigner();
                        const network = await provider.getNetwork();
                        const accounts = await signer.getAddress();

                        // store information about the user's session in a global vue component
                        if (network.chainId === HARMONY_TESTNET) {
                            web3Container.setMetaMaskAccount(accounts);
                            web3Container.setMetaMaskWallet(signer);
                            web3Container.setMetaMaskChainId(HARMONY_TESTNET);
                        } else if (network.chainId === HARMONY_MAINNET) {
                            web3Container.setMetaMaskAccount(accounts);
                            web3Container.setMetaMaskWallet(signer);
                            web3Container.setMetaMaskChainId(HARMONY_MAINNET);
                        } else {
                            console.error("Wrong network. Please connect to harmony.")
                            await this.connectToHarmony();
                            web3Container.setError('provider');
                        }
                    } catch (err) {
                        web3Container.setError('provider');
                        console.error("Couldn't retrieve provider");
                    }
                } else {
                    console.error("Metamask is not installed. Please install Metamask.");
                }
            },

            //Clear the metamask account info
            logoutMetaMaskAccount() {
                web3Container.setMetaMaskAccount("");
                web3Container.setMetaMaskWallet(undefined);
            },

            //Prompt the user with a metamask notification to change the network to Harmony Mainnet
            async connectToHarmony() {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: "0x63564C40",
                        chainName: "Harmony Mainnet Shard 0",
                        nativeCurrency: {
                            name: "Harmony One",
                            symbol: "ONE",
                            decimals: 18
                        },
                        blockExplorerUrls: ["https://explorer.harmony.one/"],
                        rpcUrls: ["https://api.harmony.one/"]
                    }]
                });

                await this.connectWallet();
            }
        };

        if (window.ethereum) {
            //Prompts a metamask notification whenever the user changes the account or moves to another chain
            window.ethereum.on('accountsChanged', async() => {
                await web3.clearAccountCache();
                await web3.connectWallet();
                location.reload();
            });

            window.ethereum.on('chainChanged', async() => {
                await web3.clearAccountCache();
                await web3.connectWallet();
                location.reload();
            });
        }

        Vue.mixin({});

        Vue.prototype.$web3 = web3;
    }
}

export default TimeStamper;