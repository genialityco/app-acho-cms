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
import { AppLinkFields } from "../../components/AppLinkPicker";

interface PromoConfig {
  isActive: boolean;
  mediaType: "image" | "video";
  imageUri: string;
  videoUri: string;
  ctaUrl: string;
  ctaText: string;
  showButton: boolean;
  imageOnPressUrl: string;
}

const DEFAULT_CONFIG: PromoConfig = {
  isActive: false,
  mediaType: "image",
  imageUri: "",
  videoUri: "",
  ctaUrl: "",
  ctaText: "",
  showButton: false,
  imageOnPressUrl: "",
};

export const PromoModalPage: React.FC = () => {
  const apiUrl = useApiUrl();
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [config, setConfig] = useState<PromoConfig>(DEFAULT_CONFIG);
  const [imageLinkEnabled, setImageLinkEnabled] = useState(false);

  // Actualiza un campo con un valor ya leído. No leer e.currentTarget dentro del
  // updater de setConfig: React puede ejecutarlo después del evento, cuando
  // currentTarget ya es null, y la página se rompe al escribir/borrar rápido.
  const setField = <K extends keyof PromoConfig>(key: K, value: PromoConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

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
      setImageLinkEnabled(Boolean(fetched.imageOnPressUrl));
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
        setConfig((prev) => ({ ...prev, imageUri: url }));
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
      setConfig((prev) => ({ ...prev, imageUri: "" }));
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
          onChange={(e) => setField("isActive", e.currentTarget.checked)}
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
        <Stack spacing="md">
          {config.mediaType === "image" && (
            <Stack spacing="xs">
              <Switch
                label="Abrir un enlace al tocar la imagen"
                checked={imageLinkEnabled}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  setImageLinkEnabled(checked);
                  if (!checked) setField("imageOnPressUrl", "");
                }}
                color="teal"
              />
              {imageLinkEnabled && (
                <AppLinkFields
                  label="Al tocar la imagen, llevar a"
                  value={config.imageOnPressUrl}
                  onChange={(url) => setField("imageOnPressUrl", url)}
                />
              )}
            </Stack>
          )}

          <Divider />

          <Stack spacing="xs">
            <Switch
              label="Mostrar botón debajo del contenido"
              checked={config.showButton}
              onChange={(e) => setField("showButton", e.currentTarget.checked)}
              color="teal"
            />
            {config.showButton && (
              <>
                <TextInput
                  label="Texto del botón"
                  placeholder="Ir a la página"
                  value={config.ctaText}
                  onChange={(e) => setField("ctaText", e.currentTarget.value)}
                />
                <AppLinkFields
                  label="Al tocar el botón, llevar a"
                  value={config.ctaUrl}
                  onChange={(url) => setField("ctaUrl", url)}
                />
              </>
            )}
          </Stack>
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
