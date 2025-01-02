import {Level} from 'level';

export type cacheEntry = {
    isPresent: boolean;
    isPending: boolean;
    isProxy: boolean;
    source: string;
    storageLayout: string;
}

const levelInstance = new Level<string, any>('./cache', { valueEncoding: 'json' })

function toCacheKey(chainId: string, address: string): string {
    return `${chainId}-${address}`;
}

export async function loadCache(chainId: string, address: string): Promise<cacheEntry> {
    let cached = await levelInstance.get(toCacheKey(chainId, address));
    if (!cached) {
        // todo: load from cache
        return {
            isPresent: false,
            isPending: false,
            isProxy: false,
            source: "",
            storageLayout: "",
        }
    } else {
        return cached;
    }
}

export async function saveCache(chainId: string, address: string, entry: cacheEntry): Promise<void> {
    await levelInstance.put(toCacheKey(chainId, address), entry);
}