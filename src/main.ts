import { mat4, vec3 } from 'wgpu-matrix';

import { initGpu } from './helpers';
import { getPipelines } from './pipelines';
import { getBuffers } from './buffers';
import { getBindGroups } from './bindGroups';

const { device, context, canvasFormat, canvas } = await initGpu();

const { uniformBuffer, vertexBuffer, cubeVertexArray, vertexBufferLayout } =
  getBuffers(device);

const { cellPipeline } = getPipelines({
  device,
  canvasFormat,
  vertexBufferLayout,
});

const { uniformBindGroup } = getBindGroups({
  device,
  cellPipeline,
  uniformBuffer,
});

const sampleCount = 4;

const depthTexture = device.createTexture({
  size: [canvas.width, canvas.height],
  format: 'depth24plus',
  usage: GPUTextureUsage.RENDER_ATTACHMENT,
  sampleCount,
});

const texture = device.createTexture({
  size: [canvas.width, canvas.height],
  sampleCount,
  format: canvasFormat,
  usage: GPUTextureUsage.RENDER_ATTACHMENT,
});
const view = texture.createView();

const aspect = canvas.width / canvas.height;
const projectionMatrix = mat4.perspective((2 * Math.PI) / 5, aspect, 1, 100.0);
const modelViewProjectionMatrix = mat4.create();

function getTransformationMatrix() {
  const viewMatrix = mat4.identity();
  mat4.translate(viewMatrix, vec3.fromValues(0, 0, -4), viewMatrix);
  const now = Date.now() / 1000;
  mat4.rotate(
    viewMatrix,
    vec3.fromValues(Math.sin(now), Math.cos(now), 0),
    1,
    viewMatrix
  );

  mat4.multiply(projectionMatrix, viewMatrix, modelViewProjectionMatrix);

  return modelViewProjectionMatrix as Float32Array;
}

// Move all of our rendering code into a function
function updateGrid() {
  const transformationMatrix = getTransformationMatrix();
  device.queue.writeBuffer(
    uniformBuffer,
    0,
    transformationMatrix.buffer,
    transformationMatrix.byteOffset,
    transformationMatrix.byteLength
  );

  const encoder = device.createCommandEncoder();

  // Render pass
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view,
        resolveTarget: context.getCurrentTexture().createView(),
        loadOp: 'clear',
        clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
        storeOp: 'discard',
      },
    ],
    depthStencilAttachment: {
      view: depthTexture.createView(),

      depthClearValue: 1.0,
      depthLoadOp: 'clear',
      depthStoreOp: 'store',
    },
  });

  // Draw the grid.
  pass.setPipeline(cellPipeline);
  pass.setBindGroup(0, uniformBindGroup);
  pass.setVertexBuffer(0, vertexBuffer);
  pass.draw(cubeVertexArray.length / 10, 1, 0, 0);

  // End the render pass and submit the command buffer
  pass.end();
  device.queue.submit([encoder.finish()]);

  requestAnimationFrame(updateGrid);
}

requestAnimationFrame(updateGrid);
