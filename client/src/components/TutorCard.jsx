import { Link } from "wouter";

export default function TutorCard({ tutor, showMatchScore = false }) {
  const {
    id,
    firstName,
    lastName,
    avatarUrl,
    bio,
    pricePerHour,
    ratingAvg,
    ratingCount,
    subjects = [],
    verified,
    match
  } = tutor;

  const displayName = `${firstName} ${lastName}`;
  const rating = ratingAvg || 0;
  const reviewCount = ratingCount || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
      <Link href={`/tutor/${id}`}>
        <div className="cursor-pointer" data-testid={`card-tutor-${id}`}>
          <div className="text-center">
            {/* Avatar */}
            <div className="relative mx-auto mb-4">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName}
                  className="w-20 h-20 rounded-full mx-auto object-cover"
                  data-testid={`img-avatar-${id}`}
                />
              ) : (
                <div className="w-20 h-20 rounded-full mx-auto bg-gray-200 flex items-center justify-center">
                  <i className="fas fa-user text-gray-400 text-2xl"></i>
                </div>
              )}
              {verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-white text-xs"></i>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1" data-testid={`text-name-${id}`}>
              {displayName}
            </h3>
            
            {bio && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2" data-testid={`text-bio-${id}`}>
                {bio}
              </p>
            )}
            
            {/* Rating */}
            <div className="flex items-center justify-center mb-3">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={i}
                    className={`fas fa-star ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  ></i>
                ))}
              </div>
              <span className="ml-1 text-sm text-gray-600" data-testid={`text-rating-${id}`}>
                {rating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>

            {/* Subjects */}
            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {subjects.slice(0, 3).map((subject, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                    data-testid={`tag-subject-${index}`}
                  >
                    {subject.name}
                  </span>
                ))}
                {subjects.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{subjects.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Match Score */}
            {showMatchScore && match && (
              <div className="mb-4 p-2 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-800">
                  {Math.round(match.score * 100)}% Match
                </div>
                {match.reasons && match.reasons.length > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    {match.reasons.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Price & Availability */}
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold text-gray-900" data-testid={`text-price-${id}`}>
                ${pricePerHour}/hour
              </div>
              <div className="text-sm text-green-600 flex items-center justify-center">
                <i className="fas fa-circle text-xs mr-1"></i>
                Available today
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
