export function showErrorMessage<T>(
  obj: T,
  errorMsg: string
): asserts obj is NonNullable<T> {
  if (!obj) {
    document.querySelector<HTMLDivElement>('#messages')!.innerHTML = `
      <h1 style="color: red">${errorMsg}</h1>
    `;
    throw new Error(errorMsg);
  }
}

export async function initGpu() {
  const canvas = document.querySelector('canvas');
  showErrorMessage(canvas, 'Canvas is not found');

  showErrorMessage(navigator.gpu, 'This browser does not support WebGPU.');

  const adapter = await navigator.gpu.requestAdapter();
  showErrorMessage(
    adapter,
    'This browser supports WebGPU but it appears disabled.'
  );

  const device = await adapter.requestDevice();

  device.lost.then((info) => {
    showErrorMessage(null, `WebGPU device was lost: ${info.message}`);

    // 'reason' will be 'destroyed' if we intentionally destroy the device.
    if (info.reason !== 'destroyed') {
      // try again
      // initGpu();
    }
  });

  const context = canvas.getContext('webgpu');
  showErrorMessage(context, 'Canvas context WebGPU is not found.');

  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

  context.configure({
    device,
    format: canvasFormat,
  });

  return {
    device,
    adapter,
    context,
    canvasFormat,
  };
}
