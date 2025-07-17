import { createPublicClient, http, Address} from 'viem';
import { contractInfo }  from 'evmole';
import { chainIdToChainInfo } from './constants';
import got from "got";

async function fetchSignatures(signatures: string[]): Promise<Record<string, any>> {
    // Build url for the request
    const url = `https://api.openchain.xyz/signature-database/v1/lookup?function=${signatures.join(',')}&filter=true`;
    const response = await got(url)
    // Parse the response
    const data = JSON.parse(response.body);
    if (!data.ok) {
        return {};
    }
    return data?.result?.function || {};
}

function resolveSig(sigDb: Record<string, any>, selector: string): string {
    // Check if the selector exists in the database
    selector = "0x"+ selector
    if (sigDb[selector]) {
        // If it exists, return the name
        return sigDb[selector][0]?.name || selector;
    }
    // If it doesn't exist, return an empty string
    return selector;
}

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
    let selectorArray = [];
    for (const selector of result.functions) {
        artifact['selectors'][selector.selector] = {
            selector: selector.selector,
            offset: selector.bytecodeOffset,
            arguments: selector.arguments,
            stateMutability: selector.stateMutability,
        }
        selectorArray.push("0x" + selector.selector);
    }
    // Fetch selector resolved names
    const signatures = await fetchSignatures(selectorArray);
    // Backfill the names
    for (const selector of selectorArray) {
        // Remove 0x prefix
        let selectorOrig = selector.replace(/^0x/, '');
        artifact['selectors'][selectorOrig].name = resolveSig(signatures, selectorOrig);
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
        for (const read of entry.reads || []) {
            name += "r_" + resolveSig(signatures, read) + "_";
        }
        for (const write of entry.writes || []) {
            name += "w_" + resolveSig(signatures, write) + "_";
        }
        if (name === "") {
            name = "unknown_";
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
