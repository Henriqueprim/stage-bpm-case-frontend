import { useCallback, useState } from "react";
import useProcessStore from "../utils/Store";
import { createProcess } from "../utils/Processes";
import { useReactFlow } from "reactflow";

function SideBar() {
    const reactFlowInstance = useReactFlow();
    const processes = useProcessStore(state => state.processes);
    const addProcess = useProcessStore(state => state.addProcess);

    const withSubprocesses = processes.filter((process: any) => process.data.subprocesses.length > 0);
    const withoutSubprocesses = processes.filter((process: any) => process.data.subprocesses.length === 0);

    const [newProcessTitle, setNewProcessTitle] = useState("");


    const saveProcess = async () => {
        const createdProcess = await createProcess(newProcessTitle);
        const process = {
            id: createdProcess.id,
            data: {
                label: createdProcess.title,
                subprocesses: createdProcess.subprocesses,
                interconnections: createdProcess.interconnections,
            },
            position: { x: 0, y: 0 },
        }
        addProcess(process);
        setNewProcessTitle("");
    }
    
    let position = {
        x: 250,
        y: 250,
    };

    const addNode = useCallback((process: any) => {
        const id = process.id;
        const newNode = {
            id,
            position: {
                x: position.x,
                y: position.y
            },
            data: {
                label: process.data.label,
            },
        };
        position.x += 20;
        position.y += 20;
        reactFlowInstance.addNodes([newNode]);
    }, []);

    const viewMap = useCallback((mappedProcess: any) => {
        const elements = { nodes: reactFlowInstance.getNodes(), edges: reactFlowInstance.getEdges() };
        reactFlowInstance.deleteElements(elements);

        const orderedSpsIdList = mappedProcess.data.subprocesses;
        const orderedInterconnections = mappedProcess.data.interconnections;
        const orderedPositions = mappedProcess.data.positions;

        const unorderedSpsList = processes.filter((process: any) => orderedSpsIdList.includes(process.id));

        const nodes = unorderedSpsList.map((sps: any) => {
            return {
                id: sps.id,
                position: {
                    x: orderedPositions[orderedSpsIdList.indexOf(sps.id)].x,
                    y: orderedPositions[orderedSpsIdList.indexOf(sps.id)].y,
                },
                data: {
                    label: sps.data.label,
                },
            };
        });

        const edges = orderedInterconnections.map((interconnection: any) => {
            return {
                id: `${orderedSpsIdList[interconnection.source]}-${orderedSpsIdList[interconnection.target]}`,
                source: orderedSpsIdList[interconnection.source],
                target: orderedSpsIdList[interconnection.target],
            };
        });
        reactFlowInstance.addNodes(nodes);
        reactFlowInstance.addEdges(edges);
    }, []);


    const deleteNodeById = useCallback((id: any) => {
        reactFlowInstance.setNodes((nodes: any) => nodes.filter((node: any) => node.id !== id));
    }, []);

    return (
        <aside>
            <div className="title">
                <h1>Stage - Business Process Mapping</h1>
            </div>
            <div>
                <form className="sidebar_search">
                    <input
                        id="search_input"
                        type="text"
                        placeholder="Search"
                        className="search_input"
                        />
                    <button type="submit" className="search_submit">Search</button>
                </form>
            </div>
            <div>
                <form className="process_creation">
                    <h3 className="subtitle">Create Process</h3>
                    <input
                        id="process_input"
                        onChange={ (e) => setNewProcessTitle(e.target.value) }
                        type="text"
                        placeholder="Title"
                        className="process_input"
                    />
                    <button
                        onClick={ saveProcess }
                        type="submit"
                        className="process_submit"
                    >
                        +
                    </button>
                </form>
                <h2 className="subtitle">Processes</h2>
                <ul className="ul">
                    {withoutSubprocesses.map((process: any) => (
                        <>
                            <li key={process.data.title}>
                                {process.data.label}
                                <button
                                    value={process.id}
                                    onClick={ () => addNode(process) }
                                    type="submit"
                                    className="node_creation"
                                >
                                +
                                </button>
                                <button
                                    value={process.id}
                                    onClick={ () => deleteNodeById(process.id) }
                                    type="submit"
                                    className="node_delete"
                                >
                                x
                                </button>
                            </li>

                        </>
                    ))}
                </ul>
                <h2 className="subtitle">Mapped Processes</h2>
                <ul className="ul">
                    {withSubprocesses.map((process: any) => (
                        <>
                            <li key={process.data.title}>
                                {process.data.label}
                                <button
                                    value={process.id}
                                    onClick={ () => viewMap(process) }
                                    type="submit"
                                    className="node_creation"
                                >
                                View
                                </button>
                            </li>

                        </>
                    ))}
                </ul>
            </div>
        </aside>
    );
}

export default SideBar;

