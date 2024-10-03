import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Función para exportar el diagrama
export const exportDiagram = (nodes, edges) => {
    const zip = new JSZip();
    const diagramData = {
        nodes: nodes,
        edges: edges,
    };
    
    // Convertir el diagrama a JSON y añadirlo al zip
    zip.file('diagram.json', JSON.stringify(diagramData));
    
    // Generar el archivo zip y guardarlo
    zip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, 'diagram.eapx');
    });
};

// Función para importar el diagrama
export const importDiagram = (file) => {
    return new Promise((resolve, reject) => {
        const zip = new JSZip();

        // Leer el archivo
        zip.loadAsync(file).then((zipContent) => {
            return zipContent.file('diagram.json').async('string');
        }).then((content) => {
            const diagramData = JSON.parse(content);
            resolve(diagramData);
        }).catch(error => {
            reject(error);
        });
    });
};


