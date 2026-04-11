import { Task, ShoppingItem, AISuggestion } from '../types';

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];
const in2 = new Date(Date.now() + 2 * 86_400_000).toISOString().split('T')[0];

export const DEMO_TASKS: Task[] = [
  { id: 1, title: 'Réunion d\'équipe', date: today, time: '10:00', completed: 1, priority: 'high', category: 'travail', ai_suggested: 0, created_at: '', updated_at: '' },
  { id: 2, title: 'Faire les courses', date: today, completed: 0, priority: 'high', category: 'courses', ai_suggested: 0, created_at: '', updated_at: '' },
  { id: 3, title: 'Appeler le médecin', date: today, time: '14:00', completed: 0, priority: 'medium', category: 'santé', ai_suggested: 0, created_at: '', updated_at: '' },
  { id: 4, title: 'Yoga du matin', date: tomorrow, time: '07:30', completed: 0, priority: 'low', category: 'santé', ai_suggested: 0, created_at: '', updated_at: '' },
  { id: 5, title: 'Dîner en famille', date: tomorrow, time: '19:00', completed: 0, priority: 'medium', category: 'loisirs', ai_suggested: 0, created_at: '', updated_at: '' },
  { id: 6, title: 'Préparer présentation', date: in2, completed: 0, priority: 'high', category: 'travail', ai_suggested: 0, created_at: '', updated_at: '' },
];

export const DEMO_SHOPPING: ShoppingItem[] = [
  { id: 1, name: 'Lait', quantity: '2L', category: 'Produits laitiers', completed: 0, recurring: 1, created_at: '' },
  { id: 2, name: 'Pain', quantity: '1 baguette', category: 'Boulangerie', completed: 1, recurring: 0, created_at: '' },
  { id: 3, name: 'Tomates', quantity: '500g', category: 'Fruits & Légumes', completed: 0, recurring: 0, created_at: '' },
  { id: 4, name: 'Fromage', quantity: '200g', category: 'Produits laitiers', completed: 0, recurring: 0, created_at: '' },
  { id: 5, name: 'Pâtes', quantity: '500g', category: 'Épicerie', completed: 0, recurring: 0, created_at: '' },
  { id: 6, name: 'Détergent', quantity: '1', category: 'Entretien', completed: 0, recurring: 1, created_at: '' },
];

export const DEMO_SUGGESTIONS: AISuggestion[] = [
  { title: 'Passer l\'aspirateur', category: 'maison', priority: 'low', ai_suggested: 1 },
  { title: 'Arroser les plantes', category: 'maison', priority: 'low', ai_suggested: 1 },
  { title: 'Préparer les repas de la semaine', category: 'maison', priority: 'medium', ai_suggested: 1 },
];
