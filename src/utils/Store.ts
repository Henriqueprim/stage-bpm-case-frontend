import { create } from 'zustand';
import { getProcesses } from './Processes';

const processesList = await getProcesses();

type ProcessState = {
    processes: any[];
    addProcess: (process: any) => void;
};

const useProcessStore = create<ProcessState>((set, get) => ({
    processes: processesList,
    addProcess: (process: any) => {set({ processes: [...get().processes, process] })},
}));

export default useProcessStore;
