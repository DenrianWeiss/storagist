function gotopage() {
    var chainId = document.getElementById('chain-id-select').value;
    var contractAddress = document.getElementById('contract-address').value;
    var forceEvmole = document.getElementById('force-evmole').checked ? 1 : 0;
    if (contractAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
        let uri = '/' + chainId + '/' + contractAddress;
        if (forceEvmole) {
            uri += '?forceEvmole=1';
        }
        window.location.href = uri;
    } else {
        alert('Please enter a valid contract address.');
    }

}