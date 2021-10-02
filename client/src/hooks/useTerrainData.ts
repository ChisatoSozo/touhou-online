import { useAssets } from "./useAssets"

export const useTerrainData = () => {
    const assets = useAssets()
    return assets.terrain["terrain"]
}