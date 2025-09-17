import { DataProvider } from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";

//const API_URL = "http://192.168.101.7:3000";
const API_URL = "https://lobster-app-uy9hx.ondigitalocean.app"
//const API_URL ="http://localhost:3000"; // URL del backend

// Inicializa el dataProvider original de simple-rest
const restProvider = dataProvider(API_URL);

// Custom Data Provider
export const customGenRestDataProvider: DataProvider = {
  ...restProvider,

  /**
   * Personalización de getList
   * Convierte la respuesta en formato estándar JSON API.
   */
  getList: async ({ resource, pagination, filters, sorters }) => {
    try {
      const { current = 1, pageSize = 10 } = pagination ?? {};
      
      // Crear URLSearchParams para manejar parámetros de manera ordenada
      const params = new URLSearchParams();
      
      // Agregar paginación
      params.append('pageSize', pageSize.toString());
      params.append('current', current.toString());

      // 🔧 NUEVA IMPLEMENTACIÓN: Aplica filtros manteniendo la estructura de array
      if (filters && filters.length > 0) {
        console.log('🔍 Procesando filtros:', filters); // Debug
        
        filters.forEach((filter, index) => {
          const { field, operator, value } = filter;
          
          // Estructura: filters[index][campo] = valor
          params.append(`filters[${index}][field]`, field);
          params.append(`filters[${index}][operator]`, operator || 'eq');
          params.append(`filters[${index}][value]`, value?.toString() || '');
        });
      }

      // Aplica ordenamiento (si lo hay)
      if (sorters && sorters.length > 0) {
        sorters.forEach((sorter, index) => {
          params.append(`sorters[${index}][field]`, sorter.field);
          params.append(`sorters[${index}][order]`, sorter.order);
        });
      }

      // 🐛 Debug: Ver qué parámetros se están enviando
      console.log('📤 Parámetros enviados al backend:', params.toString());

      // Construir la URL final
      const url = `${API_URL}/${resource}?${params.toString()}`;
      console.log('🌐 URL final:', url); // Debug

      const response = await fetch(url);
      const data = await response.json();

      console.log('📥 Respuesta del backend:', data); // Debug

      // Retorna los datos y el total de ítems
      return {
        data: data.data?.items || [],
        total: data.data?.totalItems || 0,
      };
    } catch (error) {
      console.error("Error en getList:", error);
      throw error;
    }
  },

  /**
   * Personalización de getOne
   * Adapta la respuesta para devolver el dato directamente desde el campo `data`.
   */
  getOne: async (params) => {
    try {
      const response = await restProvider.getOne(params);

      let transformedData = response.data?.data
        ? response.data?.data
        : response.data;

      return {
        ...response,
        data: transformedData,
      };
    } catch (error) {
      console.error("Error en getOne:", error);
      throw error;
    }
  },

  /**
   * Personalización de create
   * Modifica o extiende el comportamiento de la creación.
   */
  create: async (params) => {
    try {
      const response = await restProvider.create(params);

      return {
        ...response,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      console.error("Error en create:", error);
      throw error;
    }
  },

  /**
   * Personalización de update
   * Modifica o extiende el comportamiento de la actualización.
   */
  update: async ({ resource, id, variables }) => {
    if (resource === "notifications/send-from-template") {
      const response = await fetch(
        `${API_URL}/notifications/send-from-template/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`);
      }

      const data = await response.json();

      return { data };
    }

    return restProvider.update({ resource, id, variables });
  },

  /**
   * Personalización de deleteOne
   * Modifica el comportamiento de eliminación.
   */
  deleteOne: async (params) => {
    try {
      const response = await restProvider.deleteOne(params);

      return response;
    } catch (error) {
      console.error("Error en deleteOne:", error);
      throw error;
    }
  },
};