import { Create, useForm, useSelect } from "@refinedev/mantine";
import { useOne } from "@refinedev/core";
import { Select, Text, Stack } from "@mantine/core";
import { useState } from "react";
import { AgendaCalendarEditor } from "../../components/AgendaCalendarEditor";

export const AgendaCreate: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const { saveButtonProps, getInputProps, errors, values, setFieldValue } = useForm({
    initialValues: {
      eventId: "",
      sessions: [] as any[],
    },
    validate: {
      eventId: (value: string) => (value.length <= 0 ? "El evento es requerido" : null),
    },
  });

  const { selectProps } = useSelect({
    resource: "events",
    optionLabel: "name",
    optionValue: "_id",
  });

  const { data: eventData } = useOne({
    resource: "events",
    id: selectedEventId,
    queryOptions: { enabled: !!selectedEventId },
  });

  const { selectProps: speakerSelectProps } = useSelect({
    resource: "speakers",
    optionLabel: "names",
    optionValue: "_id",
    pagination: { pageSize: 1000, current: 1, mode: "server" },
    filters: [{ field: "eventId", operator: "eq", value: selectedEventId }],
    queryOptions: { enabled: !!selectedEventId },
  });

  const { selectProps: moduleSelectProps } = useSelect({
    resource: "modules",
    optionLabel: "title",
    optionValue: "_id",
  });

  const eventStart = (eventData?.data as any)?.startDate
    ? new Date((eventData?.data as any).startDate)
    : null;
  const eventEnd = (eventData?.data as any)?.endDate
    ? new Date((eventData?.data as any).endDate)
    : null;

  return (
    <Create saveButtonProps={saveButtonProps}>
      <form>
        <Stack spacing="md">
          <Select
            mt={8}
            label="Evento"
            placeholder="Selecciona un evento"
            {...getInputProps("eventId")}
            {...selectProps}
            onChange={(value) => {
              getInputProps("eventId").onChange(value);
              setSelectedEventId(value || "");
            }}
          />
          {errors.eventId && (
            <Text mt={2} weight={500} size="xs" color="red">
              {errors.eventId}
            </Text>
          )}

          <AgendaCalendarEditor
            eventStartDate={eventStart}
            eventEndDate={eventEnd}
            sessions={values.sessions}
            onChange={(sessions) => setFieldValue("sessions", sessions)}
            speakerOptions={(speakerSelectProps.data as any[]) || []}
            moduleOptions={(moduleSelectProps.data as any[]) || []}
          />
        </Stack>
      </form>
    </Create>
  );
};
