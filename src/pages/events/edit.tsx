import React, { useEffect, useState } from "react";
import { Create, Edit, useForm } from "@refinedev/mantine";
import {
  TextInput,
  NumberInput,
  Text,
  Box,
  Group,
  Switch,
  Button,
  Tabs,
  Table,
  Select,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconPhoto } from "@tabler/icons-react";
import axios from "axios";
import MDEditor from "@uiw/react-md-editor";
import { useCustom, useList, useOne } from "@refinedev/core";
import { IAgenda } from "../../interfaces";
import { AgendaEdit } from "../agendas";
import { parseISO, formatISO } from "date-fns";
import { useParams } from "react-router-dom";
import { EVENT_TYPE_LABELS } from "../../types/eventTypes";

export const EventEdit: React.FC = () => {
  const [loadingEventImage, setLoadingEventImage] = useState(false);
  const [loadingMiniatureImage, setLoadingMiniatureImage] = useState(false);
  const [eventFiles, setEventFiles] = useState<File[]>([]);
  const [miniatureFiles, setMiniatureFiles] = useState<File[]>([]);
  const [eventAgenda, setEventAgenda] = useState<IAgenda | null>(null);

  // Get event ID from route
  const { id } = useParams<{ id: string }>();

  const { saveButtonProps, getInputProps, setFieldValue, refineCore, errors } =
    useForm({
      refineCoreProps: {
        resource: "events",
        action: "edit",
        id,
      },
      initialValues: {
        name: "",
        description: "",
        type: "CONGRESO",
        startDate: null,
        endDate: null,
        location: {
          address: "",
          coordinates: {
            latitude: 0.0,
            longitude: 0.0,
          },
        },
        styles: {
          eventImage: "",
          miniatureImage: "",
        },
        eventSections: {
          agenda: false,
          speakers: false,
          documents: false,
          ubication: false,
          certificate: false,
          posters: false,
        },
      },
      validate: {
        name: (value) => (value.length < 2 ? "Event name is too short" : null),
        startDate: (value) => (!value ? "Start date is required" : null),
        endDate: (value) => (!value ? "End date is required" : null),
      },
      transformValues: (values) => {
        console.log("Transformed values:", values);
        return {
          ...values,
          startDate: values.startDate
            ? formatISO(values.startDate, { representation: "complete" })
            : null,
          endDate: values.endDate
            ? formatISO(values.endDate, { representation: "complete" })
            : null,
          location: {
            ...values.location,
            coordinates: {
              latitude: parseFloat(values.location.coordinates.latitude.toFixed(7)),
              longitude: parseFloat(
                values.location.coordinates.longitude.toFixed(7)
              ),
            },
          },
        };
      },
    });

  const { queryResult } = refineCore;
  const { data } = queryResult;

  const { data: agendaData } = useList<IAgenda>({
    resource: "agendas",
  });

  // Helper to convert local date to UTC Date object
  const toUTCDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
      )
    );
  };

  useEffect(() => {
    if (data?.data && refineCore.form) {
      const {
        name,
        description,
        type,
        startDate,
        endDate,
        location,
        styles,
        eventSections,
      } = data.data;

      // Parse UTC dates from DB
      const parsedStartDate = startDate ? parseISO(startDate) : null;
      const parsedEndDate = endDate ? parseISO(endDate) : null;

      // Log for debugging
      console.log("DB startDate:", startDate, "Parsed:", parsedStartDate);
      console.log("DB endDate:", endDate, "Parsed:", parsedEndDate);
      console.log("Full DB data:", data.data);
      console.log("Form initial values:", refineCore.form?.getValues());

      // Set all fields explicitly
      setFieldValue("name", name || "");
      setFieldValue("description", description || "");
      setFieldValue("type", type || "CONGRESO");
      setFieldValue("startDate", parsedStartDate);
      setFieldValue("endDate", parsedEndDate);
      setFieldValue("location.address", location?.address || "");
      setFieldValue(
        "location.coordinates.latitude",
        location?.coordinates?.latitude || 0.0
      );
      setFieldValue(
        "location.coordinates.longitude",
        location?.coordinates?.longitude || 0.0
      );
      setFieldValue("styles.eventImage", styles?.eventImage || "");
      setFieldValue("styles.miniatureImage", styles?.miniatureImage || "");
      setFieldValue("eventSections.agenda", eventSections?.agenda ?? false);
      setFieldValue("eventSections.speakers", eventSections?.speakers ?? false);
      setFieldValue("eventSections.documents", eventSections?.documents ?? false);
      setFieldValue("eventSections.ubication", eventSections?.ubication ?? false);
      setFieldValue(
        "eventSections.certificate",
        eventSections?.certificate ?? false
      );
      setFieldValue("eventSections.posters", eventSections?.posters ?? false);
    }
  }, [data, setFieldValue, refineCore.form]);

  useEffect(() => {
    if (refineCore.form) {
      console.log("Form isDirty:", refineCore.form?.isDirty);
      console.log("Current form values:", refineCore.form?.getValues());
    } else {
      console.log("Form not initialized yet");
    }
  }, [refineCore.form]);

  useEffect(() => {
    if (agendaData?.data && data?.data?._id) {
      const agenda = agendaData.data.find(
        (agendaItem) => agendaItem.eventId._id === data.data._id
      );
      setEventAgenda(agenda || null);
    }
  }, [agendaData, data]);

  const handleFileUpload = async (
    field: "eventImage" | "miniatureImage",
    files: File[],
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (files.length === 0) {
      alert("No files selected!");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));

    try {
      setLoading(true);
      const response = await axios.post(
        "https://lobster-app-uy9hx.ondigitalocean.app/upload/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFieldValue(`styles.${field}`, response.data.imageUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload the file.");
    } finally {
      setLoading(false);
    }
  };

  // Convertir EVENT_TYPE_LABELS a formato de opciones para Select
  const eventTypeOptions = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <form>
        <TextInput
          mt="sm"
          label="Event Name"
          placeholder="Enter event name"
          {...getInputProps("name")}
          error={errors.name}
        />

        {/* Tipo de evento */}
        <Select
          mt="sm"
          label="Event Type"
          placeholder="Select event type"
          data={eventTypeOptions}
          {...getInputProps("type")}
        />

        <Box mt="sm">
          <Text weight={500} size="sm" color="gray.700">
            Description
          </Text>
          <MDEditor data-color-mode="light" {...getInputProps("description")} />
        </Box>
        <Group grow mt="sm">
          <DateTimePicker
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            {...getInputProps("startDate")}
            onChange={(value) => {
              const utcDate = toUTCDate(value);
              console.log("Selected startDate:", value, "UTC:", utcDate);
              setFieldValue("startDate", utcDate);
            }}
            label="Start Date and Time"
            placeholder="Pick date and time"
            valueFormat="YYYY-MM-DD HH:mm:ss"
            value={
              getInputProps("startDate").value
                ? new Date(getInputProps("startDate").value)
                : null
            }
          />
          <DateTimePicker
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            {...getInputProps("endDate")}
            onChange={(value) => {
              const utcDate = toUTCDate(value);
              console.log("Selected endDate:", value, "UTC:", utcDate);
              setFieldValue("endDate", utcDate);
            }}
            label="End Date and Time"
            placeholder="Pick date and time"
            valueFormat="YYYY-MM-DD HH:mm:ss"
            value={
              getInputProps("endDate").value
                ? new Date(getInputProps("endDate").value)
                : null
            }
          />
        </Group>
        <TextInput
          mt="sm"
          label="Location Address"
          placeholder="Enter event location"
          {...getInputProps("location.address")}
        />
        <Group grow mt="sm">
          <NumberInput
            label="Latitude"
            decimalSeparator="."
            precision={7}
            step={0}
            parser={(value) => value?.replace(",", ".")}
            formatter={(value) =>
              !Number.isNaN(parseFloat(value || "")) ? `${value}` : ""
            }
            placeholder="Enter latitude"
            {...getInputProps("location.coordinates.latitude")}
          />
          <NumberInput
            label="Longitude"
            decimalSeparator="."
            precision={7}
            step={0}
            parser={(value) => value?.replace(",", ".")}
            formatter={(value) =>
              !Number.isNaN(parseFloat(value || "")) ? `${value}` : ""
            }
            placeholder="Enter longitude"
            {...getInputProps("location.coordinates.longitude")}
          />
        </Group>
        <Box mt="sm">
          <Text weight={500} size="sm" mb="xs">
            Event Image
          </Text>
          <Dropzone
            onDrop={(files) => setEventFiles(files)}
            maxSize={3 * 1024 ** 2}
            accept={IMAGE_MIME_TYPE}
          >
            <Group position="center" spacing="xl" style={{ minHeight: 120 }}>
              <IconPhoto size="2rem" stroke={1.5} />
              <div>
                {eventFiles.length > 0 ? (
                  <Text size="sm">
                    {eventFiles.map((file) => file.name).join(", ")}
                  </Text>
                ) : (
                  <Text size="sm" color="dimmed">
                    Drag files here or click to upload
                  </Text>
                )}
              </div>
            </Group>
          </Dropzone>
          <Button
            mt="sm"
            fullWidth
            disabled={eventFiles.length === 0}
            loading={loadingEventImage}
            onClick={() =>
              handleFileUpload("eventImage", eventFiles, setLoadingEventImage)
            }
          >
            Upload Event Image
          </Button>
          {getInputProps("styles.eventImage").value && (
            <img
              src={getInputProps("styles.eventImage").value}
              alt="Event"
              style={{
                marginTop: "10px",
                maxWidth: "100%",
                maxHeight: "200px",
                objectFit: "contain",
              }}
            />
          )}
        </Box>
        <Box mt="sm">
          <Text weight={500} size="sm" mb="xs">
            Miniature Image
          </Text>
          <Dropzone
            onDrop={(files) => setMiniatureFiles(files)}
            maxSize={3 * 1024 ** 2}
            accept={IMAGE_MIME_TYPE}
          >
            <Group position="center" spacing="xl" style={{ minHeight: 120 }}>
              <IconPhoto size="2rem" stroke={1.5} />
              <div>
                {miniatureFiles.length > 0 ? (
                  <Text size="sm">
                    {miniatureFiles.map((file) => file.name).join(", ")}
                  </Text>
                ) : (
                  <Text size="sm" color="dimmed">
                    Drag files here or click to upload
                  </Text>
                )}
              </div>
            </Group>
          </Dropzone>
          <Button
            mt="sm"
            fullWidth
            disabled={miniatureFiles.length === 0}
            loading={loadingMiniatureImage}
            onClick={() =>
              handleFileUpload(
                "miniatureImage",
                miniatureFiles,
                setLoadingMiniatureImage
              )
            }
          >
            Upload Miniature Image
          </Button>
          {getInputProps("styles.miniatureImage").value && (
            <img
              src={getInputProps("styles.miniatureImage").value}
              alt="Miniature"
              style={{
                marginTop: "10px",
                maxWidth: "100%",
                maxHeight: "200px",
                objectFit: "contain",
              }}
            />
          )}
        </Box>
        <Box mt="sm">
          <Text weight={500} size="sm" color="gray.700" mb="xs">
            Event Sections
          </Text>
          <Group>
            <Switch
              label="Agenda"
              {...getInputProps("eventSections.agenda", {
                type: "checkbox",
              })}
            />
            <Switch
              label="Speakers"
              {...getInputProps("eventSections.speakers", {
                type: "checkbox",
              })}
            />
            <Switch
              label="Documents"
              {...getInputProps("eventSections.documents", {
                type: "checkbox",
              })}
            />
            <Switch
              label="Ubication"
              {...getInputProps("eventSections.ubication", {
                type: "checkbox",
              })}
            />
            <Switch
              label="Certificate"
              {...getInputProps("eventSections.certificate", {
                type: "checkbox",
              })}
            />
            <Switch
              label="Posters"
              {...getInputProps("eventSections.posters", {
                type: "checkbox",
              })}
            />
          </Group>
        </Box>
      </form>
    </Edit>
  );
};