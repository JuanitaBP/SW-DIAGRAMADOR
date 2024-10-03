import React, { useState, useRef } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useParams } from 'react-router-dom';

export const CopyBoard = () => {
    const params = useParams();
    const link = `http://localhost:5173/diagram/${params.id}`;

    // Estado para manejar la notificación de copiado
    const [copied, setCopied] = useState(false);

    // Ref para el temporizador
    const timeoutRef = useRef(null);

    // Función para manejar el evento de copiado
    const handleCopyClick = () => {
        setCopied(true); // Actualiza el estado a 'true' cuando se copia
        console.log('Contenido copiado:', link);

        // Limpiar el temporizador anterior si existe
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Reinicia el mensaje después de 2 segundos
        timeoutRef.current = setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <div className="flex items-center">
            <input
                type="text"
                value={link}
                className="border border-gray-400 p-2 mr-2"
                readOnly
            />
            <CopyToClipboard text={link} onCopy={handleCopyClick}>
                <button
                    className="bg-[#8BD3DD] text-black px-4 py-2 rounded border border-gray-500 hover:bg-[#F582AE]"
                >
                    Copiar
                </button>
            </CopyToClipboard>

            {/* Muestra el mensaje si el contenido ha sido copiado */}
            {copied && <span className="text-green-500 ml-4">¡Contenido copiado!</span>}
        </div>
    );
};




