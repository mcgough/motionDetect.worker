/* eslint-disable no-unused-vars */
import * as Comlink from "comlink";
import { canvasCompare } from "@/utils/canvas-compare";

class MotionDetect {
  constructor(width, height) {
    this._frames = [];
    this._width = width;
    this._height = height;
  }
  takePicture(video) {
    const canvas = new OffscreenCanvas(100, 1);
    canvas.width = this._width;
    canvas.height = this._height;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, this._width, this._height);
    this.updatePreview(canvas);
  }
  onCompare(result) {
    if (!result) return;
    if (result.getPercentage() > 98) {
      console.log("someone present - ", result.getPercentage());
    }
  }
  processDataUrl(blob) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onerror = reject;
      reader.onload = e => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
  async updatePreview(canvas) {
    this._frames.unshift(canvas);
    this._frames.length = 2;
    if (!this._frames[0] || !this._frames[1]) return;
    const compareParams = {
      baseImageUrl: await this.processDataUrl(
        await this._frames[0].convertToBlob()
      ),
      targetImageUrl: await this.processDataUrl(
        await this._frames[1].convertToBlob()
      )
    };
    canvasCompare(compareParams)
      .then(this.onCompare)
      .catch(console.error);
  }
}

Comlink.expose(MotionDetect);
