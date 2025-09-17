import React, { useState, useEffect } from "react";
import { Edit, useForm } from "@refinedev/mantine";
import { TextInput, Text, Box, Group } from "@mantine/core";
import MDEditor from "@uiw/react-md-editor";

export const NotificationTemplateEdit: React.FC = () => {
  const {
    saveButtonProps,
    getInputProps,
    setFieldValue,
    refineCore: { queryResult },
    errors,
  } = useForm({
    initialValues: {
      title: "",
      body: "",
      data: {}, // Campo JSON para datos adicionales
      isSent: false,
    },
    validate: {
      title: (value) => (value.length < 3 ? "Title is too short" : null),
      body: (value) => (value.length < 10 ? "Body is too short" : null),
    },
  });

  // Extrae los datos del backend
  const { data } = queryResult;

  // Pre-popula los campos del formulario con los datos existentes
  useEffect(() => {
    if (data) {
      const { title, body, data: templateData, isSent } = data.data;
      setFieldValue("title", title);
      setFieldValue("body", body);
      setFieldValue("data", templateData || {});
      setFieldValue("isSent", isSent || false);
    }
  }, [data, setFieldValue]);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <form>
        {/* Título */}
        <TextInput
          mt="sm"
          label="Title"
          placeholder="Enter notification template title"
          {...getInputProps("title")}
          error={errors.title}
        />

        {/* Cuerpo */}
        <Box mt="sm">
          <Text weight={500} size="sm" color="gray.700">
            Body
          </Text>
          <MDEditor data-color-mode="light" {...getInputProps("body")} />
          {errors.body && (
            <Text mt="xs" size="xs" color="red">
              {errors.body}
            </Text>
          )}
        </Box>

        {/* Datos adicionales */}
        <TextInput
          mt="sm"
          label="Additional Data (JSON)"
          placeholder='Example: {"key": "value"}'
          {...getInputProps("data")}
        />

        {/* Estado enviado */}
        {/* <TextInput
          mt="sm"
          label="Is Sent"
          placeholder="Enter true or false"
          {...getInputProps("isSent")}
        /> */}
      </form>
    </Edit>
  );
};
