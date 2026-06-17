import { useState, useCallback } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { PRESETS_DE_REPORTE } from '../../infrastructure/presets/reportePresets';
import { Categoria } from '../../domain/entities/categoria';

export function useReporteController(currentUserId: number) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [evidenceAttached, setEvidenceAttached] = useState(false);
  const [mockPhotoUrl, setMockPhotoUrl] = useState('');

  const container = DependencyContainer.getInstance();
  const categorias: Categoria[] = container.getReferenciaRepository().getCategorias();
  const reportarUseCase = container.getReportarIncidenteUseCase();

  const handleSelectCategory = useCallback((catId: number) => {
    const preset = PRESETS_DE_REPORTE[catId];
    if (!preset) return;

    setSelectedCategory(catId);
    setSelectedDescription(preset.descripciones[0]);
    setMockPhotoUrl(preset.imagen);
    setEvidenceAttached(false);
  }, []);

  const triggerMockPhotoCapture = useCallback(() => {
    setEvidenceAttached(true);
  }, []);

  const removeEvidence = useCallback(() => {
    setEvidenceAttached(false);
  }, []);

  const saveIncidentReport = useCallback((): boolean => {
    if (!selectedCategory || !evidenceAttached) return false;

    reportarUseCase.execute({
      descripcion: selectedDescription,
      categoriaId: selectedCategory,
      usuarioId: currentUserId,
      evidenciaUrl: mockPhotoUrl,
    });

    setSelectedCategory(null);
    setSelectedDescription('');
    setEvidenceAttached(false);
    setMockPhotoUrl('');
    return true;
  }, [selectedCategory, evidenceAttached, selectedDescription, currentUserId, mockPhotoUrl, reportarUseCase]);

  const cancel = useCallback(() => {
    setSelectedCategory(null);
    setSelectedDescription('');
    setEvidenceAttached(false);
    setMockPhotoUrl('');
  }, []);

  return {
    categorias,
    selectedCategory,
    selectedDescription,
    evidenceAttached,
    mockPhotoUrl,
    handleSelectCategory,
    setSelectedDescription,
    triggerMockPhotoCapture,
    removeEvidence,
    saveIncidentReport,
    cancel,
  };
}
