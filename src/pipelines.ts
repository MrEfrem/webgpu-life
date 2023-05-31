import { cellShaderModule, simulationShaderModule } from './shaders';

function getRenderPipeline({
  device,
  canvasFormat,
}: {
  device: GPUDevice;
  canvasFormat: GPUTextureFormat;
}) {
  const cellShaderModuleInstance = cellShaderModule(device);

  // The render pipeline
  return device.createRenderPipeline({
    label: 'Cell pipeline',
    layout: 'auto',
    vertex: {
      module: cellShaderModuleInstance,
      entryPoint: 'vertexMain',
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
    primitive: {
      topology: 'triangle-list',
    },
    multisample: {
      count: 4,
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
  canvasFormat,
}: {
  device: GPUDevice;
  canvasFormat: GPUTextureFormat;
}) {
  const cellPipeline = getRenderPipeline({
    device,
    canvasFormat,
  });

  return {
    cellPipeline,
  };
}
