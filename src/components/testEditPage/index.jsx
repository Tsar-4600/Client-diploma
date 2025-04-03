import { useState, useCallback, useMemo } from 'react';

const QuestionBlock = ({ item, onUpdate, isDragging }) => {
  const handleOptionChange = useCallback((index, value) => {
    const newOptions = [...item.options];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  }, [item.options, onUpdate]);

  const handleAddOption = useCallback(() => {
    onUpdate({ options: [...item.options, `Option ${item.options.length + 1}`] });
  }, [item.options, onUpdate]);

  const options = useMemo(() => {
    if (!item.options) return null;
    
    return (
      <div className="options-container">
        {item.options.map((option, i) => (
          <label key={`${item.id}-${i}`} className="option-item">
            <input 
              type={item.template === 'multipleChoice' ? 'radio' : 'checkbox'} 
              name={`question-${item.id}`} 
            />
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              className="option-input"
            />
          </label>
        ))}
        <button onClick={handleAddOption} className="add-option-btn">
          Add Option
        </button>
      </div>
    );
  }, [item.options, item.id, item.template, handleOptionChange, handleAddOption]);

  

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
      {options}
    </div>
  );
};

const TestEditor = () => {
  const [items, setItems] = useState([
    { id: 1, type: 'question', template: 'text', title: 'Question 1', text: 'Please enter your name', schedule: { day: 'Monday', time: '09:00' } },
    { id: 3, type: 'question', template: 'multipleChoice', title: 'Multiple Choice Question', text: 'Select one option:', options: ['Option 1', 'Option 2'], schedule: { day: 'Tuesday', time: '10:30' } },
  ]);

  const [draggedItem, setDraggedItem] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  const handleDragStart = useCallback((e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', item.id);
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === items[index].id) return;

    setItems(prevItems => {
      const newItems = [...prevItems];
      const draggedIndex = newItems.findIndex(i => i.id === draggedItem.id);
      newItems.splice(draggedIndex, 1);
      newItems.splice(index, 0, draggedItem);
      return newItems;
    });
  }, [draggedItem, items]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  const addQuestion = useCallback((templateType) => {
    const newId = Math.max(...items.map(i => i.id), 0) + 1;
    const newItem = {
      id: newId,
      type: 'question',
      template: templateType,
      title: `New ${templateType} Question`,
      text: 'Question text goes here',
      ...(templateType === 'multipleChoice' && { options: ['Option 1', 'Option 2'] }),
    };
    setItems(prev => [...prev, newItem]);
    setActiveItem(newItem);
  }, [items]);

  const updateItem = useCallback((id, updates) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const renderedItems = useMemo(() => (
    items.map((item, index) => {
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
           <div>null</div>
          )}
        </div>
      );
    })
  ), [items, draggedItem, activeItem, handleDragStart, handleDragOver, handleDragEnd, updateItem]);


  ////////////////////////////generating file json/////////////////////////////////////////////////////////////////
  const generateTestJson = useCallback(() => {
    const testStructure = {
      test: {
        blocks: items.map(item => {
          const block = {
            questions: [],
            answers: [] // You'll need to implement answer handling
          };

          if (item.type === 'question') {
            const question = {
              type: item.template,
              text: item.text || item.title,
              ...(item.options && { choices: item.options })
            };
            block.questions.push(question);

            // This is a placeholder - you'll need to implement actual answer handling
            if (item.template === 'multipleChoice' && item.options?.length) {
              block.answers.push({
                type: 'choice',
                text: item.options[0], // Assuming first option is correct
                isCorrect: true
              });
            } else if (item.template === 'text') {
              block.answers.push({
                type: 'text',
                text: '', // You'll want to add actual correct answers
                isCorrect: true
              });
            }
          }

          return block;
        })
      }
    };

    // Create a JSON string and download it as a file
    const jsonStr = JSON.stringify(testStructure, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'test-structure.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    ////////////////////////////////////////////////impport jsone file///////////////////////////////
  }, [items])

  return (
    <div className="test-editor">
      <div className="editor-toolbar">
        <h2>Test Editor</h2>
        <div className="template-buttons">
          <button onClick={() => addQuestion('text')}>Add Text Question</button>
          <button onClick={() => addQuestion('multipleChoice')}>Add Multiple Choice</button>
          <button onClick={() => addQuestion('checkbox')}>Add Checkbox</button>

          <button onClick={generateTestJson} className="export-btn">
            Export Test JSON
          </button>
        </div>
      </div>

      <div className="editor-container">
        <div className="editing-area" onDragOver={(e) => e.preventDefault()}>
          {renderedItems}
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
      `}</style>
    </div>
  );
};

export default TestEditor;