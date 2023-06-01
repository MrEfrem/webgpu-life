import { sampleCount } from './constants';

export function getTextures({
  device,
  canvas,
  canvasFormat,
}: {
  device: GPUDevice;
  canvas: HTMLCanvasElement;
  canvasFormat: GPUTextureFormat;
}) {
  const depthTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    format: 'depth24plus',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
    sampleCount,
  });

  const colorTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    sampleCount,
    format: canvasFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  return {
    colorView: colorTexture.createView(),
    depthView: depthTexture.createView(),
  };
}
