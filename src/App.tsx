import { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  Node,
  Edge,
  useEdgesState,
  addEdge,
  updateEdge,
  Connection,
  ReactFlowProvider,
} from 'reactflow';
import useProcessStore from './utils/Store';
import 'reactflow/dist/style.css';
import SideBar from './components/SideBar';
import { createProcess } from './utils/Processes';


const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];


export default function App() {
  const [title, setTitle] = useState("");
  const edgeUpdateSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const addProcess = useProcessStore(state => state.addProcess);
  
  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback((oldEdge: any, newConnection: any) => {
    edgeUpdateSuccessful.current = true;
    setEdges((els) => updateEdge(oldEdge, newConnection, els));
  }, []);

  const onEdgeUpdateEnd = useCallback((_:any, edge: any) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeUpdateSuccessful.current = true;
  }, []);

  const saveMap = async (e: any) => {
    e.preventDefault();
    const subprocesses = nodes.map((node) => {
      return node.id;
    });
    const positions = nodes.map((node) => {
      return node.position;
    });
    const interconnections = edges.map((edge) => {
      return {
        source: subprocesses.indexOf(edge.source),
        target: subprocesses.indexOf(edge.target),
      }
    });
    if(title === "") {
      alert("Please enter a title for the process map.");
      return;
    }
    const processMap = await createProcess(title, subprocesses, interconnections, positions);
    const process = {
      id: processMap.id,
      data: {
          label: processMap.title,
          subprocesses: processMap.subprocesses,
          interconnections: processMap.interconnections,
          position: processMap.position,
      },
  }
    addProcess(process);
    setTitle("");
  };

  const deleteMap = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, []);

  return (
    <div className='providerflow'>
      <ReactFlowProvider>
        <div className='providerflow'>
          <SideBar/>
        </div>
        <div style={{ width: '80vw', height: '100vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeUpdate={onEdgeUpdate}
          onEdgeUpdateStart={onEdgeUpdateStart}
          onEdgeUpdateEnd={onEdgeUpdateEnd}
          onConnect={onConnect}
        >
          <form>
            <input
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              className='processNameInput'
              type="text"
              id="processName"
              placeholder="Process Name"
            />
            <button
              className='savebutton'
              type="submit"
              onClick={saveMap}
            >
              SAVE PROCESS MAP
            </button>
          </form>
          <button
            className='clearbutton'
            type="submit"
            onClick={deleteMap}
          >
            CLEAR
          </button>
          <Controls />
          <MiniMap nodeColor={'#1a1a1a'}/>
          <Background variant={ BackgroundVariant.Dots } gap={12} size={1} />
        </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}