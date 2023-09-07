import api from "./API";


const getProcesses = async () => {
    const { data } = await api.get('/process');
    const processes = data.map((process: any) => ({
      id: process.id,
      data: { label: process.title, subprocesses: process.subprocesses, interconnections: process.interconnections, positions: process.positions },
      position: { x: 0, y: 0 },
    }));
    return processes;
}

const createProcess = async (title: string, subprocesses:string[]=[], interconnections:{}[]=[], positions: {}[]=[] ) => {
  const process = { title, subprocesses, interconnections, positions };
  const { data } = await api.post('/process', process);
  return data;
}

export {
  getProcesses,
  createProcess,
};
