import React, { useState, useEffect } from "react";
import { Edit, useForm } from "@refinedev/mantine";
import { TextInput, Text, Box } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import MDEditor from "@uiw/react-md-editor";
import { NotificationRouteField } from "../../components/NotificationRouteField";

export const NotificationTemplateEdit: React.FC = () => {
  const [bodyLength, setBodyLength] = useState(0); // Estado para contar caracteres del body
  const [hasScheduledAt, setHasScheduledAt] = useState(false); // Control para mostrar el campo scheduledAt
  const maxTitleLength = 50;
  const maxBodyLength = 750;

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
  const data = queryResult?.data;

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

        {/* Redirección al abrir la notificación (data.route) */}
        <Box mt="sm">
          <NotificationRouteField
            value={getInputProps("data").value}
            onChange={(data) => setFieldValue("data", data)}
          />
        </Box>

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
