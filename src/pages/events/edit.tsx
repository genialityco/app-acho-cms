import React, { useEffect, useState } from "react";
import { Edit, useForm } from "@refinedev/mantine";
import {
  TextInput,
  NumberInput,
  Text,
  Box,
  Group,
  Switch,
  Button,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconPhoto } from "@tabler/icons-react";
import axios from "axios";
import MDEditor from "@uiw/react-md-editor";

export const EventEdit: React.FC = () => {
  const [loadingEventImage, setLoadingEventImage] = useState(false);
  const [loadingMiniatureImage, setLoadingMiniatureImage] = useState(false);
  const [eventFiles, setEventFiles] = useState<File[]>([]);
  const [miniatureFiles, setMiniatureFiles] = useState<File[]>([]);

  const { saveButtonProps, getInputProps, setFieldValue, refineCore, errors } =
    useForm({
      initialValues: {
        name: "",
        description: "",
        startDate: null,
        endDate: null,
        location: {
          address: "",
          coordinates: {
            latitude: 0,
            longitude: 0,
          },
        },
        styles: {
          eventImage: "",
          miniatureImage: "",
        },
        eventSections: {
          agenda: true,
          speakers: true,
          documents: true,
          ubication: true,
          certificate: true,
          posters: true,
        },
      },
      validate: {
        name: (value) => (value.length < 2 ? "Event name is too short" : null),
        startDate: (value) => (!value ? "Start date is required" : null),
        endDate: (value) => (!value ? "End date is required" : null),
      },
    });

  const { queryResult } = refineCore;
  const { data } = queryResult;

  useEffect(() => {
    if (data?.data) {
      const { startDate, endDate } = data.data;
      setFieldValue("startDate", startDate ? new Date(startDate) : null);
      setFieldValue("endDate", endDate ? new Date(endDate) : null);
    }
  }, [data, setFieldValue]);

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

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <form>
        {/* Nombre del evento */}
        <TextInput
          mt="sm"
          label="Event Name"
          placeholder="Enter event name"
          {...getInputProps("name")}
          error={errors.name}
        />

        {/* Descripción */}
        <Box mt="sm">
          <Text weight={500} size="sm" color="gray.700">
            Description
          </Text>
          <MDEditor data-color-mode="light" {...getInputProps("description")} />
        </Box>

        {/* Fechas */}
        <Group grow mt="sm">
          <DateTimePicker
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            {...getInputProps("startDate")}
            label="Start Date and Time"
            placeholder="Pick date and time"
          />
          <DateTimePicker
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            {...getInputProps("endDate")}
            label="End Date and Time"
            placeholder="Pick date and time"
          />
        </Group>

        {/* Ubicación */}
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

        {/* Dropzone para Event Image */}
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

        {/* Dropzone para Miniature Image */}
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

        {/* Secciones del evento */}
        <Box mt="sm">
          <Text weight={500} size="sm" color="gray.700" mb="xs">
            Event Sections
          </Text>
          <Group>
            <Switch
              label="Agenda"
              {...getInputProps("eventSections.agenda", { type: "checkbox" })}
            />
            <Switch
              label="Speakers"
              {...getInputProps("eventSections.speakers", { type: "checkbox" })}
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
              {...getInputProps("eventSections.posters", { type: "checkbox" })}
            />
          </Group>
        </Box>
      </form>
    </Edit>
  );
};
