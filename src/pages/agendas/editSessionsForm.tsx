import React, { useState } from 'react';
import { Button, Group, MultiSelect, TextInput, Stack, Text } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
//import { v4 as uuidv4 } from 'uuid'; // for unique keys for new sessions

interface Session {
  _id?: string;
  id?: number;
  title: string;
  startDateTime: Date | null;
  endDateTime: Date | null;
  speakers: string[];
}

interface Speaker {
  id: string;
  name: string;
}

const EditSessionsForm = ({
  resource,
  speakersList,
  onSubmit,
}: {
  resource: { sessions?: Session[] };
  speakersList: Speaker[];
  onSubmit: (sessions: Session[]) => void;
}) => {
  const [sessions, setSessions] = useState<Session[]>(resource?.sessions ?? []);

  const handleSessionChange = (index: number, property: string, value: any) => {
    const updatedSessions = sessions.map((session: Session, i: number) =>
      i === index ? { ...session, [property]: value } : session
    );
    setSessions(updatedSessions);
  };

  const handleAddSession = () => {
    const newSession: Session = {
      id: Math.random()*1000,//uuidv4(),
      title: '',
      startDateTime: null,
      endDateTime: null,
      speakers: []
    };
    setSessions([...sessions, newSession]);
  };

  const handleRemoveSession = (index: number) => {
    const updatedSessions = sessions.filter((_: Session, i: number) => i !== index);
    setSessions(updatedSessions);
  };

  // Handle form submission
  const handleSubmit = () => {
    onSubmit(sessions);
  };

  if (!sessions) return (
    <Text size="xl" weight={500}>
    Edit Sessions Cargando
  </Text>
  )

  return (
    <Stack spacing="md">
      <Text size="xl" weight={500}>
        Edit Sessions
      </Text>



      {sessions.map((session: Session, index: number) => (
        <Stack key={session._id} spacing="sm" sx={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <TextInput
            label="Title"
            value={session.title}
            onChange={(e) => handleSessionChange(index, 'title', e.target.value)}
            placeholder="Enter session title"
            required
          />

          <Group grow>
            <DateTimePicker
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              label="Start Date and Time"
              value={session.startDateTime}
              onChange={(value: Date | null) => handleSessionChange(index, 'startDateTime', value)}
              placeholder="Select start date and time"
              required
            />
            <DateTimePicker
              onPointerEnterCapture={undefined}
              onPointerLeaveCapture={undefined}
              label="End Date and Time"
              value={session.endDateTime}
              onChange={(value: Date | null) => handleSessionChange(index, 'endDateTime', value)}
              placeholder="Select end date and time"
              required
            />
          </Group>

          <MultiSelect
            label="Speakers"
            data={speakersList.map((speaker: Speaker) => ({ value: speaker.id, label: speaker.name }))}
            value={session.speakers}
            onChange={(value) => handleSessionChange(index, 'speakers', value)}
            placeholder="Select speakers"
            required
          />

          <Button color="red" onClick={() => handleRemoveSession(index)}>
            Remove Session
          </Button>
        </Stack>
      ))}

      <Group position="apart">
        <Button color="green" onClick={handleAddSession}>
          Add New Session
        </Button>

        <Button onClick={handleSubmit}>Save Changes</Button>
      </Group>
    </Stack>
  );
};

export default EditSessionsForm;
