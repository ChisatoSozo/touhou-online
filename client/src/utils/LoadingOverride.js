import { DefaultLoadingScreen } from "@babylonjs/core";

export const loadingTextDiv = {
    current: undefined
}

DefaultLoadingScreen.prototype.displayLoadingUI = function () {
    //@ts-ignore
    if (this._loadingDiv) {
        // Do not add a loading screen if there is already one
        return;
    }
    this._loadingDiv = document.createElement("div");
    this._loadingDiv.id = "babylonjsLoadingDiv";
    this._loadingDiv.style.opacity = "0";
    this._loadingDiv.style.transition = "opacity 1.5s ease";
    this._loadingDiv.style.pointerEvents = "none";
    // Loading text
    this._loadingTextDiv = document.createElement("div");
    this._loadingTextDiv.style.position = "absolute";
    this._loadingTextDiv.style.bottom = "20px";
    this._loadingTextDiv.style.right = "30px"
    this._loadingTextDiv.style.textAlign = "right";
    this._loadingTextDiv.innerHTML = "Please Wait, The Girls Are Preparing...";
    loadingTextDiv.current = this._loadingTextDiv
    this._loadingDiv.appendChild(this._loadingTextDiv);

    // Loading img
    const imgBack = new Image();
    imgBack.src = "/images/loading.png";
    imgBack.style.position = "absolute";
    imgBack.style.height = "80vh";
    imgBack.style.top = "20px";
    imgBack.style.left = "40vw";
    this._loadingDiv.appendChild(imgBack);
    this._resizeLoadingUI();
    window.addEventListener("resize", this._resizeLoadingUI);
    this._loadingDiv.style.backgroundColor = "#000000";
    document.body.appendChild(this._loadingDiv);
    this._loadingDiv.style.opacity = "1";
};