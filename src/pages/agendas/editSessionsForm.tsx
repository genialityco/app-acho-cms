import React, { useState } from 'react';
import { Button, Group, MultiSelect, TextInput, Stack, Text } from '@mantine/core';
import {DateField} from  "@refinedev/mantine";
//import { v4 as uuidv4 } from 'uuid'; // for unique keys for new sessions

const EditSessionsForm = ({ resource, speakersList, onSubmit }) => {
  // Assume resource.sessions is an array of session objects
  const [sessions, setSessions] = useState(resource?.sessions);

  // Handle change in session property
  const handleSessionChange = (index, property, value) => {
    const updatedSessions = sessions.map((session, i) =>
      i === index ? { ...session, [property]: value } : session
    );
    setSessions(updatedSessions);
  };

  // Add a new session to the array
  const handleAddSession = () => {
    const newSession = {
      id: Math.random()*1000,//uuidv4(),
      title: '',
      startDateTime: null,
      endDateTime: null,
      speakers: []
    };
    setSessions([...sessions, newSession]);
  };

  // Remove session from the array
  const handleRemoveSession = (index) => {
    const updatedSessions = sessions.filter((_, i) => i !== index);
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



      {sessions.map((session, index) => (
        <Stack key={session._id} spacing="sm" sx={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <TextInput
            label="Title"
            value={session.title}
            onChange={(e) => handleSessionChange(index, 'title', e.target.value)}
            placeholder="Enter session title"
            required
          />

          <Group grow>
            <DateField 
              label="Start Date and Time"
              value={session.startDateTime}
              onChange={(value) => handleSessionChange(index, 'startDateTime', value)}
              placeholder="Select start date and time"
              required
            />
            <DateField 
              label="End Date and Time"
              value={session.endDateTime}
              onChange={(value) => handleSessionChange(index, 'endDateTime', value)}
              placeholder="Select end date and time"
              required
            />
          </Group>

          <MultiSelect
            label="Speakers"
            data={speakersList.map((speaker) => ({ value: speaker.id, label: speaker.name }))}
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
