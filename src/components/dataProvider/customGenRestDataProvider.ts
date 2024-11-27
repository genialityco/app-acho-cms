import { DataProvider } from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";

const API_URL = "http://172.31.80.1:3000";

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
      const query: Record<string, any> = {
        page: current,
        limit: pageSize,
      };

      // Aplica filtros (si los hay)
      if (filters) {
        filters.forEach((filter) => {
          query[filter.field] = filter.value;
        });
      }

      // Aplica ordenamiento (si lo hay)
      if (sorters) {
        const sorterQuery = sorters.map(
          (sort) => `${sort.field}:${sort.order}`
        );
        query.sort = sorterQuery.join(",");
      }

      // Realiza la solicitud al backend
      const url = new URL(`${API_URL}/${resource}`);
      Object.keys(query).forEach((key) =>
        url.searchParams.append(key, query[key])
      );

      const response = await fetch(url.toString());
      const data = await response.json();
      console.log(data);
      
      // Retorna los datos y el total de ítems
      return {
        data: data.data.items || [],
        total: data.data.totalItems || 0,
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

      console.log("Custom getOne called:", transformedData, response, params);

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
  update: async (params) => {
    try {
      const response = await restProvider.update(params);

      console.log("Custom update called:", response);

      return {
        ...response,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      console.error("Error en update:", error);
      throw error;
    }
  },

  /**
   * Personalización de deleteOne
   * Modifica el comportamiento de eliminación.
   */
  deleteOne: async (params) => {
    try {
      const response = await restProvider.deleteOne(params);

      console.log("Custom deleteOne called:", response);

      return response;
    } catch (error) {
      console.error("Error en deleteOne:", error);
      throw error;
    }
  },
};
