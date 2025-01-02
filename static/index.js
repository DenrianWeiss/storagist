function gotopage() {

    var chainId = document.getElementById('chain-id-select').value;
    var contractAddress = document.getElementById('contract-address').value;
    if (contractAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
        window.location.href = '/' + chainId + '/' + contractAddress;
    } else {
        alert('Please enter a valid contract address.');
    }

}