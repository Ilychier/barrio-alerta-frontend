export interface CategoriaPreset {
  descripciones: string[];
  imagen: string;
}

export const PRESETS_DE_REPORTE: Record<number, CategoriaPreset> = {
  10: {
    descripciones: [
      'Persona merodeando negocios',
      'Vehículo sin placas sospechoso',
      'Intento de intrusión vecinal',
    ],
    imagen:
      'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&auto=format&fit=crop',
  },
  11: {
    descripciones: [
      'Asalto a mano armada',
      'Hurto de autopartes',
      'Robo a vivienda en proceso',
    ],
    imagen:
      'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=500&auto=format&fit=crop',
  },
  12: {
    descripciones: [
      'Accidente de tránsito grave',
      'Persona inconsciente',
      'Crisis de salud en vía pública',
    ],
    imagen:
      'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=500&auto=format&fit=crop',
  },
  13: {
    descripciones: [
      'Fuego en vivienda vecinal',
      'Cortocircuito de cableado público',
      'Fuga de gas con llamas',
    ],
    imagen:
      'https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?w=500&auto=format&fit=crop',
  },
};
