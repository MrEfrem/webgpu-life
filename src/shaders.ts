export const WORKGROUP_SIZE = 8;

export function cellShaderModule(device: GPUDevice) {
  return device.createShaderModule({
    label: 'Cell shader',
    code: `
      struct Uniforms {
        modelViewProjectionMatrix : mat4x4<f32>,
      }
      @binding(0) @group(0) var<uniform> uniforms : Uniforms;
      
      struct VertexOutput {
        @builtin(position) Position : vec4<f32>,
        @location(0) fragUV : vec2<f32>,
        @location(1) fragPosition: vec4<f32>,
      }
      
      @vertex
      fn vertexMain(
        @location(0) position : vec4<f32>,
        @location(1) uv : vec2<f32>
      ) -> VertexOutput {
        var output : VertexOutput;
        output.Position = uniforms.modelViewProjectionMatrix * position;
        output.fragUV = uv;
        output.fragPosition = 0.5 * (position + vec4(1.0, 1.0, 1.0, 1.0));
        return output;
      }
        

      @fragment
      fn fragmentMain(
        @location(0) fragUV: vec2<f32>,
        @location(1) fragPosition: vec4<f32>
      ) -> @location(0) vec4<f32> {
        return fragPosition;
      }
    `,
  });
}

export function simulationShaderModule(device: GPUDevice) {
  // Create the compute shader that will process the simulation.
  return device.createShaderModule({
    label: 'Game of Life simulation shader',
    code: `
      @group(0) @binding(0) var<uniform> grid: vec2f;

      @group(0) @binding(1) var<storage> cellStateIn: array<u32>;
      @group(0) @binding(2) var<storage, read_write> cellStateOut: array<u32>;

      fn cellIndex(cell: vec2u) -> u32 {
        return (cell.y % u32(grid.y)) * u32(grid.x) +
         (cell.x % u32(grid.x));
      }

      fn cellActive(x: u32, y: u32) -> u32 {
        return cellStateIn[cellIndex(vec2(x, y))];
      }

      @compute
      @workgroup_size(${WORKGROUP_SIZE}, ${WORKGROUP_SIZE})
      fn computeMain(@builtin(global_invocation_id) cell: vec3u) {
        let u1 = 1u;
        let activeNeighbors = cellActive(cell.x+1u, cell.y+1u) +
          cellActive(cell.x+1u, cell.y) +
          cellActive(cell.x+1u, cell.y-u1) +
          cellActive(cell.x, cell.y-u1) +
          cellActive(cell.x-u1, cell.y-u1) +
          cellActive(cell.x-u1, cell.y) +
          cellActive(cell.x-u1, cell.y+1u) +
          cellActive(cell.x, cell.y+1u);

        let i = cellIndex(cell.xy);

        // Conway's game of life rules:
        switch activeNeighbors {
          case 2u: { // Active cells with 2 neighbors stay active.
            cellStateOut[i] = cellStateIn[i];
          }
          case 3u: { // Cells with 3 neighbors become or stay active.
            cellStateOut[i] = 1u;
          }
          default: { // Cells with < 2 or > 3 neighbors become inactive.
            cellStateOut[i] = 0u;
          }
        }
      }
    `,
  });
}
