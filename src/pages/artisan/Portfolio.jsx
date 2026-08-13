import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { FiFolder, FiPlus, FiTrash2 } from 'react-icons/fi';

const Portfolio = () => {
  const [projects, setProjects] = useState([
    { id: '1', name: '5KVA Hybrid Solar Installation', desc: 'Full solar panel array, smart hybrid inverter bypass configurations on double phase wiring in Lekki Phase 1.', date: 'July 2026' }
  ]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!name || !desc) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setProjects([
        ...projects,
        { id: `p-${Math.random()}`, name, desc, date: 'Today' }
      ]);
      setName('');
      setDesc('');
      setIsSubmitting(false);
    }, 800);
  };

  const handleDeleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-secondary">Artisan Portfolio Manager</h1>
        <p className="text-xs text-secondary/45 mt-0.5">Showcase completed project references and job credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Add Project */}
        <div className="lg:col-span-1">
          <Card hoverable={false} className="p-6 bg-white border-secondary/5 space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest pb-3 border-b border-secondary/5">
              Add Project Item
            </h3>

            <form onSubmit={handleAddProject} className="space-y-4">
              <Input 
                label="Project Title"
                placeholder="e.g. 5KVA Solar Panel Array Setup"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-secondary/50 uppercase">Project Description</label>
                <textarea
                  rows={4}
                  placeholder="Details of cabling work, system balancing, and resolving customer pain points..."
                  className="w-full bg-white text-secondary text-sm border border-secondary/10 hover:border-secondary/20 transition-all rounded-xl p-3 outline-none focus:border-primary"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-1.5 py-3.5" loading={isSubmitting}>
                <FiPlus /> Add to Portfolio
              </Button>
            </form>
          </Card>
        </div>

        {/* Right List: Showcase Projects */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Showcased Projects</h3>
          
          <div className="space-y-4">
            {projects.length === 0 ? (
              <Card glass={true} className="p-8 text-center text-xs text-secondary/40">
                Your portfolio is empty. List your recent assignments to gain client visibility.
              </Card>
            ) : (
              projects.map((p) => (
                <Card key={p.id} hoverable={false} className="p-6 bg-white border-secondary/5 flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FiFolder className="text-primary" />
                      <h4 className="text-sm font-extrabold text-secondary">{p.name}</h4>
                    </div>
                    <p className="text-xs text-secondary/60 leading-relaxed">{p.desc}</p>
                    <span className="text-[10px] text-secondary/40 font-bold uppercase">{p.date}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteProject(p.id)}
                    className="p-1.5 rounded-lg hover:bg-danger/5 text-secondary/40 hover:text-danger transition-colors duration-150"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
