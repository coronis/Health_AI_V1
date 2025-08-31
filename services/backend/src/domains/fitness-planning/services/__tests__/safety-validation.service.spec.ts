import { Test, TestingModule } from '@nestjs/testing';
import { SafetyValidationService } from '../safety-validation.service';
import {
  Exercise,
  DifficultyLevel,
  ExerciseCategory,
  MuscleGroup,
} from '../../entities/exercise.entity';
import { FitnessPlan, ExperienceLevel, FitnessPlanType } from '../../entities/fitness-plan.entity';
import { FitnessPlanWorkout } from '../../entities/fitness-plan-workout.entity';
import { FitnessPlanExercise, ExerciseType } from '../../entities/fitness-plan-exercise.entity';

describe('SafetyValidationService', () => {
  let service: SafetyValidationService;

  const mockExercise: Exercise = {
    id: 'test-exercise-id',
    name: 'Squats',
    description: 'Lower body compound exercise',
    category: ExerciseCategory.RESISTANCE,
    difficultyLevel: DifficultyLevel.INTERMEDIATE,
    primaryMuscleGroup: MuscleGroup.QUADRICEPS,
    healthConditionsToAvoid: ['knee injury', 'hip injury'],
    contraindications: ['lower back pain'],
    injuryWarnings: ['knee strain'],
    isActive: true,
    isApproved: true,
    isUnilateral: false,
    isCardio: false,
    isCompound: true,
    isBodyweight: false,
    usageCount: 100,
    totalRatings: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Add missing methods
    isAvailableForEquipment: jest.fn().mockReturnValue(true),
    isSafeForConditions: jest.fn().mockReturnValue(true),
    isSuitableForLevel: jest.fn().mockReturnValue(true),
    incrementUsage: jest.fn(),
    updateRating: jest.fn(),
    approve: jest.fn(),
    getEstimatedCaloriesBurn: jest.fn().mockReturnValue(100),
    getRecommendedSets: jest.fn().mockReturnValue(3),
    getRecommendedReps: jest.fn().mockReturnValue({ min: 8, max: 12 }),
  } as any;

  const mockUserProfile = {
    experienceLevel: ExperienceLevel.INTERMEDIATE,
    healthConditions: [],
    physicalLimitations: [],
    injuryHistory: [],
    age: 30,
    currentWeight: 70,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SafetyValidationService],
    }).compile();

    service = module.get<SafetyValidationService>(SafetyValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateExerciseForUser', () => {
    it('should pass validation for suitable exercise', () => {
      const result = service.validateExerciseForUser(mockExercise, mockUserProfile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should fail validation for contraindicated health conditions', () => {
      const userWithKneeInjury = {
        ...mockUserProfile,
        healthConditions: ['knee injury', 'diabetes'],
      };

      const result = service.validateExerciseForUser(mockExercise, userWithKneeInjury);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('is contraindicated for your health conditions');
    });

    it('should warn about physical limitations', () => {
      const userWithLimitations = {
        ...mockUserProfile,
        physicalLimitations: ['lower back pain'],
      };

      const result = service.validateExerciseForUser(mockExercise, userWithLimitations);

      expect(result.isValid).toBe(true);
      expect(result.warnings[0]).toContain('may be challenging due to');
    });

    it('should warn about injury history', () => {
      const userWithInjuryHistory = {
        ...mockUserProfile,
        injuryHistory: ['knee strain'],
      };

      const result = service.validateExerciseForUser(mockExercise, userWithInjuryHistory);

      expect(result.isValid).toBe(true);
      expect(result.warnings[0]).toContain('may aggravate previous injuries');
    });

    it('should provide age-specific warnings for elderly users', () => {
      const elderlyUser = {
        ...mockUserProfile,
        age: 70,
      };

      const highImpactExercise = Object.assign({}, mockExercise, {
        category: ExerciseCategory.CALISTHENICS,
        tags: ['high-impact'],
      });

      const result = service.validateExerciseForUser(highImpactExercise, elderlyUser);

      expect(result.warnings).toContainEqual(
        expect.stringContaining('ensure proper warm-up and consider impact modifications'),
      );
    });

    it('should provide warnings for young users with heavy weights', () => {
      const youngUser = {
        ...mockUserProfile,
        age: 16,
      };

      const heavyWeightExercise = Object.assign({}, mockExercise, {
        tags: ['heavy-weight'],
      });

      const result = service.validateExerciseForUser(heavyWeightExercise, youngUser);

      expect(result.warnings).toContainEqual(
        expect.stringContaining('focus on form and gradual progression'),
      );
    });
  });

  describe('validateWorkout', () => {
    const mockWorkout: FitnessPlanWorkout = {
      id: 'workout-id',
      workoutName: 'Test Workout',
      targetMuscleGroups: [MuscleGroup.CHEST, MuscleGroup.TRICEPS],
      restBetweenSets: 60,
      restBetweenExercises: 90,
    } as any;

    const mockExercises: FitnessPlanExercise[] = [
      {
        id: 'exercise1',
        exerciseName: 'Push-ups',
        targetSets: 3,
        targetRepsPerSet: 12,
        intensityLevel: 6,
        // Add missing methods and properties
        notes: '',
        isCompleted: jest.fn().mockReturnValue(false),
        isSkipped: jest.fn().mockReturnValue(false),
        getCompletionPercentage: jest.fn().mockReturnValue(0),
        getTotalRepsCompleted: jest.fn().mockReturnValue(0),
        getTotalWeightLifted: jest.fn().mockReturnValue(0),
        getAverageWeight: jest.fn().mockReturnValue(0),
        getAverageReps: jest.fn().mockReturnValue(0),
        start: jest.fn(),
        needsEquipment: jest.fn().mockReturnValue(false),
        isBodyweightExercise: jest.fn().mockReturnValue(true),
        isTimeBasedExercise: jest.fn().mockReturnValue(false),
        isDistanceBasedExercise: jest.fn().mockReturnValue(false),
        getExerciseVolume: jest.fn().mockReturnValue(36),
        getIntensityLoad: jest.fn().mockReturnValue(216),
        shouldProgressWeight: jest.fn().mockReturnValue(false),
        shouldReduceWeight: jest.fn().mockReturnValue(false),
        getProgressionSuggestion: jest.fn().mockReturnValue({ type: 'reps', change: 1 }),
      } as any,
      {
        id: 'exercise2',
        exerciseName: 'Tricep Dips',
        targetSets: 3,
        targetRepsPerSet: 10,
        intensityLevel: 7,
        // Add missing methods and properties
        notes: '',
        isCompleted: jest.fn().mockReturnValue(false),
        isSkipped: jest.fn().mockReturnValue(false),
        getCompletionPercentage: jest.fn().mockReturnValue(0),
        getTotalRepsCompleted: jest.fn().mockReturnValue(0),
        getTotalWeightLifted: jest.fn().mockReturnValue(0),
        getAverageWeight: jest.fn().mockReturnValue(0),
        getAverageReps: jest.fn().mockReturnValue(0),
        start: jest.fn(),
        needsEquipment: jest.fn().mockReturnValue(false),
        isBodyweightExercise: jest.fn().mockReturnValue(true),
        isTimeBasedExercise: jest.fn().mockReturnValue(false),
        isDistanceBasedExercise: jest.fn().mockReturnValue(false),
        getExerciseVolume: jest.fn().mockReturnValue(30),
        getIntensityLoad: jest.fn().mockReturnValue(210),
        shouldProgressWeight: jest.fn().mockReturnValue(false),
        shouldReduceWeight: jest.fn().mockReturnValue(false),
        getProgressionSuggestion: jest.fn().mockReturnValue({ type: 'reps', change: 1 }),
      } as any,
    ];

    it('should validate a reasonable workout', () => {
      const result = service.validateWorkout(mockWorkout, mockExercises, mockUserProfile);

      expect(result.isValid).toBe(true);
      expect(result.totalVolume).toBe(6); // 3 + 3 sets
      expect(result.intensityScore).toBe(6.5); // (6 + 7) / 2
    });

    it('should warn about high volume workouts', () => {
      const highVolumeExercises = Array(4).fill(null).map(() => 
        Object.assign({}, mockExercises[0], { targetSets: 4 })
      );

      const result = service.validateWorkout(mockWorkout, highVolumeExercises, mockUserProfile);

      expect(result.warnings).toContainEqual(expect.stringContaining('High workout volume'));
    });

    it('should error on excessive volume', () => {
      const beginnerUser = {
        ...mockUserProfile,
        experienceLevel: ExperienceLevel.BEGINNER,
      };

      const excessiveVolumeExercises = Array(15).fill(null).map(() =>
        Object.assign({}, mockExercises[0], { targetSets: 3 })
      );

      const result = service.validateWorkout(mockWorkout, excessiveVolumeExercises, beginnerUser);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('Workout volume too high'));
    });

    it('should warn about very high intensity', () => {
      const highIntensityExercises = mockExercises.map((ex) => 
        Object.assign({}, ex, { intensityLevel: 10 })
      );

      const result = service.validateWorkout(mockWorkout, highIntensityExercises, mockUserProfile);

      expect(result.warnings).toContainEqual(expect.stringContaining('Very high workout intensity'));
    });
  });

  describe('validateFitnessPlan', () => {
    const mockPlan: FitnessPlan = {
      id: 'plan-id',
      planName: 'Test Plan',
      planType: FitnessPlanType.MUSCLE_GAIN,
      durationWeeks: 12,
      workoutsPerWeek: 4,
      progressiveOverloadEnabled: true,
      autoProgressionRate: 1.05,
      deloadWeekFrequency: 4,
      // Add missing methods
      isActive: jest.fn().mockReturnValue(true),
      getDaysRemaining: jest.fn().mockReturnValue(30),
      getWeeksRemaining: jest.fn().mockReturnValue(4),
      getCurrentWeek: jest.fn().mockReturnValue(8),
      getTotalPlannedWorkouts: jest.fn().mockReturnValue(48),
      getWorkoutCompletionRate: jest.fn().mockReturnValue(75),
      activate: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      complete: jest.fn(),
      cancel: jest.fn(),
      addAdaptation: jest.fn(),
      getIntensityLevel: jest.fn().mockReturnValue(7),
      getAverageWorkoutDuration: jest.fn().mockReturnValue(60),
      getEstimatedCaloriesBurnPerWorkout: jest.fn().mockReturnValue(300),
    } as any;

    it('should validate a reasonable fitness plan', () => {
      const result = service.validateFitnessPlan(mockPlan, mockUserProfile);

      expect(result.isValid).toBe(true);
    });

    it('should warn about very long plans', () => {
      const longPlan = Object.assign({}, mockPlan, { durationWeeks: 60 });

      const result = service.validateFitnessPlan(longPlan, mockUserProfile);

      expect(result.warnings).toContainEqual(expect.stringContaining('Plan duration exceeds 1 year'));
    });

    it('should warn about very short plans', () => {
      const shortPlan = Object.assign({}, mockPlan, { durationWeeks: 2 });

      const result = service.validateFitnessPlan(shortPlan, mockUserProfile);

      expect(result.warnings).toContainEqual(expect.stringContaining('Plan duration is very short'));
    });

    it('should warn about aggressive progression rates', () => {
      const aggressivePlan = Object.assign({}, mockPlan, { autoProgressionRate: 1.2 });

      const result = service.validateFitnessPlan(aggressivePlan, mockUserProfile);

      expect(result.warnings).toContainEqual(expect.stringContaining('may be too aggressive'));
    });

    it('should warn about infrequent deload weeks', () => {
      const infrequentDeloadPlan = Object.assign({}, mockPlan, { deloadWeekFrequency: 10 });

      const result = service.validateFitnessPlan(infrequentDeloadPlan, mockUserProfile);

      expect(result.warnings).toContainEqual(
        expect.stringContaining('Deload weeks scheduled infrequently'),
      );
    });
  });

  describe('validateExerciseParameters', () => {
    it('should validate reasonable exercise parameters', () => {
      const result = service.validateExerciseParameters('Squats', 3, 12, 60, mockUserProfile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should error on invalid sets', () => {
      const result = service.validateExerciseParameters('Squats', 0, 12, 60, mockUserProfile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('Invalid number of sets'));
    });

    it('should error on invalid reps', () => {
      const result = service.validateExerciseParameters('Squats', 3, 0, 60, mockUserProfile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('Invalid number of reps'));
    });

    it('should warn about very high rep ranges', () => {
      const result = service.validateExerciseParameters('Squats', 3, 50, 60, mockUserProfile);

      expect(result.warnings).toContainEqual(expect.stringContaining('Very high rep range'));
    });

    it('should warn about very heavy weights', () => {
      const result = service.validateExerciseParameters(
        'Squats',
        3,
        12,
        250, // 250kg for 70kg person
        mockUserProfile,
      );

      expect(result.warnings).toContainEqual(
        expect.stringContaining('Exercise weight is very high relative to body weight'),
      );
    });

    it('should error on negative weight', () => {
      const result = service.validateExerciseParameters('Squats', 3, 12, -10, mockUserProfile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('Weight cannot be negative'));
    });
  });

  describe('getProgressionRecommendations', () => {
    const mockCurrentPlan: FitnessPlan = {
      getCurrentWeek: jest.fn().mockReturnValue(4),
      deloadWeekFrequency: 4,
    } as any;

    it('should recommend progression for high adherence', () => {
      const result = service.getProgressionRecommendations(
        mockCurrentPlan,
        90, // High adherence
        { difficultyRating: 2 }, // Easy
      );

      expect(result.shouldProgress).toBe(true);
      expect(result.adjustments.volumeAdjustment).toBe(5);
      expect(result.recommendations).toContainEqual(expect.stringContaining('Ready for progression'));
    });

    it('should recommend volume reduction for low adherence', () => {
      const result = service.getProgressionRecommendations(
        mockCurrentPlan,
        50, // Low adherence
      );

      expect(result.adjustments.volumeAdjustment).toBe(-10);
      expect(result.recommendations).toContainEqual(expect.stringContaining('Consider reducing volume'));
    });

    it('should recommend deload for high fatigue', () => {
      const result = service.getProgressionRecommendations(
        mockCurrentPlan,
        85,
        { fatigueLevel: 5 }, // Very high fatigue
      );

      expect(result.shouldDeload).toBe(true);
      expect(result.adjustments.volumeAdjustment).toBe(-15);
      expect(result.recommendations).toContainEqual(expect.stringContaining('High fatigue detected'));
    });

    it('should recommend deload on scheduled week', () => {
      const result = service.getProgressionRecommendations(mockCurrentPlan, 85);

      expect(result.shouldDeload).toBe(true);
      expect(result.recommendations).toContainEqual(expect.stringContaining('Scheduled deload week'));
    });

    it('should recommend intensity reduction for high difficulty', () => {
      const result = service.getProgressionRecommendations(
        mockCurrentPlan,
        85,
        { difficultyRating: 5 }, // Very difficult
      );

      expect(result.adjustments.intensityAdjustment).toBe(-5);
      expect(result.recommendations).toContainEqual(expect.stringContaining('Reduce intensity'));
    });
  });
});
