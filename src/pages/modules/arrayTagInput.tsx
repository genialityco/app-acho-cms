import { useState } from 'react';
import { TextInput, Badge, Group } from '@mantine/core';

function ArrayTagInput() {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      <Group spacing="xs">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="filled"
            color="blue"
            rightSection={<span onClick={() => removeTag(tag)} style={{ cursor: 'pointer', marginLeft: 4 }}>x</span>}
          >
            {tag}
          </Badge>
        ))}
        <TextInput
          placeholder="Type and press Enter"
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          sx={{ flexGrow: 1 }}
        />
      </Group>
    </div>
  );
}

export default ArrayTagInput;