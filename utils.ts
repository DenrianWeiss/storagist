import solcjs from "solc";
import got from "got";
import * as consts from "./constants";
import * as cache from "./cache";
// Use dotenv to load the API key
const APIKEY = process.env.APIKEY;

class ContractFetchResponse {
    error: string;
    artifact: any;
    isProxy: boolean;
    implementationAddress: string;
}

async function loadSolcAsync(version: string): Promise<any> {
    return new Promise((resolve, reject) => {
        solcjs.loadRemoteVersion(version, (err: any, solc: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(solc);
            }
        });
    });
}

function fixVerifiedSource(
    source: string,
    contractName: string,
    compilerVersion: string,
    optimizationEnabled: boolean,
    runs: string,
    evmVersion: string
) {
    // If the source begins with "{{", remove the first and last {
    if (source.at(0) == "{" && source.at(1) == "{") {
        source = source.slice(1, source.length - 1);
        return source;
    }
    // If the sources does not begins with "{", which means it's not json format, then we need to wrap it
    let fixed = {
        language: "Solidity",
        sources: {
            "contract.sol": {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                "*": {
                    "*": ["abi", "storageLayout"],
                },
            },
            optimizer: {
                enabled: optimizationEnabled,
            },
            metadata: {
                bytecodeHash: "ipfs",
            },
            libraries: {},
        },
    };
    fixed = fixed as any;

    if (optimizationEnabled) {
        Object.defineProperty(fixed.settings.optimizer, "runs", runs);
    }

    if (evmVersion != "Default") {
        Object.defineProperty(fixed.settings, "evmVersion", evmVersion);
    }
    return JSON.stringify(fixed);
}

async function compileInput(input: any) {
    const contractName = input?.ContractName;
    const compilerVersion = input?.CompilerVersion;
    const optimizationEnabled = input?.OptimizationEnabled === "1";
    let sourceCode = input?.SourceCode;
    const runs = input?.Runs;
    const evmVersion = input?.EVMVersion;
    // Sanity check
    if (!contractName || !compilerVersion || !sourceCode || !evmVersion) {
        throw new Error("Invalid input");
    }
    if (optimizationEnabled && !runs) {
        throw new Error("Invalid input");
    }
    // First, load up the required compiler
    const compiler = await loadSolcAsync(compilerVersion);
    // Post-process the source code
    // First, remove the first and last lines
    sourceCode = fixVerifiedSource(
        sourceCode,
        contractName,
        compilerVersion,
        optimizationEnabled,
        runs,
        evmVersion
    );
    let parsedCompileInput = JSON.parse(sourceCode);
    parsedCompileInput.settings.outputSelection = {
        "*": {
            "*": ["abi", "storageLayout"],
        },
    };
    // Compile the source code
    const compiledOutput = compiler.compile(JSON.stringify(parsedCompileInput));
    return JSON.parse(compiledOutput);
}

function findContractsInOutputs(contractName: any, compiledOutput: any) {
    const contracts = compiledOutput.contracts;
    const contractFiles = Object.keys(contracts);
    const contractFile = contractFiles.find((file) => {
        return Object.keys(contracts[file]).includes(contractName);
    });
    if (!contractFile) {
        throw new Error("Contract not found");
    }
    return contracts[contractFile][contractName];
}

async function pullContract(address: string, chainId: string) {
    const url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=contract&action=getsourcecode&address=${address}&apikey=${APIKEY}`;
    const response = await got(url);
    const data = JSON.parse(response.body);
    return data;
}

export async function fetchContract(address: string, chainId: string): Promise<ContractFetchResponse> {
    // First try to pull the contract from the cache
    let contractInCache = await cache.loadCache(chainId, address);
    if (contractInCache.isPresent) {
        if (contractInCache.isPending) {
            return {
                error: "Contract is pending",
                artifact: null,
                isProxy: false,
                implementationAddress: "",
            };
        }
        if (contractInCache.isProxy) {
            // Handle proxy logic
            // Re-fetch the implementation contract
            let contractData = await pullContract(address, chainId);
            if (contractData.status != "1") {
                return {
                    error: "Contract not found",
                    artifact: null,
                    isProxy: false,
                    implementationAddress: "",
                }
            }
            if (contractData.result.length == 0) {
                return {
                    error: "Contract not found",
                    artifact: null,
                    isProxy: false,
                    implementationAddress: "",
                }
            }
            let contract = contractData.result[0];
            let resp = await fetchContract(contract.Implementation, chainId);
            if (resp.error) {
                return {
                    error: resp.error,
                    artifact: null,
                    isProxy: false,
                    implementationAddress: "",
                }
            }
            return {
                error: "",
                artifact: resp.artifact,
                isProxy: true,
                implementationAddress: contract.Implementation,
            }
        } else {
            return {
                error: "",
                artifact: JSON.parse(contractInCache.storageLayout),
                isProxy: false,
                implementationAddress: "",
            };
        }
    } else {
        let isProxy = false;
        let implementationAddress = "";
        let contractData = await pullContract(address, chainId);
        if (contractData.status != "1") {
            return {
                error: "Contract not found",
                artifact: null,
                isProxy: false,
                implementationAddress: "",
            }
        }
        if (contractData.result.length == 0) {
            return {
                error: "Contract not found",
                artifact: null,
                isProxy: false,
                implementationAddress: "",
            }
        }
        if (contractData.result[0].SourceCode == "") {
            return {
                error: "Contract not verified",
                artifact: null,
                isProxy: false,
                implementationAddress: "",
            }
        }
        let contract = contractData.result[0];
        if (contract.Proxy == "1") {
            console.log("Contract is a proxy, Wait 5s and retrying...");
            console.log("Implementation: ", contract.Implementation);
            isProxy = true;
            implementationAddress = contract.Implementation;
            // Set cache
            await cache.saveCache(chainId, address, {
                isPresent: true,
                isPending: false,
                isProxy: true,
                source: "",
                storageLayout: "",
            });
            await new Promise((resolve) => setTimeout(resolve, 200));
            contractData = await pullContract(contract.Implementation, chainId);
            if (contractData.status != "1") {
                console.log("Contract not found");
                return {
                    error: "Contract not found",
                    artifact: null,
                    isProxy: false,
                    implementationAddress: "",
                }
            }
            if (contractData.result.length == 0) {
                console.log("Contract not found");
                return {
                    error: "Contract not found",
                    artifact: null,
                    isProxy: false,
                    implementationAddress: "",
                }
            }
            if (contractData.result[0].SourceCode == "") {
                console.log("Contract not verified");
                return {
                    error: "Contract not verified",
                    artifact: null,
                    isProxy: false,
                    implementationAddress: "",
                }
            }
            contract = contractData.result[0];
        }
        const compiledOutput = await compileInput(contract);
        const contractOutput = findContractsInOutputs(
            contract.ContractName,
            compiledOutput
        );

        // Set cache for the contract and return the artifact
        await cache.saveCache(chainId, address, {
            isPresent: true,
            isPending: false,
            isProxy: isProxy,
            source: "",
            storageLayout: JSON.stringify(contractOutput),
        });
        return {
            error: "",
            artifact: contractOutput,
            isProxy: isProxy,
            implementationAddress: implementationAddress,
        };
    }
}