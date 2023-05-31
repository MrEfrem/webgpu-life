import { initGpu } from './helpers';
import { getPipelines } from './pipelines';

const { device, context, canvasFormat, canvas } = await initGpu();

const { cellPipeline } = getPipelines({
  device,
  canvasFormat,
});

const sampleCount = 4;

const texture = device.createTexture({
  size: [canvas.width, canvas.height],
  sampleCount,
  format: canvasFormat,
  usage: GPUTextureUsage.RENDER_ATTACHMENT,
});
const view = texture.createView();

// Move all of our rendering code into a function
function updateGrid() {
  const encoder = device.createCommandEncoder();

  // Render pass
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view,
        resolveTarget: context.getCurrentTexture().createView(),
        loadOp: 'clear',
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        storeOp: 'discard',
      },
    ],
  });

  // Draw the grid.
  pass.setPipeline(cellPipeline);
  pass.draw(3, 1, 0, 0);

  // End the render pass and submit the command buffer
  pass.end();
  device.queue.submit([encoder.finish()]);

  requestAnimationFrame(updateGrid);
}

requestAnimationFrame(updateGrid);
