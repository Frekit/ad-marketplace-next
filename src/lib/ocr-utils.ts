// OCR utility to extract CSV codes from Spanish official documents

export async function extractCSVFromPDF(pdfUrl: string): Promise<string | null> {
    try {
        // For now, return null - OCR will be implemented with a service like:
        // - Google Cloud Vision API
        // - AWS Textract
        // - Azure Computer Vision
        // - Tesseract.js (client-side)

        // TODO: Implement actual OCR extraction
        // The CSV code format is typically: XXXX-XXXX-XXXX-XXXX

        console.log('OCR extraction not yet implemented for:', pdfUrl);
        return null;
    } catch (error) {
        console.error('Error extracting CSV:', error);
        return null;
    }
}

export function getVerificationURL(docType: 'hacienda' | 'seguridad_social' | 'autonomo', csv?: string): string {
    const urls = {
        hacienda: 'https://www.agenciatributaria.gob.es/AEAT.internet/Inicio/_Segmentos_/Ciudadanos/Tramites/Certificados/Certificado_de_estar_al_corriente_de_obligaciones_tributarias.shtml',
        seguridad_social: 'https://sede.seg-social.gob.es/wps/portal/sede/sede/Ciudadanos/CiudadanoDetalle/!ut/p/z1/04_Sj9CPykssy0xPLMnMz0vMAfIjo8zi_R0dPd2CDBwNDDz9wtxMnA38zYNDfI0MDAz0w8EKDHAARwP9KGL041EQhd_4cP0oVBTkJqoX5EcUlGTm5-kH6BfkBhqGGwQYGQQYGDgYGmBTj6IIUgMU5OtHOBYU5DpnJiYnZ-Ql5qQW5-sWJJZk5qUXK-QmJuaU5BcpQPQBANuJXTg!/dz/d5/L2dBISEvZ0FBIS9nQSEh/',
        autonomo: 'https://sede.seg-social.gob.es/wps/portal/sede/sede/Ciudadanos',
    };

    return urls[docType];
}

export function formatCSVCode(code: string): string {
    // Format CSV code with dashes: XXXXXXXXXXXX -> XXXX-XXXX-XXXX
    const clean = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (clean.length === 12) {
        return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}`;
    }
    return code;
}

export function validateCSVFormat(code: string): boolean {
    // Basic validation: alphanumeric, typically 12-16 characters
    const clean = code.replace(/[^A-Z0-9]/gi, '');
    return clean.length >= 12 && clean.length <= 16;
}
