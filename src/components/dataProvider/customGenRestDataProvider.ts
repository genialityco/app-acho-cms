import { DataProvider } from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";

// const API_URL = "http://192.168.0.16:3000";
const API_URL = "https://lobster-app-uy9hx.ondigitalocean.app"

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
