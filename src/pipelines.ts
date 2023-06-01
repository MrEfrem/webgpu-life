import { sampleCount } from './constants';
import { cellShaderModule, simulationShaderModule } from './shaders';

function getRenderPipeline({
  device,
  canvasFormat,
  vertexBufferLayout,
}: {
  device: GPUDevice;
  canvasFormat: GPUTextureFormat;
  vertexBufferLayout: GPUVertexBufferLayout[];
}) {
  const cellShaderModuleInstance = cellShaderModule(device);

  // The render pipeline
  return device.createRenderPipeline({
    label: 'Cell pipeline',
    layout: 'auto',
    vertex: {
      module: cellShaderModuleInstance,
      entryPoint: 'vertexMain',
      buffers: vertexBufferLayout,
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

      // Backface culling since the cube is solid piece of geometry.
      // Faces pointing away from the camera will be occluded by faces
      // pointing toward the camera.
      cullMode: 'back',
    },
    // Enable depth testing so that the fragment closest to the camera
    // is rendered in front.
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
    multisample: {
      count: sampleCount,
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
  vertexBufferLayout,
}: {
  device: GPUDevice;
  canvasFormat: GPUTextureFormat;
  vertexBufferLayout: GPUVertexBufferLayout[];
}) {
  const cellPipeline = getRenderPipeline({
    device,
    canvasFormat,
    vertexBufferLayout,
  });

  return {
    cellPipeline,
  };
}
