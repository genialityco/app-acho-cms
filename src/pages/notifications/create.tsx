import React, { useState } from "react";
import { Create, useForm } from "@refinedev/mantine";
import { TextInput, Textarea, Box, Text, Group, Button } from "@mantine/core";
import MDEditor from "@uiw/react-md-editor";

export const NotificationTemplateCreate: React.FC = () => {
  const [dataError, setDataError] = useState<string | null>(null);

  const { saveButtonProps, getInputProps, setFieldValue, errors } = useForm({
    initialValues: {
      title: "",
      body: "",
      data: {},
      isSent: false,
      organizationId: "66f1d236ee78a23c67fada2a",
    },
    validate: {
      title: (value) => (value.length < 3 ? "Title is too short" : null),
      body: (value) => (value.length < 10 ? "Body is too short" : null),
    },
  });

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
        <Textarea
          mt="sm"
          label="Additional Data (JSON)"
          placeholder='Example: {"key": "value"}'
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
