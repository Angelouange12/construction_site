/**
 * Seed script to populate database with initial data
 * Run with: node src/utils/seedData.js
 */

require('dotenv').config();
const { 
  syncDatabase, 
  User, Site, Task, Worker, Material, Budget, 
  Attendance, Expense, Incident, Notification,
  Assignment, CalendarEvent
} = require('../models');

const seedData = async () => {
  try {
    // Reset database
    await syncDatabase(true);
    console.log('Database reset complete');

    // Create admin user
    const admin = await User.create({
      email: 'admin@construction.com',
      password: 'admin123',
      name: 'Administrateur Système',
      role: 'admin',
      phone: '+257 79 100 000',
      city: 'Bujumbura',
      country: 'Burundi'
    });
    console.log('Admin user created');

    // Create chef de chantier
    const chef = await User.create({
      email: 'chef@construction.com',
      password: 'chef123',
      name: 'Jean-Pierre Ndayisaba',
      role: 'chef_chantier',
      phone: '+257 79 200 100',
      city: 'Bujumbura',
      country: 'Burundi'
    });
    console.log('Chef de chantier created');

    // Create ouvrier user
    const ouvrier = await User.create({
      email: 'ouvrier@construction.com',
      password: 'ouvrier123',
      name: 'Emmanuel Niyonzima',
      role: 'ouvrier',
      phone: '+257 79 300 200',
      city: 'Bujumbura',
      country: 'Burundi'
    });
    console.log('Ouvrier user created');

    // Create sites in Burundi
    const site1 = await Site.create({
      name: 'Tour Bujumbura City',
      description: 'Construction d\'un immeuble de bureaux de 12 étages au centre-ville',
      location: 'Bujumbura, Burundi',
      status: 'in_progress',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      progress: 35,
      managerId: chef.id
    });

    const site2 = await Site.create({
      name: 'Résidence Les Jardins de Gitega',
      description: 'Construction de 24 unités résidentielles modernes',
      location: 'Gitega, Burundi',
      status: 'in_progress',
      startDate: '2024-03-01',
      endDate: '2025-06-30',
      progress: 15,
      managerId: chef.id
    });

    const site3 = await Site.create({
      name: 'Centre Commercial Ngozi',
      description: 'Nouveau centre commercial avec parking souterrain',
      location: 'Ngozi, Burundi',
      status: 'planning',
      startDate: '2024-06-01',
      endDate: '2026-01-15',
      progress: 0,
      managerId: admin.id
    });
    console.log('Sites created');

    // Create budgets in BIF (Burundian Franc)
    await Budget.create({
      siteId: site1.id,
      plannedAmount: 5000000000, // 5 billion BIF
      actualAmount: 1750000000,
      materialBudget: 2000000000,
      laborBudget: 2400000000,
      equipmentBudget: 400000000,
      contingency: 200000000
    });

    await Budget.create({
      siteId: site2.id,
      plannedAmount: 9000000000,
      actualAmount: 1350000000,
      materialBudget: 4000000000,
      laborBudget: 4000000000,
      equipmentBudget: 700000000,
      contingency: 300000000
    });

    await Budget.create({
      siteId: site3.id,
      plannedAmount: 30000000000,
      actualAmount: 0,
      materialBudget: 14000000000,
      laborBudget: 12000000000,
      equipmentBudget: 3000000000,
      contingency: 1000000000
    });
    console.log('Budgets created');

    // Create workers with Burundian names
    const worker1 = await Worker.create({
      name: 'Pierre Habimana',
      phone: '+257 79 111 222',
      email: 'pierre.habimana@email.com',
      specialty: 'Maçon',
      hourlyRate: 5000, // BIF per hour
      siteId: site1.id,
      userId: ouvrier.id,
      city: 'Bujumbura'
    });

    const worker2 = await Worker.create({
      name: 'Marie Uwimana',
      phone: '+257 79 222 333',
      specialty: 'Électricien',
      hourlyRate: 6000,
      siteId: site1.id,
      city: 'Bujumbura'
    });

    const worker3 = await Worker.create({
      name: 'Thaddée Bizimana',
      phone: '+257 79 333 444',
      specialty: 'Plombier',
      hourlyRate: 5500,
      siteId: site1.id,
      city: 'Bujumbura'
    });

    const worker4 = await Worker.create({
      name: 'Claudine Niyonsaba',
      phone: '+257 79 444 555',
      specialty: 'Peintre',
      hourlyRate: 4500,
      siteId: site2.id,
      city: 'Gitega'
    });

    const worker5 = await Worker.create({
      name: 'Léonidas Ndayisaba',
      phone: '+257 79 555 666',
      specialty: 'Charpentier',
      hourlyRate: 5200,
      siteId: site2.id,
      city: 'Gitega'
    });
    console.log('Workers created');

    // Create tasks
    const task1 = await Task.create({
      title: 'Démolition cloisons existantes',
      description: 'Démolition des cloisons non porteuses étage 5',
      priority: 'high',
      status: 'completed',
      progress: 100,
      startDate: '2024-01-20',
      dueDate: '2024-02-15',
      siteId: site1.id,
      workerId: worker1.id
    });

    const task2 = await Task.create({
      title: 'Installation réseau électrique',
      description: 'Mise aux normes du réseau électrique étage 5',
      priority: 'high',
      status: 'in_progress',
      progress: 60,
      startDate: '2024-02-20',
      dueDate: '2024-04-30',
      siteId: site1.id,
      workerId: worker2.id
    });

    const task3 = await Task.create({
      title: 'Rénovation plomberie',
      description: 'Remplacement canalisations sanitaires',
      priority: 'medium',
      status: 'in_progress',
      progress: 40,
      startDate: '2024-03-01',
      dueDate: '2024-05-15',
      siteId: site1.id,
      workerId: worker3.id
    });

    const task4 = await Task.create({
      title: 'Coulage fondations bâtiment A',
      description: 'Fondations pour le bâtiment principal',
      priority: 'high',
      status: 'in_progress',
      progress: 75,
      startDate: '2024-03-05',
      dueDate: '2024-04-01',
      siteId: site2.id,
      workerId: worker4.id
    });

    const task5 = await Task.create({
      title: 'Montage charpente',
      description: 'Structure bois du bâtiment A',
      priority: 'medium',
      status: 'pending',
      progress: 0,
      startDate: '2024-04-15',
      dueDate: '2024-06-01',
      siteId: site2.id,
      workerId: worker5.id
    });
    console.log('Tasks created');

    // Create materials
    await Material.create({
      name: 'Ciment Portland',
      description: 'Ciment haute résistance 42.5',
      unit: 'sac (50kg)',
      unitPrice: 28000, // BIF
      stockQuantity: 500,
      alertThreshold: 100,
      supplier: 'BUCECO'
    });

    await Material.create({
      name: 'Câble électrique 2.5mm²',
      description: 'Câble rigide H07V-U',
      unit: 'mètre',
      unitPrice: 2500,
      stockQuantity: 2000,
      alertThreshold: 500,
      supplier: 'Electro Burundi'
    });

    await Material.create({
      name: 'Tube PVC 16mm',
      description: 'Tube PVC pour plomberie',
      unit: 'mètre',
      unitPrice: 8500,
      stockQuantity: 45, // Low stock to trigger alert
      alertThreshold: 50,
      supplier: 'Plomburundi'
    });

    await Material.create({
      name: 'Peinture blanche',
      description: 'Peinture acrylique mat',
      unit: 'pot (20L)',
      unitPrice: 150000,
      stockQuantity: 8, // Low stock to trigger alert
      alertThreshold: 10,
      supplier: 'Crown Paints'
    });

    await Material.create({
      name: 'Parpaing 20x20x40',
      description: 'Bloc béton creux',
      unit: 'unité',
      unitPrice: 700,
      stockQuantity: 3000,
      alertThreshold: 500,
      supplier: 'Briqueterie de Bujumbura'
    });
    console.log('Materials created');

    // Create attendance records
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    await Attendance.create({
      workerId: worker1.id,
      siteId: site1.id,
      date: today,
      checkIn: '07:00',
      checkOut: '16:00',
      hoursWorked: 9,
      status: 'present'
    });

    await Attendance.create({
      workerId: worker2.id,
      siteId: site1.id,
      date: today,
      checkIn: '07:30',
      checkOut: '16:30',
      hoursWorked: 9,
      status: 'present'
    });

    await Attendance.create({
      workerId: worker3.id,
      siteId: site1.id,
      date: today,
      checkIn: '08:15',
      status: 'late'
    });

    // Yesterday's attendance
    await Attendance.create({
      workerId: worker1.id,
      siteId: site1.id,
      date: yesterday,
      checkIn: '07:00',
      checkOut: '17:00',
      hoursWorked: 10,
      overtimeHours: 2,
      status: 'present'
    });

    await Attendance.create({
      workerId: worker2.id,
      siteId: site1.id,
      date: yesterday,
      checkIn: '07:00',
      checkOut: '16:00',
      hoursWorked: 9,
      overtimeHours: 1,
      status: 'present'
    });
    console.log('Attendance records created');

    // Create expenses in BIF
    await Expense.create({
      description: 'Achat ciment - Livraison 1',
      amount: 14000000, // BIF
      category: 'material',
      status: 'approved',
      siteId: site1.id,
      expenseDate: '2024-02-01',
      isApproved: true,
      approvedBy: chef.id
    });

    await Expense.create({
      description: 'Location grue mobile',
      amount: 5000000,
      category: 'equipment',
      status: 'approved',
      siteId: site1.id,
      expenseDate: '2024-02-15',
      isApproved: true,
      approvedBy: chef.id
    });

    await Expense.create({
      description: 'Salaires semaine 8',
      amount: 8750000,
      category: 'labor',
      status: 'approved',
      siteId: site1.id,
      expenseDate: '2024-02-23',
      isApproved: true,
      approvedBy: admin.id
    });

    await Expense.create({
      description: 'Transport matériaux',
      amount: 1500000,
      category: 'transport',
      status: 'pending',
      siteId: site2.id,
      expenseDate: '2024-03-05',
      isApproved: false
    });

    await Expense.create({
      description: 'Équipement de sécurité',
      amount: 3500000,
      category: 'equipment',
      status: 'pending',
      siteId: site1.id,
      expenseDate: today,
      isApproved: false
    });
    console.log('Expenses created');

    // Create incidents
    await Incident.create({
      title: 'Chute de matériel',
      description: 'Un sac de ciment est tombé du 3ème étage. Zone sécurisée immédiatement.',
      severity: 'medium',
      status: 'resolved',
      siteId: site1.id,
      reportedBy: chef.id,
      incidentDate: '2024-02-10',
      incidentTime: '14:30',
      injuriesCount: 0,
      actionTaken: 'Installation de filets de protection supplémentaires'
    });

    await Incident.create({
      title: 'Coupure électrique',
      description: 'Court-circuit lors des travaux de câblage',
      severity: 'low',
      status: 'resolved',
      siteId: site1.id,
      reportedBy: ouvrier.id,
      incidentDate: '2024-03-01',
      incidentTime: '10:15',
      injuriesCount: 0,
      actionTaken: 'Remplacement du disjoncteur défaillant'
    });

    await Incident.create({
      title: 'Blessure légère',
      description: 'Un ouvrier s\'est coupé la main avec un outil',
      severity: 'high',
      status: 'investigating',
      siteId: site2.id,
      reportedBy: chef.id,
      incidentDate: today,
      incidentTime: '09:45',
      injuriesCount: 1
    });
    console.log('Incidents created');

    // Create notifications
    await Notification.create({
      userId: admin.id,
      type: 'low_stock',
      title: 'Alerte Stock Bas',
      message: 'Le stock de Tube PVC 16mm est faible (45 restants)',
      priority: 'high',
      link: '/materials'
    });

    await Notification.create({
      userId: admin.id,
      type: 'expense_pending',
      title: 'Dépense en Attente',
      message: 'La dépense Transport matériaux (1,500,000 BIF) nécessite votre approbation',
      priority: 'medium',
      link: '/expenses'
    });

    await Notification.create({
      userId: chef.id,
      type: 'incident_reported',
      title: 'Nouvel Incident Signalé',
      message: 'Un incident de gravité ÉLEVÉE a été signalé à Résidence Les Jardins de Gitega',
      priority: 'urgent',
      link: '/incidents'
    });

    await Notification.create({
      userId: chef.id,
      type: 'task_assigned',
      title: 'Tâches Mises à Jour',
      message: '2 tâches sont en cours à Tour Bujumbura City',
      priority: 'low',
      isRead: true,
      link: '/tasks'
    });
    console.log('Notifications created');

    // Create assignments
    await Assignment.create({
      assigneeType: 'worker',
      assigneeId: worker1.id,
      entityType: 'site',
      entityId: site1.id,
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      status: 'active',
      hoursPerDay: 8,
      assignedBy: chef.id
    });

    await Assignment.create({
      assigneeType: 'worker',
      assigneeId: worker2.id,
      entityType: 'site',
      entityId: site1.id,
      startDate: '2024-02-01',
      endDate: '2024-06-30',
      status: 'active',
      hoursPerDay: 8,
      assignedBy: chef.id
    });

    await Assignment.create({
      assigneeType: 'worker',
      assigneeId: worker4.id,
      entityType: 'site',
      entityId: site2.id,
      startDate: '2024-03-01',
      status: 'active',
      hoursPerDay: 8,
      assignedBy: chef.id
    });
    console.log('Assignments created');

    // Create calendar events
    await CalendarEvent.create({
      title: 'Réunion Hebdomadaire',
      description: 'Revue de l\'avancement et planification de la semaine suivante',
      eventType: 'meeting',
      startDate: new Date(),
      endDate: new Date(Date.now() + 3600000),
      siteId: site1.id,
      createdBy: chef.id,
      color: '#8b5cf6'
    });

    await CalendarEvent.create({
      title: 'Inspection de Sécurité',
      description: 'Inspection mensuelle de conformité sécurité',
      eventType: 'inspection',
      startDate: new Date(Date.now() + 86400000 * 3),
      endDate: new Date(Date.now() + 86400000 * 3 + 7200000),
      siteId: site1.id,
      createdBy: admin.id,
      color: '#f59e0b'
    });

    await CalendarEvent.create({
      title: 'Livraison de Matériaux',
      description: 'Livraison de ciment et acier',
      eventType: 'delivery',
      startDate: new Date(Date.now() + 86400000 * 2),
      endDate: new Date(Date.now() + 86400000 * 2),
      allDay: true,
      siteId: site2.id,
      createdBy: chef.id,
      color: '#10b981'
    });
    console.log('Calendar events created');

    console.log('\n========================================');
    console.log('Base de données initialisée avec succès!');
    console.log('========================================');
    console.log('\nComptes de test:');
    console.log('  Admin:   admin@construction.com / admin123');
    console.log('  Chef:    chef@construction.com / chef123');
    console.log('  Ouvrier: ouvrier@construction.com / ouvrier123');
    console.log('\nLocalisation: Burundi');
    console.log('Fuseau horaire: Africa/Bujumbura (CAT)');
    console.log('Monnaie: BIF (Franc Burundais)');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
