import { useState, useCallback, useEffect } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { Categoria } from '../../domain/entities/categoria';
import { CategoriaDescripcion } from '../../domain/entities/categoriaDescripcion';

export function useReporteController(currentUserId: number) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [evidenceAttached, setEvidenceAttached] = useState(false);
  const [mockPhotoUrl, setMockPhotoUrl] = useState('');
  const [descripciones, setDescripciones] = useState<CategoriaDescripcion[]>([]);
  const [loading, setLoading] = useState(true);

  const container = DependencyContainer.getInstance();
  const reportarUseCase = container.getReportarIncidenteUseCase();

  useEffect(() => {
    let active = true;
    async function loadCategorias() {
      try {
        setLoading(true);
        const repo = DependencyContainer.getInstance().getReferenciaRepository();
        const res = await repo.getCategorias();
        if (active) {
          setCategorias(res);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadCategorias();
    return () => {
      active = false;
    };
  }, []);

  const handleSelectCategory = useCallback(async (catId: number) => {
    setSelectedCategory(catId);
    setEvidenceAttached(false);

    try {
      const repo = DependencyContainer.getInstance().getReferenciaRepository();
      const list = await repo.getDescripcionesPorCategoria(catId);
      setDescripciones(list);

      if (list.length > 0) {
        setSelectedDescription(list[0].descripcion);
        setMockPhotoUrl(list[0].imagenUrl || '');
      } else {
        setSelectedDescription('');
        setMockPhotoUrl('');
      }
    } catch (error) {
      console.error('Error loading category descriptions:', error);
      setDescripciones([]);
      setSelectedDescription('');
      setMockPhotoUrl('');
    }
  }, []);

  const handleSelectDescription = useCallback((desc: string) => {
    setSelectedDescription(desc);
    const match = descripciones.find(d => d.descripcion === desc);
    if (match && match.imagenUrl) {
      setMockPhotoUrl(match.imagenUrl);
    }
  }, [descripciones]);

  const triggerMockPhotoCapture = useCallback(() => {
    setEvidenceAttached(true);
  }, []);

  const removeEvidence = useCallback(() => {
    setEvidenceAttached(false);
  }, []);

  const saveIncidentReport = useCallback(async (): Promise<boolean> => {
    if (!selectedCategory || !evidenceAttached) return false;

    await reportarUseCase.execute({
      descripcion: selectedDescription,
      categoriaId: selectedCategory,
      usuarioId: currentUserId,
      evidenciaUrl: mockPhotoUrl,
    });

    setSelectedCategory(null);
    setSelectedDescription('');
    setDescripciones([]);
    setEvidenceAttached(false);
    setMockPhotoUrl('');
    return true;
  }, [selectedCategory, evidenceAttached, selectedDescription, currentUserId, mockPhotoUrl, reportarUseCase]);

  const cancel = useCallback(() => {
    setSelectedCategory(null);
    setSelectedDescription('');
    setDescripciones([]);
    setEvidenceAttached(false);
    setMockPhotoUrl('');
  }, []);

  return {
    categorias,
    selectedCategory,
    selectedDescription,
    descripciones,
    evidenceAttached,
    mockPhotoUrl,
    handleSelectCategory,
    handleSelectDescription,
    triggerMockPhotoCapture,
    removeEvidence,
    saveIncidentReport,
    cancel,
    loading,
  };
}
