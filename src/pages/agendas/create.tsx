import { Create, useForm, useSelect } from "@refinedev/mantine";
import { Select, Text } from "@mantine/core";

export const AgendaCreate: React.FC = () => {
  const { saveButtonProps, getInputProps, errors } = useForm({
    initialValues: {
      eventId: "",
      sessions: [
        {
          title: "Default Session",
          startDateTime: new Date().toISOString(),
          endDateTime: new Date().toISOString(),
          speakers: [],
          moduleId: null,
          room: "",
        },
      ],
    },
    validate: {
      eventId: (value) => (value.length <= 0 ? "Event is required" : null),
    },
  });

  const { selectProps } = useSelect({
    resource: "events",
    optionLabel: "name", // Asegurar que el label sea el nombre del evento
    optionValue: "_id", // El ID del evento será el valor
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <form>
        <Select
          mt={8}
          label="Event"
          placeholder="Select an event"
          {...getInputProps("eventId")}
          {...selectProps}
        />
        {errors.eventId && (
          <Text mt={2} weight={500} size="xs" color="red">
            {errors.eventId}
          </Text>
        )}
      </form>
    </Create>
  );
};
