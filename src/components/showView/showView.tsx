import React from "react";
import {
  Title,
  Text,
  Image,
  Group,
  Badge,
  Stack,
  Card,
  SimpleGrid,
  Box,
  Divider,
} from "@mantine/core";
import { MarkdownField } from "@refinedev/mantine";

interface EntityFieldRendererProps {
  data: Record<string, any>;
  excludeFields?: string[];
  fieldLabels?: Record<string, string>;
  fieldOrder?: string[];
}

export const EntityFieldRenderer: React.FC<EntityFieldRendererProps> = ({
  data,
  excludeFields = ["__v"],
  fieldLabels = {},
  fieldOrder = [],
}) => {
  if (!data) return null;

  // Función para detectar si un string es una URL de imagen
  const isImageUrl = (str: string): boolean => {
    if (typeof str !== "string") return false;

    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)/i;
    const imageProviders =
      /imagekit\.io|cloudinary\.com|imgur\.com|firebasestorage\.googleapis\.com/i;

    const baseUrl = str.split("?")[0];

    return (
      str.match(/^https?:\/\//) !== null &&
      (imageExtensions.test(baseUrl) || imageProviders.test(str))
    );
  };

  // Función para detectar si un string es HTML
  const isHtml = (str: string): boolean => {
    if (typeof str !== "string") return false;
    const trimmed = str.trim();
    if (!trimmed) return false;

    const quickTag = /<(!|\/?[a-zA-Z][\w:.-]*)\b[^>]*>/;
    if (!quickTag.test(trimmed)) return false;

    if (typeof window !== "undefined" && "DOMParser" in window) {
      try {
        const doc = new DOMParser().parseFromString(trimmed, "text/html");
        return Array.from(doc.body.childNodes).some(
          (n) => n.nodeType === Node.ELEMENT_NODE,
        );
      } catch {
        // fallback
      }
    }

    return (
      /<([a-zA-Z][\w:.-]*)(\s[^>]*)?>/i.test(trimmed) ||
      /^<\/[a-zA-Z]/i.test(trimmed) ||
      /^<!/i.test(trimmed)
    );
  };

  // Función para detectar fechas MongoDB
  const isMongoDate = (obj: any): boolean => {
    return obj && typeof obj === "object" && obj.$date;
  };

  // Función para detectar ObjectId de MongoDB
  const isMongoObjectId = (obj: any): boolean => {
    return obj && typeof obj === "object" && obj.$oid;
  };

  // Formatear fechas MongoDB
  const formatMongoDate = (dateObj: any): string => {
    const date = new Date(dateObj.$date);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Formatear nombres de campos
  const formatFieldName = (fieldName: string): string => {
    if (fieldLabels[fieldName]) return fieldLabels[fieldName];

    return fieldName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, " ")
      .trim();
  };

  // Renderizar coordenadas
  const renderCoordinates = (coordinates: {
    latitude: number;
    longitude: number;
  }) => {
    return (
      <Card withBorder p="xs" radius="sm">
        <Text size="sm">
          <strong>Latitud:</strong> {coordinates.latitude}
        </Text>
        <Text size="sm">
          <strong>Longitud:</strong> {coordinates.longitude}
        </Text>
        <Text
          component="a"
          href={`https://maps.google.com?q=${coordinates.latitude},${coordinates.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          c="blue"
          td="underline"
          size="sm"
          mt="xs"
        >
          Ver en Google Maps
        </Text>
      </Card>
    );
  };

  // Renderizar objetos complejos
  const renderComplexObject = (
    obj: any,
    fieldName: string,
  ): React.ReactNode => {
    if (isMongoObjectId(obj)) {
      return (
        <Text c="dimmed" size="sm" ff="monospace">
          {obj.$oid}
        </Text>
      );
    }

    if (isMongoDate(obj)) {
      return <Text>{formatMongoDate(obj)}</Text>;
    }

    if (obj.latitude && obj.longitude) {
      return renderCoordinates(obj);
    }

    if (obj.address && obj.coordinates) {
      return (
        <Stack gap="xs">
          <Text>
            <strong>Dirección:</strong> {obj.address}
          </Text>
          {renderCoordinates(obj.coordinates)}
        </Stack>
      );
    }
    if (obj?.featured === true) {
      return (
        <Stack gap="xs">
          <Badge color="yellow" variant="filled">
            Evento destacado
          </Badge>

          <Card withBorder p="sm" radius="sm">
            <Stack gap="xs">
              {Object.entries(obj)
                .filter(([k]) => k !== "featured") // opcional: no mostrar el boolean
                .map(([key, value]) => (
                  <Group key={key} justify="space-between" wrap="nowrap">
                    <Text size="sm" fw={500}>
                      {formatFieldName(key)}:
                    </Text>
                    <Text size="sm" style={{ wordBreak: "break-word" }}>
                      {renderValue(value, key)}
                    </Text>
                  </Group>
                ))}
            </Stack>
          </Card>
        </Stack>
      );
    }
    const allBoolean = Object.values(obj).every(
      (val) => typeof val === "boolean",
    );
    if (allBoolean) {
      return (
        <SimpleGrid cols={2} spacing="xs">
          {Object.entries(obj).map(([key, value]) => (
            <Group key={key} justify="space-between">
              <Text size="sm">{formatFieldName(key)}</Text>
              <Badge color={value ? "green" : "red"} variant="light" size="sm">
                {value ? "Sí" : "No"}
              </Badge>
            </Group>
          ))}
        </SimpleGrid>
      );
    }

    if (
      fieldName.toLowerCase().includes("style") ||
      Object.values(obj).some(
        (val) => typeof val === "string" && isImageUrl(val),
      )
    ) {
      return (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {Object.entries(obj).map(([key, value]) => (
            <Box
              key={key}
              style={{
                maxWidth: "300px",
                margin: "0 auto",
                overflow: "hidden",
                borderRadius: "8px",
                backgroundColor: "#f8f9fa",
                padding: "8px",
              }}
            >
              <Text size="sm" fw={500} mb="xs">
                {formatFieldName(key)}
              </Text>
              {typeof value === "string" && isImageUrl(value) ? (
                <Image
                  src={value}
                  alt={`${key} image`}
                  maw={300}
                  mah={200}
                  fit="contain"
                  radius="md"
                  withPlaceholder
                  style={{ display: "block", marginBottom: "8px" }}
                />
              ) : (
                <Text size="sm">{String(value)}</Text>
              )}
            </Box>
          ))}
        </SimpleGrid>
      );
    }

    return (
      <Card withBorder p="sm" radius="sm">
        <Stack gap="xs">
          {Object.entries(obj).map(([key, value]) => (
            <Group key={key} justify="space-between" wrap="nowrap">
              <Text size="sm" fw={500}>
                {formatFieldName(key)}:
              </Text>
              <Text size="sm" style={{ wordBreak: "break-word" }}>
                {renderValue(value, key)}
              </Text>
            </Group>
          ))}
        </Stack>
      </Card>
    );
  };

  // Renderizar arrays de objetos
  const renderObjectArray = (arr: any[]): React.ReactNode => {
    if (arr.length === 0) return <Text c="dimmed">-</Text>;

    return (
      <Stack gap="sm">
        {arr.map((item, index) => (
          <Card key={index} withBorder p="sm" radius="sm">
            <Text size="sm" fw={500} mb="xs">
              Elemento {index + 1}
            </Text>
            <Divider mb="xs" />
            {typeof item === "object" ? (
              renderComplexObject(item, `item-${index}`)
            ) : (
              <Text size="sm">{String(item)}</Text>
            )}
          </Card>
        ))}
      </Stack>
    );
  };

  // Función principal para renderizar valores
  const renderValue = (value: any, fieldName: string): React.ReactNode => {
    if (value === null || value === undefined) {
      return <Text c="dimmed">-</Text>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return <Text c="dimmed">Lista vacía</Text>;

      const allPrimitives = value.every(
        (item) =>
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean",
      );

      if (allPrimitives) {
        return (
          <Group gap="xs">
            {value.map((item, index) => (
              <Badge key={index} variant="light">
                {String(item)}
              </Badge>
            ))}
          </Group>
        );
      }

      return renderObjectArray(value);
    }

    if (typeof value === "object") {
      return renderComplexObject(value, fieldName);
    }

    const stringValue = String(value);

    if (isImageUrl(stringValue)) {
      return (
        <Box
          style={{
            maxWidth: "400px",
            margin: "0 auto",
            overflow: "hidden",
            borderRadius: "8px",
            backgroundColor: "#f8f9fa",
            padding: "8px",
          }}
        >
          <Image
            src={stringValue}
            alt={`${fieldName} image`}
            maw={400}
            mah={300}
            fit="contain"
            radius="md"
            withPlaceholder
            style={{ display: "block", marginBottom: "8px" }}
          />
        </Box>
      );
    }

    // 🔹 HTML → renderizado directo
    if (isHtml(stringValue)) {
      return (
        <Box
          style={{
            wordBreak: "break-word",
            overflow: "auto", // Oculta el contenido desbordado y añade una barra de desplazamiento
            maxWidth: "100%", // Asegura que el contenido no exceda el ancho del contenedor padre
          }}
          dangerouslySetInnerHTML={{ __html: stringValue }}
        />
      );
    }

    if (
      stringValue.startsWith("http://") ||
      stringValue.startsWith("https://")
    ) {
      return (
        <Text
          component="a"
          href={stringValue}
          target="_blank"
          rel="noopener noreferrer"
          c="blue"
          td="underline"
        >
          {stringValue}
        </Text>
      );
    }

    if (typeof value === "boolean") {
      return (
        <Badge color={value ? "green" : "red"} variant="light">
          {value ? "Sí" : "No"}
        </Badge>
      );
    }

    if (typeof value === "number") {
      return <Text>{value.toLocaleString("es-ES")}</Text>;
    }

    // 🔹 Texto largo → Markdown
    if (stringValue.length > 200) {
      return <MarkdownField value={stringValue} />;
    }

    return <Text>{stringValue}</Text>;
  };

  // Claves ordenadas
  const dataKeys = Object.keys(data).filter(
    (key) => !excludeFields.includes(key),
  );

  const orderedKeys = [
    ...fieldOrder.filter((key) => dataKeys.includes(key)),
    ...dataKeys.filter((key) => !fieldOrder.includes(key)),
  ];

  return (
    <Box maw={1200} mx="auto" p="md">
      <Stack gap="xl">
        {orderedKeys.map((key) => (
          <Box key={key} style={{ marginBottom: "16px" }}>
            <Title order={4} mb="md" c="dark.7" fw={700}>
              {formatFieldName(key)}
            </Title>
            <Box pl="sm">{renderValue(data[key], key)}</Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};
