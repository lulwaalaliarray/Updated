export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorId: string;
  date: string;
  category: string;
  readTime: string;
  tags: string[];
  published: boolean;
}

const BLOG_STORAGE_KEY = 'patientcare_blogs';

// Default blog posts
const defaultBlogs: BlogPost[] = [
  {
    id: '1',
    title: '5 Tips for Managing Your Health in Bahrain\'s Climate',
    excerpt: 'Learn how to stay healthy during Bahrain\'s hot summers and maintain your wellness year-round.',
    content: `
# 5 Tips for Managing Your Health in Bahrain's Climate

Living in Bahrain's unique climate presents both opportunities and challenges for maintaining optimal health. The hot, humid summers and mild winters require specific strategies to keep your body functioning at its best.

## 1. Stay Hydrated Throughout the Day

The most crucial aspect of health management in Bahrain is proper hydration. With temperatures often exceeding 40°C (104°F) in summer, your body loses water rapidly through perspiration.

**Key hydration tips:**
- Drink at least 3-4 liters of water daily during summer months
- Start your day with a large glass of water
- Carry a water bottle wherever you go
- Avoid excessive caffeine and alcohol, which can dehydrate you
- Include water-rich foods like watermelon, cucumber, and oranges in your diet

## 2. Time Your Outdoor Activities Wisely

The intense heat during midday hours (10 AM to 4 PM) can be dangerous for outdoor activities. Plan your exercise and outdoor tasks during cooler parts of the day.

**Best practices:**
- Exercise early morning (5-7 AM) or evening (6-8 PM)
- Use covered walkways and air-conditioned spaces when possible
- Wear light-colored, loose-fitting clothing
- Always wear sunscreen with SPF 30 or higher

## 3. Maintain Indoor Air Quality

With air conditioning running constantly, indoor air quality becomes crucial for respiratory health.

**Indoor health tips:**
- Clean AC filters regularly
- Use air purifiers if needed
- Maintain humidity levels between 40-60%
- Ensure proper ventilation
- Keep indoor plants to improve air quality

## 4. Adapt Your Diet to the Climate

Your nutritional needs change with the climate. Focus on foods that help your body cope with heat and humidity.

**Climate-appropriate nutrition:**
- Eat lighter, more frequent meals
- Include cooling foods like yogurt, mint, and leafy greens
- Reduce heavy, hot foods during peak summer
- Increase intake of electrolyte-rich foods
- Consider vitamin D supplements due to limited sun exposure

## 5. Prioritize Sleep and Recovery

The climate can affect your sleep patterns and recovery. Create an environment conducive to quality rest.

**Sleep optimization:**
- Keep bedroom temperature between 18-22°C (64-72°F)
- Use blackout curtains to block intense sunlight
- Maintain consistent sleep schedule despite climate changes
- Consider a humidifier if air is too dry
- Take short afternoon naps if needed to combat heat fatigue

## Conclusion

Managing your health in Bahrain's climate requires awareness and adaptation. By following these evidence-based strategies, you can maintain optimal health year-round. Remember to consult with healthcare professionals for personalized advice, especially if you have pre-existing conditions.

Stay healthy, stay hydrated, and embrace the unique lifestyle that Bahrain's climate offers!
    `,
    author: 'Dr. Fatima Al-Khalifa',
    authorId: 'doctor_1',
    date: '2024-03-10',
    category: 'Health Tips',
    readTime: '5 min read',
    tags: ['health', 'climate', 'bahrain', 'wellness', 'hydration'],
    published: true
  },
  {
    id: '2',
    title: 'Understanding Your Health Insurance Options in Bahrain',
    excerpt: 'A comprehensive guide to navigating health insurance plans and maximizing your healthcare benefits.',
    content: `
# Understanding Your Health Insurance Options in Bahrain

Navigating the healthcare system in Bahrain can be complex, especially when it comes to understanding your insurance options. This comprehensive guide will help you make informed decisions about your health coverage.

## Overview of Bahrain's Healthcare System

Bahrain offers a dual healthcare system with both public and private options. Understanding how these work together is crucial for maximizing your healthcare benefits.

### Public Healthcare
- Provided by the Ministry of Health
- Available to all Bahraini citizens
- Subsidized rates for expatriates
- Comprehensive coverage for basic medical needs

### Private Healthcare
- Higher quality facilities and shorter wait times
- More specialized services
- English-speaking staff
- Premium pricing

## Types of Health Insurance Plans

### 1. Basic Coverage Plans
These plans cover essential medical services and are often the most affordable option.

**What's typically covered:**
- General practitioner visits
- Basic diagnostic tests
- Emergency care
- Prescription medications (generic)

**Limitations:**
- Limited specialist access
- Basic room accommodations
- Longer waiting periods

### 2. Comprehensive Coverage Plans
These plans offer extensive coverage with more flexibility and premium services.

**Enhanced benefits:**
- Specialist consultations without referrals
- Private room accommodations
- Advanced diagnostic procedures
- Dental and vision coverage
- Maternity benefits

### 3. Premium Plans
Top-tier coverage with maximum flexibility and luxury amenities.

**Premium features:**
- Access to top specialists
- International coverage
- Concierge medical services
- Alternative medicine coverage
- Executive health check-ups

## Key Factors to Consider

### 1. Network Coverage
Ensure your preferred doctors and hospitals are in-network to avoid higher costs.

### 2. Pre-existing Conditions
Understand waiting periods and coverage limitations for pre-existing conditions.

### 3. Family Coverage
Consider family plans if you have dependents - often more cost-effective than individual plans.

### 4. Annual Limits
Check for annual or lifetime benefit limits that might affect your coverage.

### 5. Deductibles and Co-pays
Understand your out-of-pocket costs for different services.

## Tips for Maximizing Your Benefits

1. **Use Preventive Care**: Most plans cover annual check-ups and screenings at no cost
2. **Stay In-Network**: Use network providers to minimize costs
3. **Keep Records**: Maintain detailed records of all medical expenses
4. **Understand Your Benefits**: Read your policy documents thoroughly
5. **Use Generic Medications**: When possible, opt for generic alternatives

## Common Mistakes to Avoid

- Not reading the fine print
- Assuming all services are covered
- Ignoring network restrictions
- Not updating beneficiary information
- Delaying necessary care due to cost concerns

## Conclusion

Choosing the right health insurance plan requires careful consideration of your needs, budget, and preferences. Take time to compare options and don't hesitate to ask questions. Your health is your most valuable asset - invest in it wisely.

For personalized advice, consult with insurance brokers or healthcare professionals who understand the Bahraini healthcare landscape.
    `,
    author: 'Ahmed Al-Mansouri',
    authorId: 'admin_1',
    date: '2024-03-05',
    category: 'Insurance',
    readTime: '8 min read',
    tags: ['insurance', 'healthcare', 'bahrain', 'coverage', 'benefits'],
    published: true
  },
  {
    id: '3',
    title: 'The Future of Telemedicine in the Gulf Region',
    excerpt: 'Exploring how digital health technologies are transforming healthcare delivery across the GCC.',
    content: `
# The Future of Telemedicine in the Gulf Region

The Gulf Cooperation Council (GCC) countries are at the forefront of adopting innovative healthcare technologies. Telemedicine, in particular, is revolutionizing how healthcare is delivered across the region.

## Current State of Telemedicine in the GCC

The COVID-19 pandemic accelerated the adoption of telemedicine across the Gulf region. Countries like the UAE, Saudi Arabia, and Bahrain have made significant investments in digital health infrastructure.

### Key Statistics:
- 300% increase in telemedicine usage since 2020
- Over 50% of routine consultations now conducted remotely
- 85% patient satisfaction rate with telehealth services
- $2.3 billion invested in digital health initiatives across GCC

## Technological Innovations Driving Change

### 1. AI-Powered Diagnostics
Artificial intelligence is enhancing diagnostic accuracy and speed:
- Automated image analysis for radiology
- AI-assisted symptom assessment
- Predictive analytics for early disease detection
- Machine learning algorithms for treatment recommendations

### 2. Wearable Health Devices
Integration of consumer health devices with healthcare systems:
- Continuous monitoring of vital signs
- Real-time health data transmission
- Early warning systems for health emergencies
- Personalized health insights and recommendations

### 3. Virtual Reality in Healthcare
VR technology is being used for:
- Medical training and education
- Pain management and therapy
- Surgical planning and simulation
- Mental health treatment

## Benefits for Patients and Providers

### For Patients:
- **Convenience**: Access healthcare from home
- **Reduced Costs**: Lower transportation and time costs
- **Better Access**: Reach specialists regardless of location
- **Continuity of Care**: Consistent follow-up and monitoring
- **Privacy**: Discreet consultations for sensitive conditions

### For Healthcare Providers:
- **Efficiency**: See more patients in less time
- **Cost Reduction**: Lower overhead costs
- **Better Resource Allocation**: Focus on critical cases
- **Data-Driven Insights**: Better patient outcomes through data analysis
- **Expanded Reach**: Serve patients across wider geographic areas

## Challenges and Solutions

### 1. Regulatory Framework
**Challenge**: Varying regulations across GCC countries
**Solution**: Harmonized regional standards and cross-border licensing

### 2. Digital Divide
**Challenge**: Unequal access to technology
**Solution**: Government initiatives to improve digital infrastructure

### 3. Data Security and Privacy
**Challenge**: Protecting sensitive health information
**Solution**: Advanced encryption and cybersecurity measures

### 4. Provider Adoption
**Challenge**: Resistance to change among healthcare professionals
**Solution**: Comprehensive training and support programs

## Future Trends and Predictions

### Next 5 Years (2024-2029):
- **Integrated Health Ecosystems**: Seamless connection between hospitals, clinics, and home care
- **Personalized Medicine**: AI-driven treatment plans based on individual genetic profiles
- **Blockchain in Healthcare**: Secure, interoperable health records
- **5G-Enabled Healthcare**: Ultra-fast, low-latency medical communications

### Long-term Vision (2030+):
- **Fully Digital Health Systems**: Complete digitization of healthcare delivery
- **Preventive Care Focus**: Shift from treatment to prevention through continuous monitoring
- **Global Health Networks**: International collaboration and knowledge sharing
- **Autonomous Healthcare**: AI-driven diagnosis and treatment recommendations

## Case Studies: Success Stories

### UAE's SEHA Virtual Hospital
- Launched in 2020 during the pandemic
- Served over 100,000 patients in first year
- 95% patient satisfaction rate
- Reduced hospital visits by 40%

### Saudi Arabia's Sehhaty App
- National digital health platform
- Over 10 million registered users
- Integrated with national health records
- Provides comprehensive health services

### Bahrain's National Health Information System
- Unified electronic health records
- Real-time health data sharing
- Improved care coordination
- Enhanced patient safety

## Recommendations for Healthcare Organizations

1. **Invest in Infrastructure**: Upgrade technology systems and internet connectivity
2. **Train Staff**: Provide comprehensive telemedicine training for healthcare providers
3. **Ensure Compliance**: Stay updated with regulatory requirements
4. **Focus on User Experience**: Design patient-friendly interfaces and processes
5. **Measure Outcomes**: Track performance metrics and patient satisfaction
6. **Plan for Scale**: Build systems that can handle growing demand

## Conclusion

The future of telemedicine in the Gulf region is bright, with significant opportunities for improving healthcare access, quality, and efficiency. Success will depend on continued investment in technology, regulatory support, and stakeholder collaboration.

As we move forward, the integration of telemedicine with traditional healthcare delivery will create a more resilient, accessible, and patient-centered healthcare system across the GCC.

The journey toward digital health transformation is just beginning, and the Gulf region is well-positioned to lead this revolution in healthcare delivery.
    `,
    author: 'Dr. Sarah Johnson',
    authorId: 'doctor_2',
    date: '2024-02-28',
    category: 'Technology',
    readTime: '6 min read',
    tags: ['telemedicine', 'technology', 'gcc', 'digital health', 'innovation'],
    published: true
  }
];

export const getBlogPosts = (): BlogPost[] => {
  try {
    const stored = localStorage.getItem(BLOG_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (error) {
        console.error('Error parsing blog posts:', error);
      }
    }
    
    // Initialize with default blogs if none exist or if there was an error
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(defaultBlogs));
    return defaultBlogs;
  } catch (error) {
    console.error('Critical error in getBlogPosts:', error);
    // Return defaults without trying to save to localStorage if there's a critical error
    return defaultBlogs;
  }
};

export const getBlogPost = (id: string): BlogPost | null => {
  const posts = getBlogPosts();
  return posts.find(post => post.id === id) || null;
};

export const saveBlogPost = (post: BlogPost): void => {
  const posts = getBlogPosts();
  const existingIndex = posts.findIndex(p => p.id === post.id);
  
  if (existingIndex >= 0) {
    posts[existingIndex] = post;
  } else {
    posts.unshift(post); // Add new posts at the beginning
  }
  
  localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
};

export const deleteBlogPost = (id: string): void => {
  const posts = getBlogPosts();
  const filteredPosts = posts.filter(post => post.id !== id);
  localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(filteredPosts));
};

export const generateBlogId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const getPublishedBlogPosts = (): BlogPost[] => {
  return getBlogPosts().filter(post => post.published);
};

export const getBlogPostsByAuthor = (authorId: string): BlogPost[] => {
  return getBlogPosts().filter(post => post.authorId === authorId);
};

export const getDraftBlogPosts = (): BlogPost[] => {
  return getBlogPosts().filter(post => !post.published);
};

export const getDraftBlogPostsByAuthor = (authorId: string): BlogPost[] => {
  return getBlogPosts().filter(post => post.authorId === authorId && !post.published);
};

export const getPublishedBlogPostsByAuthor = (authorId: string): BlogPost[] => {
  return getBlogPosts().filter(post => post.authorId === authorId && post.published);
};

// Function to ensure default blogs are loaded
export const ensureDefaultBlogs = (): void => {
  try {
    const stored = localStorage.getItem(BLOG_STORAGE_KEY);
    let posts: BlogPost[] = [];
    
    if (stored) {
      try {
        posts = JSON.parse(stored);
        if (!Array.isArray(posts)) {
          posts = [];
        }
      } catch (error) {
        console.error('Error parsing stored blogs in ensureDefaultBlogs:', error);
        posts = [];
      }
    }
    
    const hasDefaults = posts.some(post => ['doctor_1', 'doctor_2', 'admin_1'].includes(post.authorId));
    
    if (!hasDefaults) {
      console.log('Default blogs missing, adding them back');
      const allPosts = [...posts, ...defaultBlogs];
      localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(allPosts));
    }
  } catch (error) {
    console.error('Error in ensureDefaultBlogs:', error);
    // Fallback: just set the defaults
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(defaultBlogs));
  }
};