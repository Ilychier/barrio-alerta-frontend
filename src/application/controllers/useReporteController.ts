import { useState, useCallback, useEffect } from 'react';
import { DependencyContainer } from '../../infrastructure/config/dependencyContainer';
import { Categoria } from '../../domain/entities/categoria';
import { CategoriaDescripcion } from '../../domain/entities/categoriaDescripcion';

export function useReporteController(currentUserId: number) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [descripcionDetallada, setDescripcionDetallada] = useState('');
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
    setDescripcionDetallada('');

    try {
      const repo = DependencyContainer.getInstance().getReferenciaRepository();
      const list = await repo.getDescripcionesPorCategoria(catId);
      setDescripciones(list);

      if (list.length > 0) {
        setSelectedDescription(list[0].descripcion);
      } else {
        setSelectedDescription('');
      }
    } catch (error) {
      console.error('Error loading category descriptions:', error);
      setDescripciones([]);
      setSelectedDescription('');
    }
  }, []);

  const handleSelectDescription = useCallback((desc: string) => {
    setSelectedDescription(desc);
  }, []);

  const saveIncidentReport = useCallback(async (): Promise<boolean> => {
    if (!selectedCategory) return false;

    const descripcionFinal = selectedDescription
      ? `${selectedDescription}: ${descripcionDetallada}`
      : descripcionDetallada;

    await reportarUseCase.execute({
      descripcion: descripcionFinal,
      categoriaId: selectedCategory,
      usuarioId: currentUserId,
    });

    setSelectedCategory(null);
    setSelectedDescription('');
    setDescripcionDetallada('');
    setDescripciones([]);
    return true;
  }, [selectedCategory, selectedDescription, descripcionDetallada, currentUserId, reportarUseCase]);

  const cancel = useCallback(() => {
    setSelectedCategory(null);
    setSelectedDescription('');
    setDescripcionDetallada('');
    setDescripciones([]);
  }, []);

  return {
    categorias,
    selectedCategory,
    selectedDescription,
    descripcionDetallada,
    setDescripcionDetallada,
    descripciones,
    handleSelectCategory,
    handleSelectDescription,
    saveIncidentReport,
    cancel,
    loading,
  };
}
