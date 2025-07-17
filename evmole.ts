import { createPublicClient, http, Address} from 'viem';
import { contractInfo }  from 'evmole';
import { chainIdToChainInfo } from './constants';

export async function runEvmole(chainId: string, address: string) {
    // First get the rpc from chainId:
    const chainInfo = chainIdToChainInfo[chainId];
    if (!chainInfo) {
        return {
            error: "Chain not supported, how do you even get here?",
            artifact: null,
            isProxy: false,
            implementationAddress: "",
        }
    }
    // Request rpc to get bytecode
    const client = createPublicClient({
        chain: {
            id: parseInt(chainId),
            name: chainInfo.name,
            rpcUrls: {
                default: { http: [chainInfo.rpc] },
            },
            nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
            }
        },
        transport: http(),
    });
    const bytecode = await client.getCode({
        address: address as Address,
    })
    if (!bytecode) {
        return {
            error: "Contract not exit or rpc error, wtf?",
            artifact: null,
            isProxy: false,
            implementationAddress: "",
        }
    }
    // Run evmole
    const result = await contractInfo(bytecode, {
        selectors: true,
        arguments: true,
        storage: true,
    })
    if (!result) {
        return {
            error: "Evmole failed to parse the contract, maybe it's not a valid contract?",
            artifact: null,
            isProxy: false,
            implementationAddress: "",
        }
    }
    // Create a fake artifact
    let artifact = {}
    artifact['selectors'] = {}
    for (const selector of result.functions) {
        artifact['selectors'][selector.selector] = {
            selector: selector.selector,
            offset: selector.bytecodeOffset,
            arguments: selector.arguments,
            stateMutability: selector.stateMutability,
        }
    }
    let storageLayout = {};
    let storage = [];
    for (const entry of result.storage) {
        // Modify slot to remove 0x000000... prefix and replace it with 0x
        let slot = ("0x" + entry.slot).replace(/^0x0+/, '0x');
        // Get the first function in entry to make a fake name
        const firstReadFunction = entry.reads?.[0];
        const firstWriteFunction = entry.writes?.[0];
        let name = "";
        if (firstReadFunction) {
            name = "r_" + firstReadFunction;
        }
        if (firstWriteFunction) {
            name += `w_${firstWriteFunction}`;
        }
        if (name === "") {
            name = "unknown";
        }
        // Generate a 4 byte hex key
        const randomPostFix = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0');
        const key = `0x${name}${slot}${entry.offset}_${randomPostFix}`;
        storage.push({
            "label": key,
            "offset": entry.offset,
            "slot": slot,
            "type": entry.type,
        })
    }
    storageLayout['storage'] = storage;
    artifact['storageLayout'] = storageLayout;
    return {
        error: "",
        artifact: artifact,
        isProxy: false,
        implementationAddress: "",
        evmole: true,
    }
}
