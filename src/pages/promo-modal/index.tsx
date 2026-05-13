import React, { useState, useEffect } from "react";
import axios from "axios";
import { useApiUrl, useCustom, useCustomMutation } from "@refinedev/core";
import {
  Title,
  Paper,
  Switch,
  Select,
  TextInput,
  Button,
  Group,
  Text,
  Stack,
  Loader,
  Center,
  Badge,
  Divider,
  Alert,
  ActionIcon,
  Tooltip,
  Image,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE, MIME_TYPES } from "@mantine/dropzone";
import { showNotification } from "@mantine/notifications";
import {
  IconUpload,
  IconPhoto,
  IconVideo,
  IconTrash,
  IconDeviceFloppy,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";

interface PromoConfig {
  isActive: boolean;
  mediaType: "image" | "video";
  imageUri: string;
  videoUri: string;
  ctaUrl: string;
  showButton: boolean;
  imageOnPressUrl: string;
}

const DEFAULT_CONFIG: PromoConfig = {
  isActive: false,
  mediaType: "image",
  imageUri: "",
  videoUri: "",
  ctaUrl: "",
  showButton: false,
  imageOnPressUrl: "",
};

export const PromoModalPage: React.FC = () => {
  const apiUrl = useApiUrl();
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [config, setConfig] = useState<PromoConfig>(DEFAULT_CONFIG);

  const { data, isLoading, isError } = useCustom<{ data: PromoConfig }>({
    url: `${apiUrl}/promo-modal`,
    method: "get",
    errorNotification: false,
    queryOptions: { retry: false },
  });

  useEffect(() => {
    const fetched = data?.data?.data;
    if (fetched && Object.keys(fetched).length > 0) {
      setConfig({ ...DEFAULT_CONFIG, ...fetched });
    }
  }, [data]);

  const { mutate: saveConfig, isLoading: saving } = useCustomMutation();

  const handleSave = () => {
    saveConfig(
      {
        url: `${apiUrl}/promo-modal`,
        method: "put",
        values: config,
      },
      {
        onSuccess: () =>
          showNotification({
            title: "Guardado",
            message: "Configuración actualizada correctamente",
            color: "teal",
            icon: <IconCheck size={16} />,
          }),
        onError: () =>
          showNotification({
            title: "Error",
            message: "No se pudo guardar la configuración",
            color: "red",
            icon: <IconAlertCircle size={16} />,
          }),
      }
    );
  };

  const uploadMedia = async (files: File[]) => {
    if (!files.length) return;
    setUploadingMedia(true);
    const formData = new FormData();
    formData.append("file", files[0]);
    try {
      const response = await axios.post(`${apiUrl}/upload/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url: string = response.data.imageUrl;
      if (config.mediaType === "image") {
        setConfig((prev) => ({
          ...prev,
          imageUri: url,
          imageOnPressUrl: prev.imageOnPressUrl || url,
        }));
      } else {
        setConfig((prev) => ({ ...prev, videoUri: url }));
      }
      showNotification({
        title: "Archivo subido",
        message: "El archivo se subió correctamente a Firebase",
        color: "teal",
        icon: <IconCheck size={16} />,
      });
    } catch {
      showNotification({
        title: "Error",
        message: "No se pudo subir el archivo",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const deleteMedia = () => {
    if (config.mediaType === "image") {
      setConfig((prev) => ({ ...prev, imageUri: "", imageOnPressUrl: "" }));
    } else {
      setConfig((prev) => ({ ...prev, videoUri: "" }));
    }
  };

  const currentMediaUri =
    config.mediaType === "image" ? config.imageUri : config.videoUri;

  if (isLoading && !isError) {
    return (
      <Center style={{ height: 300 }}>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack spacing="lg" p="md">
      <Group position="apart">
        <div>
          <Title order={2}>Promo Modal</Title>
          <Text color="dimmed" size="sm">
            Controla el modal promocional que se muestra al abrir la app
          </Text>
        </div>
        <Badge
          size="lg"
          color={config.isActive ? "teal" : "gray"}
          variant="filled"
        >
          {config.isActive ? "ACTIVO" : "INACTIVO"}
        </Badge>
      </Group>

      {/* Estado del modal */}
      <Paper p="md" withBorder>
        <Text weight={600} mb="sm">
          Estado
        </Text>
        <Switch
          label="Mostrar modal al abrir la app"
          checked={config.isActive}
          onChange={(e) =>
            setConfig((prev) => ({ ...prev, isActive: e.currentTarget.checked }))
          }
          size="md"
          color="teal"
        />
      </Paper>

      {/* Tipo de media */}
      <Paper p="md" withBorder>
        <Text weight={600} mb="sm">
          Tipo de contenido
        </Text>
        <Select
          label="¿Qué se muestra en el modal?"
          value={config.mediaType}
          onChange={(value) =>
            setConfig((prev) => ({
              ...prev,
              mediaType: (value as "image" | "video") || "image",
            }))
          }
          data={[
            { value: "image", label: "Imagen" },
            { value: "video", label: "Video" },
          ]}
          style={{ maxWidth: 300 }}
        />
      </Paper>

      {/* Subida de archivo */}
      <Paper p="md" withBorder>
        <Group position="apart" mb="sm">
          <Text weight={600}>
            {config.mediaType === "image" ? "Imagen" : "Video"}
          </Text>
          {currentMediaUri && (
            <Tooltip label="Eliminar archivo">
              <ActionIcon color="red" variant="light" onClick={deleteMedia}>
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>

        {config.mediaType === "image" && config.imageUri && (
          <Image
            src={config.imageUri}
            alt="Imagen actual"
            height={200}
            fit="contain"
            mb="sm"
            radius="sm"
            withPlaceholder
          />
        )}
        {config.mediaType === "video" && config.videoUri && (
          <Alert
            icon={<IconVideo size={16} />}
            color="blue"
            mb="sm"
            variant="light"
          >
            <Text size="xs" style={{ wordBreak: "break-all" }}>
              {config.videoUri}
            </Text>
          </Alert>
        )}

        <Dropzone
          onDrop={uploadMedia}
          loading={uploadingMedia}
          accept={
            config.mediaType === "image"
              ? IMAGE_MIME_TYPE
              : [MIME_TYPES.mp4, "video/webm", "video/quicktime"]
          }
          maxSize={100 * 1024 * 1024}
        >
          <Group
            position="center"
            spacing="sm"
            style={{ minHeight: 80, pointerEvents: "none" }}
          >
            {config.mediaType === "image" ? (
              <IconPhoto size={28} stroke={1.5} color="#868e96" />
            ) : (
              <IconVideo size={28} stroke={1.5} color="#868e96" />
            )}
            <div>
              <Text size="sm" inline>
                {currentMediaUri
                  ? "Subir nuevo archivo para reemplazar"
                  : `Arrastra un ${config.mediaType === "image" ? "imagen" : "video"} aquí`}
              </Text>
              <Text size="xs" color="dimmed" inline mt={4}>
                {config.mediaType === "image"
                  ? "PNG, JPG, WEBP — máx. 100 MB"
                  : "MP4, WEBM, MOV — máx. 100 MB"}
              </Text>
            </div>
            <IconUpload size={16} color="#868e96" />
          </Group>
        </Dropzone>
      </Paper>

      {/* URLs */}
      <Paper p="md" withBorder>
        <Text weight={600} mb="sm">
          Configuración de enlaces
        </Text>
        <Stack spacing="sm">
          {config.mediaType === "image" && (
            <TextInput
              label="URL al presionar la imagen"
              description="Abre este enlace cuando el usuario toca la imagen"
              placeholder="https://..."
              value={config.imageOnPressUrl}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  imageOnPressUrl: e.currentTarget.value,
                }))
              }
            />
          )}
          <TextInput
            label="URL del botón CTA"
            description='Enlace del botón "Ir a la página" (si está activado)'
            placeholder="https://..."
            value={config.ctaUrl}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                ctaUrl: e.currentTarget.value,
              }))
            }
          />
          <Switch
            label='Mostrar botón "Ir a la página"'
            checked={config.showButton}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                showButton: e.currentTarget.checked,
              }))
            }
            color="teal"
          />
        </Stack>
      </Paper>

      <Divider />

      <Group position="right">
        <Button
          leftIcon={<IconDeviceFloppy size={16} />}
          color="teal"
          size="md"
          loading={saving}
          onClick={handleSave}
        >
          Guardar cambios
        </Button>
      </Group>
    </Stack>
  );
};
