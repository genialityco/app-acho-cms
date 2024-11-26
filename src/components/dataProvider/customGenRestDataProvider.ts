import { DataProvider } from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";

const API_URL = "https://lobster-app-uy9hx.ondigitalocean.app";

// Inicializa el dataProvider original de simple-rest
const restProvider = dataProvider(API_URL);

// Custom Data Provider
export const customGenRestDataProvider: DataProvider = {
  ...restProvider,

  /**
   * Personalización de getList
   * Convierte la respuesta en formato estándar JSON API.
   */
  getList: async (params) => {
    try {
      // Llamada al método original del simple-rest provider
      const response = await restProvider.getList(params);

      if (response?.data?.data?.items) {
        return {
          data: response.data.data.items,
          total: response.data.data.totalItems,
        };
      } else {
        console.error("Formato de respuesta inesperado en getList:", response);
        return {
          data: [],
          total: 0,
        };
      }
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
