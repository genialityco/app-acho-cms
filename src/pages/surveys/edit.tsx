import React from "react";
import { Edit, useForm } from "@refinedev/mantine";
import { TextInput, Checkbox, Group, Button, Stack, Text, Select } from "@mantine/core";

export const SurveyEdit: React.FC = () => {
  const { saveButtonProps, getInputProps, setFieldValue, values } = useForm({
    refineCoreProps: {
      resource: "surveys",
    },
    initialValues: {
      title: "",
      isPublished: false,
      isOpen: false,
      questions: [],
    },
  });

  const addQuestion = () => {
    const newQuestion = {
      id: `question-${values.questions.length + 1}`,
      type: "radio",
      title: "",
      options: [],
    };
    setFieldValue("questions", [...values.questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = values.questions.filter((_, i) => i !== index);
    setFieldValue("questions", updatedQuestions);
  };

  const handleOptionChange = (index: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...values.questions];
    updatedQuestions[index].options[optionIndex] = value;
    setFieldValue("questions", updatedQuestions);
  };

  const addOption = (index: number) => {
    const updatedQuestions = [...values.questions];
    updatedQuestions[index].options.push("");
    setFieldValue("questions", updatedQuestions);
  };

  const removeOption = (index: number, optionIndex: number) => {
    const updatedQuestions = [...values.questions];
    updatedQuestions[index].options = updatedQuestions[index].options.filter((_, i) => i !== optionIndex);
    setFieldValue("questions", updatedQuestions);
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Stack>
        {/* Campo de título */}
        <TextInput label="Título" placeholder="Título de la encuesta" {...getInputProps("title")} />
        
        {/* Opciones de la encuesta */}
        <Group>
          <Checkbox label="¿Publicada?" {...getInputProps("isPublished", { type: "checkbox" })} />
          <Checkbox label="¿Abierta?" {...getInputProps("isOpen", { type: "checkbox" })} />
        </Group>
        
        {/* Gestión de preguntas */}
        <Stack>
          <Text weight={500}>Preguntas</Text>
          {values.questions.map((question, index) => (
            <Stack
              key={question.id}
              spacing="xs"
              style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}
            >
              <TextInput
                label={`Título de la pregunta ${index + 1}`}
                value={question.title}
                onChange={(e) => {
                  const updatedQuestions = [...values.questions];
                  updatedQuestions[index].title = e.target.value;
                  setFieldValue("questions", updatedQuestions);
                }}
              />

              {/* Selección del tipo de pregunta */}
              <Select
                label="Tipo de pregunta"
                placeholder="Selecciona un tipo"
                data={[
                  { value: "radio", label: "Selección única (Radio)" },
                  { value: "checkbox", label: "Selección múltiple (Checkbox)" },
                  { value: "text", label: "Respuesta de texto" },
                ]}
                value={question.type}
                onChange={(value) => {
                  const updatedQuestions = [...values.questions];
                  updatedQuestions[index].type = value!;
                  if (value === "text") updatedQuestions[index].options = [];
                  setFieldValue("questions", updatedQuestions);
                }}
              />

              {/* Opciones para radio o checkbox */}
              {(question.type === "radio" || question.type === "checkbox") && (
                <Stack spacing="xs">
                  <Text weight={500} size="sm">Opciones</Text>
                  {question.options.map((option, optionIndex) => (
                    <Group key={optionIndex} position="apart">
                      <TextInput
                        placeholder={`Opción ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                      />
                      <Button
                        variant="outline"
                        color="red"
                        onClick={() => removeOption(index, optionIndex)}
                      >
                        Eliminar
                      </Button>
                    </Group>
                  ))}
                  <Button variant="subtle" onClick={() => addOption(index)}>
                    Añadir opción
                  </Button>
                </Stack>
              )}

              {/* Botón para eliminar pregunta */}
              <Button variant="outline" color="red" onClick={() => removeQuestion(index)}>
                Eliminar pregunta
              </Button>
            </Stack>
          ))}
          <Button onClick={addQuestion}>Añadir Pregunta</Button>
        </Stack>
      </Stack>
    </Edit>
  );
};
