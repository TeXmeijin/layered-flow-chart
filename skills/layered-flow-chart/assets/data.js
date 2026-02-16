const LEVELS = {
  root: {
    title: 'Example Flow',
    description: 'Click nodes to drill down into details',
    nodes: [
      { id: 'step-a', title: 'Step A', description: 'First step', icon: '1', color: '#3B82F6', x: 20, y: 50, techs: ['Tech1'], file: 'src/a.ts', hasChildren: true },
      { id: 'step-b', title: 'Step B', description: 'Second step', icon: '2', color: '#F59E0B', x: 50, y: 50, techs: ['Tech2'], file: 'src/b.ts', hasChildren: false },
      { id: 'step-c', title: 'Step C', description: 'Third step', icon: '3', color: '#10B981', x: 80, y: 50, techs: ['Tech3'], file: 'src/c.ts', hasChildren: false },
    ],
    connections: [
      { from: 'step-a', to: 'step-b' },
      { from: 'step-b', to: 'step-c' },
    ]
  },
  'step-a': {
    title: 'Step A Details',
    description: 'Drill-down view of Step A',
    nodes: [
      { id: 'a1', title: 'Sub-step A1', description: 'Detail 1', icon: 'a', color: '#3B82F6', x: 20, y: 50, techs: ['Lib'], file: 'a1.ts' },
      { id: 'a2', title: 'Sub-step A2', description: 'Detail 2', icon: 'b', color: '#3B82F6', x: 50, y: 50, techs: ['Lib'], file: 'a2.ts' },
      { id: 'a3', title: 'Sub-step A3', description: 'Detail 3', icon: 'c', color: '#3B82F6', x: 80, y: 50, techs: ['Lib'], file: 'a3.ts' },
    ],
    connections: [
      { from: 'a1', to: 'a2' },
      { from: 'a2', to: 'a3' },
    ]
  },
};

const HEADER_LOGO = 'Flow Chart';
document.title = 'Example Flow | Layered Flow Chart';
