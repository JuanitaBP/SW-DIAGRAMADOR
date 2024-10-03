import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { startLogout } from '../../store/auth/thunks';
import '../DiagramPage/Styles/header.css' //estillo para el header


export const Header = () => {
    const {nombre} = useSelector(state => state.auth);

    const dispatch = useDispatch();
    const onLogout = () => {
        dispatch(startLogout());
    };
    return (
        <header className='header w-full '> {/* Cambiado a header y clase personalizada */}
            <div>
                <p className='text-lg font-semibold'>Diagrador de classes</p>
            </div>

            {/* Contenedor para centrar el nombre */}
            <div className='nombre-container'>
                <h1 className='nombreHome'>Bienvenido(a), {nombre}</h1>
            </div>
            <div>

            <button className='logout-button' onClick={onLogout}>
            <span className='text-lg font-bold'>Cerrar Sesión</span>
            </button>
            </div>
            
        </header>
    )
}
