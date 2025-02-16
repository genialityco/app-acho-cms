import React, { useState } from "react";
import { Create, useForm } from "@refinedev/mantine";
import { TextInput, Textarea, Box, Text } from "@mantine/core";
import MDEditor from "@uiw/react-md-editor";

export const NotificationTemplateCreate: React.FC = () => {
  const [dataError, setDataError] = useState<string | null>(null);
  const [bodyLength, setBodyLength] = useState(0); // Estado para contar caracteres del body

  const maxTitleLength = 50;
  const maxBodyLength = 250;

  const { saveButtonProps, getInputProps, setFieldValue, errors } = useForm({
    initialValues: {
      title: "",
      body: "",
      data: {},
      isSent: false,
      organizationId: "66f1d236ee78a23c67fada2a",
    },
    validate: {
      title: (value) => {
        if (value.length < 3) return "Title is too short";
        if (value.length > maxTitleLength) return `Title cannot exceed ${maxTitleLength} characters`;
        return null;
      },
      body: (value) => {
        if (value.length < 10) return "Body is too short";
        if (value.length > maxBodyLength) return `Body cannot exceed ${maxBodyLength} characters`;
        return null;
      },
    },
  });

  const handleBodyChange = (value: string | undefined) => {
    const newValue = value || "";
    setFieldValue("body", newValue);
    setBodyLength(newValue.length);
  };

  const handleDataChange = (value: string) => {
    try {
      const parsedData = JSON.parse(value);
      setFieldValue("data", parsedData);
      setDataError(null);
    } catch {
      setDataError("Invalid JSON format. Please correct the input.");
    }
  };

  return (
    <Create saveButtonProps={saveButtonProps}>
      <form>
        {/* Título */}
        <TextInput
          mt="sm"
          label="Title"
          placeholder="Enter notification template title"
          {...getInputProps("title")}
          error={errors.title}
          maxLength={maxTitleLength}
        />

        {/* Cuerpo */}
        <Box mt="sm">
          <Text weight={500} size="sm" color="gray.700">
            Body
          </Text>
          <MDEditor
            data-color-mode="light"
            value={getInputProps("body").value}
            onChange={handleBodyChange}
          />
          <Text size="xs" align="right" mt="xs" color={bodyLength > maxBodyLength ? "red" : "gray"}>
            {bodyLength}/{maxBodyLength} characters
          </Text>
          {errors.body && (
            <Text mt="xs" size="xs" color="red">
              {errors.body}
            </Text>
          )}
        </Box>

        {/* Datos adicionales */}
        <Textarea
          mt="sm"
          label="Additional Data (JSON)"
          placeholder='Example: {"key": "value", "route": "/home"}'
          onChange={(event) => handleDataChange(event.currentTarget.value)}
          error={dataError}
        />
        {dataError && (
          <Text mt="xs" size="xs" color="red">
            {dataError}
          </Text>
        )}
      </form>
    </Create>
  );
};
