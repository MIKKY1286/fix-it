import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { FiPlus, FiTrash2, FiRefreshCw } from 'react-icons/fi';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [parent, setParent] = useState('Home Services');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      setCategories(list);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name) return;
    const cleanId = name.trim().toLowerCase().replace(/\s+/g, '-');
    const newCat = {
      name,
      parent,
      count: 0
    };
    try {
      await setDoc(doc(db, 'categories', cleanId), newCat);
      setCategories(prev => [...prev, { id: cleanId, ...newCat }]);
      setName('');
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service category?')) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-secondary">System Service Categories</h1>
          <p className="text-xs text-secondary/45 mt-0.5">Manage directory categories, listing counts, and parent sectors.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchCategories}
            className="text-xs font-semibold text-primary flex items-center gap-1.5 hover:underline cursor-pointer bg-white px-3 py-2 border border-secondary/5 rounded-xl shadow-sm"
          >
            <FiRefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Sync
          </button>
          <Button variant="primary" size="sm" onClick={() => setIsOpen(true)} className="flex items-center gap-1">
            <FiPlus /> Add Category
          </Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <Card className="p-12 text-center text-xs text-secondary/40">
          <FiRefreshCw className="animate-spin mx-auto mb-2 text-primary" size={20} />
          Syncing service categories...
        </Card>
      ) : categories.length === 0 ? (
        <Card glass={true} className="p-12 text-center text-secondary/40 text-xs">
          No categories found.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((c) => (
            <Card key={c.id} hoverable={true} className="p-6 bg-white border-secondary/5 flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <h4 className="text-[10px] font-bold text-secondary/40 uppercase tracking-wider">{c.parent}</h4>
                <p className="text-sm font-extrabold text-secondary truncate">{c.name}</p>
                <p className="text-[10px] text-secondary/50">{c.count} Trades registered</p>
              </div>
              <button 
                onClick={() => handleDelete(c.id)}
                className="p-1.5 rounded-lg hover:bg-danger/5 text-secondary/40 hover:text-danger cursor-pointer"
              >
                <FiTrash2 size={14} />
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Platform Category"
        size="sm"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Input 
            label="Category Title"
            placeholder="e.g. CCTV Installer"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-secondary/50 uppercase">Parent sector</label>
            <select
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              className="w-full bg-white text-secondary text-xs border border-secondary/10 rounded-xl px-3 py-2.5 outline-none hover:border-secondary/20 transition-all duration-200"
            >
              <option value="Home Services">Home Services</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Technology">Technology</option>
              <option value="Automobile">Automobile</option>
              <option value="Beauty">Beauty</option>
              <option value="Construction">Construction</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-secondary/5">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={!name}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
