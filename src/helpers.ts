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

  showErrorMessage(navigator.gpu, 'WebGPU not supported on this browser.');

  const adapter = await navigator.gpu.requestAdapter();
  showErrorMessage(adapter, 'No appropriate GPUAdapter found.');

  const device = await adapter.requestDevice();

  const context = canvas.getContext('webgpu');
  showErrorMessage(context, 'Canvas context WebGPU is not found');

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
