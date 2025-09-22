import React, { useState, useEffect } from "react";
import { Edit, useForm } from "@refinedev/mantine";
import { TextInput, Text, Box, Group, Textarea } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import MDEditor from "@uiw/react-md-editor";

export const NotificationTemplateEdit: React.FC = () => {
  const [dataError, setDataError] = useState<string | null>(null);
  const [bodyLength, setBodyLength] = useState(0); // Estado para contar caracteres del body
  const [hasScheduledAt, setHasScheduledAt] = useState(false); // Control para mostrar el campo scheduledAt
  const maxTitleLength = 50;
  const maxBodyLength = 250;

  const {
    saveButtonProps,
    getInputProps,
    setFieldValue,
    refineCore: { queryResult },
    errors,
  } = useForm({
      refineCoreProps: {
      redirect: false,
      warnWhenUnsavedChanges: false,
    },
    initialValues: {
      title: "",
      body: "",
      data: {}, // Campo JSON para datos adicionales
      isSent: false,
      scheduledAt: null as Date | null, // Campo para fecha programada
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
      scheduledAt: (value: Date | null) => {
        if (value && value <= new Date()) {
          return "Scheduled date must be in the future";
        }
        return null;
      },
    },
  });

  // Extrae los datos del backend
  const { data } = queryResult;

  // Pre-popula los campos del formulario con los datos existentes
  useEffect(() => {
    if (data) {
      const { title, body, data: templateData, isSent, scheduledAt } = data.data;
      
      setFieldValue("title", title);
      setFieldValue("body", body || "");
      setFieldValue("data", templateData || {});
      setFieldValue("isSent", isSent || false);
      
      // Solo mostrar y setear scheduledAt si existe en los datos
      if (scheduledAt) {
        setHasScheduledAt(true);
        setFieldValue("scheduledAt", new Date(scheduledAt));
      }
      
      // Inicializar el contador de caracteres del body
      setBodyLength((body || "").length);
    }
  }, [data, setFieldValue]);

  const handleBodyChange = (value: string | undefined) => {
    const newValue = value || "";
    setFieldValue("body", newValue);
    setBodyLength(newValue.length);
  };

  const handleDataChange = (value: string) => {
    try {
      const parsedData = JSON.parse(value || "{}");
      setFieldValue("data", parsedData);
      setDataError(null);
    } catch {
      setDataError("Invalid JSON format. Please correct the input.");
    }
  };

  const handleScheduledAtChange = (value: Date | null) => {
    setFieldValue("scheduledAt", value);
  };

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

        {/* Fecha programada - Solo mostrar si existe en los datos originales */}
        {hasScheduledAt && (
          <DateTimePicker
            mt="sm"
            label="Scheduled At"
            placeholder="Select date and time for notification"
            value={getInputProps("scheduledAt").value}
            onChange={handleScheduledAtChange}
            error={errors.scheduledAt}
            minDate={new Date()} // No permite fechas pasadas
            clearable
            description="Leave empty to send immediately, or select a future date/time to schedule"
            onPointerEnterCapture={undefined} 
            onPointerLeaveCapture={undefined}
          />
        )}

        {/* Datos adicionales */}
        <Textarea
          mt="sm"
          label="Additional Data (JSON)"
          placeholder='Example: {"key": "value", "route": "/home"}'
          value={JSON.stringify(getInputProps("data").value, null, 2)}
          onChange={(event) => handleDataChange(event.currentTarget.value)}
          error={dataError}
        />
        {dataError && (
          <Text mt="xs" size="xs" color="red">
            {dataError}
          </Text>
        )}

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