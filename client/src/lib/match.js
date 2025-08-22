// Tutor matching algorithm
export const matchingWeights = {
  subject: 0.3,
  availability: 0.25,
  rating: 0.2,
  price: 0.15,
  language: 0.07,
  verified: 0.03
};

export function calculateTutorMatch(tutor, searchCriteria) {
  const scores = {
    subject: calculateSubjectMatch(tutor, searchCriteria.subject),
    availability: calculateAvailabilityOverlap(tutor, searchCriteria.availability),
    rating: normalizeRating(tutor.ratingAvg || 0),
    price: calculatePriceFit(tutor.pricePerHour, searchCriteria.budget),
    language: calculateLanguageMatch(tutor.languages, searchCriteria.language),
    verified: tutor.verified ? 1 : 0
  };

  const overallScore = Object.keys(matchingWeights).reduce((total, key) => {
    return total + (scores[key] * matchingWeights[key]);
  }, 0);

  const reasons = generateMatchReasons(scores, tutor);

  return {
    score: Number(overallScore.toFixed(3)),
    reasons,
    breakdown: scores
  };
}

function calculateSubjectMatch(tutor, targetSubject) {
  if (!targetSubject || !tutor.subjects) return 0;
  
  const hasExactMatch = tutor.subjects.some(subject => 
    subject.name.toLowerCase() === targetSubject.toLowerCase()
  );
  
  if (hasExactMatch) return 1;
  
  // Partial match logic
  const hasPartialMatch = tutor.subjects.some(subject =>
    subject.name.toLowerCase().includes(targetSubject.toLowerCase()) ||
    targetSubject.toLowerCase().includes(subject.name.toLowerCase())
  );
  
  return hasPartialMatch ? 0.7 : 0;
}

function calculateAvailabilityOverlap(tutor, targetAvailability) {
  if (!targetAvailability || !tutor.availability) return 0.5; // Default if no specific requirement
  
  // This is a simplified version - in a real app you'd check actual time slots
  const hasOverlap = tutor.availability.some(slot => 
    targetAvailability.includes(slot.weekday)
  );
  
  return hasOverlap ? 1 : 0.2;
}

function normalizeRating(rating, maxRating = 5) {
  return Math.min(rating / maxRating, 1);
}

function calculatePriceFit(tutorPrice, budget) {
  if (!budget || !tutorPrice) return 0.5;
  
  const [minBudget, maxBudget] = budget.split('-').map(b => parseInt(b.replace(/\D/g, '')));
  
  if (tutorPrice >= minBudget && tutorPrice <= maxBudget) {
    return 1;
  } else if (tutorPrice < minBudget) {
    return 0.8; // Cheaper than expected is still good
  } else {
    // More expensive - linear decay
    const overBudget = tutorPrice - maxBudget;
    const tolerance = maxBudget * 0.2; // 20% tolerance
    return Math.max(0, 1 - (overBudget / tolerance));
  }
}

function calculateLanguageMatch(tutorLanguages, targetLanguage) {
  if (!targetLanguage || !tutorLanguages) return 0.5;
  
  return tutorLanguages.includes(targetLanguage) ? 1 : 0.3;
}

function generateMatchReasons(scores, tutor) {
  const reasons = [];
  
  if (scores.subject >= 0.9) {
    reasons.push("Perfect subject match");
  } else if (scores.subject >= 0.5) {
    reasons.push("Good subject match");
  }
  
  if (scores.rating >= 0.9) {
    reasons.push("Highly rated tutor");
  }
  
  if (scores.price >= 0.8) {
    reasons.push("Within your budget");
  }
  
  if (scores.availability >= 0.8) {
    reasons.push("Available when you need");
  }
  
  if (scores.verified === 1) {
    reasons.push("Verified tutor");
  }
  
  return reasons.slice(0, 3); // Limit to top 3 reasons
}

export function rankTutors(tutors, searchCriteria) {
  return tutors
    .map(tutor => ({
      ...tutor,
      match: calculateTutorMatch(tutor, searchCriteria)
    }))
    .sort((a, b) => b.match.score - a.match.score);
}

export default {
  calculateTutorMatch,
  rankTutors,
  matchingWeights
};
