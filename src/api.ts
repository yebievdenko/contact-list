import mockData from "./mockData.json";

let cursor = -1;
export const BATCH_SIZE = 10;

function delay(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), time));
}

export async function apiData() {
  await delay(1000);
  if (Math.random() > 0.7) {
    throw new Error("Something went wrong");
  }
  cursor += 1;
  const start = cursor * BATCH_SIZE;
  const end = cursor * BATCH_SIZE + BATCH_SIZE;
  return mockData.slice(start, end);
}
