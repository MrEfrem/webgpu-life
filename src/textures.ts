import { sampleCount } from './constants';

export async function getTextures({
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

  // Fetch the image and upload it into a GPUTexture.
  const response = await fetch(
    new URL('assets/Di-3d.png', import.meta.url).toString()
  );
  const imageBitmap = await createImageBitmap(await response.blob());

  const cubeTexture = device.createTexture({
    size: [imageBitmap.width, imageBitmap.height, 1],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  device.queue.copyExternalImageToTexture(
    { source: imageBitmap },
    { texture: cubeTexture },
    [imageBitmap.width, imageBitmap.height]
  );

  // Create a sampler with linear filtering for smooth interpolation.
  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  });

  return {
    colorView: colorTexture.createView(),
    depthView: depthTexture.createView(),
    cubeTexture,
    sampler,
  };
}
