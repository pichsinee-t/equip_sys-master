import React, { useState } from 'react';

const Bring = () => {
  const [formData, setFormData] = useState({
    name: '',
    equipment: '',
    quantity: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('เบิกอุปกรณ์เรียบร้อยแล้ว!');
    // Reset form
    setFormData({
      name: '',
      equipment: '',
      quantity: 1,
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>แบบฟอร์มเบิกอุปกรณ์</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            ชื่อผู้เบิก:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            รายการอุปกรณ์:
            <input
              type="text"
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
              required
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            จำนวน:
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              required
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
        <button type="submit" style={{ padding: '5px 10px' }}>
          เบิกอุปกรณ์
        </button>
      </form>
    </div>
  );
};

export default Bring;