export function getBindGroups({
  device,
  uniformBuffer,
  cellPipeline,
  cubeTexture,
  sampler,
}: {
  device: GPUDevice;
  uniformBuffer: GPUBuffer;
  cellPipeline: GPURenderPipeline;
  cubeTexture: GPUTexture;
  sampler: GPUSampler;
}) {
  // Create the bind group layout and pipeline layout.
  const uniformBindGroup = device.createBindGroup({
    label: 'Cell Bind Group Layout',
    layout: cellPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
        },
      },
      {
        binding: 1,
        resource: sampler,
      },
      {
        binding: 2,
        resource: cubeTexture.createView(),
      },
    ],
  });

  return { uniformBindGroup };
}
