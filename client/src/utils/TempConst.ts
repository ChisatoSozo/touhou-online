import { v4 } from "uuid";

const tabID = sessionStorage.tabID ?
    sessionStorage.tabID :
    sessionStorage.tabID = v4();

export const username = {
    current: tabID
}
export const avatar = "Reimu";