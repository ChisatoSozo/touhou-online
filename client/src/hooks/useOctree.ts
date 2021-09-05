import { useContext } from 'react'
import { OctreeContext } from '../containers/OctreeContext'

export const useOctree = () => {
    return useContext(OctreeContext).octree
}
