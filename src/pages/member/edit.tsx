import React, { useEffect } from "react";
import { Edit, useForm } from "@refinedev/mantine";
import { Switch, Text, TextInput } from "@mantine/core";
import type { IMember } from "../../interfaces";
import { ResetPasswordButton } from "./ResetPasswordButton";

const FIELD_LABELS: Record<string, string> = {
  fullName: "Nombre completo",
  idNumber: "Número de documento",
  email: "Correo electrónico",
  phone: "Teléfono",
  specialty: "Especialidad",
};

// La contraseña se cambia con el botón de restablecer, no desde el formulario
const HIDDEN_FIELDS = ["password"];

export const MemberEdit: React.FC = () => {
  const {
    saveButtonProps,
    getInputProps,
    setValues,
    values,
    refineCore: { query: queryResult },
  } = useForm<IMember, any, { memberActive: boolean; properties: Record<string, any> }>({
    refineCoreProps: { redirect: "list" },
    initialValues: { memberActive: true, properties: {} },
    // El PUT reemplaza properties completo; values.properties trae también
    // los campos que no se muestran (password, objetos), así que no se pierden
    transformValues: (values) => ({
      memberActive: values.memberActive,
      properties: values.properties,
    }),
  });

  const record = queryResult?.data?.data;

  useEffect(() => {
    if (record) {
      setValues({
        memberActive: record.memberActive,
        properties: { ...record.properties },
      });
    }
  }, [record]);

  const editableKeys = Object.keys(values.properties ?? {}).filter((key) => {
    const value = values.properties[key];
    return (
      !HIDDEN_FIELDS.includes(key) &&
      (value === null || ["string", "number", "boolean"].includes(typeof value))
    );
  });

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      headerButtons={({ defaultButtons }) => (
        <>
          {record && (
            <ResetPasswordButton
              memberId={record._id}
              fullName={record.properties?.fullName}
              idNumber={record.properties?.idNumber}
            />
          )}
          {defaultButtons}
        </>
      )}
    >
      <form>
        <Switch
          mt={8}
          label="Miembro activo"
          {...getInputProps("memberActive", { type: "checkbox" })}
        />
        {editableKeys.map((key) =>
          typeof values.properties[key] === "boolean" ? (
            <Switch
              key={key}
              mt={12}
              label={FIELD_LABELS[key] ?? key}
              {...getInputProps(`properties.${key}`, { type: "checkbox" })}
            />
          ) : key === "email" ? (
            <TextInput
              key={key}
              mt={8}
              label={FIELD_LABELS[key]}
              description="Es el correo de acceso a la app; no se cambia desde aquí."
              disabled
              {...getInputProps(`properties.${key}`)}
            />
          ) : (
            <TextInput
              key={key}
              mt={8}
              label={FIELD_LABELS[key] ?? key}
              {...getInputProps(`properties.${key}`)}
            />
          )
        )}
        <Text size="xs" color="dimmed" mt="md">
          La contraseña no se edita aquí: usa "Restablecer contraseña" para que
          vuelva a ser el número de documento.
        </Text>
      </form>
    </Edit>
  );
};
