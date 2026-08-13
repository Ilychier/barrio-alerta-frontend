import { useState, useCallback, useEffect } from 'react';
import { IContainer } from '../ports/IContainer';
import { Categoria } from '../../domain/entities/categoria';
import { CategoriaDescripcion } from '../../domain/entities/categoriaDescripcion';
import { ICategoriaRepository } from '../../domain/ports/ICategoriaRepository';

/**
 * Controller del formulario de reporte. El contenedor se inyecta por prop
 * (regla hexagonal: application no importa infrastructure directamente).
 */
export function useReporteController(container: IContainer, currentUserId: number) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [descripcionDetallada, setDescripcionDetallada] = useState('');
  const [descripciones, setDescripciones] = useState<CategoriaDescripcion[]>([]);
  const [loading, setLoading] = useState(true);

  const reportarUseCase = container.getReportarIncidenteUseCase();
  const categoriaRepo: ICategoriaRepository = container.getReferenciaRepository();

  useEffect(() => {
    let active = true;
    async function loadCategorias() {
      try {
        setLoading(true);
        const res = await categoriaRepo.getCategorias();
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
  }, [categoriaRepo]);

  const handleSelectCategory = useCallback(async (catId: number) => {
    setSelectedCategory(catId);
    setDescripcionDetallada('');

    try {
      const list = await categoriaRepo.getDescripcionesPorCategoria(catId);
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
  }, [categoriaRepo]);

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
