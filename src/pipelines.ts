import { cellShaderModule, simulationShaderModule } from './shaders';

function getPipelineLayout({
  device,
  bindGroupLayout,
}: {
  device: GPUDevice;
  bindGroupLayout: GPUBindGroupLayout;
}) {
  return device.createPipelineLayout({
    label: 'Cell Pipeline Layout',
    bindGroupLayouts: [bindGroupLayout],
  });
}

function getRenderPipeline({
  device,
  pipelineLayout,
  canvasFormat,
  vertexBufferLayout,
}: {
  device: GPUDevice;
  pipelineLayout: GPUPipelineLayout;
  canvasFormat: GPUTextureFormat;
  vertexBufferLayout: GPUVertexBufferLayout;
}) {
  const cellShaderModuleInstance = cellShaderModule(device);

  // The render pipeline
  return device.createRenderPipeline({
    label: 'Cell pipeline',
    layout: pipelineLayout,
    vertex: {
      module: cellShaderModuleInstance,
      entryPoint: 'vertexMain',
      buffers: [vertexBufferLayout],
    },
    fragment: {
      module: cellShaderModuleInstance,
      entryPoint: 'fragmentMain',
      targets: [
        {
          format: canvasFormat,
        },
      ],
    },
  });
}

function getComputePipeline({
  device,
  pipelineLayout,
}: {
  device: GPUDevice;
  pipelineLayout: GPUPipelineLayout;
}) {
  const simulationShaderModuleInstance = simulationShaderModule(device);

  // Create a compute pipeline that updates the game state.
  return device.createComputePipeline({
    label: 'Simulation pipeline',
    layout: pipelineLayout,
    compute: {
      module: simulationShaderModuleInstance,
      entryPoint: 'computeMain',
    },
  });
}

export function getPipelines({
  device,
  bindGroupLayout,
  canvasFormat,
  vertexBufferLayout,
}: {
  device: GPUDevice;
  bindGroupLayout: GPUBindGroupLayout;
  canvasFormat: GPUTextureFormat;
  vertexBufferLayout: GPUVertexBufferLayout;
}) {
  const pipelineLayout = getPipelineLayout({
    device,
    bindGroupLayout,
  });

  const cellPipeline = getRenderPipeline({
    device,
    pipelineLayout,
    canvasFormat,
    vertexBufferLayout,
  });

  const simulationPipeline = getComputePipeline({
    device,
    pipelineLayout,
  });

  return {
    cellPipeline,
    simulationPipeline,
  };
}
