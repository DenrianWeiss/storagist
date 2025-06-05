const sample = {
    "error": "",
    "artifact": {
        "storageLayout": {
            "storage": [
                {
                    "astId": 7049,
                    "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                    "label": "_strategies",
                    "offset": 0,
                    "slot": "0",
                    "type": "t_struct(AddressSet)5429_storage"
                },
                {
                    "astId": 7053,
                    "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                    "label": "positionLimit",
                    "offset": 0,
                    "slot": "2",
                    "type": "t_mapping(t_address,t_uint256)"
                },
                {
                    "astId": 7382,
                    "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                    "label": "vaultParams",
                    "offset": 0,
                    "slot": "3",
                    "type": "t_struct(VaultParams)5952_storage"
                },
                {
                    "astId": 7385,
                    "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                    "label": "vaultState",
                    "offset": 0,
                    "slot": "16",
                    "type": "t_struct(VaultState)5964_storage"
                },
                {
                    "astId": 7388,
                    "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                    "label": "tokens",
                    "offset": 0,
                    "slot": "21",
                    "type": "t_struct(AddressSet)5429_storage"
                },
                {
                    "astId": 7390,
                    "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                    "label": "unbackedMintedAmount",
                    "offset": 0,
                    "slot": "23",
                    "type": "t_uint256"
                },
                {
                    "astId": 7392,
                    "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                    "label": "unbackedMinter",
                    "offset": 0,
                    "slot": "24",
                    "type": "t_address"
                }
            ],
            "types": {
                "t_address": {
                    "encoding": "inplace",
                    "label": "address",
                    "numberOfBytes": "20"
                },
                "t_array(t_bytes32)dyn_storage": {
                    "base": "t_bytes32",
                    "encoding": "dynamic_array",
                    "label": "bytes32[]",
                    "numberOfBytes": "32"
                },
                "t_bytes32": {
                    "encoding": "inplace",
                    "label": "bytes32",
                    "numberOfBytes": "32"
                },
                "t_mapping(t_address,t_uint256)": {
                    "encoding": "mapping",
                    "key": "t_address",
                    "label": "mapping(address => uint256)",
                    "numberOfBytes": "32",
                    "value": "t_uint256"
                },
                "t_mapping(t_bytes32,t_uint256)": {
                    "encoding": "mapping",
                    "key": "t_bytes32",
                    "label": "mapping(bytes32 => uint256)",
                    "numberOfBytes": "32",
                    "value": "t_uint256"
                },
                "t_string_storage": {
                    "encoding": "bytes",
                    "label": "string",
                    "numberOfBytes": "32"
                },
                "t_struct(AddressSet)5429_storage": {
                    "encoding": "inplace",
                    "label": "struct EnumerableSet.AddressSet",
                    "members": [
                        {
                            "astId": 5428,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "_inner",
                            "offset": 0,
                            "slot": "0",
                            "type": "t_struct(Set)5114_storage"
                        }
                    ],
                    "numberOfBytes": "64"
                },
                "t_struct(Set)5114_storage": {
                    "encoding": "inplace",
                    "label": "struct EnumerableSet.Set",
                    "members": [
                        {
                            "astId": 5109,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "_values",
                            "offset": 0,
                            "slot": "0",
                            "type": "t_array(t_bytes32)dyn_storage"
                        },
                        {
                            "astId": 5113,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "_positions",
                            "offset": 0,
                            "slot": "1",
                            "type": "t_mapping(t_bytes32,t_uint256)"
                        }
                    ],
                    "numberOfBytes": "64"
                },
                "t_struct(VaultParams)5952_storage": {
                    "encoding": "inplace",
                    "label": "struct IVault.VaultParams",
                    "members": [
                        {
                            "astId": 5927,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "underlyingToken",
                            "offset": 0,
                            "slot": "0",
                            "type": "t_address"
                        },
                        {
                            "astId": 5929,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "name",
                            "offset": 0,
                            "slot": "1",
                            "type": "t_string_storage"
                        },
                        {
                            "astId": 5931,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "symbol",
                            "offset": 0,
                            "slot": "2",
                            "type": "t_string_storage"
                        },
                        {
                            "astId": 5933,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "marketCapacity",
                            "offset": 0,
                            "slot": "3",
                            "type": "t_uint256"
                        },
                        {
                            "astId": 5935,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "managementFeeRate",
                            "offset": 0,
                            "slot": "4",
                            "type": "t_uint256"
                        },
                        {
                            "astId": 5937,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "managementFeeClaimPeriod",
                            "offset": 0,
                            "slot": "5",
                            "type": "t_uint256"
                        },
                        {
                            "astId": 5939,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "maxPriceUpdatePeriod",
                            "offset": 0,
                            "slot": "6",
                            "type": "t_uint256"
                        },
                        {
                            "astId": 5941,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "revenueRate",
                            "offset": 0,
                            "slot": "7",
                            "type": "t_uint256"
                        },
                        {
                            "astId": 5943,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "exitFeeRate",
                            "offset": 0,
                            "slot": "8",
                            "type": "t_uint256"
                        },
                        {
                            "astId": 5945,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "admin",
                            "offset": 0,
                            "slot": "9",
                            "type": "t_address"
                        },
                        {
                            "astId": 5947,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "rebalancer",
                            "offset": 0,
                            "slot": "10",
                            "type": "t_address"
                        },
                        {
                            "astId": 5949,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "feeReceiver",
                            "offset": 0,
                            "slot": "11",
                            "type": "t_address"
                        },
                        {
                            "astId": 5951,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "redeemOperator",
                            "offset": 0,
                            "slot": "12",
                            "type": "t_address"
                        }
                    ],
                    "numberOfBytes": "416"
                },
                "t_struct(VaultState)5964_storage": {
                    "encoding": "inplace",
                    "label": "struct IVault.VaultState",
                    "members": [
                        {
                            "astId": 5955,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "exchangePrice",
                            "offset": 0,
                            "slot": "0",
                            "type": "t_uint256"
                        },
                        {
                            "astId": 5957,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "revenueExchangePrice",
                            "offset": 0,
                            "slot": "1",
                            "type": "t_uint256"
                        },
                        {
                            "astId": 5959,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "revenue",
                            "offset": 0,
                            "slot": "2",
                            "type": "t_uint256"
                        },
                        {
                            "astId": 5961,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "lastClaimMngFeeTime",
                            "offset": 0,
                            "slot": "3",
                            "type": "t_uint256"
                        },
                        {
                            "astId": 5963,
                            "contract": "contracts/main/VaultYieldRSETH.sol:VaultYieldRSETH",
                            "label": "lastUpdatePriceTime",
                            "offset": 0,
                            "slot": "4",
                            "type": "t_uint256"
                        }
                    ],
                    "numberOfBytes": "160"
                },
                "t_uint256": {
                    "encoding": "inplace",
                    "label": "uint256",
                    "numberOfBytes": "32"
                }
            }
        }
    },
    "isProxy": false,
    "implementationAddress": ""
}

const IdToExplorer = {
    "1": "https://etherscan.io/address/",
    "10": "https://bscscan.com/address/",
    "56": "https://bscscan.com/address/",
    "137": "https://polygonscan.com/address/",
    "146": "https://sonicscan.org/address/",
    "1329": "https://seitrace.com/address/",
    "42161": "https://arbiscan.io/address/",
    "43114": "https://snowscan.xyz/address/",
}


function getExplorerLink(address, chainId) {
    return `${IdToExplorer[chainId.toString()]}${address}`; // todo: change to correct link
}

function slotHash(location, key) {
    return ethers.utils.keccak256(ethers.utils.solidityPack(["uint256", "uint256"], [location, key]));
}

function hashSlot(slotId, mappingEntry = "") {
    // If mappingEntry is not empty, it's a mapping.
    if (mappingEntry == "") {
        // Convert slotId to hex and make it 64 characters long
        const hexSlot = slotId.toString(16).padStart(64, '0');
        return "0x" + hexSlot;
    } else {
        return slotHash(ethers.utils.hexZeroPad(mappingEntry, 32), slotId);
    }
}

function renderDocument(result, chainId) {
    // If error is not empty, render error message
    if (result.error) {
        return `<div>Error: ${result.error}</div>`;
    }
    let renderOut = "";
    // If it's proxy, add div for implementation address
    if (result.isProxy) {
        renderOut += `<div class="mdui-container">
        <p>Proxy Contract, Implementation Address: <a href="${getExplorerLink(result.implementationAddress, chainId)}">${result.implementationAddress}</a>
        </p></div>`;
    }
    // Render storage layout
    let layoutTable = `<table class="mdui-table mdui-table-hoverable">
    <thead>
        <tr>
            <th>Slot</th>
            <th>Label</th>
            <th>Type</th>
        </tr>
    </thead>
    `;
    for (let storage of result.artifact.storageLayout.storage) {
        layoutTable += `<tr>
        <td>${storage.slot}</td>
        <td>${storage.label}</td>
        <td>${storage.type}</td>
        </tr>`;
    }
    layoutTable += `</table>`;
    renderOut += layoutTable;
    renderOut += generateStorageLayoutHTML(result);
    return renderOut;
    // todo: render types
}

async function renderthis() {
    // First, get current url, and read chainId and contractAddress from it
    let url = window.location.href;
    let chainId = url.split('/')[3];
    let contractAddress = url.split('/')[4];
    // Then, fetch the storage layout
    let response = await fetch(`/api/${chainId}/${contractAddress}`);
    let result = await response.json();
    // Render the document
    let doc = renderDocument(result, chainId);
    document.getElementById("addr").innerText = "Contract:" + contractAddress;
    // Finally, set the document
    document.getElementById('view').innerHTML = doc;
}

async function fetchStorage() {
    // First get rpc
    let url = window.location.href;
    let rpc = document.getElementById('rpc').value;
    let contractAddress = url.split('/')[4];
    let slotId = document.getElementById('storage_slot').value;
    let mapKey = document.getElementById('map_key').value;
    let hashKey = hashSlot(slotId, mapKey);
    if (rpc == "") {
        document.getElementById('storage_content').innerText = "RPC is not provided, return slot instead: " + hashKey;
    }
    let provider = new ethers.providers.JsonRpcProvider(rpc);
    let storage = await provider.getStorageAt(contractAddress, hashKey, "latest"); 
    document.getElementById('storage_content').innerText = storage;
}

