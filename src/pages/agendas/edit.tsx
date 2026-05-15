import { Edit, useForm, useSelect } from "@refinedev/mantine";
import { useOne } from "@refinedev/core";
import { Text } from "@mantine/core";
import { useEffect } from "react";
import { AgendaCalendarEditor } from "../../components/AgendaCalendarEditor";

export const AgendaEdit: React.FC = () => {
  const {
    saveButtonProps,
    values,
    setFieldValue,
    refineCore: { query: queryResult },
  } = useForm({
    refineCoreProps: {
      redirect: false,
    },
    initialValues: {
      _id: "",
      eventId: { _id: "", name: "" },
      title: "",
      sessions: [] as any[],
      startDate: new Date().toString(),
      status: "",
      category: { id: "" },
      content: "",
    },
    transformValues: (vals) => ({
      ...vals,
      eventId: vals?.eventId?._id || "",
    }),
  });

  useEffect(() => {
    console.log("queryResult =>", queryResult?.data?.data);
  }, [queryResult?.data?.data]);

  const eventId: string =
    values?.eventId?._id || queryResult?.data?.data?.eventId?._id || "";

  const { data: eventData } = useOne({
    resource: "events",
    id: eventId,
    queryOptions: { enabled: !!eventId },
  });

  const { selectProps: speakerSelectProps } = useSelect({
    resource: "speakers",
    optionLabel: "names",
    optionValue: "_id",
    pagination: { pageSize: 1000, current: 1, mode: "server" },
    filters: [{ field: "eventId", operator: "eq", value: eventId }],
    queryOptions: { enabled: !!eventId },
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
    <Edit saveButtonProps={saveButtonProps}>
      <form>
        <Text mt={8} size="sm" color="dimmed">
          ID: {queryResult?.data?.data?._id}
        </Text>
        <Text mt={4} weight={500} mb="xs">
          Evento: {queryResult?.data?.data?.eventId?.name}
        </Text>

        <AgendaCalendarEditor
          eventStartDate={eventStart}
          eventEndDate={eventEnd}
          sessions={values.sessions}
          onChange={(sessions) => setFieldValue("sessions", sessions)}
          speakerOptions={(speakerSelectProps.data as any[]) || []}
          moduleOptions={(moduleSelectProps.data as any[]) || []}
        />
      </form>
    </Edit>
  );
};
