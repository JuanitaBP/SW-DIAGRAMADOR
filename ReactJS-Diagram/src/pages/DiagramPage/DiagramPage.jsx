import React, { useCallback, useContext, useEffect, useState } from 'react';

import ReactFlow,

{
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  Background // Importar Background
} from 'reactflow';
import 'reactflow/dist/style.css';


import DatabaseNode from './NodeType/DatabaseNode';
import './Styles/text-updater-node.css';
import { MultiSelectionToolbar } from './SelectedNode/MultiSelectionToolbar';
import { SelectedEdge } from './SelectedEdge/SelectedEdge';
import { CopyBoard } from './CopyBoard';
import { Link, useParams } from 'react-router-dom';
import { useFetchProject } from '../../hooks/useFetchProject';
import { updateProject } from '../../helpers/updateProject';
import { SocketContext } from '../../context/SocketContext';
import '../../utils/fileUtils'



const edgeOptions = {
  label: "1-1..*",
};

//const nodeTypes = useMemo(() => ({database : DatabaseNode,textUpdater: TextUpdaterNode}), []);
const nodeTypes = {
  database: DatabaseNode
};

const connectionLineStyle = { stroke: 'white' };


let nodeId = 0;
const backgroundColors = ['#6ede87', '#ff0072', '#6865A5'];

export const Diagram = () => {
  const params = useParams();
  const proyecto = useFetchProject(params.id);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const reactFlowInstance = useReactFlow();
  const { socket } = useContext(SocketContext);

  
 
  // Función para exportar el diagrama
  const handleExport = () => {
    exportDiagram(nodes, edges);
  };

  // Función para importar el diagrama
  const handleImport = (event) => {
    const file = event.target.files[0];
    importDiagram(file).then((data) => {
      setNodes(data.nodes);
      setEdges(data.edges);
    }).catch((error) => {
      console.error('Error al importar el diagrama:', error);
    });
  };

  useEffect(() => {
    socket.emit('joinRoom', { room: params.id })

    socket.on('newNode', (data) => {
      nodeId = data.nodeId
      

      // Asignar un color aleatorio si no tiene uno
      const num = Math.floor(Math.random() * backgroundColors.length);
      data.node.style = { ...data.node.style, backgroundColor: backgroundColors[num], color: 'white' };
      setNodes((nds) => nds.concat(data.node));

    })

    socket.on('movedNode', (data) => {
      console.log(`frontend: movedNode ${data.node.data.title}`);
      setNodes(nodes => nodes.map(nd => {
        if (nd.id == data.node.id) {
          nd.position.x = data.node.position.x;
          nd.position.y = data.node.position.y;
        }
        return nd;
      }))
    })

    //* escuchar cuando se actualiza un nodo
    socket.on('updatedNode', (data) => {
      console.log(`frontend: updatedNode ${data.node}`);
      setNodes([...data.node]);
    })

    //* escuchar evento cuando se elimine nodes
    socket.on('deletedNodes', (data) => {
      console.log('frontend: deletedNodes');
      setNodes((nds) => nds.filter(n => {
        for (let i = 0; i < data.length; i++) {
          if (n.id === data[i].id) {
            continue;
          }
          return n;
        }
      }));
    })

    socket.on('newEdge', (data) => {
      console.log('frontend: newEdge');
      setEdges((eds) => addEdge({ ...data.edge, type: 'step', data: { tipo: "Asociacion", label: "1-1..*" }, style: { strokeWidth: 2 } }, eds)),
        [setEdges]
    })



    //* escuchar evento para que se actualice el label de un edge
    socket.on('changeLabel', (data) => {
      console.log('frontend: setLabel');
      setEdges([...data.edges]);
    })

    //* escuchar evento cuando se eliminen edges
    socket.on('deletedEdges', (data) => {
      console.log('frontend: deletedEdges');
      setEdges((edges) => edges.filter(edge => {
        if (edge.id !== data[0].id)
          return edge;
      }));
    })



    return () => {
      socket.emit('leaveRoom', { room: params.id })
    }
  }, [])


  const onConnect = useCallback(
    (connection) => socket.emit('insertEdge', { edge: connection, room: params.id })
  );



  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const handleClickSave = () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      updateProject(proyecto.id, flow);
    }
  }


  const onCreate = useCallback(() => {
    const id = `${++nodeId}`;
    const num = Math.floor(Math.random() * (2 - 0 + 1) + 0);
    const newNode = {
      id,
      type: 'database',
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        label: 'Title',
        atributos: ["id"],
        tipos: ["Text"],
        primaryKey: [true],
      },
      style: { backgroundColor: `#${backgroundColors[num]}`, color: 'white' },
    };
    reactFlowInstance.addNodes(newNode);
    socket.emit('insertNode', { node: newNode, room: params.id, nodeId });
  }, []);

  const handleNodeChange = (newElement) => {
    setNodes(newElement);
    socket.emit('updateNode', { node: nodes, room: params.id });
  };

  const handleEdgeChange = (newElement) => {
    setEdges(newElement);
    socket.emit('setLabel', { edges, room: params.id });
  }

  const handleOnEdgesDelete = (eds) => {
    console.log(`se ha eliminado el edge ${eds.length}`);
    socket.emit('deleteEdges', {edges:eds, room: params.id});
  }

  useEffect(() => {
    setNodes(proyecto.diagramObject !== undefined ? proyecto.diagramObject.nodes : []);
    setEdges(proyecto.diagramObject !== undefined ? proyecto.diagramObject.edges : []);
    nodeId = (proyecto.diagramObject !== undefined && proyecto.diagramObject.nodes.length > 0) ? proyecto.diagramObject.nodes[0]['id'] : 0;
  }, [proyecto.diagramObject])

  const handleOnNodesDelete = (nodes) => {
    socket.emit('deleteNodes', { nodes: nodes, room: params.id });
  }

  const handleOnNodeDragStop = (e, node) => {
    socket.emit('moveNode', { node, room: params.id });
  }



  return (
    
    <div className='h-screen'>
     
    {
      
      !proyecto.isEmpty ?
        <ReactFlow
          nodes={nodes}
          edges={edges}
          defaultEdgeOptions={edgeOptions}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          //onPaneClick={handlePaneClick}
          onNodesDelete={handleOnNodesDelete}
          onEdgesDelete={handleOnEdgesDelete}
          onNodeDragStop={handleOnNodeDragStop}
          style={{
            backgroundColor: '#D3B2A2FF' ,
            
            
          }}
       
        >
           {/* Agregar el componente Background aquí */}
           <Background color="#ccc" variant="lines" gap={30} />

          <Panel position='top-center'>
            <Link to="/home"><button className='rounded bg-[#8BD3DD] p-1 text-black border border-gray-500 hover:bg-[#F582AE]'>Home</button>
            </Link>
            <button className='rounded bg-[#8BD3DD] p-1 text-black mx-2 border border-gray-500 hover:bg-[#F582AE]' onClick={onCreate}>New Class</button>
            <button className='rounded bg-[#8BD3DD] p-1 text-black mx-2 border border-gray-500 hover:bg-[#F582AE]' onClick={handleClickSave}>Guardar Cambios</button>
                {/* Botón para exportar el diagrama */}
              <button className='rounded bg-[#8BD3DD] p-1 text-black border border-gray-500 hover:bg-[#F582AE]' onClick={handleExport}>Exportar .eapx</button>

{/* Input para importar el diagrama */}
<input
  type="file"
  accept=".eapx"
  onChange={handleImport}
  className='rounded bg-[#8BD3DD] p-1 text-black border border-gray-500 hover:bg-[#F582AE]'
/>
          </Panel>

          <Panel position='bottom-left'>
            <CopyBoard />
          </Panel >
        

      
        <MultiSelectionToolbar setNodes={handleNodeChange} />
        <SelectedEdge setEdges={handleEdgeChange} />

           
        </ReactFlow>
        : <div><h1>Cargando Diagrama {proyecto.id}</h1></div>
    }
    
  </div>
  );
}

export const DiagramPage = () => {
  return (
    
    <ReactFlowProvider>
      <Diagram />
    </ReactFlowProvider>
  );
}