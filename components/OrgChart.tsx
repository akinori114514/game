
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Employee, CultureType, Role } from '../types';
import { User, Users, Zap, Shield, X, AlertTriangle } from 'lucide-react';

interface OrgChartProps {
  onClose: () => void;
}

const CultureIcon = ({ culture }: { culture: CultureType }) => {
  if (culture === CultureType.INNOVATION) return <Zap size={12} className="text-yellow-400" />;
  return <Shield size={12} className="text-blue-400" />;
};

const RoleBadge = ({ role }: { role: Role }) => {
  let color = 'bg-slate-700';
  if (role === Role.SALES) color = 'bg-emerald-600';
  if (role === Role.ENGINEER) color = 'bg-blue-600';
  if (role === Role.CS) color = 'bg-orange-600';
  if (role === Role.MANAGER) color = 'bg-purple-600';

  return (
    <span className={`text-[10px] px-1 rounded ${color} text-white uppercase`}>
      {role.substring(0, 3)}
    </span>
  );
};

export const OrgChart: React.FC<OrgChartProps> = ({ onClose }) => {
  const { gameState, assignManager } = useGame();
  const { employees, co_founder } = gameState;

  // Logic to build the tree
  // We need to know direct reports for each manager to calculate efficiency
  const getDirectReports = (managerId: string | null) => {
    return employees.filter(e => e.manager_id === managerId);
  };

  const handleDragStart = (e: React.DragEvent, employeeId: string) => {
    e.dataTransfer.setData('employeeId', employeeId);
  };

  const handleDrop = (e: React.DragEvent, newManagerId: string | null) => {
    e.preventDefault();
    const employeeId = e.dataTransfer.getData('employeeId');
    if (employeeId) {
      assignManager(employeeId, newManagerId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Recursive Node Component
  const OrgNode = ({ 
    employeeId, 
    isRoot = false,
    depth = 0
  }: { 
    employeeId: string | null, // null for CEO (Root)
    isRoot?: boolean,
    depth?: number
  }) => {
    // If Root (CEO), we define a virtual object
    let employee: Employee | null = null;
    let culture: CultureType = CultureType.INNOVATION;
    let name = "CEO (あなた)";
    let role = "FOUNDER";

    if (!isRoot && employeeId) {
      employee = employees.find(e => e.id === employeeId) || null;
      if (!employee) return null;
      culture = employee.culture;
      name = employee.name;
      role = employee.role;
    }

    // Children (Direct Reports)
    const children = getDirectReports(employeeId);
    
    // 7-Person Rule Check
    const isOverloaded = children.length > 7;
    
    // Culture Clash Check (Only for non-root)
    let isCultureClash = false;
    if (employee && employee.manager_id) {
         const manager = employees.find(e => e.id === employee.manager_id);
         if (manager && manager.culture !== employee.culture) {
             isCultureClash = true;
         }
    }

    return (
      <div className="flex flex-col items-center">
        {/* Card */}
        <div 
          draggable={!isRoot}
          onDragStart={(e) => !isRoot && employeeId && handleDragStart(e, employeeId)}
          onDrop={(e) => handleDrop(e, employeeId)}
          onDragOver={handleDragOver}
          className={`
            relative w-48 p-3 rounded-lg border-2 transition-all flex flex-col gap-2 bg-slate-800 z-10
            ${isOverloaded ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse' : 'border-slate-600 hover:border-indigo-500'}
            ${isRoot ? 'bg-indigo-900/20 border-indigo-500' : ''}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                 {isRoot ? <User size={16} className="text-indigo-400"/> : <RoleBadge role={role as Role} />}
                 <span className="text-xs font-bold text-white truncate max-w-[80px]">{name}</span>
             </div>
             {!isRoot && <CultureIcon culture={culture} />}
          </div>

          {/* Stats / Info */}
          <div className="text-[10px] text-slate-400 flex justify-between items-center">
             <span>部下: {children.length}名</span>
             {isOverloaded && <span className="text-red-500 font-bold flex items-center"><AlertTriangle size={10} className="mr-1"/> OVERLOAD</span>}
          </div>

          {/* Alerts */}
          {isCultureClash && (
              <div className="absolute -top-2 -right-2 bg-yellow-900 text-yellow-200 text-[9px] px-2 py-0.5 rounded-full border border-yellow-500 flex items-center">
                  <Zap size={10} className="mr-1" /> Clash
              </div>
          )}
        </div>

        {/* Connecting Line */}
        {children.length > 0 && (
          <div className="flex flex-col items-center w-full">
            <div className="w-px h-4 bg-slate-600"></div>
            <div className="flex justify-center gap-4 relative">
               {/* Horizontal Line for multiple children */}
               {children.length > 1 && (
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-12rem)] h-px bg-slate-600 hidden md:block"></div>
               )}
               
               <div className="flex flex-wrap justify-center gap-4">
                   {children.map(child => (
                       <OrgNode key={child.id} employeeId={child.id} depth={depth + 1} />
                   ))}
               </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
            <div className="bg-indigo-500/20 p-2 rounded text-indigo-400">
                <Users size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">組織図パズル (Org Chart)</h2>
                <p className="text-xs text-slate-400">ドラッグ＆ドロップで指揮命令系統を構築してください。</p>
            </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-400 mr-8">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 border border-red-500 block"></span>
                <span>7人ルール (効率低下)</span>
            </div>
            <div className="flex items-center gap-2">
                <Zap size={12} className="text-yellow-400" />
                <span>文化不一致 (ストレス増)</span>
            </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
            <X size={24} />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">
         <div className="min-w-max flex justify-center">
             <OrgNode employeeId={null} isRoot={true} />
         </div>
      </div>
    </div>
  );
};
