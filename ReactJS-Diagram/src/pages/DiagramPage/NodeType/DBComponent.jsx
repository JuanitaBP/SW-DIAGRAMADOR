import React from 'react'

export const DBComponent = ({ atributos, tipos, primaryKey }) => {
    return (
        <div>
            {atributos.map((atributo, index) => (
                <div key={index}>
                    {primaryKey[index] && "(pk) "}
                    {atributo}: 
                    {tipos[index]}
                </div>
            ))}
        </div>
    )
}
