// customDataProvider.js
import { DataProvider } from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";

import axios from "axios";

const API_URL = "https://lobster-app-uy9hx.ondigitalocean.app"; // Your API base URL
//const API_URL = 'https://api.fake-rest.refine.dev'; // Your API base URL

// Initialize the simple-rest dataProvider
const restProvider = dataProvider(API_URL);

// Custom wrapper around simple-rest dataProvider
//Gen.api devuelve los datos en el formato [[data:item] o [data:{items:[items]}]
//lo convertimos en una respuesta JSON API standar
export const customGenRestDataProvider: DataProvider = {
  // // Customizing getList behavior
  ...restProvider,
  getList: async (params) => {
    // Call the original simple-rest provider's getList method
    const response = await restProvider.getList(params);
    let transformedData = response.data?.data?.items ? response.data?.data.items : response.data;
    return {
      ...response,
      data: transformedData, // Return modified data
    };
  },

  // Customizing getOne behavior
  getOne: async (params) => {
      
      // Call the original simple-rest provider's getOne method
      const response = await restProvider.getOne(params);
      let transformedData = response.data?.data ?  response.data?.data : response.data;
      console.log('Custom getOne called:', transformedData, response,params);
      return {
          ...response,
          data: transformedData, // Return modified data
      };
  },

  // // Customizing create behavior
  // create: async (params) => {
  //     console.log('Custom create called:', params);

  //     // Call the original simple-rest provider's create method
  //     const response = await restProvider.create(params);

  //     // Optionally modify the created data before returning
  //     return {
  //         ...response,
  //         data: {
  //             ...response.data,
  //             createdAt: new Date().toISOString(), // Add a custom field after creation
  //         },
  //     };
  // },

  // // Customizing update behavior
  // update: async (params) => {
  //     console.log('Custom update called:', params);

  //     // Call the original simple-rest provider's update method
  //     const response = await restProvider.update(params);

  //     // Optionally modify the updated data before returning
  //     return {
  //         ...response,
  //         data: {
  //             ...response.data,
  //             updatedField: 'Updated successfully', // Add a custom field after updating
  //         },
  //     };
  // },

  // // Customizing delete behavior
  // deleteOne: async (params) => {
  //     console.log('Custom delete called:', params);

  //     // Call the original simple-rest provider's deleteOne method
  //     const response = await restProvider.deleteOne(params);

  //     // Optionally handle custom logic on deletion
  //     return response; // Return as-is or add custom modifications
  // },

  // Forward other dataProvider methods to the original provider
};
