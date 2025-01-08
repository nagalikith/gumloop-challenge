import React, { useState } from 'react';
import BaseNode, { 
  NodeFieldset,
  NodeLabel,
  NodeInput,
  NodeSelect,
} from './BaseNode';

export const InputNodeNaga = ({ data, selected }) => {
  const [currText, setCurrText] = useState(data?.text || '{{input}}');

  const handleTextChange = (e) => {
    setCurrText(e.target.value);
  };
  return (
    <BaseNode
      selected={selected}
      label={'User_Question' || currText}
      handles={{ right: true }}
    >
      {/* Field Name Input */}
      <NodeFieldset>
        <NodeLabel htmlFor="inputName">
          Field Name
        </NodeLabel>
        <NodeInput
          id="inputName"
          type="text"
          value={currText}
          onChange={(e) => {
            data.onChange?.({handleTextChange});
          }}
        />
      </NodeFieldset>

      {/* Type Selector */}
      <NodeFieldset>
        <NodeLabel htmlFor="inputType">
          Type
        </NodeLabel>
        <NodeSelect>
          <NodeInput
            id="inputType"
            type="text"
            value="Text"
            readOnly
          />
        </NodeSelect>
      </NodeFieldset>

    </BaseNode>
  );
};

InputNodeNaga.displayName = 'InputNode';

export default InputNodeNaga;