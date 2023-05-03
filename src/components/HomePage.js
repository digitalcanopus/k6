import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddRecordForm from './AddRecordForm';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [records, setRecords] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [editDateValue, setEditDateValue] = useState('');
  const [editWeightValue, setEditWeightValue] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = () => {
    axios.get('/api/weights')
      .then((res) => {
        const records = res.data.map(record => {
          const files = record.files.map(file => ({
            id: file._id,
            file: file.file,
            url: `/uploads/${file.file}`
          }));
          return {
            id: record._id,
            date: record.date,
            weight: record.weight, 
            files
          };
        });
        setRecords(records);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          navigate('/auth');
        }
      });
  }

  const exit = () => {
    axios.post('/api/exit')
      .then((res) => {console.log(res); navigate('/auth');});
  }

  const addRecord = (record) => {
    axios.post('/api/weights', record)
      .then(res => {
        setRecords([...records, res.data]);
        fetchRecords();
      })
      .catch(err => console.log(err));
  };

  const deleteRecord = id => {
    axios.delete(`/api/weights/${id}`)
      .then(res => {
        setRecords(records.filter(record => record.id !== id));
        //fetchRecords();
      })
      .catch(err => console.log(err));
  };

  const deleteFile = id => {
    axios.put(`/api/weights/fdel/${id}`)
      .then(res => {
        setRecords(prevRecords => {
          const updatedRecords = prevRecords.map(record => {
            if (record.id === id) {
              return res.data;
            }
            return record;
          });
          return updatedRecords;
        });
        fetchRecords();
      })
      .catch(err => console.log(err));
  };

  const editRecord = (id, updatedRecord) => {
    axios.put(`/api/weights/${id}`, updatedRecord)
      .then(res => {
        setRecords(prevRecords => {
          const updatedRecords = prevRecords.map(record => {
            if (record.id === id) {
              return res.data;
            }
            return record;
          });
          return updatedRecords;
        });
        fetchRecords();
      })
      .catch(err => console.log(err));
  };

  const handleTableClick = (event) => {
    const isInputCellClicked = event.target.closest(".input-cell");
    if (!isInputCellClicked) {
      setEditIndex(-1);
    }
  };

  const handleEditClick = (index, value_d, value_w) => {
    setEditIndex(index);
    setEditDateValue(value_d);
    setEditWeightValue(value_w);
  };

  const handleDateChange = (event) => {
    setEditDateValue(event.target.value);
  };

  const handleWeightChange = (event) => {
    setEditWeightValue(event.target.value);
  };

  const handleKeyPress = (event, index, field) => {
    if (event.key === 'Enter') {
      setEditIndex(-1);
      const id = records[index].id;
      if (field == 'weight') { 
        const updatedRecord = { weight: editWeightValue };
        editRecord(id, updatedRecord);
      }     
      else if (field == 'date') {
        const updatedRecord = { date: editDateValue };
        editRecord(id, updatedRecord);
      }       
    }
  };

 const handleBlurWeight = (index) => {
    setEditIndex(-1);
    const id = records[index].id;
    const updatedRecord = { weight: editWeightValue };
    editRecord(id, updatedRecord);
  };

  const handleBlurDate = (index) => {
    setEditIndex(-1);
    const id = records[index].id;
    const updatedRecord = { date: editDateValue };
    editRecord(id, updatedRecord);
  };

  return (
    <div className="page">
      <div className="ext-btn">
      <button className="exit-btn btn btn-sm btn-outline-danger" onClick={exit}>Exit</button>
      </div>
      <AddRecordForm onAddRecord={addRecord} />
      <div className="table-cont">
      <h2 className="progr">Progress</h2>
      <table className="table" onClick={handleTableClick}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Weight (kg)</th>
            <th className="th-file">File</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(records) && records.map((record, index) => (
            <tr key={record._id}>
              
              <td style={{ width: '240px' }} className={`input-cell ${
                  editIndex === index ? "editing" : ""
                }`}
                onClick={() => handleEditClick(index, new Date(record.date).toISOString().substring(0, 10), record.weight)}
              >
              {editIndex === index ? (
                <input
                  type="date"
                  value={editDateValue}
                  onChange={handleDateChange}
                  onKeyPress={(event) => handleKeyPress(event, index, 'date')}
                  onBlur={() => handleBlurDate(index)}
                  style={{ width: '120px', height: '22px' }}
                />
              ) : (
                new Date(record.date).toLocaleDateString()
              )}
              </td>

              <td style={{ width: '240px' }} className={`input-cell ${
                  editIndex === index ? "editing" : ""
                }`}
                onClick={() => handleEditClick(index, new Date(record.date).toISOString().substring(0, 10), record.weight)}
              >
              {editIndex === index ? (
                <input
                  type="number"
                  value={editWeightValue}
                  onChange={handleWeightChange}
                  onKeyPress={(event) => handleKeyPress(event, index, 'weight')}
                  onBlur={() => handleBlurWeight(index)}
                  style={{ width: '40px', height: '22px' }}
                />
              ) : (
                record.weight
              )}
              </td>

              <td className="file-cell">
                {record.files && record.files.length > 0 ? (
                  record.files.map((file) => (
                    <div key={file._id}>
                    <a href={`../../uploads/${file.file}`} target="_blank" type="application/octet-stream" style={{ paddingRight: '8px' }}>
                    {file.file}
                    </a>
                  <button className="del-f-btn btn btn-sm btn-outline-danger" onClick={() => deleteFile(file.id)}>-</button>
                  </div>
                  ))
                ) : (
                  'No file'
                )}
              </td>

              <td>
                <button className="del-btn btn btn-sm btn-outline-danger" onClick={() => deleteRecord(record.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export default HomePage;