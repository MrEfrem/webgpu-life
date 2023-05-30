import { getBindGroups } from './bindGroups';
import { getBuffers } from './buffers';
import { initGpu } from './helpers';
import { getPipelines } from './pipelines';
import { WORKGROUP_SIZE } from './shaders';

const { device, context, canvasFormat } = await initGpu();

const {
  vertexBufferLayout,
  uniformBuffer,
  storageBuffers,
  vertexBuffer,
  vertices,
  GRID_SIZE,
} = getBuffers(device);

const { bindGroups, bindGroupLayout } = getBindGroups({
  device,
  uniformBuffer,
  storageBuffers,
});

const { cellPipeline, simulationPipeline } = getPipelines({
  device,
  bindGroupLayout,
  canvasFormat,
  vertexBufferLayout,
});

const UPDATE_INTERVAL = 200; // Update every 200ms (5 times/sec)
let step = 0; // Track how many simulation steps have been run

// Move all of our rendering code into a function
function updateGrid() {
  const encoder = device.createCommandEncoder();

  // Compute pass
  const computePass = encoder.beginComputePass();

  computePass.setPipeline(simulationPipeline);
  computePass.setBindGroup(0, bindGroups[step % 2]);

  const workgroupCount = Math.ceil(GRID_SIZE / WORKGROUP_SIZE);
  computePass.dispatchWorkgroups(workgroupCount, workgroupCount);

  computePass.end();

  step++; // Increment the step count

  // Render pass
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: 'clear',
        clearValue: { r: 0, g: 0, b: 0.4, a: 1 },
        storeOp: 'store',
      },
    ],
  });

  // Draw the grid.
  pass.setPipeline(cellPipeline);
  pass.setBindGroup(0, bindGroups[step % 2]);
  pass.setVertexBuffer(0, vertexBuffer);
  pass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE);

  // End the render pass and submit the command buffer
  pass.end();
  device.queue.submit([encoder.finish()]);
}

// Schedule updateGrid() to run repeatedly
setInterval(updateGrid, UPDATE_INTERVAL);
