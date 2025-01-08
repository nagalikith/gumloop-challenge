
import { Handle, Position } from 'reactflow';

const BaseNode = ({
  selected,
  children,
  handles = { left: false, right: true },
  label,
  nodeStyle = {},
  className = '',
}) => {
  const renderHandle = (type, position) => (
    <Handle
      type={type}
      position={position}
      className="m-0 !bg-white !border-[1px] border-gray-300"
      style={{
        top: '55%',
        [position === Position.Left ? 'left' : 'right']: '-10px',
        padding: '8px',
        borderRadius: '50%',
      }}
    >
      <div 
        className={`
          absolute p-[2px] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]
          pointer-events-none border-[3px] rounded-full
          ${selected ? 'border-blue-400 bg-blue-300' : 'border-gray-300 bg-white'}
          hover:border-blue-400 hover:bg-blue-300
          transition-colors duration-150
        `}
        style={{ boxSizing: 'border-box' }}
      />
    </Handle>
  );

  const renderLabel = (position) => (
    <div 
      style={{ 
        position: 'absolute',
        userSelect: 'none',
        [position === Position.Left ? 'left' : 'right']: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
      }}
      className="truncate"
    >
      <span className={`
        ${selected ? 'text-blue-600' : 'text-gray-600'}
        transition-colors duration-150
      `}>
        {label}
      </span>
    </div>
  );

  return (
    <div 
      className={`
        flex flex-col flex-1 relative px-[18px] pt-2 pb-4 overflow-hidden max-w-full
        ${className}
      `}
      style={{ ...nodeStyle, border: '1px solid #ccc', borderRadius: '6px' }}
    >
      <div 
        className="relative overflow-hidden" 
        style={{ 
          marginLeft: '-18px',
          marginRight: '-18px',
          paddingLeft: '18px',
          paddingRight: '18px'
        }}
      >
        {/* Main Content */}
        <div className="flex flex-col gap-1 max-w-full">
          {children}
        </div>

        {/* Handles */}
        {handles.left && renderHandle('target', Position.Left)}
        {handles.right && renderHandle('source', Position.Right)}

        {/* Labels */}
        {label && (handles.left ? renderLabel(Position.Left) : renderLabel(Position.Right))}
      </div>
    </div>
  );
};

// Form Field Components
export const NodeFieldset = ({ 
  children,
  className = '',
  ...props 
}) => (
  <fieldset 
    className={`w-full flex-1 flex flex-col relative overflow-hidden ${className}`}
    {...props}
  >
    {children}
  </fieldset>
);

export const NodeLabel = ({ 
  children,
  className = '',
  ...props 
}) => (
  <label
    className={`
      transition-all font-medium mb-[2px] text-[12px] 
      cursor-text text-[#6c737f] truncate
      ${className}
    `}
    {...props}
  >
    {children}
  </label>
);

export const NodeInput = ({ 
  className = '',
  ...props 
}) => (
  <input
    className={`
      nodrag w-full duration-50 outline-none 
      font-sans text-[13px] py-1 px-2 truncate
      ${className}
    `}
    autoCapitalize="off"
    autoComplete="off"
    autoCorrect="off"
    spellCheck="true"
    {...props}
  />
);

export const NodeSelect = ({ 
  children,
  className = '',
  ...props 
}) => (
  <div className={`relative w-full overflow-hidden ${className}`}>
    {children}
    <button 
      className="absolute right-0 bottom-[-3px] p-1"
      type="button"
      style={{ maxWidth: '100%' }}
    >
      <svg 
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="m7 10 5 5 5-5z" />
      </svg>
    </button>
  </div>
);

export const CollapsibleSection = ({
  title,
  children,
  isExpanded = false,
  className = '',
}) => (
  <div className={`
    transition-all select-none
    ${isExpanded ? 'h-auto opacity-100' : 'h-0 overflow-hidden opacity-0'}
    cursor-grab max-w-full
    ${className}
  `}>
    <hr className="mt-4 mb-2 border-t border-gray-200" />
    <h6 className="text-sm font-medium mb-1 truncate">{title}</h6>
    {children}
  </div>
);

BaseNode.displayName = 'BaseNode';
NodeFieldset.displayName = 'NodeFieldset';
NodeLabel.displayName = 'NodeLabel';
NodeInput.displayName = 'NodeInput';
NodeSelect.displayName = 'NodeSelect';
CollapsibleSection.displayName = 'CollapsibleSection';

export default BaseNode;
