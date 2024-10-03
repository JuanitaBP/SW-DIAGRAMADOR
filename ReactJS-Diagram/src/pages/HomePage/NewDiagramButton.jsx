import React, { useState } from 'react'; // Asegúrate de importar useState
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { createProject } from '../../helpers/createProject';

export const NewDiagramButton = () => {
    const navigate = useNavigate();
    const idUser = useSelector(state => state.auth.id);
    const [projectName, setProjectName] = useState(''); // Estado para el nombre del proyecto

    // Función para actualizar el nombre del proyecto
    const handleInputChange = (e) => {
        setProjectName(e.target.value);
    };

    // Función para manejar el clic en "Crear Proyecto"
    const handleClick = async () => {
        if (!projectName) {
            alert('Por favor, ingresa un nombre para el proyecto.'); // Validación básica
            return;
        }
        
        const nuevoDiagrama = await createProject(projectName, idUser); // Usa el nombre ingresado
        if (nuevoDiagrama.diagramObject) {
            navigate(`/diagram/${nuevoDiagrama.id}`);
        }
    };

    return (
        <div className='m-3 p-3 text-center text-white border border-gray-500 rounded-md'>
            <div className='grid grid-rows-3 gap-2'>
                <div className='text-xl'>
                    Nuevo Proyecto 
                </div>
                {/* Campo de entrada para el nombre del proyecto */}
                <input
                    type='text'
                    placeholder='Ingresa el nombre del proyecto'
                    value={projectName}
                    onChange={handleInputChange}
                    className='p-2 rounded border border-gray-500'
                    style={{ backgroundColor: '#F3D2C1', color: '#000' }} // Color personalizado
                />
                <Link
                    to="/diagram/"
                    onClick={handleClick}
                    className='bg-blue-500 p-2 rounded text-white mt-2'
                    style={{ backgroundColor: '#8BD3DD', color: '#000' }} 
                >
                    Crear Proyecto
                </Link>
            </div>
        </div>
    );
};
