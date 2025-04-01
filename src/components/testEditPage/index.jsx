import { useState } from 'react';

const QuestionBlock = ({ item, onUpdate, isDragging }) => {
  const renderOptions = () => {
    if (!item.options) return null;
    
    return (
      <div className="options-container">
        {item.options.map((option, i) => (
          <label key={i} className="option-item">
            {item.template === 'multipleChoice' ? (
              <input type="radio" name={`question-${item.id}`} />
            ) : (
              <input type="checkbox" name={`question-${item.id}`} />
            )}
            <input
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...item.options];
                newOptions[i] = e.target.value;
                onUpdate({ options: newOptions });
              }}
              className="option-input"
            />
          </label>
        ))}
        <button
          onClick={() => onUpdate({ options: [...item.options, `Option ${item.options.length + 1}`] })}
          className="add-option-btn"
        >
          Add Option
        </button>
      </div>
    );
  };

  return (
    <div className={`question-block ${isDragging ? 'dragging' : ''}`} data-id={item.id}>
      <input
        type="text"
        value={item.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        className="question-title-input"
      />
      <textarea
        value={item.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        className="question-text-input"
      />
      {renderOptions()}
    </div>
  );
};

const ScheduleBlock = ({ item, onUpdate, isDragging }) => {
  return (
    <div className={`schedule-block ${isDragging ? 'dragging' : ''}`} data-id={item.id}>
      <div className="schedule-header">
        <select value={item.day} onChange={(e) => onUpdate({ day: e.target.value })}>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        <input
          type="time"
          value={item.time}
          onChange={(e) => onUpdate({ time: e.target.value })}
        />
      </div>
      <div className="schedule-content">
        {/* Questions will be rendered here based on parentId */}
      </div>
    </div>
  );
};

const TestEditor = () => {
  const [items, setItems] = useState([
    { id: 1, type: 'question', template: 'text', title: 'Question 1', text: 'Please enter your name', schedule: { day: 'Monday', time: '09:00' } },
    { id: 2, type: 'schedule', day: 'Tuesday', time: '10:30' },
    { id: 3, type: 'question', template: 'multipleChoice', title: 'Multiple Choice Question', text: 'Select one option:', options: ['Option 1', 'Option 2'], schedule: { day: 'Tuesday', time: '10:30' } },
  ]);

  const [draggedItem, setDraggedItem] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', item.id);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === items[index].id) return;

    setItems(prevItems => {
      const newItems = [...prevItems];
      const draggedIndex = newItems.findIndex(i => i.id === draggedItem.id);
      newItems.splice(draggedIndex, 1);
      newItems.splice(index, 0, draggedItem);
      return newItems;
    });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const addQuestion = (templateType) => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    const newItem = {
      id: newId,
      type: 'question',
      template: templateType,
      title: `New ${templateType} Question`,
      text: 'Question text goes here',
      ...(templateType === 'multipleChoice' && { options: ['Option 1', 'Option 2'] }),
      schedule: { day: 'Unassigned', time: '00:00' }
    };
    setItems([...items, newItem]);
    setActiveItem(newItem);
  };

  const addScheduleBlock = () => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    const newItem = {
      id: newId,
      type: 'schedule',
      day: 'New Day',
      time: '00:00'
    };
    setItems([...items, newItem]);
    setActiveItem(newItem);
  };

  const updateItem = (id, updates) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  return (
    <div className="test-editor">
      <div className="editor-toolbar">
        <h2>Test Editor</h2>
        <div className="template-buttons">
          <button onClick={() => addQuestion('text')}>Add Text Question</button>
          <button onClick={() => addQuestion('multipleChoice')}>Add Multiple Choice</button>
          <button onClick={() => addQuestion('checkbox')}>Add Checkbox</button>
          <button onClick={addScheduleBlock}>Add Schedule Block</button>
        </div>
      </div>

      <div className="editor-container">
        <div className="editing-area" onDragOver={(e) => e.preventDefault()}>
          {items.map((item, index) => {
            const isDragging = draggedItem?.id === item.id;
            return (
              <div
                key={item.id}
                className={`editor-block ${item.type} ${activeItem?.id === item.id ? 'active' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => setActiveItem(item)}
                style={{ opacity: isDragging ? 0.5 : 1 }}
              >
                <div className="drag-handle">≡</div>
                {item.type === 'question' ? (
                  <QuestionBlock 
                    item={item} 
                    onUpdate={(updates) => updateItem(item.id, updates)}
                    isDragging={isDragging}
                  />
                ) : (
                  <ScheduleBlock 
                    item={item} 
                    onUpdate={(updates) => updateItem(item.id, updates)}
                    isDragging={isDragging}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .test-editor {
          display: flex;
          flex-direction: column;
          height: 100vh;
          padding: 20px;
        }
        
        .editor-toolbar {
          margin-bottom: 20px;
        }
        
        .template-buttons {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        
        .editor-container {
          flex: 1;
          overflow-y: auto;
        }
        
        .editing-area {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 10px;
        }
        
        .editor-block {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 15px;
          position: relative;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .editor-block.active {
          border: 2px solid #2196F3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
        }
        
        .editor-block.question {
          border-left: 4px solid #4CAF50;
        }
        
        .editor-block.schedule {
          border-left: 4px solid #2196F3;
        }
        
        .drag-handle {
          position: absolute;
          left: 5px;
          top: 5px;
          cursor: move;
          color: #666;
        }
        
        .question-block {
          margin-left: 20px;
        }
        
        .question-title-input, .question-text-input, .option-input {
          width: 100%;
          padding: 8px;
          border: 1px solid #eee;
        }
        
        .options-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .add-option-btn {
          margin-top: 5px;
        }

        .schedule-header {
          display: flex;
          gap: 10px;
          margin-left: 20px;
        }

        .schedule-content {
          margin-top: 15px;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default TestEditor;