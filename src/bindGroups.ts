export function getBindGroups({
  device,
  uniformBuffer,
  cellPipeline,
}: {
  device: GPUDevice;
  uniformBuffer: GPUBuffer;
  cellPipeline: GPURenderPipeline;
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
    ],
  });

  return { uniformBindGroup };
}
