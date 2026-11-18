export interface SiliconDefinition {
  id: string;
  model: string;
  low: number;
  high: number;
  lowEfficiency: string;
  highEfficiency: string;
  length: number;
  width: number;
  thickness: number;
  weight: number;
  cells: number;
  file: string;
}

export const siliconDefinitions: SiliconDefinition[] = [
  {
    id: "sp-n18-132hg",
    model: "SP-N18/132HG",
    low: 700,
    high: 720,
    lowEfficiency: "22.5",
    highEfficiency: "23.2",
    length: 2384,
    width: 1303,
    thickness: 33,
    weight: 38.1,
    cells: 132,
    file: "SP-N18-132HG700-720W",
  },
  {
    id: "sp-n16-156hg",
    model: "SP-N16/156HG",
    low: 625,
    high: 640,
    lowEfficiency: "22.4",
    highEfficiency: "22.9",
    length: 2465,
    width: 1134,
    thickness: 30,
    weight: 34,
    cells: 156,
    file: "SP-N16-156HG625-640W",
  },
  {
    id: "sp-n16b-132hg",
    model: "SP-N16B/132HG",
    low: 610,
    high: 630,
    lowEfficiency: "22.6",
    highEfficiency: "23.3",
    length: 2382,
    width: 1134,
    thickness: 30,
    weight: 33,
    cells: 132,
    file: "SP-N16B-132HG610-630W",
  },
  {
    id: "sp-n16a-144hg",
    model: "SP-N16A/144HG",
    low: 610,
    high: 630,
    lowEfficiency: "22.6",
    highEfficiency: "23.3",
    length: 2382,
    width: 1134,
    thickness: 30,
    weight: 33,
    cells: 144,
    file: "SP-N16A-144HG610-630W",
  },
  {
    id: "sp-n16-144hg",
    model: "SP-N16/144HG",
    low: 570,
    high: 600,
    lowEfficiency: "22.1",
    highEfficiency: "23.2",
    length: 2278,
    width: 1134,
    thickness: 30,
    weight: 31.5,
    cells: 144,
    file: "SP-N16-144HG570-600W-2024V3.0",
  },
  {
    id: "sp-n16b-96hg",
    model: "SP-N16B/96HG",
    low: 435,
    high: 450,
    lowEfficiency: "21.8",
    highEfficiency: "22.5",
    length: 1762,
    width: 1134,
    thickness: 30,
    weight: 20.2,
    cells: 96,
    file: "SP-N16B-96HG435-450W",
  },
];
