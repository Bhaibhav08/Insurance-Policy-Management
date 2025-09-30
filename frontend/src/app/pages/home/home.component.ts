import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  features = [
    {
      icon: '🛡️',
      title: 'Comprehensive Coverage',
      description: 'Protect what matters most with our wide range of insurance policies designed for every need.'
    },
    {
      icon: '⚡',
      title: 'Quick Claims Processing',
      description: 'Fast and efficient claims processing with 24/7 support to get you back on track quickly.'
    },
    {
      icon: '💰',
      title: 'Competitive Premiums',
      description: 'Affordable insurance solutions with flexible payment options to fit your budget.'
    },
    {
      icon: '📱',
      title: 'Digital Management',
      description: 'Manage your policies, file claims, and make payments all from one convenient platform.'
    }
  ];

  policyCategories = [
    {
      name: 'Life Insurance',
      description: 'Secure your family\'s future with comprehensive life coverage',
      icon: '👨‍👩‍👧‍👦',
      color: 'bg-blue-500'
    },
    {
      name: 'Health Insurance',
      description: 'Protect your health and well-being with our medical coverage',
      icon: '🏥',
      color: 'bg-green-500'
    },
    {
      name: 'Auto Insurance',
      description: 'Drive with confidence knowing you\'re fully protected',
      icon: '🚗',
      color: 'bg-red-500'
    },
    {
      name: 'Home Insurance',
      description: 'Safeguard your home and belongings from unexpected events',
      icon: '🏠',
      color: 'bg-purple-500'
    }
  ];
}
