export const WORKGROUP_SIZE = 8;

export function cellShaderModule(device: GPUDevice) {
  return device.createShaderModule({
    label: 'Cell shader',
    code: `
        struct VertexInput {
            @location(0) pos: vec2f,
            @builtin(instance_index) instance: u32,
        };
        
        struct VertexOutput {
            @builtin(position) pos: vec4f,
            @location(0) cell: vec2f,
        };
        
        @group(0) @binding(0) var<uniform> grid: vec2f;
        @group(0) @binding(1) var<storage> cellState: array<u32>;
        
        @vertex
        fn vertexMain(input: VertexInput) -> VertexOutput  {
            let i = f32(input.instance);
            let cell = vec2f(i % grid.x, floor(i / grid.x));
            let state = f32(cellState[input.instance]);
        
            let cellOffset = cell / grid * 2f;

            // Scale the position by the cell's active state.
            let gridPos = (input.pos*state+1f) / grid - 1f + cellOffset;
            
            var output: VertexOutput;
            output.pos = vec4f(gridPos, 0f, 1f);
            output.cell = cell;
            return output;
        }
        
        @fragment
        fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
            let c = input.cell / grid;
            return vec4f(c, 1f-c.x, 1f);
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
